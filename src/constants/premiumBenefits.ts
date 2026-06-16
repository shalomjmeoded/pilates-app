export const PAYWALL_TITLE = 'Your personalized BetterMe plan is ready.';

export const PAYWALL_SUBTITLE =
  'Everything you shared is woven into daily movement, nutrition, and coaching — designed for calm, sustainable progress.';

export interface PaywallOutcomeBenefit {
  icon: 'yoga' | 'food-apple-outline' | 'chart-line' | 'camera-outline' | 'account-voice' | 'swap-horizontal';
  title: string;
  description: string;
}

export const PAYWALL_OUTCOME_BENEFITS: PaywallOutcomeBenefit[] = [
  {
    icon: 'yoga',
    title: 'AI-guided daily workouts',
    description: 'Pilates flows matched to your goals, pace, and preferences.',
  },
  {
    icon: 'food-apple-outline',
    title: 'Nutrition targets built for you',
    description: 'Calories and macros shaped around your body and rhythm.',
  },
  {
    icon: 'chart-line',
    title: 'Progress that proves momentum',
    description: 'Weight trends, consistency, and milestones in one place.',
  },
  {
    icon: 'camera-outline',
    title: 'AI meal estimates',
    description: 'Describe or photograph a meal — logging stays effortless.',
  },
  {
    icon: 'account-voice',
    title: 'Weekly coaching insights',
    description: 'Gentle guidance drawn from your week, not generic tips.',
  },
  {
    icon: 'swap-horizontal',
    title: 'Exercise swaps when you need variety',
    description: 'Adapt any movement without losing your plan’s intention.',
  },
];

/** @deprecated Use PAYWALL_OUTCOME_BENEFITS for display */
export const CORE_PREMIUM_BENEFITS = [
  'Personalized workouts',
  'Nutrition tracking',
  'Progress analytics',
  'Weight tracking',
  'Saved meals',
  'Notifications',
] as const;

/** @deprecated Use PAYWALL_OUTCOME_BENEFITS for display */
export const AI_PREMIUM_BENEFITS = [
  'AI meal estimates',
  'AI coaching',
  'Exercise substitutions',
  'Future physique analysis',
] as const;

/** @deprecated Use PAYWALL_OUTCOME_BENEFITS for display */
export const PAYWALL_BENEFITS = [...CORE_PREMIUM_BENEFITS, ...AI_PREMIUM_BENEFITS] as const;
