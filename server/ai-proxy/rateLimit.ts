import type { AiFeature } from './types';

export interface QuotaPeriod {
  limit: number;
  period: 'day' | 'week' | 'month';
}

export const PREMIUM_QUOTAS: Record<AiFeature, QuotaPeriod> = {
  meal_text_estimate: { limit: 20, period: 'day' },
  meal_photo_estimate: { limit: 10, period: 'day' },
  exercise_substitution: { limit: 10, period: 'day' },
  weekly_coach: { limit: 2, period: 'week' },
  physique_assessment: { limit: 2, period: 'month' },
};

export const FREE_QUOTA = 0;

const COOLDOWN_MS = 10_000;
const SPAM_WINDOW_MS = 60_000;

interface UsageBucket {
  count: number;
  periodKey: string;
}

interface DeviceState {
  lastRequestAt: number;
  lastPromptHash?: string;
  lastPromptAt?: number;
  features: Partial<Record<AiFeature, UsageBucket>>;
}

const deviceState = new Map<string, DeviceState>();

function periodKey(period: QuotaPeriod['period'], now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  if (period === 'day') {
    return `${y}-${m}-${d}`;
  }
  if (period === 'week') {
    const date = new Date(Date.UTC(y, now.getUTCMonth(), now.getUTCDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  return `${y}-${m}`;
}

function hashPrompt(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export function resetRateLimitState(): void {
  deviceState.clear();
}

export interface RateLimitCheckInput {
  deviceInstallId: string;
  feature: AiFeature;
  isPremium: boolean;
  promptFingerprint: string;
  now?: number;
}

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; code: 'RATE_LIMITED' | 'COOLDOWN' | 'SPAM_BLOCKED' | 'UNAUTHORIZED'; message: string };

export function checkRateLimit(input: RateLimitCheckInput): RateLimitResult {
  const now = input.now ?? Date.now();

  if (!input.isPremium) {
    return {
      allowed: false,
      code: 'UNAUTHORIZED',
      message: 'AI features require Tune Premium.',
    };
  }

  const quota = PREMIUM_QUOTAS[input.feature];
  const state = deviceState.get(input.deviceInstallId) ?? {
    lastRequestAt: 0,
    features: {},
  };

  if (now - state.lastRequestAt < COOLDOWN_MS) {
    return {
      allowed: false,
      code: 'COOLDOWN',
      message: 'Please wait a few seconds between AI requests.',
    };
  }

  const promptHash = hashPrompt(input.promptFingerprint);
  if (
    state.lastPromptHash === promptHash &&
    state.lastPromptAt &&
    now - state.lastPromptAt < SPAM_WINDOW_MS
  ) {
    return {
      allowed: false,
      code: 'SPAM_BLOCKED',
      message: 'Duplicate AI request blocked. Edit your input and try again.',
    };
  }

  const key = periodKey(quota.period, new Date(now));
  const bucket = state.features[input.feature];
  const count = bucket?.periodKey === key ? bucket.count : 0;

  if (count >= quota.limit) {
    return {
      allowed: false,
      code: 'RATE_LIMITED',
      message: `AI limit reached for ${input.feature}.`,
    };
  }

  return { allowed: true, remaining: quota.limit - count - 1 };
}

export function recordRateLimitUse(input: RateLimitCheckInput): void {
  const now = input.now ?? Date.now();
  const quota = PREMIUM_QUOTAS[input.feature];
  const state = deviceState.get(input.deviceInstallId) ?? {
    lastRequestAt: 0,
    features: {},
  };

  const key = periodKey(quota.period, new Date(now));
  const bucket = state.features[input.feature];
  const count = bucket?.periodKey === key ? bucket.count : 0;

  state.features[input.feature] = { periodKey: key, count: count + 1 };
  state.lastRequestAt = now;
  state.lastPromptHash = hashPrompt(input.promptFingerprint);
  state.lastPromptAt = now;
  deviceState.set(input.deviceInstallId, state);
}
