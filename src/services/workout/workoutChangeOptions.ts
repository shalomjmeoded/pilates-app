import type { WorkoutFocusArea, WorkoutIntensity } from '@/types/workout';

export const WORKOUT_CHANGE_FOCUS_OPTIONS: Array<{ value: WorkoutFocusArea; label: string }> = [
  { value: 'core', label: 'Core' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'posture', label: 'Posture' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'full_body', label: 'Full Body' },
];

export const WORKOUT_CHANGE_MINUTE_OPTIONS = [15, 25, 35] as const;

export const WORKOUT_CHANGE_INTENSITY_OPTIONS: Array<{ value: WorkoutIntensity; label: string }> = [
  { value: 'lighter', label: 'Lighter' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'challenging', label: 'Challenging' },
];
