import { create } from 'zustand';

import { buildBaselinePlan } from '@/engines/calculations';
import { deriveWeightTrajectory } from '@/onboarding/deriveWeightTrajectory';
import { isBirthYearWithinSupportedAge } from '@/onboarding/helpers';
import {
  clearPersistedOnboardingSession,
  persistOnboardingSession,
  readPersistedOnboardingSession,
} from '@/onboarding/onboardingDraftPersistence';
import type { BaselinePlanResult } from '@/types/calculations';
import type {
  ExercisePreference,
  FitnessGoal,
  GenderIdentity,
  MediaPreference,
  NutritionMode,
  Pace,
  Profile,
  TrainingFrequency,
  WeightTrajectory,
} from '@/types/profile';

export interface OnboardingDraft {
  genderIdentity: GenderIdentity | null;
  trainingFrequency: TrainingFrequency | null;
  exercisePreferences: ExercisePreference[];
  mediaPreference: MediaPreference | null;
  notificationsEnabled: boolean;
  heightCm: number | null;
  currentWeightKg: number | null;
  nutritionMode: NutritionMode;
  birthYear: number | null;
  fitnessGoal: FitnessGoal | null;
  goalWeightKg: number | null;
  weightTrajectory: WeightTrajectory | null;
  paceKgPerWeek: Pace | null;
  baselinePlan: BaselinePlanResult | null;
}

