import { buildAdherenceMetrics } from '../adherence';
import { buildWeightJourney } from '../weightJourney';
import { calculateConsistencyScore } from '../consistencyScore';
import { validateWeightKg, isDuplicateTimestamp } from '../weightValidation';
import { buildBmiInfo } from '../bmiCategory';
import type { WeightLog } from '@/types/progress';

describe('validateWeightKg', () => {
  it('rejects non-positive weights', () => {
    expect(validateWeightKg(0).valid).toBe(false);
    expect(validateWeightKg(70).valid).toBe(true);
  });
});

describe('isDuplicateTimestamp', () => {
  it('detects timestamps within one minute', () => {
    const base = '2026-06-09T10:00:00.000Z';
    const near = '2026-06-09T10:00:30.000Z';
    expect(isDuplicateTimestamp(near, [base])).toBe(true);
  });
});

describe('buildWeightJourney', () => {
  it('calculates loss progress', () => {
    const logs: WeightLog[] = [
      { id: '1', loggedAt: '2026-01-01T00:00:00.000Z', weightKg: 68 },
      { id: '2', loggedAt: '2026-02-01T00:00:00.000Z', weightKg: 65.4 },
    ];
    const journey = buildWeightJourney(logs, 68, 65.4, 62);
    expect(journey.differenceLabel).toContain('lost');
    expect(journey.progressPercent).toBeGreaterThan(0);
  });
});

describe('buildBmiInfo', () => {
  it('returns normal category in healthy range', () => {
    const info = buildBmiInfo(65, 170);
    expect(info.category).toBe('normal');
  });
});

describe('calculateConsistencyScore', () => {
  it('returns bounded score', () => {
    const result = calculateConsistencyScore({
      completedWorkoutsLast7Days: 3,
      plannedWorkoutDaysLast7: 4,
      nutritionRows: [],
      weightLogDaysLast7: 2,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('buildGoalProjection', () => {
  it('requires sufficient data span', () => {
    const { buildGoalProjection } = require('../goalProjection');
    const projection = buildGoalProjection(
      [{ id: '1', loggedAt: '2026-06-01T00:00:00.000Z', weightKg: 68 }],
      68,
      62,
      0.5,
    );
    expect(projection.hasEnoughData).toBe(false);
  });
});

describe('buildAdherenceMetrics', () => {
  it('averages recent nutrition totals', () => {
    const metrics = buildAdherenceMetrics([
      {
        mealDate: '2026-06-09',
        caloriesConsumed: 1800,
        proteinG: 110,
        carbsG: 180,
        fatG: 60,
        fiberG: 25,
        mealCount: 3,
        nutritionScore: 85,
        targetCalories: 2000,
        targetProteinG: 120,
        targetCarbsG: 200,
        targetFatG: 65,
        targetFiberG: 28,
        updatedAt: '2026-06-09',
      },
    ]);
    expect(metrics.calories.adherencePercent).toBe(90);
  });
});
