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
      <Card>
        <Text variant="label">Calories</Text>
        <Text variant="h1">{goalCalories}</Text>
      </Card>

      <Card>
        <Text variant="label">Protein</Text>
        <Text variant="h1">{macros.proteinG}g</Text>
      </Card>

      <Card>
        <Text variant="label">Workouts</Text>
        <Text variant="h1">{workoutsPerWeek}/week</Text>
      </Card>

      <View style={styles.macroGrid}>
        <Card style={styles.macroCard}>
          <Text variant="h2">{macros.carbsG}g</Text>
          <Text variant="label">Carbs</Text>
        </Card>
        <Card style={styles.macroCard}>
          <Text variant="h2">{macros.fatG}g</Text>
          <Text variant="label">Fat</Text>
        </Card>
        <Card style={styles.macroCard}>
          <Text variant="h2">{macros.fiberG}g</Text>
          <Text variant="label">Fiber</Text>
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
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  macroCard: {
    width: '31%',
    gap: spacing.xs,
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
