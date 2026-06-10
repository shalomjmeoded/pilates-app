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
          <Text variant="label">{mealLabel}</Text>
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
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateBlock: {
    gap: 2,
  },
  date: {
    color: colors.textDark,
  },
  mealCountBadge: {
    alignItems: 'flex-end',
    gap: 2,
  },
  mealCountValue: {
    color: colors.brandPrimary,
  },
});
