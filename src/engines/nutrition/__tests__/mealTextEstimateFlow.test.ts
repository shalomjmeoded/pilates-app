import {
  buildManualFallbackParams,
  buildMealInputFromAiReview,
} from '../mealTextEstimateFlow';

describe('mealTextEstimateFlow', () => {
  const estimate = {
    mealTitle: 'Salmon bowl',
    confidence: 0.82,
    calories: 520,
    proteinG: 34,
    carbsG: 42,
    fatG: 18,
    fiberG: 7,
    ingredients: [{ name: 'Salmon', grams: 150 }],
  };

  it('builds ai_text meal input only after review fields are supplied', () => {
    const input = buildMealInputFromAiReview(
      estimate,
      {
        title: 'Edited salmon bowl',
        calories: 500,
        proteinG: 32,
        carbsG: 40,
        fatG: 16,
        fiberG: 6,
      },
      '2026-06-09',
    );

    expect(input.source).toBe('ai_text');

    const photoInput = buildMealInputFromAiReview(
      estimate,
      {
        title: 'Photo bowl',
        calories: 500,
        proteinG: 32,
        carbsG: 40,
        fatG: 16,
        fiberG: 6,
      },
      '2026-06-09',
      'ai_photo',
    );
    expect(photoInput.source).toBe('ai_photo');
    expect(input.title).toBe('Edited salmon bowl');
    expect(input.aiConfidence).toBe(0.82);
    expect(input.aiIngredients).toEqual(estimate.ingredients);
  });

  it('prefills manual fallback with user description', () => {
    expect(buildManualFallbackParams('2026-06-09', '  chicken salad  ')).toEqual({
      mealDate: '2026-06-09',
      prefilledTitle: 'chicken salad',
    });
  });

});
