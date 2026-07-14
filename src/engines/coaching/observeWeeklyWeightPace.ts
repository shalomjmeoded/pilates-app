import type { WeightLog } from '@/types/progress';

const MIN_LOGS = 2;
const MIN_SPAN_DAYS = 7;
const DEFAULT_WINDOW_DAYS = 14;

export interface ObservedWeeklyPace {
  /** Signed kg/week: negative = loss, positive = gain. */
  rateKgPerWeek: number;
  /** Absolute loss rate (0 if gaining/flat). */
  lossKgPerWeek: number;
  spanDays: number;
}

/**
 * Smoothed weekly weight change from logs inside a recent window
 * (defaults to 14 days, requires ≥7 day span).
 */
export function observeWeeklyWeightPace(
  logs: WeightLog[],
  windowDays: number = DEFAULT_WINDOW_DAYS,
  now: Date = new Date(),
): ObservedWeeklyPace | null {
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const sorted = [...logs]
    .filter((log) => new Date(log.loggedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  if (sorted.length < MIN_LOGS) {
    return null;
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const spanMs = new Date(last.loggedAt).getTime() - new Date(first.loggedAt).getTime();
  const spanDays = spanMs / (1000 * 60 * 60 * 24);

  if (spanDays < MIN_SPAN_DAYS) {
    return null;
  }

  const rateKgPerWeek = ((last.weightKg - first.weightKg) / spanDays) * 7;
  return {
    rateKgPerWeek,
    lossKgPerWeek: rateKgPerWeek < 0 ? Math.abs(rateKgPerWeek) : 0,
    spanDays,
  };
}
