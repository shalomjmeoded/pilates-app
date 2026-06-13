import type { AiFeature } from './types';

export const AI_ROUTES = {
  mealText: '/ai/meal-text',
  mealPhoto: '/ai/meal-photo',
  exerciseSwap: '/ai/exercise-swap',
  workoutChange: '/ai/workout-change',
  weeklyCoach: '/ai/weekly-coach',
  physiqueAssessment: '/ai/physique-assessment',
} as const;

export type AiRoute = (typeof AI_ROUTES)[keyof typeof AI_ROUTES];

export const ROUTE_TO_FEATURE: Record<AiRoute, AiFeature> = {
  [AI_ROUTES.mealText]: 'meal_text_estimate',
  [AI_ROUTES.mealPhoto]: 'meal_photo_estimate',
  [AI_ROUTES.exerciseSwap]: 'exercise_substitution',
  [AI_ROUTES.workoutChange]: 'workout_change_suggestion',
  [AI_ROUTES.weeklyCoach]: 'weekly_coach',
  [AI_ROUTES.physiqueAssessment]: 'physique_assessment',
};

export function isAiRoute(pathname: string): pathname is AiRoute {
  return Object.values(AI_ROUTES).includes(pathname as AiRoute);
}
