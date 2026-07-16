import { hasCompletedOnboardingInDb } from '@/db/repositories/onboardingRepository';
import { getProfile, saveProfile } from '@/db/repositories/profileRepository';
import { preferencesStorage } from '@/storage/mmkv';
import { loadSqlitePreferences } from '@/storage/sqlitePreferences';
import { usePreferencesStore } from '@/stores/preferencesStore';

const VIDEO_STREAMING_DEFAULT_MIGRATION_KEY = 'media_pref_video_streaming_default_v1';

export async function hydratePreferencesFromStorage(): Promise<void> {
  if (preferencesStorage.getStorageBackend() === 'memory') {
    const sqliteValues = await loadSqlitePreferences();
    preferencesStorage.hydrateFromSqlite(sqliteValues);
  }

  const completedInDb = await hasCompletedOnboardingInDb();

  if (completedInDb && !preferencesStorage.getOnboardingCompleted()) {
    preferencesStorage.setOnboardingCompleted(true);
  }

  // Media preference onboarding was removed; everyone stayed on static_only and never
  // saw curated embeds. One-time upgrade to video_streaming (can still turn off in Settings).
  const flags = preferencesStorage.getCachedFlags();
  if (!flags[VIDEO_STREAMING_DEFAULT_MIGRATION_KEY]) {
    const profile = await getProfile();
    if (profile?.mediaPreference === 'static_only') {
      await saveProfile({ ...profile, mediaPreference: 'video_streaming' });
    }
    preferencesStorage.setCachedFlag(VIDEO_STREAMING_DEFAULT_MIGRATION_KEY, true);
  }

  usePreferencesStore.getState().hydrate();
}
