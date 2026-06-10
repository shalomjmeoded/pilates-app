import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { getProfile } from '@/db/repositories/profileRepository';
import { recalibrateFromProfile } from '@/services/recalibration/recalibrateProfile';
import { useProfileStore } from '@/stores/profileStore';
import { useRecalibrationStore } from '@/stores/recalibrationStore';
import type { Profile } from '@/types/profile';

export function useSettingsProfile() {
  const router = useRouter();
  const setComparison = useRecalibrationStore((state) => state.setComparison);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await getProfile();
      setProfile(loaded);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load profile.');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveAndRecalibrate = useCallback(
    async (nextProfile: Profile) => {
      setIsSaving(true);
      setError(null);
      try {
        const comparison = await recalibrateFromProfile(nextProfile);
        setProfile(nextProfile);
        await useProfileStore.getState().loadProfile();
        setComparison(comparison);
        router.push('/(tabs)/settings/plan-updated');
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Could not update plan.');
      } finally {
        setIsSaving(false);
      }
    },
    [router, setComparison],
  );

  return {
    profile,
    setProfile,
    isLoading,
    isSaving,
    error,
    reload,
    saveAndRecalibrate,
  };
}
