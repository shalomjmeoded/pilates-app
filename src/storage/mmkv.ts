import Constants from 'expo-constants';

import {
  DEFAULT_PREFERENCES,
  type AppPreferences,
  type AvailableEquipmentPreference,
  type CoachNutritionPreferences,
  type StorageBackend,
  type UnitPreferences,
  type WeekStartsOn,
} from '@/types/preferences';

const KEYS = {
  onboardingCompleted: 'onboarding_completed',
  theme: 'theme',
  units: 'units',
  coachNutrition: 'coach_nutrition',
  weekStartsOn: 'week_starts_on',
  availableEquipment: 'available_equipment',
  cachedFlags: 'cached_flags',
  onboardingDraft: 'onboarding_draft',
} as const;

interface KeyValueStorage {
  getBoolean(key: string): boolean | undefined;
  getString(key: string): string | undefined;
  set(key: string, value: boolean | string | number): void;
  clearAll(): void;
}

class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, boolean | string | number>();

  getBoolean(key: string): boolean | undefined {
    const value = this.values.get(key);
    return typeof value === 'boolean' ? value : undefined;
  }

  getString(key: string): string | undefined {
    const value = this.values.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  set(key: string, value: boolean | string | number): void {
    this.values.set(key, value);
  }

  clearAll(): void {
    this.values.clear();
  }
}

function createStorage(): { storage: KeyValueStorage; backend: StorageBackend } {
  if (Constants.appOwnership === 'expo' || process.env.NODE_ENV === 'test') {
    return {
      storage: new MemoryStorage(),
      backend: 'memory',
    };
  }

  try {
    // Lazy require — MMKV is unavailable in Expo Go.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    return {
      storage: new MMKV({ id: 'betterme-preferences' }),
      backend: 'mmkv',
    };
  } catch (error) {
    console.warn('[BetterMe] MMKV unavailable, using in-memory preferences fallback.', error);
    return {
      storage: new MemoryStorage(),
      backend: 'memory',
    };
  }
}

const { storage, backend: storageBackend } = createStorage();

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mirrorToSqlite(key: string, value: boolean | string | number): void {
  if (storageBackend !== 'memory' || process.env.NODE_ENV === 'test') {
    return;
  }

  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  void import('./sqlitePreferences')
    .then(({ setSqlitePreference }) => setSqlitePreference(key, serialized))
    .catch((error) => {
      console.warn(`[BetterMe] Failed to mirror preference "${key}" to SQLite.`, error);
    });
}

function safeGetBoolean(key: string): boolean | undefined {
  try {
    return storage.getBoolean(key);
  } catch {
    return undefined;
  }
}

function safeGetString(key: string): string | undefined {
  try {
    return storage.getString(key);
  } catch {
    return undefined;
  }
}

function safeSet(key: string, value: boolean | string | number): void {
  try {
    storage.set(key, value);
    mirrorToSqlite(key, value);
  } catch (error) {
    console.warn(`[BetterMe] Failed to persist preference "${key}".`, error);
  }
}

export function getStorageBackend(): StorageBackend {
  return storageBackend;
}

