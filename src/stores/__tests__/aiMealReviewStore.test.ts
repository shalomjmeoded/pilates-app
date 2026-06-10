import { useAiMealReviewStore } from '../aiMealReviewStore';

describe('aiMealReviewStore', () => {
  beforeEach(() => {
    useAiMealReviewStore.getState().clear();
  });

  it('requires pending review before a save path can run', () => {
    expect(useAiMealReviewStore.getState().estimate).toBeNull();

    useAiMealReviewStore.getState().setPendingReview({
      estimate: {
        mealTitle: 'Oats',
        confidence: 0.7,
        calories: 300,
        proteinG: 12,
        carbsG: 45,
        fatG: 8,
        fiberG: 6,
        ingredients: [],
      },
      originalDescription: 'oatmeal with berries',
      mealDate: '2026-06-09',
      source: 'ai_photo',
    });

    expect(useAiMealReviewStore.getState().estimate?.mealTitle).toBe('Oats');
    expect(useAiMealReviewStore.getState().source).toBe('ai_photo');

    useAiMealReviewStore.getState().clear();
    expect(useAiMealReviewStore.getState().estimate).toBeNull();
  });
});
