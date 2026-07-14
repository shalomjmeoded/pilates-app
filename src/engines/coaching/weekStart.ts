import { addDays, format, getDay, parseISO, startOfWeek, subDays } from 'date-fns';

import { preferencesStorage } from '@/storage/mmkv';
import type { WeekStartsOn } from '@/types/preferences';

export function getConfiguredWeekStartsOn(): WeekStartsOn {
  return preferencesStorage.getWeekStartsOn();
}

export function getWeekStartDate(
  date = new Date(),
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): string {
  return format(startOfWeek(date, { weekStartsOn }), 'yyyy-MM-dd');
}

/** Monday-of-previous-week style: start of the calendar week that just ended. */
export function getPreviousWeekStartDate(
  date = new Date(),
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): string {
  const currentWeekStart = getWeekStartDate(date, weekStartsOn);
  return format(subDays(parseISO(`${currentWeekStart}T00:00:00`), 7), 'yyyy-MM-dd');
}

export function getWeekEndDate(weekStart: string): string {
  return format(addDays(parseISO(`${weekStart}T00:00:00`), 6), 'yyyy-MM-dd');
}

/** True when `date` is the user's configured first day of the week. */
export function isWeekStartDay(
  date = new Date(),
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): boolean {
  return getDay(date) === weekStartsOn;
}
