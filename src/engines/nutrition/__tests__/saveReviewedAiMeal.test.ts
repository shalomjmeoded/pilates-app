import { saveReviewedAiMeal } from '../saveReviewedAiMeal';

jest.mock('@/db/repositories/nutritionRepository', () => ({
  saveMeal: jest.fn().mockResolvedValue({
    id: 'meal-1',
    mealDate: '2026-06-09',
    loggedAt: '2026-06-09T12:00:00.000Z',
    title: 'Salmon bowl',
    calories: 520,
    proteinG: 34,
    carbsG: 42,
    fatG: 18,
    fiberG: 7,
    portionMultiplier: 1,
    source: 'ai_text',
  }),
}));

jest.mock('@/db/repositories/savedMealRepository', () => ({
  upsertSavedMeal: jest.fn().mockResolvedValue({ id: 'saved-1' }),
}));

import { saveMeal } from '@/db/repositories/nutritionRepository';
import { upsertSavedMeal } from '@/db/repositories/savedMealRepository';

const mealInput = {
  title: 'Salmon bowl',
  calories: 520,
  proteinG: 34,
  carbsG: 42,
  fatG: 18,
  fiberG: 7,
  source: 'ai_text' as const,
  mealDate: '2026-06-09',
  aiConfidence: 0.82,
  aiIngredients: [{ name: 'Salmon', grams: 150 }],
};

describe('saveReviewedAiMeal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists reviewed meal to meals table', async () => {
    await saveReviewedAiMeal({ meal: mealInput, saveToLibrary: false });

    expect(saveMeal).toHaveBeenCalledWith(mealInput);
    expect(upsertSavedMeal).not.toHaveBeenCalled();
  });

  it('optionally saves to saved_meals for reuse', async () => {
    await saveReviewedAiMeal({ meal: mealInput, saveToLibrary: true });

    expect(saveMeal).toHaveBeenCalledTimes(1);
    expect(upsertSavedMeal).toHaveBeenCalledWith({
      title: 'Salmon bowl',
      calories: 520,
      proteinG: 34,
      carbsG: 42,
      fatG: 18,
      fiberG: 7,
    });
  });
});
