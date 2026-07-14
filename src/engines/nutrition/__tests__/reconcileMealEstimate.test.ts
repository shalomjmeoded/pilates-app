import type { AiMealEstimate } from '@/types/ai';

import { CORRECTED_CONFIDENCE_CEILING, reconcileMealEstimate } from '../reconcileMealEstimate';

function makeEstimate(overrides: Partial<AiMealEstimate> = {}): AiMealEstimate {
  return {
    mealTitle: 'Test meal',
    confidence: 0.9,
    calories: 400,
    proteinG: 40,
    carbsG: 40,
    fatG: 9,
    fiberG: 5,
    ingredients: [{ name: 'chicken', grams: 150 }],
    ...overrides,
  };
}

describe('reconcileMealEstimate', () => {
  it('leaves a self-consistent estimate unchanged', () => {
    // 40*4 + 40*4 + 9*9 = 401, calories 400 is within tolerance.
    const { estimate, corrected } = reconcileMealEstimate(makeEstimate({ calories: 400 }));
    expect(corrected).toBe(false);
    expect(estimate.calories).toBe(400);
    expect(estimate.confidence).toBe(0.9);
  });

  it('recomputes calories from macros when the total is hallucinated', () => {
    // Macros imply ~401 kcal but the model claims 950.
    const { estimate, corrected } = reconcileMealEstimate(makeEstimate({ calories: 950 }));
    expect(corrected).toBe(true);
    expect(estimate.calories).toBe(401);
  });

  it('caps confidence when it had to correct the estimate', () => {
    const { estimate } = reconcileMealEstimate(makeEstimate({ calories: 50, confidence: 0.99 }));
    expect(estimate.confidence).toBeLessThanOrEqual(CORRECTED_CONFIDENCE_CEILING);
  });

  it('clamps negative macros to zero', () => {
    const { estimate } = reconcileMealEstimate(
      makeEstimate({ proteinG: -5, carbsG: 0, fatG: 0, calories: 0 }),
    );
    expect(estimate.proteinG).toBe(0);
    expect(estimate.calories).toBe(0);
  });
});
