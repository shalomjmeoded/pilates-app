import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding';
import { PaywallHero } from '@/components/premium';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useFinishOnboarding } from '@/hooks/useFinishOnboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { usePremium } from '@/hooks/usePremium';
import { trackPremiumEvent } from '@/services/monetization/premiumAnalytics';
import { colors, spacing } from '@/theme';

export default function Step17Paywall() {
  const { step, goBack } = useOnboardingNavigation(14);
  const { finish, isSubmitting, error, rebuildMode } = useFinishOnboarding();
  const { beginFreeTrial, beginMockTrial, restore } = usePremium();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!rebuildMode) {
      trackPremiumEvent('paywall_viewed', { metadata: { source: 'onboarding' } });
    }
  }, [rebuildMode]);

  const unlockPlan = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
      await finish();
    } catch (unlockError) {
      setActionError(
        unlockError instanceof Error ? unlockError.message : 'Could not unlock your plan.',
      );
    }
  };

  if (rebuildMode) {
    return (
      <OnboardingShell
        step={step}
        title="Plan refreshed"
        subtitle="Your history stays intact."
        onBack={goBack}
        hideFooter
        hideStepIndicator
      >
        <Card>
          <Text variant="h2">Update my plan</Text>
          <Text variant="bodyMuted" style={styles.copy}>Targets refresh from your new answers.</Text>
        </Card>
        <Button
          label={isSubmitting ? 'Updating...' : 'Update my plan'}
          onPress={() => void finish()}
          disabled={isSubmitting}
        />
        {error ? (
          <Text variant="body" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={step}
      title="Unlock BetterMe"
      subtitle="Start your free trial."
      onBack={goBack}
      hideFooter
      showBack
      scrollEnabled
      hideStepIndicator
      phaseLabel="Unlock your plan"
      reasonWhy={null}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <PaywallHero
          compact
          onStartTrial={(plan) => void unlockPlan(() => beginFreeTrial(plan))}
          onContinueWithTrial={__DEV__ ? () => void unlockPlan(beginMockTrial) : undefined}
          onRestore={() => void unlockPlan(restore)}
        />

        {isSubmitting ? <Text variant="bodyMuted">Unlocking your plan...</Text> : null}
        {actionError || error ? (
          <Text variant="body" style={styles.error}>
            {actionError ?? error}
          </Text>
        ) : null}
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  copy: {
    marginTop: 2,
  },
  error: {
    color: colors.destructive,
    textAlign: 'center',
  },
});
