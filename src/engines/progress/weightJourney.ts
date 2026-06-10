import type { WeightJourney } from '@/types/progress';
import type { WeightLog } from '@/types/progress';

export function buildWeightJourney(
  logs: WeightLog[],
  profileStartKg: number,
  profileCurrentKg: number,
  goalWeightKg: number,
): WeightJourney {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
  );

  const startWeightKg = sorted.length > 0 ? sorted[0].weightKg : profileStartKg;
  const currentWeightKg =
    sorted.length > 0 ? sorted[sorted.length - 1].weightKg : profileCurrentKg;

  const differenceKg = round(currentWeightKg - startWeightKg);
  const direction =
    goalWeightKg < startWeightKg ? 'loss' : goalWeightKg > startWeightKg ? 'gain' : 'maintain';

  const differenceLabel =
    Math.abs(differenceKg) < 0.05
      ? 'Holding steady'
      : differenceKg < 0
        ? `${formatKg(Math.abs(differenceKg))} lost`
        : `${formatKg(differenceKg)} gained`;

  const totalChange = Math.abs(goalWeightKg - startWeightKg);
  const completedChange = Math.abs(currentWeightKg - startWeightKg);
  const progressPercent =
    totalChange === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((completedChange / totalChange) * 100)));

  return {
    startWeightKg,
    currentWeightKg,
    goalWeightKg,
    differenceKg,
    differenceLabel,
    progressPercent,
    direction,
  };
}

function formatKg(value: number): string {
  return `${round(value)}kg`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
