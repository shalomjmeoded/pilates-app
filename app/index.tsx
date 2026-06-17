import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { BetterMeBootLoader } from '@/components/ui/BetterMeBootLoader';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { getCurrentPremiumStatus } from '@/services/monetization/currentPremiumStatus';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { usePremiumStore } from '@/stores/premiumStore';

export default function Index() {
  const onboardingCompleted = usePreferencesStore(
    (state) => state.preferences.onboardingCompleted,
  );
  const [premiumChecked, setPremiumChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    void (async () => {
      const status = await getCurrentPremiumStatus();
      usePremiumStore.getState().setStatus(status);
      setHasAccess(hasPremiumAccess(status));
      setPremiumChecked(true);
    })();
  }, []);

  if (!premiumChecked) {
    return <BetterMeBootLoader />;
  }

  if (!onboardingCompleted || !hasAccess) {
    return <Redirect href="/onboarding/step-00-welcome" />;
  }

  return <Redirect href="/(tabs)/workout" />;
}
