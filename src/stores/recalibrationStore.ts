import { create } from 'zustand';

import type { RecalibrationComparison } from '@/types/settings';

interface RecalibrationState {
  comparison: RecalibrationComparison | null;
  setComparison: (comparison: RecalibrationComparison) => void;
  clearComparison: () => void;
}

export const useRecalibrationStore = create<RecalibrationState>((set) => ({
  comparison: null,
  setComparison(comparison) {
    set({ comparison });
  },
  clearComparison() {
    set({ comparison: null });
  },
}));
