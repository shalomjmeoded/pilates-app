import {
  ONBOARDING_RESUME_WINDOW_MS,
  parsePersistedOnboardingSession,
} from '../onboardingDraftPersistence';
import type { OnboardingDraft } from '@/stores/onboardingStore';

const draft: OnboardingDraft = {
  genderIdentity: 'female',
  trainingFrequency: null,
  exercisePreferences: [],
  availableEquipment: [],
  mediaPreference: 'static_only',
  notificationsEnabled: true,
  heightCm: null,
  currentWeightKg: null,
  nutritionMode: 'full_tracking',
  birthYear: null,
  fitnessGoal: null,
  goalWeightKg: null,
  weightTrajectory: null,
  paceKgPerWeek: null,
  baselinePlan: null,
};

function makeSnapshot(updatedAt: number, currentStep = 3): string {
  return JSON.stringify({ version: 1, draft, currentStep, updatedAt });
}

describe('onboarding draft persistence', () => {
  const now = Date.UTC(2026, 6, 10, 12);

  it('restores a valid session within the 48-hour window', () => {
    const session = parsePersistedOnboardingSession(
      makeSnapshot(now - ONBOARDING_RESUME_WINDOW_MS + 1),
      now,
    );

    expect(session?.currentStep).toBe(3);
    expect(session?.draft.genderIdentity).toBe('female');
  });

  it('expires a session after 48 hours', () => {
    expect(
      parsePersistedOnboardingSession(
        makeSnapshot(now - ONBOARDING_RESUME_WINDOW_MS - 1),
        now,
      ),
    ).toBeNull();
  });

  it('rejects invalid step indexes and malformed data', () => {
    expect(parsePersistedOnboardingSession(makeSnapshot(now, 99), now)).toBeNull();
    expect(parsePersistedOnboardingSession('{bad json', now)).toBeNull();
  });
});
