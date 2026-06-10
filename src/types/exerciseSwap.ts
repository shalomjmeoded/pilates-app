export type ExerciseSwapReason =
  | 'too_hard'
  | 'too_easy'
  | 'knee_discomfort'
  | 'no_equipment'
  | 'dislike_movement';

export const EXERCISE_SWAP_REASONS: Array<{ id: ExerciseSwapReason; label: string }> = [
  { id: 'too_hard', label: 'Too hard' },
  { id: 'too_easy', label: 'Too easy' },
  { id: 'knee_discomfort', label: 'Knee discomfort' },
  { id: 'no_equipment', label: 'No equipment' },
  { id: 'dislike_movement', label: 'Dislike this movement' },
];
