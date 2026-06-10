import type {
  AiExerciseSubstitution,
  AiMealEstimate,
  AiPhysiqueAssessment,
  AiWeeklyCoachInsight,
  PhysiqueAssessmentRequest,
} from '@/types/ai';
import type { WeeklyCoachSummary } from '@/types/coaching';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';

import type { AiProvider } from '../AiProvider';
import { logAiAudit } from '../aiAudit';
import { generateGeminiJson } from '../geminiClient';
import {
  buildPhysiqueAssessmentGeminiParts,
  buildPhysiqueAssessmentPrompt,
} from '../physiqueAssessmentPrompt';
import { buildPrompt } from '../prompts';
import { parseAiResponse } from '../parseAiResponse';
import {
  aiExerciseSubstitutionSchema,
  aiWeeklyCoachSchema,
  aiPhysiqueAssessmentSchema,
  parseMealEstimateResponse,
} from '../schemas';
import type { AiFeature } from '../types';
import { getGeminiModel } from '../config';

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
      model: getGeminiModel(),
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

async function callGeminiFeature(
  feature: AiFeature,
  payload: Record<string, unknown>,
  images?: string | string[],
): Promise<unknown> {
  if (feature === 'physique_assessment') {
    const frontImageBase64 = String(payload.frontImageBase64 ?? '');
    const prompt = buildPhysiqueAssessmentPrompt({
      notes: typeof payload.notes === 'string' ? payload.notes : undefined,
      genderIdentity:
        payload.genderIdentity === 'female' ||
        payload.genderIdentity === 'male' ||
        payload.genderIdentity === 'non_binary' ||
        payload.genderIdentity === 'prefer_not_to_say'
          ? payload.genderIdentity
          : undefined,
      ageYears: typeof payload.ageYears === 'number' ? payload.ageYears : undefined,
      hasSidePhoto: Boolean(payload.sideImageBase64),
      hasBackPhoto: Boolean(payload.backImageBase64),
    });
    const parts = buildPhysiqueAssessmentGeminiParts(prompt, {
      frontImageBase64,
      sideImageBase64:
        typeof payload.sideImageBase64 === 'string' ? payload.sideImageBase64 : undefined,
      backImageBase64:
        typeof payload.backImageBase64 === 'string' ? payload.backImageBase64 : undefined,
    });
    const text = await generateGeminiJson('', undefined, {
      parts,
      temperature: 0,
    });
    return JSON.parse(text) as unknown;
  }

  const prompt = buildPrompt(feature, payload);
  const text = await generateGeminiJson(prompt, images);
  return JSON.parse(text) as unknown;
}

export class GeminiDirectProvider implements AiProvider {
  estimateMealFromText(description: string): Promise<AiMealEstimate> {
    return withAudit(
      'meal_text_estimate',
      { descriptionLength: description.length },
      description,
      async () => {
        const raw = await callGeminiFeature('meal_text_estimate', { description });
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
        const raw = await callGeminiFeature('meal_photo_estimate', { imageBase64 }, imageBase64);
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
        const raw = await callGeminiFeature('weekly_coach', { ...summary });
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
        const raw = await callGeminiFeature('exercise_substitution', context);
        return parseAiResponse(aiExerciseSubstitutionSchema, raw);
      },
    );
  }

  assessPhysique(context: PhysiqueAssessmentRequest): Promise<AiPhysiqueAssessment> {
    const imageCount =
      1 + (context.sideImageBase64 ? 1 : 0) + (context.backImageBase64 ? 1 : 0);

    return withAudit(
      'physique_assessment',
      {
        notesLength: context.notes?.length ?? 0,
        imageCount,
        genderIdentity: context.genderIdentity,
        ageYears: context.ageYears,
        frontImageByteLength: context.frontImageBase64.length,
      },
      `${context.frontImageBase64.slice(0, 64)}:${imageCount}`,
      async () => {
        const raw = await callGeminiFeature('physique_assessment', { ...context });
        return parseAiResponse(aiPhysiqueAssessmentSchema, raw);
      },
    );
  }
}
