import { trainingFrequencyToWorkoutsPerWeek } from '@/engines/monetization/premiumAccess';
import type { ExercisePreference, Pace, TrainingFrequency } from '@/types/profile';

const PREFERENCE_LABELS: Record<ExercisePreference, string> = {
  mat_pilates: 'Mat Pilates',
  reformer_pilates: 'Pilates',
  cardio_burn: 'Cardio Burn',
  core_focus: 'Core Focus',
  flexibility_length: 'Flexibility & Length',
};

function paceLabel(pace: Pace | null): string {
  if (pace === 0.25) {
    return 'Relaxed pace';
  }
  if (pace === 1) {
    return 'Focused pace';
  }
  return 'Moderate pace';
}

export function buildPersonalizationSummary(input: {
  trainingFrequency: TrainingFrequency | null;
  exercisePreferences: ExercisePreference[];
  pace: Pace | null;
}): string {
  const sessions = trainingFrequencyToWorkoutsPerWeek(input.trainingFrequency);
  const movement = input.exercisePreferences[0]
    ? PREFERENCE_LABELS[input.exercisePreferences[0]]
    : 'Balanced movement';

  return `${sessions} sessions/week · ${movement} · ${paceLabel(input.pace)}`;
}
