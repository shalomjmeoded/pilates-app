import { create } from 'zustand';

import { getProfile, saveProfile } from '@/db/repositories/profileRepository';
import type { Profile } from '@/types/profile';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  async loadProfile() {
    set({ isLoading: true, error: null });
    try {
      const profile = await getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile',
      });
    }
  },

  async updateProfile(profile) {
    set({ isLoading: true, error: null });
    try {
      await saveProfile(profile);
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save profile',
      });
    }
  },
}));
