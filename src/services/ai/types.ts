export type AiFeature =
  | 'meal_text_estimate'
  | 'meal_photo_estimate'
  | 'weekly_coach'
  | 'exercise_substitution'
  | 'physique_assessment';

export type AiQuotaPeriod = 'day' | 'week' | 'month';

export interface AiQuotaConfig {
  limit: number;
  period: AiQuotaPeriod;
}

export const PREMIUM_AI_QUOTAS: Record<AiFeature, AiQuotaConfig> = {
  meal_text_estimate: { limit: 20, period: 'day' },
  meal_photo_estimate: { limit: 10, period: 'day' },
  exercise_substitution: { limit: 10, period: 'day' },
  weekly_coach: { limit: 2, period: 'week' },
  physique_assessment: { limit: 2, period: 'month' },
};
