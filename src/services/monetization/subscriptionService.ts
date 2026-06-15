import { addDays } from 'date-fns';

import {
  getPremiumStatus,
  setMockPremiumStatus,
} from '@/db/repositories/premiumRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { trackPremiumEvent } from '@/services/monetization/premiumAnalytics';
import {
  purchaseRevenueCatCurrentOffering,
  restoreRevenueCatPurchases,
} from '@/services/monetization/revenueCatService';
import type { PremiumPlanId, PremiumStatus } from '@/types/premium';
import { TRIAL_LENGTH_DAYS } from '@/types/premium';

export async function startMockTrial(): Promise<PremiumStatus> {
  const current = await getPremiumStatus();

  if (current.trialUsed && !hasPremiumAccess(current)) {
    throw new Error('Your free trial has already been used. Subscribe to continue.');
  }

  const expiresAt = addDays(new Date(), TRIAL_LENGTH_DAYS).toISOString();
  const status: PremiumStatus = {
    subscriptionStatus: 'trial',
    isPremium: true,
    trialUsed: true,
    source: 'mock',
    productId: 'betterme_trial_mock',
    expiresAt,
  };

  await setMockPremiumStatus(status);
  trackPremiumEvent('trial_started', { metadata: { source: 'mock' } });

  return status;
}

export async function startFreeTrial(plan: PremiumPlanId = 'yearly'): Promise<PremiumStatus> {
  return purchaseRevenueCatCurrentOffering(plan);
}

export async function restorePurchases(): Promise<PremiumStatus> {
  return restoreRevenueCatPurchases();
}

export async function restoreMockPurchases(): Promise<PremiumStatus> {
  trackPremiumEvent('restore_purchase_tapped');

  const current = await getPremiumStatus();

  if (current.trialUsed && current.productId) {
    const restored: PremiumStatus = {
      subscriptionStatus: current.productId.includes('trial') ? 'trial' : 'active',
      isPremium: true,
      trialUsed: current.trialUsed,
      source: 'mock',
      productId: current.productId,
      expiresAt: current.expiresAt ?? addDays(new Date(), TRIAL_LENGTH_DAYS).toISOString(),
    };
    await setMockPremiumStatus(restored);
    trackPremiumEvent('restore_purchase_succeeded', { metadata: { source: 'mock' } });
    return restored;
  }

  throw new Error('No previous purchase found on this device.');
}
