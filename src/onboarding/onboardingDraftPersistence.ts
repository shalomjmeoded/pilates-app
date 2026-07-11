import { ONBOARDING_TOTAL_STEPS } from '@/onboarding/constants';
import { preferencesStorage } from '@/storage/mmkv';
import type { OnboardingDraft } from '@/stores/onboardingStore';

export const ONBOARDING_RESUME_WINDOW_MS = 48 * 60 * 60 * 1000;

export interface PersistedOnboardingSession {
  version: 1;
  draft: OnboardingDraft;
  currentStep: number;
  updatedAt: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parsePersistedOnboardingSession(
  serialized: string | undefined,
  now = Date.now(),
): PersistedOnboardingSession | null {
  if (!serialized) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (
      !isRecord(parsed) ||
      parsed.version !== 1 ||
      !isRecord(parsed.draft) ||
      typeof parsed.currentStep !== 'number' ||
      !Number.isInteger(parsed.currentStep) ||
      parsed.currentStep < 1 ||
      parsed.currentStep > ONBOARDING_TOTAL_STEPS ||
      typeof parsed.updatedAt !== 'number' ||
      !Number.isFinite(parsed.updatedAt) ||
      parsed.updatedAt > now + 60_000 ||
      now - parsed.updatedAt > ONBOARDING_RESUME_WINDOW_MS
    ) {
      return null;
    }

    return parsed as unknown as PersistedOnboardingSession;
  } catch {
    return null;
  }
}

export function readPersistedOnboardingSession(
  now = Date.now(),
): PersistedOnboardingSession | null {
  const serialized = preferencesStorage.getOnboardingDraft();
  const session = parsePersistedOnboardingSession(serialized, now);

  if (serialized && !session) {
    preferencesStorage.clearOnboardingDraft();
  }

  return session;
}

export function persistOnboardingSession(
  draft: OnboardingDraft,
  currentStep: number,
): void {
  const session: PersistedOnboardingSession = {
    version: 1,
    draft,
    currentStep,
    updatedAt: Date.now(),
  };
  preferencesStorage.setOnboardingDraft(JSON.stringify(session));
}

export function clearPersistedOnboardingSession(): void {
  preferencesStorage.clearOnboardingDraft();
}
