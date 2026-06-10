export type SubscriptionStatus = 'inactive' | 'trial' | 'active';

export const TRIAL_LENGTH_DAYS = 7;

export interface PremiumStatus {
  subscriptionStatus: SubscriptionStatus;
  isPremium: boolean;
  productId?: string;
  expiresAt?: string;
  trialUsed: boolean;
  source: 'mock' | 'revenuecat';
}

export type PremiumAnalyticsEvent =
  | 'paywall_viewed'
  | 'trial_started'
  | 'feature_locked'
  | 'upsell_opened'
  | 'restore_purchase_tapped'
  | 'restore_purchase_succeeded';

export type PremiumFeatureKey =
  | 'start_workout'
  | 'add_meal'
  | 'saved_meals'
  | 'progress_analytics'
  | 'ai_meal_text'
  | 'ai_meal_photo'
  | 'exercise_swap'
  | 'weekly_coach'
  | 'physique_assessment';
