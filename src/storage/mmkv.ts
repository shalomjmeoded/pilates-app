import Constants from 'expo-constants';

import {
  DEFAULT_PREFERENCES,
  type AppPreferences,
  type StorageBackend,
  type UnitPreferences,
} from '@/types/preferences';

import { setSqlitePreference } from './sqlitePreferences';

const KEYS = {
  onboardingCompleted: 'onboarding_completed',
  theme: 'theme',
  units: 'units',
  cachedFlags: 'cached_flags',
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
  if (Constants.appOwnership === 'expo') {
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
  if (storageBackend !== 'memory') {
    return;
  }

  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  void setSqlitePreference(key, serialized).catch((error) => {
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
    return theme === 'light' ? 'light' : DEFAULT_PREFERENCES.theme;
  },

  setTheme(theme: AppPreferences['theme']): void {
    safeSet(KEYS.theme, theme);
  },

  getUnits(): UnitPreferences {
    return parseJson(safeGetString(KEYS.units), DEFAULT_PREFERENCES.units);
  },

  setUnits(units: UnitPreferences): void {
    safeSet(KEYS.units, JSON.stringify(units));
  },

  getCachedFlags(): AppPreferences['cachedFlags'] {
    return parseJson(safeGetString(KEYS.cachedFlags), DEFAULT_PREFERENCES.cachedFlags);
  },

  setCachedFlag(key: string, value: boolean | string | number): void {
    const flags = this.getCachedFlags();
    flags[key] = value;
    safeSet(KEYS.cachedFlags, JSON.stringify(flags));
  },

  getAll(): AppPreferences {
    return {
      onboardingCompleted: this.getOnboardingCompleted(),
      theme: this.getTheme(),
      units: this.getUnits(),
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
