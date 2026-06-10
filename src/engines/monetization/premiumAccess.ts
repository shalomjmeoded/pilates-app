import type { PremiumStatus, SubscriptionStatus } from '@/types/premium';

export function deriveSubscriptionStatus(input: {
  isPremium: boolean;
  productId?: string;
  expiresAt?: string;
  trialUsed: boolean;
  now?: Date;
}): SubscriptionStatus {
  const now = input.now ?? new Date();

  if (!input.isPremium) {
    return 'inactive';
  }

  if (input.expiresAt && new Date(input.expiresAt) <= now) {
    return 'inactive';
  }

  if (input.productId?.includes('trial') || (input.trialUsed && input.expiresAt)) {
    return 'trial';
  }

  return 'active';
}

export function hasPremiumAccess(status: PremiumStatus, now = new Date()): boolean {
  if (!status.isPremium) {
    return false;
  }

  if (status.expiresAt && new Date(status.expiresAt) <= now) {
    return false;
  }

  return status.subscriptionStatus !== 'inactive';
}

export function trainingFrequencyToWorkoutsPerWeek(
  frequency: import('@/types/profile').TrainingFrequency | null,
): number {
  switch (frequency) {
    case '1_2':
      return 2;
    case '3_4':
      return 4;
    case '5_plus':
      return 5;
    default:
      return 3;
  }
}
