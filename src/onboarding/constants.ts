import type { ExercisePreference, FitnessGoal, GenderIdentity, MediaPreference, Pace, TrainingFrequency, WeightTrajectory } from '@/types/profile';

export const ONBOARDING_SPRING = {
  mass: 1,
  damping: 15,
  stiffness: 120,
} as const;

export const ONBOARDING_TOTAL_STEPS = 16;

export const ONBOARDING_ROUTES = [
  'step-01-gender',
  'step-02-frequency',
  'step-03-preferences',
  'step-04-media',
  'step-05-notifications',
  'step-06-height',
  'step-07-weight',
  'step-09-birth-year',
  'step-10-fitness-goal',
  'step-11-goal-weight',
  'step-12-trajectory',
  'step-13-roadmap',
  'step-14-pace',
  'step-15-loading',
  'step-16-plan-reveal',
  'step-17-paywall',
] as const;

export type OnboardingRoute = (typeof ONBOARDING_ROUTES)[number];

export const GENDER_OPTIONS: Array<{ value: GenderIdentity; label: string }> = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-Binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const FREQUENCY_OPTIONS: Array<{ value: TrainingFrequency; label: string }> = [
  { value: 'none', label: 'Not training currently' },
  { value: '1_2', label: '1–2× / week' },
  { value: '3_4', label: '3–4× / week' },
  { value: '5_plus', label: '5+ / week' },
];

export const PREFERENCE_OPTIONS: Array<{ value: ExercisePreference; label: string }> = [
  { value: 'mat_pilates', label: 'Mat Pilates' },
  { value: 'reformer_pilates', label: 'Reformer Pilates' },
  { value: 'cardio_burn', label: 'Cardio Burn' },
  { value: 'core_focus', label: 'Core Focus' },
  { value: 'flexibility_length', label: 'Flexibility & Length' },
];

export const MEDIA_OPTIONS: Array<{ value: MediaPreference; label: string; description: string }> = [
  {
    value: 'video_streaming',
    label: 'Allow video streaming',
    description: 'Open guided video references during workouts.',
  },
  {
    value: 'static_only',
    label: 'Static images / GIFs only',
    description: 'Keep workouts lightweight with on-device visuals.',
  },
];

export const FITNESS_GOAL_OPTIONS: Array<{ value: FitnessGoal; label: string }> = [
  { value: 'get_toned', label: 'Get Toned' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'build_muscle', label: 'Build Muscle' },
];

export const TRAJECTORY_OPTIONS: Array<{ value: WeightTrajectory; label: string; description: string }> = [
  {
    value: 'weight_loss',
    label: 'Weight loss strategy',
    description: 'Gradual deficit toward your goal weight.',
  },
  {
    value: 'lean_mass',
    label: 'Lean mass strategy',
    description: 'Slow gain while staying defined.',
  },
  {
    value: 'steady_state',
    label: 'Steady state',
    description: 'Maintain current weight and build consistency.',
  },
];

export const PACE_OPTIONS: Array<{ value: Pace; label: string; description: string }> = [
  { value: 0.25, label: 'Relaxed', description: '25% intensity' },
  { value: 0.5, label: 'Moderate', description: '50% intensity' },
  { value: 1, label: 'Aggressive', description: '100% intensity' },
];

export function getOnboardingRoute(stepIndex: number): OnboardingRoute {
  return ONBOARDING_ROUTES[stepIndex - 1];
}
