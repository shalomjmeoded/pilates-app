import { addWeeks, format } from 'date-fns';

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

export function estimateWeeksToGoal(
  currentWeightKg: number,
  goalWeightKg: number,
  trajectory: WeightTrajectory,
  paceKgPerWeek: number,
): number | null {
  if (trajectory === 'steady_state') {
    return null;
  }

  const diff = Math.abs(currentWeightKg - goalWeightKg);
  if (diff < 0.1) {
    return 0;
  }

  const pace =
    trajectory === 'lean_mass' ? Math.min(paceKgPerWeek, 0.25) : paceKgPerWeek;
  if (pace <= 0) {
    return null;
  }

  return Math.ceil(diff / pace);
}

export function formatRoadmapTargetDate(weeks: number | null): string {
  if (weeks === null) {
    return 'Ongoing wellness focus';
  }
  if (weeks === 0) {
    return 'You are at your goal';
  }
  return format(addWeeks(new Date(), weeks), 'MMM d, yyyy');
}

export function roadmapConfidenceLabel(trajectory: WeightTrajectory, paceKgPerWeek: number): string {
  if (trajectory === 'steady_state') {
    return 'High confidence — habit-first approach';
  }
  if (paceKgPerWeek <= 0.35) {
    return 'High confidence — sustainable pace';
  }
  if (paceKgPerWeek <= 0.6) {
    return 'Moderate confidence — steady progress';
  }
  return 'Guided pace — we will monitor closely';
}

export function formatFirstMilestone(
  currentWeightKg: number,
  trajectory: WeightTrajectory,
  paceKgPerWeek: number,
  weightUnit: 'kg' | 'lb' = 'kg',
): string {
  const effectivePace =
    trajectory === 'lean_mass' ? Math.min(paceKgPerWeek, 0.25) : paceKgPerWeek;
  const deltaKg = effectivePace * 4;

  if (trajectory === 'steady_state') {
    return '4 weeks of consistent habits';
  }

  const direction = trajectory === 'weight_loss' ? -1 : 1;
  const projected = currentWeightKg + direction * deltaKg;
  const display =
    weightUnit === 'lb'
      ? `${Math.round(projected * 2.20462 * 10) / 10} lb`
      : `${Math.round(projected * 10) / 10} kg`;

  return `Week 4 · ${display}`;
}
