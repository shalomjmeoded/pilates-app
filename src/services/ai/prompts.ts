import { buildPhysiqueAssessmentPrompt } from './physiqueAssessmentPrompt';
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
}
Hard rules — follow every one:
- calories MUST equal proteinG*4 + carbsG*4 + fatG*9, rounded. Do the arithmetic and make the numbers agree; never return a total that does not match the macros.
- Base grams and macros on standard nutrition data for realistic portions. Do not inflate or guess wildly.
- Only include ingredients that are actually described or clearly visible. Never invent foods, brands, or quantities that were not provided.
- confidence is 0..1 and must reflect real uncertainty: lower it when portions or ingredients are ambiguous.
- All numbers are non-negative.`;

export function buildPrompt(feature: AiFeature, payload: Record<string, unknown>): string {
  switch (feature) {
    case 'meal_text_estimate':
      return `You are a precise nutrition assistant for Form: Pilates Studio, a Pilates and wellness app for women and the LGBTQ+ community.
Estimate macros for this meal from the description only. Be accurate and conservative — when in doubt, estimate a sensible standard portion and lower your confidence rather than guessing high.
${MEAL_JSON_RULES}
Meal description: ${String(payload.description ?? '')}`;

    case 'meal_photo_estimate': {
      const note = String(payload.description ?? '').trim();
      return `You are a precise nutrition assistant for Form: Pilates Studio. Estimate macros for food that is clearly visible in the photo.
Do not assume hidden ingredients or oversized portions; if the photo is ambiguous, lower your confidence.
${note ? `The user also provided this optional description — use it to refine portions, oil/cooking fat, and ingredients that may be hard to see:\n${note}\n` : ''}
${MEAL_JSON_RULES}`;
    }

    case 'weekly_coach':
      return `You are an experienced Pilates + lifestyle coach for Form: Pilates Studio — warm, direct, and specific. Speak in second person like a real coach reviewing THEIR week, not a generic wellness blog. Celebrate real effort, call out patterns kindly, and give concrete next actions.
Return ONLY JSON:
{
  "summary": string,
  "wins": string[],
  "focusForNextWeek": string,
  "nutritionTip": string,
  "weightTip": string,
  "workoutTip": string
}
Guidance:
- summary: 2-3 sentences weaving food, weight trend, and sessions together for LAST week. workoutsPlanned is training days on their plan (e.g. 4), NOT 7 calendar days.
- wins: 1-3 specific wins grounded ONLY in the numbers. Never invent adherence, meals, or workouts.
- focusForNextWeek: one clear priority tied to their goal — invitation, not guilt.
- nutritionTip: genuine feedback on food choices using calorieAdherencePercent, proteinAdherencePercent, averageCalories, averageProteinG, and nutritionLogDays. Be specific (e.g. protein gaps, overshoot days) without shaming.
- weightTip: genuine feedback on weightTrend and weightLogDays — logging rhythm + what the trend means for their goal.
- workoutTip: genuine feedback on sessions done vs planned and topSkippedExerciseNames — how the work went, recovery, swaps if skips.
- Never say they planned 7 sessions unless workoutsPlanned is actually 7.
Use ONLY the provided aggregates. Do NOT fabricate history.
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
