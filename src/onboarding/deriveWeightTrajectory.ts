import type { FitnessGoal, WeightTrajectory } from '@/types/profile';

export function deriveWeightTrajectory(
  fitnessGoal: FitnessGoal,
  currentWeightKg: number,
  goalWeightKg: number,
): WeightTrajectory {
  if (fitnessGoal === 'lose_weight') {
    return 'weight_loss';
  }

  if (fitnessGoal === 'build_muscle') {
    return 'lean_mass';
  }

  if (goalWeightKg < currentWeightKg) {
    return 'weight_loss';
  }

  if (goalWeightKg > currentWeightKg) {
    return 'lean_mass';
  }

  return 'steady_state';
}
