import { AI_ROUTES } from '../routes';
import { handleAiRoute } from '../handler';
import { checkRateLimit, recordRateLimitUse, resetRateLimitState } from '../rateLimit';

describe('ai-proxy rateLimit', () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it('blocks free tier users', () => {
    const result = checkRateLimit({
      deviceInstallId: 'device-1',
      feature: 'meal_text_estimate',
      isPremium: false,
      promptFingerprint: 'oatmeal with berries',
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.code).toBe('UNAUTHORIZED');
    }
  });

  it('enforces cooldown between requests', () => {
    const now = Date.now();
    recordRateLimitUse({
      deviceInstallId: 'device-2',
      feature: 'meal_text_estimate',
      isPremium: true,
      promptFingerprint: 'salad',
      now,
    });

    const blocked = checkRateLimit({
      deviceInstallId: 'device-2',
      feature: 'meal_text_estimate',
      isPremium: true,
      promptFingerprint: 'different salad',
      now: now + 1000,
    });

    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.code).toBe('COOLDOWN');
    }
  });

  it('blocks identical prompt spam', () => {
    const now = Date.now();
    recordRateLimitUse({
      deviceInstallId: 'device-3',
      feature: 'meal_text_estimate',
      isPremium: true,
      promptFingerprint: 'same meal',
      now,
    });

    const blocked = checkRateLimit({
      deviceInstallId: 'device-3',
      feature: 'meal_text_estimate',
      isPremium: true,
      promptFingerprint: 'same meal',
      now: now + 11_000,
    });

    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.code).toBe('SPAM_BLOCKED');
    }
  });

  it('tracks meal text daily quota (20/day)', () => {
    const deviceInstallId = 'device-4';
    const now = Date.now();

    for (let i = 0; i < 20; i += 1) {
      const allowed = checkRateLimit({
        deviceInstallId,
        feature: 'meal_text_estimate',
        isPremium: true,
        promptFingerprint: `meal-${i}`,
        now: now + i * 11_000,
      });
      expect(allowed.allowed).toBe(true);
      recordRateLimitUse({
        deviceInstallId,
        feature: 'meal_text_estimate',
        isPremium: true,
        promptFingerprint: `meal-${i}`,
        now: now + i * 11_000,
      });
    }

    const blocked = checkRateLimit({
      deviceInstallId,
      feature: 'meal_text_estimate',
      isPremium: true,
      promptFingerprint: 'meal-21',
      now: now + 21 * 11_000,
    });

    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.code).toBe('RATE_LIMITED');
    }
  });

  it('tracks weekly coach quota (2/week)', () => {
    const deviceInstallId = 'device-weekly';
    const now = Date.now();

    for (let i = 0; i < 2; i += 1) {
      const allowed = checkRateLimit({
        deviceInstallId,
        feature: 'weekly_coach',
        isPremium: true,
        promptFingerprint: `coach-${i}`,
        now: now + i * 11_000,
      });
      expect(allowed.allowed).toBe(true);
      recordRateLimitUse({
        deviceInstallId,
        feature: 'weekly_coach',
        isPremium: true,
        promptFingerprint: `coach-${i}`,
        now: now + i * 11_000,
      });
    }

    const blocked = checkRateLimit({
      deviceInstallId,
      feature: 'weekly_coach',
      isPremium: true,
      promptFingerprint: 'coach-3',
      now: now + 22_000,
    });

    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.code).toBe('RATE_LIMITED');
    }
  });

  it('tracks physique assessment quota (2/month)', () => {
    const deviceInstallId = 'device-physique';
    const now = Date.now();

    for (let i = 0; i < 2; i += 1) {
      const allowed = checkRateLimit({
        deviceInstallId,
        feature: 'physique_assessment',
        isPremium: true,
        promptFingerprint: `physique-${i}`,
        now: now + i * 11_000,
      });
      expect(allowed.allowed).toBe(true);
      recordRateLimitUse({
        deviceInstallId,
        feature: 'physique_assessment',
        isPremium: true,
        promptFingerprint: `physique-${i}`,
        now: now + i * 11_000,
      });
    }

    const blocked = checkRateLimit({
      deviceInstallId,
      feature: 'physique_assessment',
      isPremium: true,
      promptFingerprint: 'physique-3',
      now: now + 22_000,
    });

    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.code).toBe('RATE_LIMITED');
    }
  });
});

describe('ai-proxy route quotas via handler', () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it('returns RATE_LIMITED when meal-text quota exceeded', async () => {
    const deviceInstallId = 'device-handler-quota';
    const base = Date.now() - 30 * 60 * 1000;

    for (let i = 0; i < 20; i += 1) {
      recordRateLimitUse({
        deviceInstallId,
        feature: 'meal_text_estimate',
        isPremium: true,
        promptFingerprint: `meal-${i}`,
        now: base + i * 11_000,
      });
    }

    const result = await handleAiRoute(
      AI_ROUTES.mealText,
      JSON.stringify({
        deviceInstallId,
        isPremium: true,
        payload: { description: 'quota blocked meal' },
      }),
      { apiKey: 'test-key' },
    );

    expect(result.status).toBe(429);
    if (!result.body.ok) {
      expect(result.body.code).toBe('RATE_LIMITED');
    }
  });
});
