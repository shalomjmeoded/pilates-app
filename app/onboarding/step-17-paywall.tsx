import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding';
import { PaywallHero, type PaywallOutcomeSummary } from '@/components/premium';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { estimateWeeksToGoal, formatRoadmapTargetDate } from '@/engines/calculations';
import { useFinishOnboarding } from '@/hooks/useFinishOnboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { usePremium } from '@/hooks/usePremium';
import { deriveWeightTrajectory } from '@/onboarding/deriveWeightTrajectory';
import { trackPremiumEvent } from '@/services/monetization/premiumAnalytics';
import { scheduleOnboardingPaywallNudge } from '@/services/notifications/notificationService';
import { colors, spacing } from '@/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { displayWeight } from '@/utils/units';

const PAYWALL_HEADER_IMAGES = [
  require('../../assets/exercises/thumbnails/Pilates_Hundred.jpg'),
  require('../../assets/exercises/thumbnails/Pilates_Roll_Up.jpg'),
  require('../../assets/exercises/thumbnails/Single_Leg_Stretch.jpg'),
];

function compactDateLabel(label: string): string {
  return label.replace(/, \d{4}$/, '');
}

function buildPaywallOutcome(
  draft: ReturnType<typeof useOnboardingStore.getState>['draft'],
  weightUnit: 'kg' | 'lb',
): PaywallOutcomeSummary | undefined {
  if (
    draft.currentWeightKg === null ||
    draft.goalWeightKg === null ||
    draft.fitnessGoal === null ||
    draft.paceKgPerWeek === null
  ) {
    return undefined;
  }

  const trajectory = deriveWeightTrajectory(
    draft.fitnessGoal,
    draft.currentWeightKg,
    draft.goalWeightKg,
  );
  const diffKg = Math.abs(draft.currentWeightKg - draft.goalWeightKg);

  if (trajectory === 'steady_state' || diffKg < 0.1) {
    return {
      title: 'Stay consistent',
      caption: 'Your weekly rhythm is ready.',
    };
  }

  const weeksToGoal = estimateWeeksToGoal(
    draft.currentWeightKg,
    draft.goalWeightKg,
    trajectory,
    draft.paceKgPerWeek,
  );
  const targetDate = compactDateLabel(formatRoadmapTargetDate(weeksToGoal));

  if (trajectory === 'weight_loss') {
    return {
      title: 'Lose',
      highlightedValue: displayWeight(diffKg, weightUnit),
      suffix: `by ${targetDate}`,
      caption: 'Your plan adapts as you log progress.',
    };
  }

  return {
    title: 'Build toward',
    highlightedValue: `+${displayWeight(diffKg, weightUnit)}`,
    suffix: `by ${targetDate}`,
    caption: 'Lean, steady progress without guesswork.',
  };
}

export default function Step17Paywall() {
  const { step, goBack } = useOnboardingNavigation(15);
  const { finish, isSubmitting, error, rebuildMode } = useFinishOnboarding();
  const { beginFreeTrial, restore } = usePremium();
  const draft = useOnboardingStore((state) => state.draft);
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);
  const [actionError, setActionError] = useState<string | null>(null);
  const outcome = buildPaywallOutcome(draft, weightUnit);

  useEffect(() => {
    if (!rebuildMode) {
      trackPremiumEvent('paywall_viewed', { metadata: { source: 'onboarding' } });
      void scheduleOnboardingPaywallNudge();
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
      scrollEnabled={false}
      hideStepIndicator
      titleLines={1}
      phaseLabel="Unlock your plan"
      reasonWhy={null}
      headerAccessorySources={PAYWALL_HEADER_IMAGES}
      headerAccessoryAccessibilityLabel="Pilates movement previews"
      headerAccessoryPlacement="background"
      titleTreatment="softContrast"
    >
      <View style={styles.container}>
        <PaywallHero
          compact
          outcome={outcome}
          onStartTrial={(plan) => void unlockPlan(() => beginFreeTrial(plan))}
          onRestore={() => void unlockPlan(restore)}
        />

        {isSubmitting ? <Text variant="bodyMuted">Unlocking your plan...</Text> : null}
        {actionError || error ? (
          <Text variant="body" style={styles.error}>
            {actionError ?? error}
          </Text>
        ) : null}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  copy: {
    marginTop: 2,
  },
  error: {
    color: colors.destructive,
    textAlign: 'center',
  },
});
