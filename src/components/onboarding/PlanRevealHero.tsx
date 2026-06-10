import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';

interface PlanRevealHeroProps {
  calories: number;
  proteinG: number;
  workoutsPerWeek: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  timelineLabel: string;
  firstMilestone: string;
}

export function PlanRevealHero({
  calories,
  proteinG,
  workoutsPerWeek,
  carbsG,
  fatG,
  fiberG,
  timelineLabel,
  firstMilestone,
}: PlanRevealHeroProps) {
  return (
    <View style={[styles.hero, shadows.card]}>
      <Text variant="label" style={styles.eyebrow}>
        Your personalized plan
      </Text>
      <Text variant="display" style={styles.calories}>
        {calories}
      </Text>
      <Text variant="bodyMuted" style={styles.calorieUnit}>
        daily calories
      </Text>

      <View style={styles.divider} />

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text variant="h2">{proteinG}g</Text>
          <Text variant="label">Protein</Text>
        </View>
        <View style={styles.stat}>
          <Text variant="h2">{workoutsPerWeek}</Text>
          <Text variant="label">Workouts / wk</Text>
        </View>
      </View>

      <View style={styles.macroRow}>
        <Text variant="bodyMuted">C {carbsG}g · F {fatG}g · Fi {fiberG}g</Text>
      </View>

      <View style={styles.milestoneCard}>
        <Text variant="label">Estimated timeline</Text>
        <Text variant="body">{timelineLabel}</Text>
        <Text variant="bodyMuted" style={styles.milestone}>
          First milestone: {firstMilestone}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.brandSecondary,
  },
  calories: {
    color: colors.brandPrimary,
    marginTop: spacing.xs,
  },
  calorieUnit: {
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  macroRow: {
    marginTop: spacing.xs,
  },
  milestoneCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.card,
    padding: spacing.sm,
    gap: 4,
  },
  milestone: {
    marginTop: 4,
  },
});
