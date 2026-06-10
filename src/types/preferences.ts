export type StorageBackend = 'mmkv' | 'memory';

export interface UnitPreferences {
  height: 'cm' | 'in';
  weight: 'kg' | 'lb';
}

export interface AppPreferences {
  onboardingCompleted: boolean;
  theme: 'light';
  units: UnitPreferences;
  cachedFlags: Record<string, boolean | string | number>;
  storageBackend: StorageBackend;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  onboardingCompleted: false,
  theme: 'light',
  units: {
    height: 'cm',
    weight: 'kg',
  },
  cachedFlags: {},
  storageBackend: 'mmkv',
};
