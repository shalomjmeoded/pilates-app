import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { BetterMeBootLoader } from '@/components/ui/BetterMeBootLoader';
import { getProfile } from '@/db/repositories/profileRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { getOnboardingRoute } from '@/onboarding/constants';
import { getCurrentPremiumStatus } from '@/services/monetization/currentPremiumStatus';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { usePremiumStore } from '@/stores/premiumStore';

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
        setDestination('/(tabs)/workout');
        return;
      }

      if (onboardingCompleted) {
        const profile = await getProfile();
        if (profile) {
          useOnboardingStore.getState().prepareReturningFlow(profile);
          setDestination('/onboarding/step-00-welcome');
          return;
        }
      }

      const savedStep = useOnboardingStore.getState().restorePersistedDraft();
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
