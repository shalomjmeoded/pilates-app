import { StyleSheet, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import { Text } from '@/components/ui/Text';
import { isDateToday } from '@/engines/workout';
import { colors, radius, spacing } from '@/theme';

interface NutritionTodayCardProps {
  mealDate: string;
  targetCalories: number;
  remainingCalories: number;
}

export function NutritionTodayCard({
  mealDate,
  targetCalories,
  remainingCalories,
}: NutritionTodayCardProps) {
  const today = isDateToday(mealDate);

  return (
    <View style={styles.card}>
      <Text variant="label">{today ? 'Today' : format(parseISO(mealDate), 'EEEE')}</Text>
      <Text variant="h2" style={styles.date}>
        {format(parseISO(mealDate), 'MMMM d')}
      </Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text variant="label">Daily target</Text>
          <Text variant="h2">{targetCalories}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text variant="label">Remaining</Text>
          <Text variant="h2" style={styles.remaining}>
            {Math.max(0, remainingCalories)}
          </Text>
        </View>
      </View>
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
    gap: spacing.xs,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  date: {
    color: colors.textDark,
  },
  row: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.sm,
  },
  remaining: {
    color: colors.brandPrimary,
  },
});
