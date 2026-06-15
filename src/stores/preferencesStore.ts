import { create } from 'zustand';

import { preferencesStorage } from '@/storage/mmkv';
import { DEFAULT_PREFERENCES, type AppPreferences, type UnitPreferences } from '@/types/preferences';

interface PreferencesState {
  preferences: AppPreferences;
  hydrate: () => void;
  setOnboardingCompleted: (value: boolean) => void;
  setUnits: (units: UnitPreferences) => void;
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

  resetForDev() {
    preferencesStorage.clear();
    set({ preferences: preferencesStorage.getAll() });
  },
}));
