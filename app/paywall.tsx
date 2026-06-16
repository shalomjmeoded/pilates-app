import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
    return (
      <SafeAreaView style={styles.safeArea}>
        <SubscreenTopBar />
        <View style={styles.centered}>
          <Text variant="h1">Your plan is unlocked</Text>
          <Text variant="bodyMuted">Welcome back to your personalized BetterMe rhythm.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  error: {
    color: colors.destructive,
    textAlign: 'center',
  },
});
