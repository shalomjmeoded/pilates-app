export type StorageBackend = 'mmkv' | 'memory';

export type ThemePreference = 'light' | 'luxe' | 'pride';

export type CoachDeficitCutPreference = 'carbs' | 'fat' | 'balanced';

/** date-fns / JS weekday: 0 = Sunday … 6 = Saturday */
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface UnitPreferences {
  height: 'cm' | 'in';
  weight: 'kg' | 'lb';
}

export interface CoachNutritionPreferences {
  /** Master switch — coach may change targets after weekly assessment. */
  adjustEnabled: boolean;
  allowIncrease: boolean;
  allowDecrease: boolean;
  /** Where to remove calories when loss is too slow. */
  deficitCutPreference: CoachDeficitCutPreference;
  /**
   * When true, auto-decreases never go below the gender safety floor.
   * When false, still clamp to MIN_AUTO_CALORIE_TARGET.
   */
  calorieSafeguardEnabled: boolean;
}

export interface AppPreferences {
  onboardingCompleted: boolean;
  theme: ThemePreference;
  units: UnitPreferences;
  coachNutrition: CoachNutritionPreferences;
  /** First day of the user's training / coach week. Default Monday. */
  weekStartsOn: WeekStartsOn;
  cachedFlags: Record<string, boolean | string | number>;
  storageBackend: StorageBackend;
}

export const DEFAULT_COACH_NUTRITION_PREFERENCES: CoachNutritionPreferences = {
  adjustEnabled: false,
  allowIncrease: true,
  allowDecrease: true,
  deficitCutPreference: 'balanced',
  calorieSafeguardEnabled: true,
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  onboardingCompleted: false,
  theme: 'light',
  units: {
    height: 'cm',
    weight: 'kg',
  },
  coachNutrition: DEFAULT_COACH_NUTRITION_PREFERENCES,
  weekStartsOn: 1,
  cachedFlags: {},
  storageBackend: 'mmkv',
};

export const WEEK_START_DAY_LABELS: Record<WeekStartsOn, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
