import { create } from 'zustand';

import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import type { PremiumFeatureKey, PremiumStatus } from '@/types/premium';

interface PremiumState {
  status: PremiumStatus | null;
  isLoading: boolean;
  upsellFeature: PremiumFeatureKey | null;
  upsellVisible: boolean;
  hydrate: () => Promise<void>;
  setStatus: (status: PremiumStatus) => void;
  openUpsell: (feature: PremiumFeatureKey) => void;
  closeUpsell: () => void;
}

const INACTIVE_STATUS: PremiumStatus = {
  subscriptionStatus: 'inactive',
  isPremium: false,
  trialUsed: false,
  source: 'mock',
};

export const usePremiumStore = create<PremiumState>((set, get) => ({
  status: null,
  isLoading: false,
  upsellFeature: null,
  upsellVisible: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const status = await getPremiumStatus();
      set({ status });
    } finally {
      set({ isLoading: false });
    }
  },

  setStatus: (status) => set({ status }),

  openUpsell: (feature) =>
    set({
      upsellFeature: feature,
      upsellVisible: true,
    }),

  closeUpsell: () =>
    set({
      upsellFeature: null,
      upsellVisible: false,
    }),
}));

export function selectHasPremiumAccess(state: PremiumState): boolean {
  if (!state.status) {
    return false;
  }
  return hasPremiumAccess(state.status);
}

export function selectPremiumStatus(state: PremiumState): PremiumStatus {
  return state.status ?? INACTIVE_STATUS;
}
