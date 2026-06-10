import type { TrainingFrequency } from '@/types/profile';

const MULTIPLIERS: Record<TrainingFrequency, number> = {
  none: 1.2,
  '1_2': 1.375,
  '3_4': 1.55,
  '5_plus': 1.725,
};

export function getTdeeMultiplier(frequency: TrainingFrequency): number {
  return MULTIPLIERS[frequency];
}

export function calculateTdee(bmr: number, frequency: TrainingFrequency): { tdee: number; multiplier: number } {
  const multiplier = getTdeeMultiplier(frequency);
  return { tdee: Math.round(bmr * multiplier), multiplier };
}
