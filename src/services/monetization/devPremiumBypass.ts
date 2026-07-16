import type { PremiumStatus } from '@/types/premium';

/** Local-only mock premium. Never active in production builds. */
export function isDevPremiumBypassEnabled(): boolean {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return false;
  }

  return process.env.EXPO_PUBLIC_DEV_PREMIUM === 'true';
}

export function getDevPremiumStatus(): PremiumStatus {
  return {
    subscriptionStatus: 'active',
    isPremium: true,
    productId: 'dev_bypass',
    trialUsed: false,
    source: 'mock',
  };
}
