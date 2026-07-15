import { preferencesStorage } from '@/storage/mmkv';
import type { TrainingFrequency } from '@/types/profile';
import type { WeekStartsOn } from '@/types/preferences';

import { isScheduledWorkoutDay } from './weeklySchedule';

export type DayScheduleOverride = 'workout' | 'rest';

const DAY_OVERRIDES_KEY = 'day_schedule_overrides';

type OverrideMap = Record<string, DayScheduleOverride>;

function readOverrides(): OverrideMap {
  const flags = preferencesStorage.getCachedFlags();
  const raw = flags[DAY_OVERRIDES_KEY];
  if (typeof raw !== 'string' || !raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: OverrideMap = {};
    for (const [date, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value === 'workout' || value === 'rest') {
        result[date] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeOverrides(map: OverrideMap): void {
  preferencesStorage.setCachedFlag(DAY_OVERRIDES_KEY, JSON.stringify(map));
}

export function getDayScheduleOverride(planDate: string): DayScheduleOverride | null {
  return readOverrides()[planDate] ?? null;
}

/**
 * One-shot override for a single calendar date. Pass null to clear.
 * Does not shift the rest of the week’s frequency pattern.
 */
export function setDayScheduleOverride(
  planDate: string,
  override: DayScheduleOverride | null,
): void {
  const map = readOverrides();
  if (!override) {
    delete map[planDate];
  } else {
    map[planDate] = override;
  }
  writeOverrides(map);
}

/** Effective workout day after applying a date-level override (if any). */
export function isEffectiveWorkoutDay(
  planDate: string,
  frequency: TrainingFrequency,
  weekStartsOn?: WeekStartsOn,
): boolean {
  const override = getDayScheduleOverride(planDate);
  if (override === 'workout') {
    return true;
  }
  if (override === 'rest') {
    return false;
  }
  return isScheduledWorkoutDay(planDate, frequency, weekStartsOn);
}
