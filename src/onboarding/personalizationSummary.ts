import { trainingFrequencyToWorkoutsPerWeek } from '@/engines/monetization/premiumAccess';
import type { ExercisePreference, Pace, TrainingFrequency } from '@/types/profile';
import type { AvailableEquipmentPreference } from '@/types/preferences';

const PREFERENCE_LABELS: Record<ExercisePreference, string> = {
  mat_pilates: 'Mat Pilates',
  reformer_pilates: 'Pilates',
  cardio_burn: 'Cardio Burn',
  core_focus: 'Core Focus',
  flexibility_length: 'Flexibility & Length',
};

const EQUIPMENT_LABELS: Record<AvailableEquipmentPreference, string> = {
  reformer: 'Reformer',
  'magic circle': 'Magic circle',
  'light weights': 'Light weights',
  'resistance band': 'Resistance band',
  'pilates ball': 'Pilates ball',
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

function equipmentLabel(equipment: AvailableEquipmentPreference[]): string {
  if (equipment.length === 0) {
    return 'Mat only';
  }
  if (equipment.length === 1) {
    return EQUIPMENT_LABELS[equipment[0]!];
  }
  return `${equipment.length} props`;
}

export function buildPersonalizationSummary(input: {
  trainingFrequency: TrainingFrequency | null;
  exercisePreferences: ExercisePreference[];
  pace: Pace | null;
  availableEquipment?: AvailableEquipmentPreference[];
}): string {
  const sessions = trainingFrequencyToWorkoutsPerWeek(input.trainingFrequency);
  const movement = input.exercisePreferences[0]
    ? PREFERENCE_LABELS[input.exercisePreferences[0]]
    : 'Balanced movement';
  const equipment = equipmentLabel(input.availableEquipment ?? []);

  return `${sessions} sessions/week · ${movement} · ${equipment} · ${paceLabel(input.pace)}`;
}
