import {
  purchaseRevenueCatCurrentOffering,
  restoreRevenueCatPurchases,
} from '@/services/monetization/revenueCatService';
import type { PremiumPlanId, PremiumStatus } from '@/types/premium';

export async function startFreeTrial(plan: PremiumPlanId = 'yearly'): Promise<PremiumStatus> {
  return purchaseRevenueCatCurrentOffering(plan);
}

export async function restorePurchases(): Promise<PremiumStatus> {
  return restoreRevenueCatPurchases();
}
