import { addDays, format } from 'date-fns';

import type { GoalProjection } from '@/types/progress';
import type { WeightLog } from '@/types/progress';

const MIN_LOGS = 2;
const MIN_SPAN_DAYS = 7;

export function buildGoalProjection(
  logs: WeightLog[],
  currentWeightKg: number,
  goalWeightKg: number,
  paceKgPerWeek: number,
): GoalProjection {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
  );

  if (sorted.length < MIN_LOGS) {
    return {
      hasEnoughData: false,
      message: 'Add more weight entries to generate a prediction.',
    };
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const spanMs = new Date(last.loggedAt).getTime() - new Date(first.loggedAt).getTime();
  const spanDays = spanMs / (1000 * 60 * 60 * 24);

  if (spanDays < MIN_SPAN_DAYS) {
    return {
      hasEnoughData: false,
      message: 'Add more weight entries to generate a prediction.',
    };
  }

  const weightChange = last.weightKg - first.weightKg;
  const weeklyRate = Math.abs((weightChange / spanDays) * 7);
  const effectivePace = weeklyRate > 0.05 ? weeklyRate : paceKgPerWeek;

  if (effectivePace <= 0) {
    return {
      hasEnoughData: false,
      message: 'Add more weight entries to generate a prediction.',
    };
  }

  const remaining = Math.abs(goalWeightKg - currentWeightKg);
  if (remaining < 0.1) {
    return {
      hasEnoughData: true,
      estimatedDate: format(new Date(), 'MMMM d, yyyy'),
      message: 'You are at your goal weight.',
    };
  }

  const weeksRemaining = remaining / effectivePace;
  const estimated = addDays(new Date(), Math.ceil(weeksRemaining * 7));

  return {
    hasEnoughData: true,
    estimatedDate: format(estimated, 'MMMM d, yyyy'),
    message: `Estimated goal date: ${format(estimated, 'MMMM d, yyyy')}`,
  };
}

export function filterLogsByRange(
  logs: WeightLog[],
  range: import('@/types/progress').WeightChartRange,
): WeightLog[] {
  if (range === 'all') {
    return [...logs].sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  }

  const days =
    range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return logs
    .filter((log) => new Date(log.loggedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
}
