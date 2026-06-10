import * as fs from 'node:fs';
import * as path from 'node:path';

import { saveReviewedAiMeal } from '@/engines/nutrition/saveReviewedAiMeal';
import { useAiMealReviewStore } from '@/stores/aiMealReviewStore';
import { usePhysiqueAssessmentReviewStore } from '@/stores/physiqueAssessmentReviewStore';

jest.mock('@/db/repositories/premiumRepository', () => ({
  getPremiumStatus: jest.fn().mockResolvedValue({ isPremium: true }),
}));

jest.mock('@/db/repositories/aiOutputRepository', () => ({
  logAiOutput: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/repositories/aiUsageRepository', () => ({
  recordAiUsage: jest.fn().mockResolvedValue(undefined),
  getAiUsageCount: jest.fn().mockResolvedValue(0),
  getQuotaPeriodKey: jest.fn().mockReturnValue('2026-06-09'),
}));

jest.mock('@/db/repositories/nutritionRepository', () => ({
  saveMeal: jest.fn().mockResolvedValue({ id: 'meal-1' }),
}));

jest.mock('@/db/repositories/savedMealRepository', () => ({
  upsertSavedMeal: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../deviceInstallId', () => ({
  getDeviceInstallId: jest.fn().mockResolvedValue('device-qa-001'),
}));

import { getPremiumStatus } from '@/db/repositories/premiumRepository';

import { AiProxyError, callAiProxy } from '../aiProxyClient';
import { AiValidationError } from '../errors';
import { MockAiProvider } from '../providers/MockAiProvider';
import { parseAiResponse } from '../parseAiResponse';
import { aiMealEstimateSchema } from '../schemas';

const originalFetch = global.fetch;

function mockFetchResponse(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    json: async () => body,
  }) as typeof fetch;
}

function collectSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !fullPath.includes('__tests__')) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Phase 8.8 AI QA — client', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_AI_PROXY_URL = 'http://localhost:8787';
    jest.clearAllMocks();
    (getPremiumStatus as jest.Mock).mockResolvedValue({ isPremium: true });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('success: proxy returns validated meal estimate data', async () => {
    mockFetchResponse(200, {
      ok: true,
      data: {
        mealTitle: 'Salmon bowl',
        confidence: 0.8,
        calories: 520,
        proteinG: 34,
        carbsG: 42,
        fatG: 18,
        fiberG: 7,
        ingredients: [{ name: 'Salmon', grams: 150 }],
      },
    });

    const data = await callAiProxy('meal_text_estimate', { description: 'salmon bowl' });
    expect((data as { mealTitle: string }).mealTitle).toBe('Salmon bowl');
  });

  it('failure: proxy error surfaces as AiProxyError', async () => {
    mockFetchResponse(502, {
      ok: false,
      error: 'Gemini unavailable',
      code: 'UPSTREAM_ERROR',
    });

    await expect(callAiProxy('meal_text_estimate', { description: 'salad' })).rejects.toMatchObject({
      name: 'AiProxyError',
      code: 'UPSTREAM_ERROR',
    });
  });

  it('invalid JSON shape is rejected by Zod before persistence', () => {
    expect(() =>
      parseAiResponse(aiMealEstimateSchema, {
        mealTitle: '',
        confidence: 2,
        calories: -1,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
        ingredients: [],
      }),
    ).toThrow(AiValidationError);
  });

  it('offline: network failure propagates to caller', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed')) as typeof fetch;

    await expect(callAiProxy('meal_text_estimate', { description: 'offline meal' })).rejects.toThrow(
      'Network request failed',
    );
  });

  it('quota exceeded: maps RATE_LIMITED from proxy', async () => {
    mockFetchResponse(429, {
      ok: false,
      error: 'AI limit reached for meal_text_estimate.',
      code: 'RATE_LIMITED',
    });

    await expect(callAiProxy('meal_text_estimate', { description: 'quota meal' })).rejects.toMatchObject({
      name: 'AiProxyError',
      code: 'RATE_LIMITED',
    });
  });

  it('cooldown: maps COOLDOWN from proxy', async () => {
    mockFetchResponse(429, {
      ok: false,
      error: 'Please wait a few seconds between AI requests.',
      code: 'COOLDOWN',
    });

    await expect(callAiProxy('weekly_coach', { weekStart: '2026-06-02' })).rejects.toMatchObject({
      code: 'COOLDOWN',
    });
  });

  it('non-premium blocked: proxy returns UNAUTHORIZED', async () => {
    (getPremiumStatus as jest.Mock).mockResolvedValue({ isPremium: false });
    mockFetchResponse(403, {
      ok: false,
      error: 'AI features require Tune Premium.',
      code: 'UNAUTHORIZED',
    });

    await expect(callAiProxy('meal_text_estimate', { description: 'free tier' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('review-before-save: AI meal estimate stays in review store until save engine runs', async () => {
    useAiMealReviewStore.getState().clear();

    const estimate = await new MockAiProvider().estimateMealFromText('oats and berries');
    useAiMealReviewStore.getState().setPendingReview({
      estimate,
      originalDescription: 'oats and berries',
      mealDate: '2026-06-09',
      source: 'ai_text',
    });

    expect(useAiMealReviewStore.getState().estimate?.mealTitle).toBeTruthy();

    await saveReviewedAiMeal({
      meal: {
        title: estimate.mealTitle,
        calories: estimate.calories,
        proteinG: estimate.proteinG,
        carbsG: estimate.carbsG,
        fatG: estimate.fatG,
        fiberG: estimate.fiberG,
        mealDate: '2026-06-09',
        source: 'ai_text',
      },
      saveToLibrary: false,
    });

    expect(useAiMealReviewStore.getState().estimate).toBeTruthy();
  });

  it('review-before-save: physique assessment requires pending review before save path', async () => {
    usePhysiqueAssessmentReviewStore.getState().clear();

    const assessment = await new MockAiProvider().assessPhysique({
      frontImageBase64: 'data:image/jpeg;base64,abc',
    });

    usePhysiqueAssessmentReviewStore.getState().setPendingReview({
      assessment,
      disclaimerAcceptedAt: '2026-06-09T12:00:00.000Z',
    });

    expect(usePhysiqueAssessmentReviewStore.getState().assessment?.physiqueCategory).toBeTruthy();
    expect(usePhysiqueAssessmentReviewStore.getState().disclaimerAcceptedAt).toBeTruthy();
  });

  it('no direct Gemini calls from UI routes', () => {
    const appFiles = collectSourceFiles(path.join(process.cwd(), 'app'));
    const violations = appFiles.filter((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return (
        content.includes('aiFacade') ||
        content.includes('aiService') ||
        content.includes('generativelanguage.googleapis.com') ||
        content.includes('GEMINI_API_KEY')
      );
    });

    expect(violations).toEqual([]);
  });

  it('privacy copy mentions Gemini routing and review-before-save', () => {
    const privacy = fs.readFileSync(
      path.join(process.cwd(), 'app/(tabs)/settings/privacy.tsx'),
      'utf8',
    );

    expect(privacy).toContain('Gemini');
    expect(privacy).toContain('review every AI meal estimate before saving');
    expect(privacy).toContain('physique photos');
    expect(privacy).not.toContain('GEMINI_API_KEY');
  });
});
