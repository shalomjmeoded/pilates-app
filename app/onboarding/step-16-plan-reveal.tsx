import { StyleSheet, View } from 'react-native';

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

export default function Step16PlanReveal() {
  const { step, goNext, goToStep } = useOnboardingNavigation(15);
  const draft = useOnboardingStore((state) => state.draft);
  const baselinePlan = draft.baselinePlan;
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);

  if (!baselinePlan) {
    return null;
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
      title="Your plan is ready"
      subtitle="Built for sustainable progress — stronger every week."
      onBack={() => goToStep(14)}
      onNext={goNext}
      nextLabel="Start with Tune"
    >
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
        <View style={styles.warning}>
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
  warning: {
    backgroundColor: colors.surfacePeach,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accentWarm,
    padding: spacing.sm,
  },
  warningText: {
    color: colors.textDark,
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
