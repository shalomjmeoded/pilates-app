import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { GlobalUpsellModal } from '@/components/premium';
import { TuneBootError } from '@/components/ui/TuneBootError';
import { TuneBootLoader } from '@/components/ui/TuneBootLoader';
import { useDatabase } from '@/hooks/useDatabase';
import { useNotificationDeepLinks } from '@/hooks/useNotificationDeepLinks';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors } from '@/theme';

export default function RootLayout() {
  const [bootAttempt, setBootAttempt] = useState(0);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const hydratePreferences = usePreferencesStore((state) => state.hydrate);
  const { isReady, error } = useDatabase(bootAttempt);
  useNotificationDeepLinks();

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  if (!fontsLoaded) {
    return <TuneBootLoader />;
  }

  if (error) {
    return <TuneBootError message={error} onRetry={() => setBootAttempt((attempt) => attempt + 1)} />;
  }

  if (!isReady) {
    return <TuneBootLoader />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundPrimary },
          animation: 'slide_from_right',
        }}
      />
      <GlobalUpsellModal />
    </>
  );
}
