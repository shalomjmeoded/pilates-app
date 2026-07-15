import { Pressable, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/ui/Text';
import { formatPlanDate, isDateToday } from '@/engines/workout';
import { colors, radius, spacing, createDynamicStyles } from '@/theme';

interface WeekCalendarStripProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (planDate: string) => void;
  completedDates?: Set<string>;
  /** Dates scheduled as rest (no workout). */
  restDates?: Set<string>;
  weekLabel?: string;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export function WeekCalendarStrip({
  dates,
  selectedDate,
  onSelectDate,
  completedDates,
  restDates,
  weekLabel,
  onPreviousWeek,
  onNextWeek,
  canGoPrevious = true,
  canGoNext = true,
}: WeekCalendarStripProps) {
  return (
    <View style={styles.wrap}>
      {weekLabel || onPreviousWeek || onNextWeek ? (
        <View style={styles.weekNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            disabled={!canGoPrevious || !onPreviousWeek}
            onPress={onPreviousWeek}
            style={[styles.navButton, (!canGoPrevious || !onPreviousWeek) && styles.navButtonDisabled]}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={22}
              color={canGoPrevious && onPreviousWeek ? colors.textDark : colors.textMuted}
            />
          </Pressable>
          <Text variant="label" style={styles.weekLabel}>
            {weekLabel ?? 'This week'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next week"
            disabled={!canGoNext || !onNextWeek}
            onPress={onNextWeek}
            style={[styles.navButton, (!canGoNext || !onNextWeek) && styles.navButtonDisabled]}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={canGoNext && onNextWeek ? colors.textDark : colors.textMuted}
            />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.row}>
        {dates.map((planDate) => {
          const selected = planDate === selectedDate;
          const today = isDateToday(planDate);
          const completed = completedDates?.has(planDate);
          const rest = restDates?.has(planDate);

          return (
            <Pressable
              key={planDate}
              accessibilityRole="button"
              accessibilityLabel={`${format(parseISO(planDate), 'EEEE MMMM d')}${rest ? ', rest day' : ''}${completed ? ', workout completed' : ''}${today ? ', today' : ''}`}
              accessibilityState={{ selected }}
              onPress={() => onSelectDate(planDate)}
              style={[
                styles.chip,
                rest && styles.chipRest,
                selected && styles.chipSelected,
                today && !selected && styles.chipToday,
              ]}
            >
              <Text
                variant="label"
                style={[styles.weekday, rest && styles.textRest, selected && styles.textSelected]}
              >
                {format(parseISO(planDate), 'EEE')}
              </Text>
              <Text
                variant="body"
                style={[styles.dayNumber, rest && styles.textRest, selected && styles.textSelected]}
              >
                {format(parseISO(planDate), 'd')}
              </Text>
              <View style={styles.dotSlot}>
                {completed ? (
                  <View style={[styles.completedDot, selected && styles.completedDotSelected]} />
                ) : rest ? (
                  <View style={[styles.restDot, selected && styles.restDotSelected]} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function buildCompletedDatesSet(
  entries: Array<{ planDate: string; completed: boolean }>,
): Set<string> {
  return new Set(entries.filter((entry) => entry.completed).map((entry) => entry.planDate));
}

export { formatPlanDate };

const styles = createDynamicStyles(() => ({
  wrap: {
    gap: spacing.xs,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
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
  chipRest: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  chipToday: {
    borderColor: colors.accentCool,
  },
  chipSelected: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
    borderStyle: 'solid',
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
  textRest: {
    color: colors.textMuted,
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
  restDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.45,
  },
  restDotSelected: {
    backgroundColor: colors.surfaceCanvas,
    opacity: 0.8,
  },
}));
