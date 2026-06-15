import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface PlanRevealHeroProps {
  calories: number;
  proteinG: number;
  workoutsPerWeek: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export function PlanRevealHero({
  calories,
  proteinG,
  workoutsPerWeek,
  carbsG,
  fatG,
  fiberG,
}: PlanRevealHeroProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          Your workout plan
        </Text>
        <View style={styles.workoutRow}>
          <Text variant="display" style={styles.workoutCount}>
            {workoutsPerWeek}
          </Text>
          <View style={styles.workoutCopy}>
            <Text variant="label" style={styles.eyebrow}>
              workouts / week
            </Text>
            <Text variant="bodyMuted" numberOfLines={2}>
              Adaptive Pilates sessions built around your goals.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          Your nutrition plan
        </Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.calorieBlock}>
            <Text variant="label" style={styles.eyebrow}>
              Calories
            </Text>
            <Text variant="display" style={styles.calories}>
              {calories}
            </Text>
          </View>
          <View style={styles.macroGrid}>
            <View style={styles.macroPill}>
              <Text variant="h2" style={styles.macroValue}>
                {proteinG}g
              </Text>
              <Text variant="caption">Protein</Text>
            </View>
            <View style={styles.macroPill}>
              <Text variant="h2" style={styles.macroValue}>
                {carbsG}g
              </Text>
              <Text variant="caption">Carbs</Text>
            </View>
            <View style={styles.macroPill}>
              <Text variant="h2" style={styles.macroValue}>
                {fatG}g
              </Text>
              <Text variant="caption">Fat</Text>
            </View>
            <View style={styles.macroPill}>
              <Text variant="h2" style={styles.macroValue}>
                {fiberG}g
              </Text>
              <Text variant="caption">Fiber</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.brandPrimary,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  workoutCount: {
    color: colors.brandPrimary,
    minWidth: 72,
    textAlign: 'center',
  },
  workoutCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: colors.brandSecondary,
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  calorieBlock: {
    flex: 1.2,
    minHeight: 172,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  calories: {
    color: colors.brandPrimary,
  },
  macroGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  macroPill: {
    width: '48%',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  macroValue: {
    color: colors.textStrong,
  },
});
