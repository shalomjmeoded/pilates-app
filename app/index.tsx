import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { BetterMeBootLoader } from '@/components/ui/BetterMeBootLoader';
import { getProfile } from '@/db/repositories/profileRepository';
import { countWorkoutPlans } from '@/db/repositories/workoutRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { getOnboardingRoute } from '@/onboarding/constants';
import { getCurrentPremiumStatus } from '@/services/monetization/currentPremiumStatus';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { usePremiumStore } from '@/stores/premiumStore';
import {
  beginOnboardingAnalyticsSession,
  captureProductEvent,
  resetOnboardingAnalyticsSession,
} from '@/services/analytics/analyticsCore';

export default function Index() {
  const onboardingCompleted = usePreferencesStore(
    (state) => state.preferences.onboardingCompleted,
  );
  const [destination, setDestination] = useState<Href | null>(null);

  useEffect(() => {
    void (async () => {
      const status = await getCurrentPremiumStatus();
      usePremiumStore.getState().setStatus(status);
      const hasAccess = hasPremiumAccess(status);

      if (onboardingCompleted && hasAccess) {
        // A successful purchase can precede first-workout generation. If the
        // app was closed during that handoff, return to the retryable builder
        // instead of silently skipping the first session.
        let needsFirstWorkoutRecovery = false;
        try {
          needsFirstWorkoutRecovery = (await countWorkoutPlans()) === 0;
        } catch (error) {
          console.warn('[BetterMe] Could not verify first workout state.', error);
        }

        if (needsFirstWorkoutRecovery) {
          setDestination('/onboarding/step-18-workout-loading');
          return;
        }

        setDestination('/(tabs)/workout');
        return;
      }

      if (onboardingCompleted) {
        const profile = await getProfile();
        if (profile) {
          useOnboardingStore.getState().prepareReturningFlow(profile);
          resetOnboardingAnalyticsSession();
          captureProductEvent('onboarding started', {
            route_key: getOnboardingRoute(1),
            step_index: 1,
            entry_mode: 'returning',
          });
          setDestination('/onboarding/step-00-welcome');
          return;
        }
      }

      const savedStep = useOnboardingStore.getState().restorePersistedDraft();
      if (savedStep) {
        beginOnboardingAnalyticsSession();
        captureProductEvent('onboarding resumed', {
          route_key: getOnboardingRoute(savedStep),
          step_index: savedStep,
          entry_mode: 'fresh',
        });
      } else {
        resetOnboardingAnalyticsSession();
        captureProductEvent('onboarding started', {
          route_key: getOnboardingRoute(1),
          step_index: 1,
          entry_mode: 'fresh',
        });
      }
      setDestination(
        savedStep
          ? `/onboarding/${getOnboardingRoute(savedStep)}`
          : '/onboarding/step-00-welcome',
      );
    })();
  }, [onboardingCompleted]);

  if (!destination) {
    return <BetterMeBootLoader />;
  }

  return <Redirect href={destination} />;
}
