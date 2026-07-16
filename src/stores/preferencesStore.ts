import { create } from 'zustand';

import { preferencesStorage } from '@/storage/mmkv';
import type {
  AppPreferences,
  CoachNutritionPreferences,
  ThemePreference,
  UnitPreferences,
  WeekStartsOn,
} from '@/types/preferences';

interface PreferencesState {
  preferences: AppPreferences;
  hydrate: () => void;
  setOnboardingCompleted: (value: boolean) => void;
  setUnits: (units: UnitPreferences) => void;
  setTheme: (theme: ThemePreference) => void;
  setCoachNutrition: (prefs: CoachNutritionPreferences) => void;
  setWeekStartsOn: (weekStartsOn: WeekStartsOn) => void;
  resetForDev: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: preferencesStorage.getAll(),

  hydrate() {
    set({ preferences: preferencesStorage.getAll() });
  },

  setOnboardingCompleted(value) {
    preferencesStorage.setOnboardingCompleted(value);
    set({ preferences: preferencesStorage.getAll() });
  },

  setUnits(units) {
    preferencesStorage.setUnits(units);
    set({ preferences: preferencesStorage.getAll() });
  },

  setTheme(theme) {
    preferencesStorage.setTheme(theme);
    const { applyColorScheme } =
      require('@/theme/tokens') as typeof import('@/theme/tokens');
    const { resolveColorScheme } =
      require('@/theme/resolveColorScheme') as typeof import('@/theme/resolveColorScheme');
    applyColorScheme(resolveColorScheme(theme));
    set({ preferences: preferencesStorage.getAll() });
  },

  setCoachNutrition(prefs) {
    preferencesStorage.setCoachNutrition(prefs);
    set({ preferences: preferencesStorage.getAll() });
  },

  setWeekStartsOn(weekStartsOn) {
    preferencesStorage.setWeekStartsOn(weekStartsOn);
    set({ preferences: preferencesStorage.getAll() });
  },

  resetForDev() {
    preferencesStorage.clear();
    set({ preferences: preferencesStorage.getAll() });
  },
}));
