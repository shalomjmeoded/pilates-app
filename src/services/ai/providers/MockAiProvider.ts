import type {
  AiExerciseSubstitution,
  AiMealEstimate,
  AiPhysiqueAssessment,
  AiWorkoutChangeSuggestion,
  AiWeeklyCoachInsight,
  PhysiqueAssessmentRequest,
} from '@/types/ai';
import type { WeeklyCoachSummary } from '@/types/coaching';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';
import type { WorkoutChangeRequest, WorkoutFocusArea } from '@/types/workout';

import type { AiProvider } from '../AiProvider';
import { logAiAudit } from '../aiAudit';
import {
  aiExerciseSubstitutionSchema,
  aiWorkoutChangeSuggestionSchema,
  aiWeeklyCoachSchema,
  aiPhysiqueAssessmentSchema,
  parseMealEstimateResponse,
} from '../schemas';
import { parseAiResponse } from '../parseAiResponse';

async function withMockAudit<T>(
  feature: Parameters<typeof logAiAudit>[0]['feature'],
  requestSummary: Record<string, unknown>,
  promptFingerprint: string,
  build: () => T,
): Promise<T> {
  const data = build();
  await logAiAudit({
    feature,
    requestSummary,
    promptFingerprint,
    response: data,
    model: 'mock',
    success: true,
  });
  return data;
}

export class MockAiProvider implements AiProvider {
  estimateMealFromText(description: string): Promise<AiMealEstimate> {
    return withMockAudit(
      'meal_text_estimate',
      { descriptionLength: description.length },
      description,
      () =>
        parseMealEstimateResponse({
          mealTitle: description.slice(0, 48) || 'Estimated meal',
          confidence: 0.72,
          calories: 420,
          proteinG: 28,
          carbsG: 38,
          fatG: 14,
          fiberG: 6,
          ingredients: [
            { name: 'Main item', grams: 180 },
            { name: 'Side', grams: 80 },
          ],
        }),
    );
  }

  estimateMealFromPhoto(): Promise<AiMealEstimate> {
    return withMockAudit(
      'meal_photo_estimate',
      { imageByteLength: 0 },
      'mock-photo',
      () =>
        parseMealEstimateResponse({
          mealTitle: 'Photo meal estimate',
          confidence: 0.65,
          calories: 380,
          proteinG: 22,
          carbsG: 42,
          fatG: 12,
          fiberG: 5,
          ingredients: [{ name: 'Visible plate', grams: 250 }],
        }),
    );
  }

  generateWeeklyCoach(summary: WeeklyCoachSummary): Promise<AiWeeklyCoachInsight> {
    return withMockAudit('weekly_coach', { weekStart: summary.weekStart }, JSON.stringify(summary), () =>
      parseAiResponse(aiWeeklyCoachSchema, {
        summary: `Strong week toward your ${summary.goal.replaceAll('_', ' ')} goal.`,
        wins: [`Completed ${summary.workoutsCompleted} workouts.`],
        focusForNextWeek: 'Keep your next week simple and repeatable.',
        nutritionTip: 'Anchor each day with a protein-rich meal.',
        workoutTip: 'Prioritize form and breathing over speed.',
      }),
    );
  }

  substituteExercise(context: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    libraryExerciseIds: string[];
    swapReason: ExerciseSwapReason;
  }): Promise<AiExerciseSubstitution> {
    const replacement =
      context.libraryExerciseIds.find((id) => id !== context.exerciseId) ?? context.exerciseId;

    return withMockAudit(
      'exercise_substitution',
      {
        exerciseId: context.exerciseId,
        swapReason: context.swapReason,
        candidateCount: context.libraryExerciseIds.length,
      },
      JSON.stringify(context),
      () =>
        parseAiResponse(aiExerciseSubstitutionSchema, {
          replacementExerciseId: replacement,
          reason: 'Similar muscle focus with lower joint stress.',
          coachingNote: 'Move slowly and keep your core engaged throughout.',
        }),
    );
  }

  suggestWorkoutChange(context: WorkoutChangeRequest & {
    availableMinuteOptions: number[];
    availableFocusAreas: WorkoutFocusArea[];
    todayMovementCount: number;
    todayEstimatedMinutes: number;
    decisionMode?: 'standard' | 'onboarding_seed';
    onboardingProfile?: {
      fitnessGoal: string;
      trainingFrequency: string;
      exercisePreferences: string[];
      paceKgPerWeek: number;
      weightTrajectory: string;
    };
  }): Promise<AiWorkoutChangeSuggestion> {
    const minuteOption =
      context.availableMinuteOptions.find((value) => value === context.targetMinutes) ??
      context.availableMinuteOptions[0] ??
      context.targetMinutes;

    return withMockAudit(
      'workout_change_suggestion',
      {
        focusArea: context.focusArea,
        targetMinutes: context.targetMinutes,
        intensity: context.intensity,
      },
      JSON.stringify(context),
      () =>
        parseAiResponse(aiWorkoutChangeSuggestionSchema, {
          focusArea: context.focusArea,
          targetMinutes: minuteOption,
          intensity: context.intensity,
          coachRationale:
            'Great choice. This adjustment keeps your plan aligned with your focus while preserving steady weekly progress.',
        }),
    );
  }

  assessPhysique(context: PhysiqueAssessmentRequest): Promise<AiPhysiqueAssessment> {
    return withMockAudit(
      'physique_assessment',
      {
        imageCount:
          1 + (context.sideImageBase64 ? 1 : 0) + (context.backImageBase64 ? 1 : 0),
      },
      'mock-physique',
      () =>
        parseAiResponse(aiPhysiqueAssessmentSchema, {
          physiqueCategory: 'average',
          estimatedBodyFatRange: { minPercent: 22, maxPercent: 28 },
          confidence: 'medium',
          nutritionAdjustmentSuggestion:
            'Keep protein steady at meals and add one extra serving of vegetables this week.',
          workoutFocusSuggestion:
            'Prioritize core control and glute activation in your Pilates sessions.',
        }),
    );
  }
}
