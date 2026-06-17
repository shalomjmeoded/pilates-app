import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { PaywallHero } from '@/components/premium';
import { Text } from '@/components/ui/Text';
import { useFinishOnboarding } from '@/hooks/useFinishOnboarding';
import { usePremium } from '@/hooks/usePremium';
import { trackPremiumEvent } from '@/services/monetization/premiumAnalytics';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors, spacing } from '@/theme';

export default function PaywallScreen() {
  const router = useRouter();
  const onboardingCompleted = usePreferencesStore(
    (state) => state.preferences.onboardingCompleted,
  );
  const { finish, isSubmitting, error, rebuildMode } = useFinishOnboarding();
  const { beginFreeTrial, restore, hasAccess, hydrate } = usePremium();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    trackPremiumEvent('paywall_viewed');
    void hydrate();
  }, [hydrate]);

  const completeAccess = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
      if (!onboardingCompleted) {
        await finish();
        return;
      }
    } catch (accessError) {
      setActionError(
        accessError instanceof Error ? accessError.message : 'Could not unlock your plan.',
      );
    }
  };

  if (rebuildMode) {
    return null;
  }

  if (hasAccess && onboardingCompleted) {
    return <Redirect href="/(tabs)/workout" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {router.canGoBack() ? <SubscreenTopBar /> : null}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <PaywallHero
          compact
          onStartTrial={(plan) => void completeAccess(() => beginFreeTrial(plan))}
          onRestore={() => void completeAccess(restore)}
        />
        {isSubmitting ? <Text variant="bodyMuted">Unlocking your plan...</Text> : null}
        {actionError || error ? (
          <Text variant="body" style={styles.error}>
            {actionError ?? error}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    padding: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  error: {
    color: colors.destructive,
    textAlign: 'center',
  },
});
