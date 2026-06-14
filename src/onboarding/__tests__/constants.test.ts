import { ONBOARDING_ROUTES, ONBOARDING_TOTAL_STEPS, getOnboardingRoute } from '../constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

describe('onboarding flow', () => {
  afterEach(() => {
    useOnboardingStore.getState().resetDraft();
  });

  it('does not include the obsolete media preference step', () => {
    expect(ONBOARDING_ROUTES).not.toContain('step-04-media');
    expect(ONBOARDING_ROUTES).toHaveLength(ONBOARDING_TOTAL_STEPS);
    expect(getOnboardingRoute(4)).toBe('step-05-notifications');
  });

  it('allows a complete onboarding profile with no movement preference selected', () => {
    const store = useOnboardingStore.getState();
    store.patchDraft({
      genderIdentity: 'female',
      trainingFrequency: '3_4',
      exercisePreferences: [],
      heightCm: 168,
      currentWeightKg: 65,
      birthYear: 1992,
      fitnessGoal: 'get_toned',
      goalWeightKg: 60,
      weightTrajectory: 'weight_loss',
      paceKgPerWeek: 0.5,
    });

    const profile = useOnboardingStore.getState().toProfile();

    expect(profile).not.toBeNull();
    expect(profile?.exercisePreferences).toEqual([]);
    expect(profile?.mediaPreference).toBe('static_only');
  });
});
