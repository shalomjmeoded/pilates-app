import { StyleSheet, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { SAFETY_WARNING_MESSAGE } from '@/engines/calculations';
import { trainingFrequencyToWorkoutsPerWeek } from '@/engines/monetization/premiumAccess';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, spacing } from '@/theme';

export default function Step16PlanReveal() {
  const { step, goNext, goToStep } = useOnboardingNavigation(17);
  const draft = useOnboardingStore((state) => state.draft);
  const baselinePlan = draft.baselinePlan;

  if (!baselinePlan) {
    return null;
  }

  const { macros, goalCalories, safetyWarning } = baselinePlan;
  const workoutsPerWeek = trainingFrequencyToWorkoutsPerWeek(draft.trainingFrequency);

  return (
    <OnboardingShell
      step={step}
      title="Your Personalized Plan"
      subtitle="Built specifically for you."
      onBack={() => goToStep(15)}
      onNext={goNext}
      nextLabel="Continue"
    >
      <View style={styles.summaryGrid}>
        <Card style={[styles.metricCard, styles.metricCardPrimary]}>
          <Text variant="label">Calories</Text>
          <Text variant="h1" style={styles.primaryValue}>
            {goalCalories}
          </Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text variant="label">Protein</Text>
          <Text variant="h2">{macros.proteinG}g</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text variant="label">Workouts</Text>
          <Text variant="h2">{workoutsPerWeek}/week</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text variant="label">Carbs</Text>
          <Text variant="h2">{macros.carbsG}g</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text variant="label">Fat</Text>
          <Text variant="h2">{macros.fatG}g</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text variant="label">Fiber</Text>
          <Text variant="h2">{macros.fiberG}g</Text>
        </Card>
      </View>

      {safetyWarning.triggered ? (
        <View style={styles.warning}>
          <Text variant="body" style={styles.warningText}>
            {SAFETY_WARNING_MESSAGE}
          </Text>
        </View>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    width: '47.8%',
    gap: spacing.xs,
    minHeight: 92,
    justifyContent: 'space-between',
  },
  metricCardPrimary: {
    width: '100%',
    minHeight: 112,
    backgroundColor: colors.surfaceRose,
    borderColor: colors.brandPrimary,
  },
  primaryValue: {
    color: colors.brandPrimary,
  },
  warning: {
    backgroundColor: '#FFF4EC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentWarm,
    padding: spacing.sm,
  },
  warningText: {
    color: colors.textDark,
  },
});
