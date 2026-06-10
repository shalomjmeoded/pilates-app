import type { RoadmapPoint } from '@/types/calculations';
import type { WeightTrajectory } from '@/types/profile';

export function buildRoadmapProjection(
  currentWeightKg: number,
  trajectory: WeightTrajectory,
  paceKgPerWeek: number,
  weeks: number = 24,
): RoadmapPoint[] {
  const direction =
    trajectory === 'weight_loss' ? -1 : trajectory === 'lean_mass' ? 1 : 0;

  const effectivePace = trajectory === 'lean_mass' ? Math.min(paceKgPerWeek, 0.25) : paceKgPerWeek;

  return Array.from({ length: weeks + 1 }, (_, week) => ({
    week,
    projectedWeightKg:
      Math.round((currentWeightKg + direction * effectivePace * week) * 10) / 10,
  }));
}
