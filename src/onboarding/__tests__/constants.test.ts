import { ONBOARDING_ROUTES, ONBOARDING_TOTAL_STEPS, getOnboardingRoute } from '../constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

describe('onboarding flow', () => {
  afterEach(() => {
    useOnboardingStore.getState().resetDraft();
  });

  it('does not include the obsolete media preference step', () => {
    expect(ONBOARDING_ROUTES).not.toContain('step-04-media');
    expect(ONBOARDING_ROUTES).not.toContain('step-12-trajectory');
    expect(ONBOARDING_ROUTES).toHaveLength(ONBOARDING_TOTAL_STEPS);
    expect(getOnboardingRoute(1)).toBe('step-00-welcome');
    expect(getOnboardingRoute(2)).toBe('step-01-gender');
    expect(getOnboardingRoute(5)).toBe('step-04-equipment');
    expect(getOnboardingRoute(6)).toBe('step-05-notifications');
    expect(getOnboardingRoute(11)).toBe('step-11-goal-weight');
    expect(getOnboardingRoute(12)).toBe('step-14-pace');
  });

  it('defaults equipment to mat only', () => {
    expect(useOnboardingStore.getState().draft.availableEquipment).toEqual([]);
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
      goalWeightKg: 65,
      paceKgPerWeek: 0.5,
    });

    const profile = useOnboardingStore.getState().toProfile();

    expect(profile).not.toBeNull();
    expect(profile?.exercisePreferences).toEqual([]);
    expect(profile?.mediaPreference).toBe('video_streaming');
    expect(profile?.weightTrajectory).toBe('steady_state');
  });

  it('derives weight trajectory from the selected goal and goal weight', () => {
    const store = useOnboardingStore.getState();
    store.patchDraft({
      genderIdentity: 'female',
      trainingFrequency: '3_4',
      exercisePreferences: [],
      heightCm: 168,
      currentWeightKg: 65,
      birthYear: 1992,
      fitnessGoal: 'lose_weight',
      goalWeightKg: 65,
      paceKgPerWeek: 0.5,
    });

    expect(useOnboardingStore.getState().toProfile()?.weightTrajectory).toBe('weight_loss');

    useOnboardingStore.getState().patchDraft({
      fitnessGoal: 'get_toned',
      goalWeightKg: 68,
    });

    expect(useOnboardingStore.getState().toProfile()?.weightTrajectory).toBe('lean_mass');

    useOnboardingStore.getState().patchDraft({
      fitnessGoal: 'maintain',
      goalWeightKg: 62,
    });

    expect(useOnboardingStore.getState().toProfile()?.weightTrajectory).toBe('weight_loss');

    useOnboardingStore.getState().patchDraft({
      fitnessGoal: 'maintain',
      goalWeightKg: 65,
    });

    expect(useOnboardingStore.getState().toProfile()?.weightTrajectory).toBe('steady_state');
  });

  it('keeps notification reminders selected by default', () => {
    expect(useOnboardingStore.getState().draft.notificationsEnabled).toBe(true);
  });

  it('invalidates a calculated plan when a plan input changes', () => {
    const store = useOnboardingStore.getState();
    store.patchDraft({
      genderIdentity: 'female',
      trainingFrequency: '3_4',
      heightCm: 168,
      currentWeightKg: 65,
      birthYear: 1992,
      fitnessGoal: 'maintain',
      goalWeightKg: 65,
      paceKgPerWeek: 0.5,
    });

    expect(store.buildPlanFromDraft()).not.toBeNull();
    expect(useOnboardingStore.getState().draft.baselinePlan).not.toBeNull();

    store.patchDraft({ heightCm: 169 });
    expect(useOnboardingStore.getState().draft.baselinePlan).toBeNull();
  });

  it('prepares a complete returning-user plan without reopening the quiz', () => {
    const store = useOnboardingStore.getState();
    store.prepareReturningFlow({
      genderIdentity: 'female',
      trainingFrequency: '3_4',
      exercisePreferences: ['mat_pilates'],
      mediaPreference: 'static_only',
      heightCm: 168,
      currentWeightKg: 65,
      nutritionMode: 'full_tracking',
      birthYear: 1992,
      fitnessGoal: 'get_toned',
      goalWeightKg: 60,
      weightTrajectory: 'weight_loss',
      paceKgPerWeek: 0.5,
    });

    const state = useOnboardingStore.getState();
    expect(state.entryMode).toBe('returning');
    expect(state.draft.goalWeightKg).toBe(60);
    expect(state.draft.weightTrajectory).toBe('weight_loss');
    expect(state.draft.baselinePlan).not.toBeNull();
  });
});
