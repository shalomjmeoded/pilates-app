import { setMockPremiumStatus } from '@/db/repositories/premiumRepository';
import { cancelOnboardingPaywallNudge } from '@/services/notifications/notificationService';
import type { PremiumStatus } from '@/types/premium';

export function isDevPremiumEnvEnabled(): boolean {
  return (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    process.env.EXPO_PUBLIC_DEV_PREMIUM === 'true'
  );
}

export function createDevPremiumStatus(): PremiumStatus {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 10);

  return {
    subscriptionStatus: 'trial',
    isPremium: true,
    trialUsed: true,
    source: 'mock',
    productId: 'dev_bypass',
    expiresAt: expiresAt.toISOString(),
  };
}

export async function grantDevPremiumBypass(): Promise<PremiumStatus> {
  if (!__DEV__) {
    throw new Error('Dev premium bypass is only available in development builds.');
  }

  const status = createDevPremiumStatus();
  await setMockPremiumStatus(status);
  void cancelOnboardingPaywallNudge();
  return status;
}

export async function clearDevPremiumBypass(): Promise<PremiumStatus> {
  if (!__DEV__) {
    throw new Error('Dev premium bypass is only available in development builds.');
  }

  const status: PremiumStatus = {
    subscriptionStatus: 'inactive',
    isPremium: false,
    trialUsed: false,
    source: 'mock',
  };
  await setMockPremiumStatus(status);
  return status;
}
