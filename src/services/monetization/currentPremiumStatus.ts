import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import {
  grantDevPremiumBypass,
  isDevPremiumEnvEnabled,
} from '@/services/monetization/devPremiumBypass';
import type { PremiumStatus } from '@/types/premium';

export async function getCurrentPremiumStatus(): Promise<PremiumStatus> {
  if (isDevPremiumEnvEnabled()) {
    const existing = await getPremiumStatus();
    if (existing.isPremium && existing.productId === 'dev_bypass') {
      return existing;
    }
    return grantDevPremiumBypass();
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
