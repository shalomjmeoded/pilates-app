import type { ExerciseMuscleGroup } from '../../src/types/exercise';

export interface FreeExerciseDbRecord {
  id: string;
  name: string;
  force: string | null;
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

export interface MuscleOverride {
  muscleGroup: ExerciseMuscleGroup;
  secondaryMuscles: ExerciseMuscleGroup[];
}

/** Must be included when present in source and passes media/instruction checks. */
export const PRIORITY_EXERCISE_IDS = new Set([
  'Dead_Bug',
  'Plank',
  'Glute_Kickback',
  'Single_Leg_Glute_Bridge',
  'Butt_Lift_Bridge',
  'Pelvic_Tilt_Into_Bridge',
  'Side_Bridge',
  'Scissor_Kick',
  'Superman',
  'Leg_Lift',
  'Reverse_Crunch',
  'Cross-Body_Crunch',
]);

export const MUSCLE_OVERRIDES: Record<string, MuscleOverride> = {
  Frog_Hops: { muscleGroup: 'quadriceps', secondaryMuscles: ['glutes', 'full body'] },
  Crossover_Reverse_Lunge: { muscleGroup: 'glutes', secondaryMuscles: ['quadriceps', 'core'] },
  Bodyweight_Walking_Lunge: { muscleGroup: 'quadriceps', secondaryMuscles: ['glutes', 'core'] },
  Dead_Bug: { muscleGroup: 'core', secondaryMuscles: ['lower back', 'hip flexors'] },
  Plank: { muscleGroup: 'core', secondaryMuscles: ['shoulders', 'glutes'] },
  Side_Bridge: { muscleGroup: 'core', secondaryMuscles: ['glutes', 'outer thighs'] },
  Mountain_Climbers: { muscleGroup: 'core', secondaryMuscles: ['quadriceps', 'shoulders'] },
  Glute_Kickback: { muscleGroup: 'glutes', secondaryMuscles: ['hamstrings', 'core'] },
  Single_Leg_Glute_Bridge: { muscleGroup: 'glutes', secondaryMuscles: ['hamstrings', 'core'] },
  Butt_Lift_Bridge: { muscleGroup: 'glutes', secondaryMuscles: ['hamstrings', 'core'] },
  Pelvic_Tilt_Into_Bridge: { muscleGroup: 'glutes', secondaryMuscles: ['core', 'lower back'] },
  Superman: { muscleGroup: 'lower back', secondaryMuscles: ['glutes', 'core'] },
  Leg_Lift: { muscleGroup: 'glutes', secondaryMuscles: ['core', 'outer thighs'] },
  Scissor_Kick: { muscleGroup: 'core', secondaryMuscles: ['hip flexors'] },
};

const BODY_PART_ONLY_NAMES = new Set(
  [
    'Adductor',
    'Abductor',
    'Adductor/Groin',
    'Groin',
    'Hamstring',
    'Hamstrings',
    'Quadriceps',
    'Calves',
    'Calf',
    'Neck',
    'Foot',
    'Peroneals',
    'Brachialis',
    'Rhomboids',
    'Piriformis',
    'Latissimus Dorsi',
    'Iliotibial Tract',
    'Anterior Tibialis',
    'Chest',
    'Biceps',
    'Triceps',
    'Forearms',
    'Traps',
    'Lats',
  ].map((name) => name.toLowerCase()),
);

const MOVEMENT_NAME_PATTERN =
  /\b(hop|hops|jump|jumps|lunge|lunges|squat|squats|bridge|bridges|plank|planks|kick|kicks|kickback|raise|raises|lift|lifts|curl|curls|crunch|crunches|sit-up|sit-ups|situp|climber|climbers|step-up|step-ups|press|pushes|push-up|push-ups|pushup|pull-up|pull-ups|row|rows|twist|twists|circle|circles|swing|swings|walk|walking|march|marches|bug|bugs|stroke|swim|swimming|rocking|scissor|mountain|donkey|thrust|thrusts|extension|flexion|rotation|rotations|draw|saw|swan|teaser|mermaid|superman|deadlift|burpee|jack|jacks|skip|skips|hop|bound|bounds|clap|reach|reaches|hold|holds|tilt|tilts|roll-up|rollup|hundred|fire|hydrant|clam|bird|dog|v-up|v up|leg raise|leg raises|glute|hip|knee|toe touch|inchworm|windmill|windmills)\b/i;

const SMR_PATTERN = /\bSMR\b|-SMR$/i;

const ANATOMY_LABEL_PATTERN =
  /^(adductor|abductor|groin|hamstring|hamstrings|quadriceps|calves|calf|neck|foot|peroneals|brachialis|rhomboids|piriformis|latissimus|iliotibial|tibialis|forearms|biceps|triceps|traps|lats|chest|shoulders|glutes|abs|abdominals)(\/[a-z\s]+)?$/i;

export type DisqualifyReason =
  | 'smr_or_foam_roll'
  | 'body_part_only'
  | 'machine_equipment'
  | 'excluded_category'
  | 'missing_media'
  | 'missing_instructions'
  | 'not_a_movement'
  | 'bodybuilding_only';

export function getDisqualifyReason(record: FreeExerciseDbRecord): DisqualifyReason | null {
  if (!record.images?.length) {
    return 'missing_media';
  }
  if (!record.instructions?.length) {
    return 'missing_instructions';
  }

  const name = record.name.trim();
  const normalized = name.toLowerCase();

  if (SMR_PATTERN.test(name)) {
    return 'smr_or_foam_roll';
  }

  if (record.equipment === 'foam roll') {
    return 'smr_or_foam_roll';
  }

  if (BODY_PART_ONLY_NAMES.has(normalized) || ANATOMY_LABEL_PATTERN.test(name)) {
    return 'body_part_only';
  }

  if (['barbell', 'machine', 'cable', 'e-z curl bar'].includes(record.equipment ?? '')) {
    return 'machine_equipment';
  }

  if (['powerlifting', 'strongman', 'olympic weightlifting'].includes(record.category)) {
    return 'excluded_category';
  }

  if (PRIORITY_EXERCISE_IDS.has(record.id)) {
    return null;
  }

  if (!MOVEMENT_NAME_PATTERN.test(name)) {
    return 'not_a_movement';
  }

  if (
    record.category === 'strength' &&
    /\b(barbell|bench press|deadlift|snatch|clean and jerk|curl|fly|pulldown|row machine)\b/i.test(name) &&
    record.equipment !== 'body only' &&
    record.equipment !== null &&
    record.equipment !== 'bands'
  ) {
    return 'bodybuilding_only';
  }

  return null;
}

export function isBodyPartLikeName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (BODY_PART_ONLY_NAMES.has(normalized)) {
    return true;
  }
  if (SMR_PATTERN.test(name)) {
    return true;
  }
  return ANATOMY_LABEL_PATTERN.test(name.trim());
}

export function isDynamicMovement(record: FreeExerciseDbRecord): boolean {
  const name = record.name.toLowerCase();
  return (
    record.category === 'plyometrics' ||
    record.category === 'cardio' ||
    /\b(hop|jump|lunge|squat|burpee|jack|climber|kickback|mountain|bound|skip|sprint)\b/i.test(name)
  );
}
