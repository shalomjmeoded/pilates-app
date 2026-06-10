import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

export interface WeightStreakStats {
  currentStreak: number;
  longestStreak: number;
}

function normalizeDate(date: string): string {
  return date.slice(0, 10);
}

function uniqueSortedDates(loggedAtValues: string[]): string[] {
  return [...new Set(loggedAtValues.map(normalizeDate))].sort();
}

export function calculateWeightStreakStats(loggedAtValues: string[]): WeightStreakStats {
  const dates = uniqueSortedDates(loggedAtValues);
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longest = 1;
  let run = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const gap = differenceInCalendarDays(parseISO(dates[index]), parseISO(dates[index - 1]));
    if (gap === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else if (gap > 1) {
      run = 1;
    }
  }

  let current = 0;
  let cursor = new Date();
  const set = new Set(dates);

  while (set.has(format(cursor, 'yyyy-MM-dd'))) {
    current += 1;
    cursor = subDays(cursor, 1);
  }

  return { currentStreak: current, longestStreak: longest };
}
