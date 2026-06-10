import type { PremiumFeatureKey } from '@/types/premium';

export interface PremiumUpsellContent {
  featureName: string;
  title: string;
  description: string;
  benefits: string[];
}

export const PREMIUM_UPSELLS: Record<PremiumFeatureKey, PremiumUpsellContent> = {
  start_workout: {
    featureName: 'start_workout',
    title: 'Premium Feature',
    description: 'Start your personalized workout plan built from your onboarding answers.',
    benefits: [
      'Daily Pilates sessions tailored to you',
      'Progressive movement planning',
      'Streak tracking and session history',
    ],
  },
  add_meal: {
    featureName: 'add_meal',
    title: 'Premium Feature',
    description: 'Log meals against your personalized calorie and macro targets.',
    benefits: [
      'Daily macro tracking',
      'Portion adjustments',
      'Adherence insights',
    ],
  },
  saved_meals: {
    featureName: 'saved_meals',
    title: 'Premium Feature',
    description: 'Save meals you eat often for one-tap logging.',
    benefits: [
      'Reusable meal templates',
      'Faster daily logging',
      'Consistent macro targets',
    ],
  },
  progress_analytics: {
    featureName: 'progress_analytics',
    title: 'Premium Feature',
    description: 'See weight trends, adherence, consistency, and milestone progress.',
    benefits: [
      'Weight journey charts',
      'Macro adherence',
      'Consistency scoring',
    ],
  },
  ai_meal_text: {
    featureName: 'ai_meal_text',
    title: 'Premium Feature',
    description: 'Estimate calories and macros instantly from text.',
    benefits: ['Faster logging', 'Better accuracy', 'Saved meals'],
  },
  ai_meal_photo: {
    featureName: 'ai_meal_photo',
    title: 'Premium Feature',
    description: 'Estimate visible meals from a photo before you save.',
    benefits: ['Quick capture', 'Review before save', 'On-device compression'],
  },
  exercise_swap: {
    featureName: 'exercise_swap',
    title: 'Premium Feature',
    description: 'Get personalized exercise alternatives based on your session.',
    benefits: ['Equipment constraints', 'Injury-friendly swaps', 'Preferences', 'Fitness level'],
  },
  weekly_coach: {
    featureName: 'weekly_coach',
    title: 'Weekly AI Coach',
    description: 'Your coaching report is ready.',
    benefits: [
      'Weekly wins and focus areas',
      'Nutrition and workout tips',
      'Summary-only — never full history',
    ],
  },
  physique_assessment: {
    featureName: 'physique_assessment',
    title: 'Premium Feature',
    description: 'Experimental visual physique insights from photos.',
    benefits: [
      'Range-based body composition estimate',
      'Nutrition and workout focus ideas',
      'Review before saving',
    ],
  },
};
