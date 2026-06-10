const cachedFlags: Record<string, boolean | string | number> = {};

jest.mock('@/storage/mmkv', () => ({
  preferencesStorage: {
    getCachedFlags: () => cachedFlags,
    setCachedFlag: (_key: string, value: boolean | string | number) => {
      cachedFlags.premium_analytics_events = value;
    },
  },
}));

import {
  clearPremiumAnalyticsEvents,
  getPremiumAnalyticsEvents,
  trackPremiumEvent,
} from '../premiumAnalytics';

describe('premiumAnalytics', () => {
  beforeEach(() => {
    Object.keys(cachedFlags).forEach((key) => delete cachedFlags[key]);
    clearPremiumAnalyticsEvents();
  });

  it('tracks paywall and upsell events locally', () => {
    trackPremiumEvent('paywall_viewed');
    trackPremiumEvent('feature_locked', { feature: 'add_meal' });
    trackPremiumEvent('upsell_opened', { feature: 'add_meal' });
    trackPremiumEvent('trial_started');

    const events = getPremiumAnalyticsEvents();
    expect(events.map((event) => event.event)).toEqual([
      'paywall_viewed',
      'feature_locked',
      'upsell_opened',
      'trial_started',
    ]);
    expect(events[1]?.feature).toBe('add_meal');
  });
});
