import type { FitnessGoal, Pace } from '@/types/profile';

import { MIN_AUTO_CALORIE_TARGET } from './constants';

const KCAL_PER_KG_FAT = 7700;

export function paceToDailyDeficit(paceKgPerWeek: Pace): number {
  return Math.round((paceKgPerWeek * KCAL_PER_KG_FAT) / 7);
}

export function calculateGoalCalories(
  tdee: number,
  fitnessGoal: FitnessGoal,
  paceKgPerWeek: Pace,
): number {
  let goalCalories: number;

  switch (fitnessGoal) {
    case 'get_toned':
      goalCalories = Math.max(0, tdee - paceToDailyDeficit(paceKgPerWeek));
      break;
    case 'maintain':
      goalCalories = tdee;
      break;
    case 'build_muscle':
      goalCalories = tdee + 200;
      break;
  }

  return Math.max(MIN_AUTO_CALORIE_TARGET, Math.round(goalCalories));
}
