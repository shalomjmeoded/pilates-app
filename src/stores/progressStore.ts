import { create } from 'zustand';

import type { WeightChartRange } from '@/types/progress';

interface ProgressState {
  chartRange: WeightChartRange;
  setChartRange: (range: WeightChartRange) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  chartRange: '30d',
  setChartRange(chartRange) {
    set({ chartRange });
  },
}));
