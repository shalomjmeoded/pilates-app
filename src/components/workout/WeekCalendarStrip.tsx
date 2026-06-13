import { Pressable, StyleSheet, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import { Text } from '@/components/ui/Text';
import { formatPlanDate, isDateToday } from '@/engines/workout';
import { colors, radius, spacing } from '@/theme';

interface WeekCalendarStripProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (planDate: string) => void;
  completedDates?: Set<string>;
}

export function WeekCalendarStrip({
  dates,
  selectedDate,
  onSelectDate,
  completedDates,
}: WeekCalendarStripProps) {
  return (
    <View style={styles.row}>
      {dates.map((planDate) => {
        const selected = planDate === selectedDate;
        const today = isDateToday(planDate);
        const completed = completedDates?.has(planDate);

        return (
          <Pressable
            key={planDate}
            accessibilityRole="button"
            accessibilityLabel={`${format(parseISO(planDate), 'EEEE MMMM d')}${completed ? ', workout completed' : ''}${today ? ', today' : ''}`}
            accessibilityState={{ selected }}
            onPress={() => onSelectDate(planDate)}
            style={[
              styles.chip,
              selected && styles.chipSelected,
              today && !selected && styles.chipToday,
            ]}
          >
            <Text variant="label" style={[styles.weekday, selected && styles.textSelected]}>
              {format(parseISO(planDate), 'EEE')}
            </Text>
            <Text variant="body" style={[styles.dayNumber, selected && styles.textSelected]}>
              {format(parseISO(planDate), 'd')}
            </Text>
            <View style={styles.dotSlot}>
              {completed ? (
                <View style={[styles.completedDot, selected && styles.completedDotSelected]} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function buildCompletedDatesSet(
  entries: Array<{ planDate: string; completed: boolean }>,
): Set<string> {
  return new Set(entries.filter((entry) => entry.completed).map((entry) => entry.planDate));
}

export { formatPlanDate };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    paddingVertical: 2,
  },
  chip: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipToday: {
    borderColor: colors.accentCool,
  },
  chipSelected: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  weekday: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dayNumber: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: colors.textDark,
  },
  textSelected: {
    color: colors.surfaceCanvas,
  },
  dotSlot: {
    height: 6,
    marginTop: 2,
    justifyContent: 'center',
  },
  completedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accentCool,
  },
  completedDotSelected: {
    backgroundColor: colors.surfaceCanvas,
  },
});
