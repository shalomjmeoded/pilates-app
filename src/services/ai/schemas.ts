import { z } from 'zod';

import type { AiMealEstimate } from '@/types/ai';

import { AiValidationError } from './errors';

const ingredientSchema = z.object({
  name: z.string().min(1),
  grams: z.number().nonnegative(),
});

export const aiMealEstimateSchema = z.object({
  mealTitle: z.string().min(1),
  confidence: z.number().min(0).max(1),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative(),
  ingredients: z.array(ingredientSchema),
});

export const aiMealEstimateLegacySchema = aiMealEstimateSchema.extend({
  carbG: z.number().nonnegative().optional(),
});

export function parseMealEstimateResponse(raw: unknown): AiMealEstimate {
  const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const normalized = {
    ...record,
    carbsG: record.carbsG ?? record.carbG,
  };
  const result = aiMealEstimateSchema.safeParse(normalized);
  if (!result.success) {
    throw new AiValidationError(result.error);
  }
  return result.data;
}

export const aiWorkoutAdaptationSchema = z.object({
  exerciseIds: z.array(z.string().min(1)).min(9).max(12),
  coachingCopy: z.string().optional(),
});

export const aiCoachingTipSchema = z.object({
  tip: z.string().min(1),
  relatedGoal: z.enum(['lose_weight', 'get_toned', 'maintain', 'build_muscle']).optional(),
});

export const aiWeeklyCoachSchema = z.object({
  summary: z.string().min(1),
  wins: z.array(z.string().min(1)).min(1).max(5),
  focusForNextWeek: z.string().min(1),
  nutritionTip: z.string().min(1),
  workoutTip: z.string().min(1),
});

export const aiExerciseSubstitutionSchema = z.object({
  replacementExerciseId: z.string().min(1),
  reason: z.string().min(1),
  coachingNote: z.string().min(1),
});

export const aiWorkoutChangeSuggestionSchema = z.object({
  focusArea: z.enum(['core', 'glutes', 'posture', 'mobility', 'full_body']),
  targetMinutes: z.number().int().min(12).max(60),
  intensity: z.enum(['lighter', 'balanced', 'challenging']),
  coachRationale: z.string().min(1),
});

const physiqueCategorySchema = z.enum(['lean', 'average', 'athletic', 'higher_body_fat']);

const physiqueConfidenceSchema = z.enum(['low', 'medium', 'high']);

const bodyFatRangeSchema = z
  .object({
    minPercent: z.number().int().min(5).max(60),
    maxPercent: z.number().int().min(5).max(60),
  })
  .refine((range) => range.minPercent <= range.maxPercent, {
    message: 'minPercent must be less than or equal to maxPercent',
  });

export const aiPhysiqueAssessmentSchema = z.object({
  physiqueCategory: physiqueCategorySchema,
  estimatedBodyFatRange: bodyFatRangeSchema,
  confidence: physiqueConfidenceSchema,
  nutritionAdjustmentSuggestion: z.string().min(1),
  workoutFocusSuggestion: z.string().min(1),
});

export type AiMealEstimatePayload = z.infer<typeof aiMealEstimateSchema>;
export type AiWorkoutAdaptationPayload = z.infer<typeof aiWorkoutAdaptationSchema>;
export type AiCoachingTipPayload = z.infer<typeof aiCoachingTipSchema>;
export type AiWorkoutChangeSuggestionPayload = z.infer<typeof aiWorkoutChangeSuggestionSchema>;
