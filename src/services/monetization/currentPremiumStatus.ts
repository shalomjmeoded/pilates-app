import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import {
  getDevPremiumStatus,
  isDevPremiumBypassEnabled,
} from '@/services/monetization/devPremiumBypass';
import type { PremiumStatus } from '@/types/premium';

export async function getCurrentPremiumStatus(): Promise<PremiumStatus> {
  if (isDevPremiumBypassEnabled()) {
    return getDevPremiumStatus();
  }

  try {
    const { refreshRevenueCatPremiumStatus } = await import(
      '@/services/monetization/revenueCatService'
    );
    return (await refreshRevenueCatPremiumStatus()) ?? (await getPremiumStatus());
  } catch {
    return getPremiumStatus();
  }
}
