import { create } from 'zustand';

import { formatPlanDate } from '@/engines/workout';

interface WorkoutState {
  selectedDate: string;
  setSelectedDate: (planDate: string) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  selectedDate: formatPlanDate(new Date()),
  setSelectedDate: (planDate) => set({ selectedDate: planDate }),
}));
