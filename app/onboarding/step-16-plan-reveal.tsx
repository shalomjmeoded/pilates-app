import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { OnboardingShell, PlanRevealHero } from '@/components/onboarding';
import { Text } from '@/components/ui/Text';
import { WELLNESS_DISCLAIMER } from '@/constants/compliance';
import {
  estimateWeeksToGoal,
  formatFirstMilestone,
  formatRoadmapTargetDate,
} from '@/engines/calculations';
import { SAFETY_WARNING_MESSAGE } from '@/engines/calculations';
import { trainingFrequencyToWorkoutsPerWeek } from '@/engines/monetization/premiumAccess';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors, radius, spacing } from '@/theme';
import { successNotificationHaptic } from '@/utils/haptics';

export default function Step16PlanReveal() {
  const { step, goNext, goToStep } = useOnboardingNavigation(15);
  const draft = useOnboardingStore((state) => state.draft);
  const baselinePlan = draft.baselinePlan;
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);
  const hasPlayedSuccess = useRef(false);

  useEffect(() => {
    if (baselinePlan && !hasPlayedSuccess.current) {
      hasPlayedSuccess.current = true;
      successNotificationHaptic();
      AccessibilityInfo.announceForAccessibility('Your personalized plan is ready.');
    }
  }, [baselinePlan]);

  if (!baselinePlan) {
    return (
      <OnboardingShell
        step={step}
        title="Almost there"
        subtitle="One more moment while we finalize your plan."
        onBack={() => goToStep(14)}
        onNext={() => goToStep(14)}
        nextLabel="Review plan setup"
        phaseLabel="Creating your plan"
        reasonWhy={null}
      >
        <View style={styles.disclaimer}>
          <Text variant="bodyMuted" style={styles.disclaimerText}>
            Reopen the previous step to finalize your personalized plan.
          </Text>
        </View>
      </OnboardingShell>
    );
  }

  const { macros, goalCalories, safetyWarning } = baselinePlan;
  const workoutsPerWeek = trainingFrequencyToWorkoutsPerWeek(draft.trainingFrequency);
  const currentWeight = draft.currentWeightKg ?? 68;
  const goalWeight = draft.goalWeightKg ?? currentWeight;
  const pace = draft.paceKgPerWeek ?? 0.5;
  const trajectory = draft.weightTrajectory ?? 'weight_loss';
  const weeksToGoal = estimateWeeksToGoal(currentWeight, goalWeight, trajectory, pace);
  const timelineLabel =
    weeksToGoal === null
      ? 'Build consistency for long-term wellness'
      : weeksToGoal === 0
        ? 'You are aligned with your goal weight'
        : `~${weeksToGoal} weeks · target ${formatRoadmapTargetDate(weeksToGoal)}`;

  return (
    <OnboardingShell
      step={step}
      title="This is your Tune plan"
      subtitle="Movement, nourishment, and milestones — woven together for calm, sustainable progress."
      onBack={() => goToStep(14)}
      onNext={goNext}
      nextLabel="Unlock my plan"
      phaseLabel="Your reveal"
      reasonWhy={null}
      hideStepIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(400)}>
        <Text variant="bodyMuted" style={styles.revealLead}>
          Everything you shared shaped these targets. They&apos;re yours — private, personal, and
          ready when you are.
        </Text>
      </Animated.View>

      <PlanRevealHero
        calories={goalCalories}
        proteinG={macros.proteinG}
        workoutsPerWeek={workoutsPerWeek}
        carbsG={macros.carbsG}
        fatG={macros.fatG}
        fiberG={macros.fiberG}
        timelineLabel={timelineLabel}
        firstMilestone={formatFirstMilestone(currentWeight, trajectory, pace, weightUnit)}
      />

      {safetyWarning.triggered ? (
        <View style={styles.warning} accessibilityRole="alert">
          <Text variant="label" style={styles.warningTitle}>
            Safety note
          </Text>
          <Text variant="body" style={styles.warningText}>
            {SAFETY_WARNING_MESSAGE}
          </Text>
        </View>
      ) : null}

      <View style={styles.disclaimer}>
        <Text variant="bodyMuted" style={styles.disclaimerText}>
          {WELLNESS_DISCLAIMER}
        </Text>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  revealLead: {
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  warning: {
    backgroundColor: colors.warningSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.sm,
  },
  warningText: {
    color: colors.textDark,
  },
  warningTitle: {
    color: colors.textStrong,
    marginBottom: spacing.xs,
  },
  disclaimer: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
  },
  disclaimerText: {
    lineHeight: 22,
  },
});
