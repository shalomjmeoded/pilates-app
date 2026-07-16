import { hasCompletedOnboardingInDb } from '@/db/repositories/onboardingRepository';
import { preferencesStorage } from '@/storage/mmkv';
import { loadSqlitePreferences } from '@/storage/sqlitePreferences';
import { usePreferencesStore } from '@/stores/preferencesStore';

export async function hydratePreferencesFromStorage(): Promise<void> {
  if (preferencesStorage.getStorageBackend() === 'memory') {
    const sqliteValues = await loadSqlitePreferences();
    preferencesStorage.hydrateFromSqlite(sqliteValues);
  }

  const completedInDb = await hasCompletedOnboardingInDb();

  if (completedInDb && !preferencesStorage.getOnboardingCompleted()) {
    preferencesStorage.setOnboardingCompleted(true);
  }

  usePreferencesStore.getState().hydrate();
}
