import {
  deriveSubscriptionStatus,
  hasPremiumAccess,
  trainingFrequencyToWorkoutsPerWeek,
} from '../premiumAccess';

describe('premiumAccess', () => {
  it('derives inactive status for free users', () => {
    expect(
      deriveSubscriptionStatus({
        isPremium: false,
        trialUsed: false,
      }),
    ).toBe('inactive');
  });

  it('derives trial status for active trial users', () => {
    expect(
      deriveSubscriptionStatus({
        isPremium: true,
        trialUsed: true,
        productId: 'tune_trial_mock',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    ).toBe('trial');
  });

  it('expires access after trial end', () => {
    const status = {
      subscriptionStatus: 'trial' as const,
      isPremium: true,
      trialUsed: true,
      source: 'mock' as const,
      productId: 'tune_trial_mock',
      expiresAt: '2020-01-01T00:00:00.000Z',
    };

    expect(hasPremiumAccess(status, new Date('2026-01-01T00:00:00.000Z'))).toBe(false);
  });

  it('maps training frequency to workouts per week', () => {
    expect(trainingFrequencyToWorkoutsPerWeek('3_4')).toBe(4);
    expect(trainingFrequencyToWorkoutsPerWeek('5_plus')).toBe(5);
  });
});
