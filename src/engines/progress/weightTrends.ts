import { parseISO, subDays } from 'date-fns';

import type { WeightLog } from '@/types/progress';

export interface WeightTrendAverages {
  weeklyAverageKg: number | null;
  monthlyAverageKg: number | null;
}

function average(weights: number[]): number | null {
  if (weights.length === 0) {
    return null;
  }
  const sum = weights.reduce((total, value) => total + value, 0);
  return Math.round((sum / weights.length) * 10) / 10;
}

export function buildWeightTrendAverages(logs: WeightLog[], anchor: Date = new Date()): WeightTrendAverages {
  const weekCutoff = subDays(anchor, 7);
  const monthCutoff = subDays(anchor, 30);

  const weekly = logs
    .filter((log) => parseISO(log.loggedAt) >= weekCutoff)
    .map((log) => log.weightKg);

  const monthly = logs
    .filter((log) => parseISO(log.loggedAt) >= monthCutoff)
    .map((log) => log.weightKg);

  return {
    weeklyAverageKg: average(weekly),
    monthlyAverageKg: average(monthly),
  };
}

export function formatTrendLabel(value: number | null, unit: 'kg' | 'lb', toLb: (kg: number) => number): string {
  if (value === null) {
    return '—';
  }
  return unit === 'kg' ? `${value} kg` : `${toLb(value)} lb`;
}
