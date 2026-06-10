export const PAYWALL_TITLE = 'Unlock Your Plan';

export const PAYWALL_SUBTITLE = 'Your personalized Tune experience — built specifically for you.';

export const CORE_PREMIUM_BENEFITS = [
  'Personalized workouts',
  'Nutrition tracking',
  'Progress analytics',
  'Weight tracking',
  'Saved meals',
  'Notifications',
] as const;

export const AI_PREMIUM_BENEFITS = [
  'AI meal estimates',
  'AI coaching',
  'Exercise substitutions',
  'Future physique analysis',
] as const;

export const PAYWALL_BENEFITS = [...CORE_PREMIUM_BENEFITS, ...AI_PREMIUM_BENEFITS] as const;
