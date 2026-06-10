import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';

interface RemainingCaloriesHeroProps {
  remainingCalories: number;
  targetCalories: number;
  consumedCalories: number;
}

export function RemainingCaloriesHero({
  remainingCalories,
  targetCalories,
  consumedCalories,
}: RemainingCaloriesHeroProps) {
  const isOver = remainingCalories < 0;

  return (
    <View style={[styles.hero, shadows.card]}>
      <Text variant="label">Remaining today</Text>
      <Text variant="display" style={styles.value}>
        {Math.abs(Math.round(remainingCalories))}
      </Text>
      <Text variant="bodyMuted">
        {isOver ? 'kcal over target' : 'kcal left'} · {Math.round(consumedCalories)} /{' '}
        {Math.round(targetCalories)} eaten
      </Text>
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
  value: {
    color: colors.brandPrimary,
    fontSize: 40,
    lineHeight: 46,
  },
});
