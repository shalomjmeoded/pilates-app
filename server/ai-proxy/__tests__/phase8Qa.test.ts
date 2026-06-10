import { handleAiRoute } from '../handler';
import { AI_ROUTES } from '../routes';
import { resetRateLimitState } from '../rateLimit';

const generateGeminiJson = jest.fn();

jest.mock('../gemini', () => ({
  generateGeminiJson: (...args: unknown[]) => generateGeminiJson(...args),
}));

function routeBody(payload: Record<string, unknown>) {
  return JSON.stringify({
    deviceInstallId: 'device-qa-proxy',
    isPremium: true,
    payload,
  });
}

describe('Phase 8.8 AI QA — proxy', () => {
  beforeEach(() => {
    resetRateLimitState();
    generateGeminiJson.mockReset();
  });

  it('success: returns parsed JSON data from Gemini', async () => {
    generateGeminiJson.mockResolvedValue(
      JSON.stringify({
        mealTitle: 'Proxy meal',
        confidence: 0.75,
        calories: 410,
        proteinG: 28,
        carbsG: 36,
        fatG: 14,
        fiberG: 5,
        ingredients: [{ name: 'Chicken', grams: 120 }],
      }),
    );

    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      routeBody({ description: 'grilled chicken' }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(200);
    if (result.body.ok) {
      expect((result.body.data as { mealTitle: string }).mealTitle).toBe('Proxy meal');
    }
  });

  it('failure: upstream Gemini errors return UPSTREAM_ERROR', async () => {
    generateGeminiJson.mockRejectedValue(new Error('Gemini API error 500'));

    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      routeBody({ description: 'broken upstream' }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(502);
    if (!result.body.ok) {
      expect(result.body.code).toBe('UPSTREAM_ERROR');
    }
  });

  it('invalid JSON from Gemini returns UPSTREAM_ERROR', async () => {
    generateGeminiJson.mockResolvedValue('this is not json');

    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      routeBody({ description: 'invalid json upstream' }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(502);
    if (!result.body.ok) {
      expect(result.body.code).toBe('UPSTREAM_ERROR');
    }
  });

  it('non-premium blocked at proxy layer', async () => {
    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      JSON.stringify({
        deviceInstallId: 'device-free',
        isPremium: false,
        payload: { description: 'salad' },
      }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(403);
    if (!result.body.ok) {
      expect(result.body.code).toBe('UNAUTHORIZED');
    }
    expect(generateGeminiJson).not.toHaveBeenCalled();
  });
});
