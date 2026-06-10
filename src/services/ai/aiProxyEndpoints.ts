import type { AiFeature } from './types';

export const AI_PROXY_ENDPOINTS: Record<AiFeature, string> = {
  meal_text_estimate: '/ai/meal-text',
  meal_photo_estimate: '/ai/meal-photo',
  exercise_substitution: '/ai/exercise-swap',
  weekly_coach: '/ai/weekly-coach',
  physique_assessment: '/ai/physique-assessment',
};

export function buildAiEndpointUrl(baseUrl: string, feature: AiFeature): string {
  const normalizedBase = baseUrl.replace(/\/$/, '').replace(/\/api\/ai-proxy$/, '');
  return `${normalizedBase}${AI_PROXY_ENDPOINTS[feature]}`;
}
