import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing, createDynamicStyles } from '@/theme';

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
  const progress = targetCalories > 0
    ? Math.min(1, Math.max(0, consumedCalories / targetCalories))
    : 0;
  const status = isOver
    ? 'Target reached — focus on your next balanced choice.'
    : progress >= 0.75
      ? 'Nearly there for today.'
      : 'Plenty of room for balanced meals.';

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
      <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text variant="caption" style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
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
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.brandSecondary,
  },
  status: {
    color: colors.textMuted,
  },
}));
