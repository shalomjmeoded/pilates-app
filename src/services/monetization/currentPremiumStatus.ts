import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import type { PremiumStatus } from '@/types/premium';

export async function getCurrentPremiumStatus(): Promise<PremiumStatus> {
  try {
    const { refreshRevenueCatPremiumStatus } = await import(
      '@/services/monetization/revenueCatService'
    );
    return (await refreshRevenueCatPremiumStatus()) ?? (await getPremiumStatus());
  } catch {
    return getPremiumStatus();
  }
}
