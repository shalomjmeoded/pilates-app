import { calculateNutritionScore } from '../score';
import { sumMealTotals } from '../portion';
import { validateMealInput } from '../validation';
import type { Meal, NutritionTargets } from '@/types/nutrition';

const targets: NutritionTargets = {
  effectiveDate: '2026-06-09',
  calories: 1800,
  proteinG: 120,
  carbsG: 180,
  fatG: 60,
  fiberG: 28,
  isManualOverride: false,
};

describe('validateMealInput', () => {
  it('rejects empty title and negative values', () => {
    const result = validateMealInput({
      title: '  ',
      calories: -1,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      source: 'manual',
      mealDate: '2026-06-09',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('sumMealTotals', () => {
  it('applies portion multiplier', () => {
    const meal: Meal = {
      id: '1',
      mealDate: '2026-06-09',
      loggedAt: '2026-06-09T08:00:00.000Z',
      title: 'Breakfast',
      calories: 400,
      proteinG: 20,
      carbsG: 40,
      fatG: 10,
      fiberG: 5,
      portionMultiplier: 1.5,
      source: 'manual',
    };

    const totals = sumMealTotals([meal]);
    expect(totals.calories).toBe(600);
    expect(totals.proteinG).toBe(30);
  });
});

describe('calculateNutritionScore', () => {
  it('returns high score when on target', () => {
    const score = calculateNutritionScore(
      {
        calories: 1800,
        proteinG: 120,
        carbsG: 180,
        fatG: 60,
        fiberG: 28,
      },
      targets,
    );
    expect(score).toBeGreaterThanOrEqual(90);
  });
});
