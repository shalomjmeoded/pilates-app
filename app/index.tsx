import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { TuneBootLoader } from '@/components/ui/TuneBootLoader';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
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
      const status = await getPremiumStatus();
      usePremiumStore.getState().setStatus(status);
      setHasAccess(hasPremiumAccess(status));
      setPremiumChecked(true);
    })();
  }, []);

  if (!premiumChecked) {
    return <TuneBootLoader />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding/step-00-units" />;
  }

  if (!hasAccess) {
    return <Redirect href="/paywall" />;
  }

  return <Redirect href="/(tabs)/workout" />;
}
