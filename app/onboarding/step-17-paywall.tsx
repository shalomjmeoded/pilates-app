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
  const { step, goBack } = useOnboardingNavigation(15);
  const { finish, isSubmitting, error, rebuildMode } = useFinishOnboarding();
  const { beginFreeTrial, restore } = usePremium();
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
        title="Your rhythm, refreshed"
        subtitle="Your history stays intact. We will update your plan targets from your new answers."
        onBack={goBack}
        hideFooter
        hideStepIndicator
      >
        <Card>
          <Text variant="h2">Update my plan</Text>
          <Text variant="bodyMuted" style={styles.copy}>
            Profile and nutrition targets will be replaced using your new onboarding answers.
          </Text>
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
      title="Your plan is ready to begin"
      subtitle="Start your free trial to unlock movement, nourishment, and coaching — shaped entirely around you."
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
          onStartTrial={() => void unlockPlan(beginFreeTrial)}
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
    paddingBottom: spacing.lg,
  },
  copy: {
    marginTop: 2,
  },
  error: {
    color: colors.destructive,
    textAlign: 'center',
  },
});
