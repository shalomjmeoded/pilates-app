import type { ChartPoint, WeightLog } from '@/types/progress';

const CHART_WIDTH = 320;
const CHART_HEIGHT = 180;
const PADDING = 24;

export function buildChartLayout(
  logs: WeightLog[],
  goalWeightKg: number,
  width: number = CHART_WIDTH,
  height: number = CHART_HEIGHT,
): {
  points: ChartPoint[];
  goalY: number;
  path: string;
  minWeight: number;
  maxWeight: number;
} {
  if (logs.length === 0) {
    return { points: [], goalY: height / 2, path: '', minWeight: 0, maxWeight: 0 };
  }

  const weights = logs.map((log) => log.weightKg);
  const minWeight = Math.min(...weights, goalWeightKg) - 1;
  const maxWeight = Math.max(...weights, goalWeightKg) + 1;
  const range = maxWeight - minWeight || 1;
  const innerWidth = width - PADDING * 2;
  const innerHeight = height - PADDING * 2;

  const points: ChartPoint[] = logs.map((log, index) => {
    const x =
      logs.length === 1
        ? width / 2
        : PADDING + (index / (logs.length - 1)) * innerWidth;
    const y =
      PADDING + innerHeight - ((log.weightKg - minWeight) / range) * innerHeight;
    return {
      date: log.loggedAt,
      weightKg: log.weightKg,
      x,
      y,
    };
  });

  const goalY = PADDING + innerHeight - ((goalWeightKg - minWeight) / range) * innerHeight;
  const path = buildSmoothPath(points);

  return { points, goalY, path, minWeight, maxWeight };
}

function buildSmoothPath(points: ChartPoint[]): string {
  if (points.length === 0) {
    return '';
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export const CHART_DIMENSIONS = { width: CHART_WIDTH, height: CHART_HEIGHT, padding: PADDING };