const INITIAL_DRAFT: OnboardingDraft = {
  genderIdentity: null,
  trainingFrequency: null,
  exercisePreferences: [],
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

const PLAN_INPUT_KEYS = new Set<keyof OnboardingDraft>([
  'genderIdentity',
  'trainingFrequency',
  'heightCm',
  'currentWeightKg',
  'birthYear',
  'fitnessGoal',
  'goalWeightKg',
  'weightTrajectory',
  'paceKgPerWeek',
]);

interface OnboardingState {
  draft: OnboardingDraft;
  rebuildMode: boolean;
  entryMode: 'fresh' | 'returning';
  currentStep: number;
  patchDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
  setRebuildMode: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
  restorePersistedDraft: () => number | null;
  clearPersistedDraft: () => void;
  loadDraftFromProfile: (profile: Profile) => void;
  prepareReturningFlow: (profile: Profile) => void;
  buildPlanFromDraft: () => BaselinePlanResult | null;
  toProfile: () => Profile | null;
}

type CompleteOnboardingDraft = OnboardingDraft & {
  genderIdentity: GenderIdentity;
  trainingFrequency: TrainingFrequency;
  heightCm: number;
  currentWeightKg: number;
  nutritionMode: NutritionMode;
  birthYear: number;
  fitnessGoal: FitnessGoal;
  goalWeightKg: number;
  paceKgPerWeek: Pace;
  exercisePreferences: ExercisePreference[];
};

function isCompleteDraft(draft: OnboardingDraft): draft is CompleteOnboardingDraft {
  return (
    draft.genderIdentity !== null &&
    draft.trainingFrequency !== null &&
    draft.heightCm !== null &&
    draft.currentWeightKg !== null &&
    draft.birthYear !== null &&
    isBirthYearWithinSupportedAge(draft.birthYear) &&
    draft.fitnessGoal !== null &&
    draft.goalWeightKg !== null &&
    draft.paceKgPerWeek !== null
  );
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  draft: INITIAL_DRAFT,
  rebuildMode: false,
  entryMode: 'fresh',
  currentStep: 1,

  patchDraft(patch) {
    const state = get();
    const invalidatesPlan = (Object.keys(patch) as Array<keyof OnboardingDraft>).some((key) =>
      PLAN_INPUT_KEYS.has(key),
    );
    const draft = {
      ...state.draft,
      ...patch,
      ...(invalidatesPlan ? { baselinePlan: null } : null),
    };
    set({ draft });
    if (state.entryMode === 'fresh' && !state.rebuildMode) {
      persistOnboardingSession(draft, state.currentStep);
    }
  },

  resetDraft() {
    clearPersistedOnboardingSession();
    set({
      draft: INITIAL_DRAFT,
      rebuildMode: false,
      entryMode: 'fresh',
      currentStep: 1,
    });
  },

  setRebuildMode(value) {
    set({ rebuildMode: value });
  },

  setCurrentStep(step) {
    const state = get();
    set({ currentStep: step });
    if (state.entryMode === 'fresh' && !state.rebuildMode) {
      persistOnboardingSession(state.draft, step);
    }
  },

  restorePersistedDraft() {
    const session = readPersistedOnboardingSession();
    if (!session) {
      return null;
    }

    set({
      draft: { ...INITIAL_DRAFT, ...session.draft },
      rebuildMode: false,
      entryMode: 'fresh',
      currentStep: session.currentStep,
    });
    return session.currentStep;
  },

  clearPersistedDraft() {
    clearPersistedOnboardingSession();
  },

  loadDraftFromProfile(profile) {
    const goalWeightKg =
      profile.fitnessGoal === 'maintain' || profile.fitnessGoal === 'get_toned'
        ? profile.currentWeightKg
        : profile.goalWeightKg;
    set({
      draft: {
        ...INITIAL_DRAFT,
        genderIdentity: profile.genderIdentity,
        trainingFrequency: profile.trainingFrequency,
        exercisePreferences: profile.exercisePreferences,
        mediaPreference: 'static_only',
        heightCm: profile.heightCm,
        currentWeightKg: profile.currentWeightKg,
        nutritionMode: 'full_tracking',
        birthYear: profile.birthYear,
        fitnessGoal: profile.fitnessGoal,
        goalWeightKg,
        weightTrajectory:
          profile.fitnessGoal === 'maintain' || profile.fitnessGoal === 'get_toned'
            ? 'steady_state'
            : profile.weightTrajectory,
        paceKgPerWeek: profile.paceKgPerWeek,
      },
    });
  },

  prepareReturningFlow(profile) {
    clearPersistedOnboardingSession();
    get().loadDraftFromProfile(profile);
    set({ entryMode: 'returning', rebuildMode: false, currentStep: 1 });
    get().buildPlanFromDraft();
  },

  buildPlanFromDraft() {
    const profile = get().toProfile();
    if (!profile) {
      return null;
    }

    const plan = buildBaselinePlan({
      genderIdentity: profile.genderIdentity,
      birthYear: profile.birthYear,
      heightCm: profile.heightCm,
      currentWeightKg: profile.currentWeightKg,
      goalWeightKg: profile.goalWeightKg,
      trainingFrequency: profile.trainingFrequency,
      fitnessGoal: profile.fitnessGoal,
      weightTrajectory: profile.weightTrajectory,
      paceKgPerWeek: profile.paceKgPerWeek,
    });

    set((state) => ({ draft: { ...state.draft, baselinePlan: plan } }));
    return plan;
  },

  toProfile() {
    const { draft } = get();
    if (!isCompleteDraft(draft)) {
      return null;
    }
    const weightTrajectory = deriveWeightTrajectory(
      draft.fitnessGoal,
      draft.currentWeightKg,
      draft.goalWeightKg,
    );

    return {
      genderIdentity: draft.genderIdentity,
      birthYear: draft.birthYear,
      heightCm: draft.heightCm,
      currentWeightKg: draft.currentWeightKg,
      goalWeightKg: draft.goalWeightKg,
      trainingFrequency: draft.trainingFrequency,
      fitnessGoal: draft.fitnessGoal,
      exercisePreferences: draft.exercisePreferences,
      mediaPreference: 'static_only',
      nutritionMode: 'full_tracking',
      weightTrajectory,
      paceKgPerWeek: draft.paceKgPerWeek,
    };
  },
}));
