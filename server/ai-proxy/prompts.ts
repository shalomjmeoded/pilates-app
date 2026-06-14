import { buildPhysiqueAssessmentPrompt } from '../../src/services/ai/physiqueAssessmentPrompt';

import type { AiFeature } from './types';

const MEAL_JSON_RULES = `Respond with ONLY valid JSON matching this shape:
{
  "mealTitle": string,
  "confidence": number,
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "fiberG": number,
  "ingredients": [{ "name": string, "grams": number }]
}`;

export function buildPrompt(feature: AiFeature, payload: Record<string, unknown>): string {
  switch (feature) {
    case 'meal_text_estimate':
      return `You are a nutrition assistant for a Pilates and wellness app.
Estimate macros for this meal description. Be conservative and practical.
${MEAL_JSON_RULES}
Meal description: ${String(payload.description ?? '')}`;

    case 'meal_photo_estimate':
      return `You are a nutrition assistant. Estimate visible meal macros from the photo.
Keep ingredients simple and conservative.
${MEAL_JSON_RULES}`;

    case 'weekly_coach':
      return `You are a supportive Pilates coach. Return ONLY JSON:
{
  "summary": string,
  "wins": string[],
  "focusForNextWeek": string,
  "nutritionTip": string,
  "workoutTip": string
}
Use only the provided weekly summary aggregates. Do not invent detailed history.
Context: ${JSON.stringify(payload)}`;

    case 'exercise_substitution':
      return `You are a Pilates movement coach. Return ONLY JSON:
{
  "replacementExerciseId": string,
  "reason": string,
  "coachingNote": string
}
Pick the best replacementExerciseId from libraryExerciseIds only.
Respect swapReason (too_hard, too_easy, knee_discomfort, no_equipment, dislike_movement).
Never invent an exercise id.
Context: ${JSON.stringify(payload)}`;

    case 'workout_change_suggestion':
      if (payload.decisionMode === 'onboarding_seed') {
        return `You are a premium Pilates coach selecting a user's first workout from onboarding context.
Return ONLY JSON:
{
  "focusArea": "core" | "glutes" | "posture" | "mobility" | "full_body",
  "targetMinutes": number,
  "intensity": "lighter" | "balanced" | "challenging",
  "coachRationale": string
}
Use onboardingProfile to choose a suitable first-session focus, duration, and intensity.
Do NOT simply mirror the default request values when onboardingProfile is provided.
Keep targetMinutes within availableMinuteOptions.
coachRationale must be concise and supportive.
Context: ${JSON.stringify(payload)}`;
      }
      return `You are a premium Pilates coach. Return ONLY JSON:
{
  "focusArea": "core" | "glutes" | "posture" | "mobility" | "full_body",
  "targetMinutes": number,
  "intensity": "lighter" | "balanced" | "challenging",
  "coachRationale": string
}
Use requested focus/time/intensity as primary input.
Keep targetMinutes within availableMinuteOptions when provided.
coachRationale must be concise and supportive.
Context: ${JSON.stringify(payload)}`;

    case 'physique_assessment':
      return buildPhysiqueAssessmentPrompt({
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

    default:
      return '';
  }
}
