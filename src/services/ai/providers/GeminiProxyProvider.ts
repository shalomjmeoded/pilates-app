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
import { AiProxyError, callAiProxy } from '../aiProxyClient';
import { parseAiResponse } from '../parseAiResponse';
import {
  aiExerciseSubstitutionSchema,
  aiWorkoutChangeSuggestionSchema,
  aiWeeklyCoachSchema,
  aiPhysiqueAssessmentSchema,
  parseMealEstimateResponse,
} from '../schemas';
import type { AiFeature } from '../types';

async function withAudit<T>(
  feature: AiFeature,
  requestSummary: Record<string, unknown>,
  promptFingerprint: string,
  action: () => Promise<T>,
): Promise<T> {
  try {
    const data = await action();
    await logAiAudit({
      feature,
      requestSummary,
      promptFingerprint,
      response: data,
      model: 'gemini-proxy',
      success: true,
    });
    return data;
  } catch (error) {
    await logAiAudit({
      feature,
      requestSummary,
      promptFingerprint,
      success: false,
    });
    throw error;
  }
}

export class GeminiProxyProvider implements AiProvider {
  estimateMealFromText(description: string): Promise<AiMealEstimate> {
    return withAudit(
      'meal_text_estimate',
      { descriptionLength: description.length },
      description,
      async () => {
        const raw = await callAiProxy<unknown>('meal_text_estimate', { description });
        return parseMealEstimateResponse(raw);
      },
    );
  }

  estimateMealFromPhoto(imageBase64: string): Promise<AiMealEstimate> {
    return withAudit(
      'meal_photo_estimate',
      { imageByteLength: imageBase64.length },
      `${imageBase64.slice(0, 64)}:${imageBase64.length}`,
      async () => {
        const raw = await callAiProxy<unknown>('meal_photo_estimate', { imageBase64 });
        return parseMealEstimateResponse(raw);
      },
    );
  }

  generateWeeklyCoach(summary: WeeklyCoachSummary): Promise<AiWeeklyCoachInsight> {
    return withAudit(
      'weekly_coach',
      {
        weekStart: summary.weekStart,
        workoutsCompleted: summary.workoutsCompleted,
        calorieAdherencePercent: summary.calorieAdherencePercent,
        proteinAdherencePercent: summary.proteinAdherencePercent,
        skippedExerciseCount: summary.skippedExerciseCount,
      },
      JSON.stringify(summary),
      async () => {
        const raw = await callAiProxy<unknown>('weekly_coach', { ...summary });
        return parseAiResponse(aiWeeklyCoachSchema, raw);
      },
    );
  }

  substituteExercise(context: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    libraryExerciseIds: string[];
    swapReason: ExerciseSwapReason;
  }): Promise<AiExerciseSubstitution> {
    return withAudit(
      'exercise_substitution',
      {
        exerciseId: context.exerciseId,
        exerciseName: context.exerciseName,
        muscleGroup: context.muscleGroup,
        swapReason: context.swapReason,
        candidateCount: context.libraryExerciseIds.length,
      },
      JSON.stringify(context),
      async () => {
        const raw = await callAiProxy<unknown>('exercise_substitution', context);
        return parseAiResponse(aiExerciseSubstitutionSchema, raw);
      },
    );
  }

  suggestWorkoutChange(context: WorkoutChangeRequest & {
    availableMinuteOptions: number[];
    availableFocusAreas: WorkoutFocusArea[];
    todayMovementCount: number;
    todayEstimatedMinutes: number;
  }): Promise<AiWorkoutChangeSuggestion> {
    return withAudit(
      'workout_change_suggestion',
      {
        focusArea: context.focusArea,
        targetMinutes: context.targetMinutes,
        intensity: context.intensity,
        hasCoachNote: Boolean(context.coachNote),
        todayMovementCount: context.todayMovementCount,
      },
      JSON.stringify(context),
      async () => {
        const payload: Record<string, unknown> = { ...context };
        const raw = await callAiProxy<unknown>('workout_change_suggestion', payload);
        return parseAiResponse(aiWorkoutChangeSuggestionSchema, raw);
      },
    );
  }

  assessPhysique(context: PhysiqueAssessmentRequest): Promise<AiPhysiqueAssessment> {
    const imageCount =
      1 +
      (context.sideImageBase64 ? 1 : 0) +
      (context.backImageBase64 ? 1 : 0);

    return withAudit(
      'physique_assessment',
      {
        notesLength: context.notes?.length ?? 0,
        imageCount,
        frontImageByteLength: context.frontImageBase64.length,
      },
      `${context.frontImageBase64.slice(0, 64)}:${imageCount}`,
      async () => {
        const raw = await callAiProxy<unknown>('physique_assessment', { ...context });
        return parseAiResponse(aiPhysiqueAssessmentSchema, raw);
      },
    );
  }
}
