import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import '@/theme';
import { GlobalUpsellModal, PremiumThemeGuard } from '@/components/premium';
import { BetterMeBootError } from '@/components/ui/BetterMeBootError';
import { BetterMeBootLoader } from '@/components/ui/BetterMeBootLoader';
import { useDatabase } from '@/hooks/useDatabase';
import { useNotificationDeepLinks } from '@/hooks/useNotificationDeepLinks';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { AnalyticsProvider } from '@/services/analytics/AnalyticsProvider';
import { ThemeProvider, colors, useAppTheme } from '@/theme';

export default function RootLayout() {
  const [bootAttempt, setBootAttempt] = useState(0);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  const hydratePreferences = usePreferencesStore((state) => state.hydrate);
  const { isReady, error } = useDatabase(bootAttempt);
  useNotificationDeepLinks();

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AnalyticsProvider>
          <RootLayoutContent
            fontsLoaded={fontsLoaded}
            error={error}
            isReady={isReady}
            onRetry={() => setBootAttempt((attempt) => attempt + 1)}
          />
        </AnalyticsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutContent({
  fontsLoaded,
  error,
  isReady,
  onRetry,
}: {
  fontsLoaded: boolean;
  error: string | null;
  isReady: boolean;
  onRetry: () => void;
}) {
  const { scheme } = useAppTheme();

  let content;

  if (!fontsLoaded) {
    content = <BetterMeBootLoader />;
  } else if (error) {
    content = <BetterMeBootError message={error} onRetry={onRetry} />;
  } else if (!isReady) {
    content = <BetterMeBootLoader />;
  } else {
    content = (
      <>
        <Stack
          key={scheme}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.backgroundPrimary },
            animation: 'slide_from_right',
          }}
        />
        <GlobalUpsellModal />
        <PremiumThemeGuard />
      </>
    );
  }

  return content;
}
