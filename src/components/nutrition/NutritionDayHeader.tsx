import { StyleSheet, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import { CompactMacroSummary } from './CompactMacroSummary';
import { Text } from '@/components/ui/Text';
import { isDateToday } from '@/engines/workout';
import type { MacroTotals, NutritionTargets } from '@/types/nutrition';
import { colors, radius, spacing } from '@/theme';

interface NutritionDayHeaderProps {
  mealDate: string;
  mealCount: number;
  consumed: MacroTotals;
  targets: NutritionTargets;
}

export function NutritionDayHeader({
  mealDate,
  mealCount,
  consumed,
  targets,
}: NutritionDayHeaderProps) {
  const today = isDateToday(mealDate);
  const mealLabel = mealCount === 1 ? '1 meal' : `${mealCount} meals`;

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.topRow}>
        <View style={styles.dateBlock}>
          <Text variant="label">{today ? 'Today' : format(parseISO(mealDate), 'EEEE')}</Text>
          <Text variant="h2" style={styles.date}>
            {format(parseISO(mealDate), 'MMM d')}
          </Text>
        </View>
        <View style={styles.mealCountBadge}>
          <Text variant="h2" style={styles.mealCountValue}>
            {mealCount}
          </Text>
          <Text variant="label" style={styles.mealCountLabel}>
            {mealLabel}
          </Text>
        </View>
      </View>
      <CompactMacroSummary consumed={consumed} targets={targets} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.accentCool,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateBlock: {
    gap: 2,
  },
  date: {
    color: colors.textDark,
  },
  mealCountBadge: {
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSelected,
    paddingHorizontal: spacing.xs,
    paddingVertical: 8,
  },
  mealCountValue: {
    color: colors.brandPrimary,
    lineHeight: 24,
  },
  mealCountLabel: {
    color: colors.textMuted,
  },
});
