import type { Pace } from '@/types/profile';

export function paceToPercent(pace: Pace): number {
  return Math.round(pace * 100);
}

export function formatPacePercent(pace: Pace): string {
  return `${paceToPercent(pace)}%`;
}

export function formatPaceIntensity(pace: Pace): string {
  return `${formatPacePercent(pace)} intensity`;
}
