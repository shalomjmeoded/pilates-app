import type { NutritionDailyTotalsRow } from '@/types/nutrition';
import type { AdherenceMetric } from '@/types/progress';

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function dayAdherence(consumed: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((consumed / target) * 100));
}

export function buildAdherenceMetrics(
  rows: NutritionDailyTotalsRow[],
  days: number = 7,
): { calories: AdherenceMetric; protein: AdherenceMetric; fiber: AdherenceMetric } {
  const recent = rows
    .sort((a, b) => b.mealDate.localeCompare(a.mealDate))
    .slice(0, days)
    .filter((row) => row.mealCount > 0 || row.caloriesConsumed > 0);

  const calorieValues = recent.map((row) =>
    dayAdherence(row.caloriesConsumed, row.targetCalories),
  );
  const proteinValues = recent.map((row) => dayAdherence(row.proteinG, row.targetProteinG));
  const fiberValues = recent.map((row) => dayAdherence(row.fiberG, row.targetFiberG));

  return {
    calories: {
      label: 'Calories',
      adherencePercent: average(calorieValues),
      daysIncluded: recent.length,
    },
    protein: {
      label: 'Protein',
      adherencePercent: average(proteinValues),
      daysIncluded: recent.length,
    },
    fiber: {
      label: 'Fiber',
      adherencePercent: average(fiberValues),
      daysIncluded: recent.length,
    },
  };
}