export const preferencesStorage = {
  getStorageBackend(): StorageBackend {
    return storageBackend;
  },

  hydrateFromSqlite(values: Record<string, string>): void {
    for (const [key, value] of Object.entries(values)) {
      if (key === KEYS.onboardingCompleted) {
        storage.set(key, value === 'true');
        continue;
      }

      storage.set(key, value);
    }
  },

  getOnboardingCompleted(): boolean {
    return safeGetBoolean(KEYS.onboardingCompleted) ?? DEFAULT_PREFERENCES.onboardingCompleted;
  },

  setOnboardingCompleted(value: boolean): void {
    safeSet(KEYS.onboardingCompleted, value);
  },

  getTheme(): AppPreferences['theme'] {
    const theme = safeGetString(KEYS.theme);
    if (theme === 'pride') {
      // Legacy Pride theme — migrate to Wellness.
      safeSet(KEYS.theme, 'light');
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { writeThemePreferenceSync } =
          require('./themePreferenceSync') as typeof import('./themePreferenceSync');
        writeThemePreferenceSync('light');
      } catch {
        // ignore
      }
      return 'light';
    }
    if (theme === 'light' || theme === 'luxe') {
      return theme;
    }

    // Expo Go uses in-memory prefs that reset on reload — fall back to SQLite.
    try {
      // Lazy require avoids pulling sqlite into jest/unit paths that mock storage.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { readThemePreferenceSync } =
        require('./themePreferenceSync') as typeof import('./themePreferenceSync');
      const persisted = readThemePreferenceSync();
      if (persisted) {
        storage.set(KEYS.theme, persisted);
        return persisted;
      }
    } catch {
      // SQLite unavailable during early/test boot.
    }

    return DEFAULT_PREFERENCES.theme;
  },

  setTheme(theme: AppPreferences['theme']): void {
    safeSet(KEYS.theme, theme);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { writeThemePreferenceSync } =
        require('./themePreferenceSync') as typeof import('./themePreferenceSync');
      writeThemePreferenceSync(theme);
    } catch (error) {
      console.warn('[BetterMe] Failed to persist theme synchronously.', error);
    }
  },

  getUnits(): UnitPreferences {
    return parseJson(safeGetString(KEYS.units), DEFAULT_PREFERENCES.units);
  },

  setUnits(units: UnitPreferences): void {
    safeSet(KEYS.units, JSON.stringify(units));
  },

  getCoachNutrition(): CoachNutritionPreferences {
    const parsed = parseJson<Partial<CoachNutritionPreferences>>(
      safeGetString(KEYS.coachNutrition),
      {},
    );
    return { ...DEFAULT_PREFERENCES.coachNutrition, ...parsed };
  },

  setCoachNutrition(prefs: CoachNutritionPreferences): void {
    safeSet(KEYS.coachNutrition, JSON.stringify(prefs));
  },

  getWeekStartsOn(): WeekStartsOn {
    const raw = safeGetString(KEYS.weekStartsOn);
    if (raw === undefined || raw === '') {
      return DEFAULT_PREFERENCES.weekStartsOn;
    }
    const parsed = Number(raw);
    if (parsed >= 0 && parsed <= 6 && Number.isInteger(parsed)) {
      return parsed as WeekStartsOn;
    }
    return DEFAULT_PREFERENCES.weekStartsOn;
  },

  setWeekStartsOn(weekStartsOn: WeekStartsOn): void {
    safeSet(KEYS.weekStartsOn, String(weekStartsOn));
  },

  getAvailableEquipment(): AvailableEquipmentPreference[] {
    return parseJson(
      safeGetString(KEYS.availableEquipment),
      DEFAULT_PREFERENCES.availableEquipment,
    );
  },

  setAvailableEquipment(equipment: AvailableEquipmentPreference[]): void {
    safeSet(KEYS.availableEquipment, JSON.stringify(equipment));
  },

  getCachedFlags(): AppPreferences['cachedFlags'] {
    return parseJson(safeGetString(KEYS.cachedFlags), DEFAULT_PREFERENCES.cachedFlags);
  },

  setCachedFlag(key: string, value: boolean | string | number): void {
    const flags = this.getCachedFlags();
    flags[key] = value;
    safeSet(KEYS.cachedFlags, JSON.stringify(flags));
  },

  getOnboardingDraft(): string | undefined {
    return safeGetString(KEYS.onboardingDraft);
  },

  setOnboardingDraft(value: string): void {
    safeSet(KEYS.onboardingDraft, value);
  },

  clearOnboardingDraft(): void {
    safeSet(KEYS.onboardingDraft, '');
  },

  getAll(): AppPreferences {
    return {
      onboardingCompleted: this.getOnboardingCompleted(),
      theme: this.getTheme(),
      units: this.getUnits(),
      coachNutrition: this.getCoachNutrition(),
      weekStartsOn: this.getWeekStartsOn(),
      availableEquipment: this.getAvailableEquipment(),
      cachedFlags: this.getCachedFlags(),
      storageBackend: this.getStorageBackend(),
    };
  },

  clear(): void {
    try {
      storage.clearAll();
    } catch (error) {
      console.warn('[BetterMe] Failed to clear preferences storage.', error);
    }
  },
};
