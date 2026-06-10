import { create } from 'zustand';

import { formatPlanDate } from '@/engines/workout';

interface NutritionState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  selectedDate: formatPlanDate(new Date()),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
