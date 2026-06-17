import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { trackPremiumEvent } from '@/services/monetization/premiumAnalytics';
import {
  restorePurchases,
  startFreeTrial,
} from '@/services/monetization/subscriptionService';
import { cancelOnboardingPaywallNudge } from '@/services/notifications/notificationService';
import {
  selectHasPremiumAccess,
  selectPremiumStatus,
  usePremiumStore,
} from '@/stores/premiumStore';
import type { PremiumFeatureKey } from '@/types/premium';
import type { PremiumPlanId } from '@/types/premium';

export function usePremium() {
  const router = useRouter();
  const status = usePremiumStore(selectPremiumStatus);
  const hasAccess = usePremiumStore(selectHasPremiumAccess);
  const isLoading = usePremiumStore((state) => state.isLoading);
  const upsellFeature = usePremiumStore((state) => state.upsellFeature);
  const upsellVisible = usePremiumStore((state) => state.upsellVisible);
  const hydrate = usePremiumStore((state) => state.hydrate);
  const setStatus = usePremiumStore((state) => state.setStatus);
  const openUpsell = usePremiumStore((state) => state.openUpsell);
  const closeUpsell = usePremiumStore((state) => state.closeUpsell);

  useEffect(() => {
    if (!usePremiumStore.getState().status) {
      void hydrate();
    }
  }, [hydrate]);

  const requirePremium = useCallback(
    (feature: PremiumFeatureKey, onAllowed: () => void) => {
      if (hasAccess) {
        onAllowed();
        return true;
      }

      trackPremiumEvent('feature_locked', { feature });
      trackPremiumEvent('upsell_opened', { feature });
      openUpsell(feature);
      return false;
    },
    [hasAccess, openUpsell],
  );

  const beginFreeTrial = useCallback(async (plan: PremiumPlanId = 'yearly') => {
    const nextStatus = await startFreeTrial(plan);
    setStatus(nextStatus);
    if (nextStatus.isPremium) {
      void cancelOnboardingPaywallNudge();
    }
    return nextStatus;
  }, [setStatus]);

  const restore = useCallback(async () => {
    const nextStatus = await restorePurchases();
    setStatus(nextStatus);
    if (nextStatus.isPremium) {
      void cancelOnboardingPaywallNudge();
    }
    return nextStatus;
  }, [setStatus]);

  const openPaywall = useCallback(() => {
    trackPremiumEvent('paywall_viewed');
    router.push('/paywall');
  }, [router]);

  return {
    status,
    hasAccess,
    isLoading,
    upsellFeature,
    upsellVisible,
    hydrate,
    requirePremium,
    beginFreeTrial,
    restore,
    openPaywall,
    openUpsell,
    closeUpsell,
  };
}
