import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import type { ThemePreference } from '@/types/preferences';

/** Dedicated file — never open the main DB with sync APIs (breaks Android async handle). */
const APPEARANCE_DATABASE_NAME = 'betterme-appearance.db';
const THEME_KEY = 'theme';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS appearance (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

let appearanceDb: SQLiteDatabase | null = null;

function isThemePreference(value: string | undefined | null): value is ThemePreference {
  return value === 'light' || value === 'luxe';
}

function normalizeThemePreference(value: string | undefined | null): ThemePreference | null {
  if (isThemePreference(value)) {
    return value;
  }
  // Legacy Pride theme — map to Wellness.
  if (value === 'pride') {
    return 'light';
  }
  return null;
}

function getAppearanceDatabase(): SQLiteDatabase {
  if (!appearanceDb) {
    appearanceDb = openDatabaseSync(APPEARANCE_DATABASE_NAME);
    appearanceDb.execSync(SCHEMA);
  }
  return appearanceDb;
}

/** Sync read so theme survives Expo Go / memory-backend reloads. */
export function readThemePreferenceSync(): ThemePreference | null {
  try {
    const db = getAppearanceDatabase();
    const row = db.getFirstSync<{ value: string }>(
      'SELECT value FROM appearance WHERE key = ?',
      THEME_KEY,
    );
    const normalized = normalizeThemePreference(row?.value);
    if (normalized && row?.value === 'pride') {
      writeThemePreferenceSync(normalized);
    }
    return normalized;
  } catch {
    return null;
  }
}

/** Sync write — must complete before reloadAppAsync or the choice is lost. */
export function writeThemePreferenceSync(theme: ThemePreference): void {
  try {
    const db = getAppearanceDatabase();
    db.runSync(
      `INSERT INTO appearance (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      THEME_KEY,
      theme,
    );
  } catch (error) {
    console.warn('[BetterMe] Failed to sync-write theme preference.', error);
  }
}
