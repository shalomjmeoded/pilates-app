import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding';
import { PremiumGate } from '@/components/premium';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { PAYWALL_BENEFITS, PAYWALL_SUBTITLE, PAYWALL_TITLE } from '@/constants/premiumBenefits';
import { useFinishOnboarding } from '@/hooks/useFinishOnboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { usePremium } from '@/hooks/usePremium';
import { trackPremiumEvent } from '@/services/monetization/premiumAnalytics';
import { colors, spacing } from '@/theme';

export default function Step17Paywall() {
  const { step, goBack } = useOnboardingNavigation(16);
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
        title="Rebuild complete"
        subtitle="Your history stays intact. We will refresh your plan targets."
        onBack={goBack}
        hideFooter
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
      title={PAYWALL_TITLE}
      subtitle="Start your 7-day free trial to unlock Tune."
      onBack={goBack}
      hideFooter
      showBack
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <PremiumGate
          title={PAYWALL_TITLE}
          description={PAYWALL_SUBTITLE}
          bullets={[...PAYWALL_BENEFITS]}
          onStartTrial={() => void unlockPlan(beginFreeTrial)}
          onRestore={() => void unlockPlan(restore)}
        />

        <View style={styles.trialNote}>
          <Text variant="bodyMuted">
            7-day free trial, then subscription required. Payment processing ships with RevenueCat in a
            later phase — this build unlocks locally for development.
          </Text>
        </View>

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
  trialNote: {
    paddingHorizontal: spacing.xs,
  },
  error: {
    color: colors.brandPrimary,
    textAlign: 'center',
  },
});
