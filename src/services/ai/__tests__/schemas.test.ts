import { AiValidationError } from '../errors';
import {
  aiMealEstimateSchema,
  aiPhysiqueAssessmentSchema,
  parseMealEstimateResponse,
} from '../schemas';
import { parseAiResponse } from '../parseAiResponse';

describe('ai meal schemas', () => {
  it('parses strict JSON meal estimate with carbsG', () => {
    const parsed = parseMealEstimateResponse({
      mealTitle: 'Salmon bowl',
      confidence: 0.8,
      calories: 520,
      proteinG: 34,
      carbsG: 42,
      fatG: 18,
      fiberG: 7,
      ingredients: [{ name: 'Salmon', grams: 150 }],
    });

    expect(parsed.mealTitle).toBe('Salmon bowl');
    expect(parsed.carbsG).toBe(42);
    expect(aiMealEstimateSchema.parse(parsed)).toEqual(parsed);
  });

  it('accepts legacy carbG field from older prompts', () => {
    const parsed = parseMealEstimateResponse({
      mealTitle: 'Oats',
      confidence: 0.7,
      calories: 300,
      proteinG: 12,
      carbG: 45,
      fatG: 8,
      fiberG: 6,
      ingredients: [],
    });

    expect(parsed.carbsG).toBe(45);
  });

  it('parses physique assessment with range and categorical confidence', () => {
    const parsed = parseAiResponse(aiPhysiqueAssessmentSchema, {
      physiqueCategory: 'average',
      estimatedBodyFatRange: { minPercent: 20, maxPercent: 26 },
      confidence: 'medium',
      nutritionAdjustmentSuggestion: 'Add a protein serving at lunch.',
      workoutFocusSuggestion: 'Focus on posture and glute engagement.',
    });

    expect(parsed.estimatedBodyFatRange.minPercent).toBe(20);
    expect(parsed.confidence).toBe('medium');
  });

  it('rejects physique assessment without a valid range', () => {
    expect(() =>
      parseAiResponse(aiPhysiqueAssessmentSchema, {
        physiqueCategory: 'lean',
        estimatedBodyFatRange: { minPercent: 30, maxPercent: 20 },
        confidence: 'high',
        nutritionAdjustmentSuggestion: 'n/a',
        workoutFocusSuggestion: 'n/a',
      }),
    ).toThrow(AiValidationError);
  });

  it('rejects invalid JSON shapes', () => {
    expect(() =>
      parseMealEstimateResponse({
        mealTitle: '',
        confidence: 2,
        calories: -1,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
        ingredients: [],
      }),
    ).toThrow(AiValidationError);
  });
});
