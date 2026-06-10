import { create } from 'zustand';

import { buildBaselinePlan } from '@/engines/calculations';
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
  mediaPreference: null,
  notificationsEnabled: false,
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

interface OnboardingState {
  draft: OnboardingDraft;
  rebuildMode: boolean;
  patchDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
  setRebuildMode: (value: boolean) => void;
  loadDraftFromProfile: (profile: Profile) => void;
  buildPlanFromDraft: () => BaselinePlanResult | null;
  toProfile: () => Profile | null;
}

type CompleteOnboardingDraft = OnboardingDraft & {
  genderIdentity: GenderIdentity;
  trainingFrequency: TrainingFrequency;
  mediaPreference: MediaPreference;
  heightCm: number;
  currentWeightKg: number;
  nutritionMode: NutritionMode;
  birthYear: number;
  fitnessGoal: FitnessGoal;
  goalWeightKg: number;
  weightTrajectory: WeightTrajectory;
  paceKgPerWeek: Pace;
  exercisePreferences: ExercisePreference[];
};

function isCompleteDraft(draft: OnboardingDraft): draft is CompleteOnboardingDraft {
  return (
    draft.genderIdentity !== null &&
    draft.trainingFrequency !== null &&
    draft.exercisePreferences.length > 0 &&
    draft.mediaPreference !== null &&
    draft.heightCm !== null &&
    draft.currentWeightKg !== null &&
    draft.birthYear !== null &&
    draft.fitnessGoal !== null &&
    draft.goalWeightKg !== null &&
    draft.weightTrajectory !== null &&
    draft.paceKgPerWeek !== null
  );
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  draft: INITIAL_DRAFT,
  rebuildMode: false,

  patchDraft(patch) {
    set((state) => ({ draft: { ...state.draft, ...patch } }));
  },

  resetDraft() {
    set({ draft: INITIAL_DRAFT, rebuildMode: false });
  },

  setRebuildMode(value) {
    set({ rebuildMode: value });
  },

  loadDraftFromProfile(profile) {
    set({
      draft: {
        ...INITIAL_DRAFT,
        genderIdentity: profile.genderIdentity,
        trainingFrequency: profile.trainingFrequency,
        exercisePreferences: profile.exercisePreferences,
        mediaPreference: profile.mediaPreference,
        heightCm: profile.heightCm,
        currentWeightKg: profile.currentWeightKg,
        nutritionMode: profile.nutritionMode,
        birthYear: profile.birthYear,
        fitnessGoal: profile.fitnessGoal,
        goalWeightKg: profile.goalWeightKg,
        weightTrajectory: profile.weightTrajectory,
        paceKgPerWeek: profile.paceKgPerWeek,
      },
    });
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

    return {
      genderIdentity: draft.genderIdentity,
      birthYear: draft.birthYear,
      heightCm: draft.heightCm,
      currentWeightKg: draft.currentWeightKg,
      goalWeightKg: draft.goalWeightKg,
      trainingFrequency: draft.trainingFrequency,
      fitnessGoal: draft.fitnessGoal,
      exercisePreferences: draft.exercisePreferences,
      mediaPreference: draft.mediaPreference,
      nutritionMode: draft.nutritionMode,
      weightTrajectory: draft.weightTrajectory,
      paceKgPerWeek: draft.paceKgPerWeek,
    };
  },
}));
