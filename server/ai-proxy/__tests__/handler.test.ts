import { handleAiRoute } from '../handler';
import { AI_ROUTES } from '../routes';
import { resetRateLimitState } from '../rateLimit';

jest.mock('../gemini', () => ({
  generateGeminiJson: jest.fn().mockResolvedValue(
    JSON.stringify({
      mealTitle: 'Test meal',
      confidence: 0.8,
      calories: 400,
      proteinG: 30,
      carbsG: 35,
      fatG: 12,
      fiberG: 6,
      ingredients: [{ name: 'Chicken', grams: 120 }],
    }),
  ),
}));

function routeBody(payload: Record<string, unknown>, overrides?: Partial<{ deviceInstallId: string; isPremium: boolean }>) {
  return JSON.stringify({
    deviceInstallId: overrides?.deviceInstallId ?? 'device-test-001',
    isPremium: overrides?.isPremium ?? true,
    payload,
  });
}

describe('ai-proxy route handler', () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it('rejects invalid JSON body', async () => {
    const result = await handleAiRoute(AI_ROUTES.mealText, 'not-json');
    expect(result.status).toBe(400);
    expect(result.body.ok).toBe(false);
  });

  it('returns not configured without API key', async () => {
    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      routeBody({ description: 'grilled chicken salad' }),
      { apiKey: undefined, model: 'gemini-2.5-flash' },
    );

    expect(result.status).toBe(503);
    if (!result.body.ok) {
      expect(result.body.code).toBe('NOT_CONFIGURED');
    }
  });

  it('blocks non-premium users', async () => {
    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      routeBody({ description: 'salad' }, { isPremium: false }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(403);
    if (!result.body.ok) {
      expect(result.body.code).toBe('UNAUTHORIZED');
    }
  });

  it('rejects oversized text body', async () => {
    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      routeBody({ description: 'x'.repeat(120_000) }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(413);
    if (!result.body.ok) {
      expect(result.body.code).toBe('PAYLOAD_TOO_LARGE');
    }
  });

  it('requires front photo for physique assessment', async () => {
    const result = await handleAiRoute(
      AI_ROUTES.physiqueAssessment,
      routeBody({ sideImageBase64: 'abc' }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(400);
    if (!result.body.ok) {
      expect(result.body.code).toBe('INVALID_REQUEST');
    }
  });

  it('rejects oversized decoded images', async () => {
    const oversized = Buffer.alloc(3 * 1024 * 1024 + 1, 1).toString('base64');
    const result = await handleAiRoute(
      AI_ROUTES.mealPhoto,
      routeBody({ imageBase64: oversized }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(413);
    if (!result.body.ok) {
      expect(result.body.code).toBe('IMAGE_TOO_LARGE');
    }
  });

  it('enforces cooldown per device', async () => {
    const first = await handleAiRoute(AI_ROUTES.mealText, routeBody({ description: 'first meal' }), {
      apiKey: 'test-key',
      model: 'gemini-2.5-flash',
    });
    expect(first.status).toBe(200);

    const second = await handleAiRoute(
      AI_ROUTES.mealText,
      routeBody({ description: 'second meal' }),
      { apiKey: 'test-key' },
    );

    expect(second.status).toBe(429);
    if (!second.body.ok) {
      expect(second.body.code).toBe('COOLDOWN');
    }
  });
});
