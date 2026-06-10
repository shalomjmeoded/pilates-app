import type {
  Difficulty,
  Exercise,
  ExerciseCategory,
  ExerciseEquipment,
  ExerciseMuscleGroup,
  ExerciseSessionRole,
} from '../../src/types/exercise';
import type { ExercisePreference } from '../../src/types/profile';

import {
  getDisqualifyReason,
  isDynamicMovement,
  MUSCLE_OVERRIDES,
  PRIORITY_EXERCISE_IDS,
  type DisqualifyReason,
  type FreeExerciseDbRecord,
} from './exerciseQualityRules';

export type { FreeExerciseDbRecord };
export const EXERCISE_LIBRARY_SOURCE = 'free_exercise_db' as const;
export const TARGET_LIBRARY_MIN = 120;
export const TARGET_LIBRARY_MAX = 200;

export interface ImportSelectionResult {
  selected: FreeExerciseDbRecord[];
  removed: Array<{ id: string; name: string; reason: DisqualifyReason }>;
}

const MUSCLE_MAP: Record<string, ExerciseMuscleGroup> = {
  abdominals: 'core',
  abductors: 'outer thighs',
  adductors: 'inner thighs',
  biceps: 'arms',
  calves: 'full body',
  chest: 'full body',
  forearms: 'arms',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'upper back',
  'lower back': 'lower back',
  'middle back': 'upper back',
  neck: 'upper back',
  quadriceps: 'quadriceps',
  shoulders: 'shoulders',
  traps: 'upper back',
  triceps: 'arms',
};

const EQUIPMENT_MAP: Record<string, ExerciseEquipment> = {
  'body only': 'none',
  bands: 'resistance band',
  'exercise ball': 'mat',
  'medicine ball': 'light weights',
  dumbbell: 'light weights',
  kettlebells: 'light weights',
  other: 'none',
};

function mapMuscle(muscle: string): ExerciseMuscleGroup {
  return MUSCLE_MAP[muscle] ?? 'full body';
}

function mapEquipment(equipment: string | null): ExerciseEquipment {
  if (!equipment) {
    return 'none';
  }
  return EQUIPMENT_MAP[equipment] ?? 'none';
}

function mapDifficulty(level: FreeExerciseDbRecord['level']): Difficulty {
  if (level === 'expert') {
    return 'advanced';
  }
  return level;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function inferMuscleGroup(record: FreeExerciseDbRecord): MuscleOverrideResult {
  const override = MUSCLE_OVERRIDES[record.id];
  if (override) {
    return override;
  }

  const name = record.name.toLowerCase();

  if (/\b(reverse lunge|walking lunge|forward lunge|split squat|curtsy)\b/i.test(name)) {
    return { muscleGroup: 'glutes', secondaryMuscles: ['quadriceps', 'core'] };
  }
  if (/\b(hop|hops|jump|squat|lunge)\b/i.test(name)) {
    return { muscleGroup: 'quadriceps', secondaryMuscles: ['glutes', 'core'] };
  }
  if (/\b(bridge|kickback|donkey|hydrant|clam|glute)\b/i.test(name)) {
    return { muscleGroup: 'glutes', secondaryMuscles: ['hamstrings', 'core'] };
  }
  if (/\b(plank|dead bug|crunch|sit-up|hundred|roll up|bird|v-up|scissor)\b/i.test(name)) {
    return { muscleGroup: 'core', secondaryMuscles: ['hip flexors'] };
  }
  if (/\b(side plank|side bridge)\b/i.test(name)) {
    return { muscleGroup: 'core', secondaryMuscles: ['glutes', 'outer thighs'] };
  }
  if (/\b(mountain climber|burpee|jack)\b/i.test(name)) {
    return { muscleGroup: 'core', secondaryMuscles: ['quadriceps', 'shoulders'] };
  }
  if (/\b(leg lift|leg raise|fire hydrant)\b/i.test(name)) {
    return { muscleGroup: 'glutes', secondaryMuscles: ['core', 'outer thighs'] };
  }
  if (/\b(superman|back extension|bird dog)\b/i.test(name)) {
    return { muscleGroup: 'lower back', secondaryMuscles: ['glutes', 'core'] };
  }
  if (/\b(hamstring curl|good morning|deadlift)\b/i.test(name)) {
    return { muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'lower back'] };
  }

  const primary = mapMuscle(record.primaryMuscles[0] ?? 'abdominals');
  const secondary = record.secondaryMuscles.map(mapMuscle).filter((m) => m !== primary);

  return {
    muscleGroup: primary,
    secondaryMuscles: [...new Set(secondary)].slice(0, 3),
  };
}

interface MuscleOverrideResult {
  muscleGroup: ExerciseMuscleGroup;
  secondaryMuscles: ExerciseMuscleGroup[];
}

export function scoreFreeExercise(record: FreeExerciseDbRecord): number {
  if (getDisqualifyReason(record)) {
    return -100;
  }

  let score = 0;

  if (PRIORITY_EXERCISE_IDS.has(record.id)) {
    score += 80;
  }

  if (record.category === 'strength' && (record.equipment === 'body only' || !record.equipment)) {
    score += 35;
  }
  if (record.category === 'plyometrics') {
    score -= 20;
  }
  if (record.category === 'cardio') {
    score -= 15;
  }
  if (/\b(squat|lunge|hop|jump|burpee|mountain climber|push-up|deadlift)\b/i.test(record.name)) {
    score -= 40;
  }
  if (record.equipment === 'bands') {
    score += 25;
  }
  if (record.equipment === 'exercise ball' || record.equipment === 'medicine ball') {
    score += 15;
  }
  if (record.level === 'beginner') {
    score += 12;
  }
  if (record.level === 'intermediate') {
    score += 8;
  }
  if (record.level === 'expert') {
    score -= 15;
  }

  const primary = new Set(record.primaryMuscles);
  if (primary.has('abdominals') || primary.has('glutes')) {
    score += 15;
  }
  if (primary.has('abductors') || primary.has('adductors')) {
    score += 10;
  }

  if (record.category === 'stretching' && !isDynamicMovement(record)) {
    score -= 25;
  }

  if (
    /\bpilates|hundred|roll up|teaser|swan|mermaid|dead bug|bird dog|clamshell|scissor|pelvic tilt|side bridge|glute bridge|leg lift|reverse crunch|cross-body crunch|glute kickback|fire hydrant\b/i.test(
      record.name,
    )
  ) {
    score += 35;
  }
  if (/\bplank|bridge\b/i.test(record.name)) {
    score += 20;
  }

  return score;
}

function assignCategories(record: FreeExerciseDbRecord, muscleGroup: ExerciseMuscleGroup): ExerciseCategory[] {
  const categories = new Set<ExerciseCategory>();
  const name = record.name.toLowerCase();

  if (
    /\bpilates|hundred|roll up|teaser|swan|mermaid|dead bug|bird dog|clamshell|scissor|pelvic tilt|side bridge|glute bridge|leg lift|reverse crunch|cross-body crunch|glute kickback|fire hydrant|plank|bridge\b/i.test(
      name,
    )
  ) {
    categories.add('pilates');
  }
  if (isDynamicMovement(record)) {
    categories.add('bodyweight');
    categories.add('mobility');
  }
  if (record.equipment === 'body only' || !record.equipment) {
    categories.add('bodyweight');
  }
  if (record.equipment === 'bands') {
    categories.add('resistance_band');
  }
  if (muscleGroup === 'glutes' || /\bglute|bridge|kickback|clam|hydrant\b/i.test(name)) {
    categories.add('glutes');
  }
  if (muscleGroup === 'core' || /\bplank|crunch|bug|core\b/i.test(name)) {
    categories.add('core');
    categories.add('posture');
  }
  if (record.category === 'stretching' && !isDynamicMovement(record)) {
    categories.add('flexibility');
    categories.add('mobility');
  }

  if (categories.size === 0) {
    categories.add('bodyweight');
  }

  return [...categories];
}

function assignTags(categories: ExerciseCategory[], record: FreeExerciseDbRecord): ExercisePreference[] {
  const tags = new Set<ExercisePreference>();

  if (categories.includes('pilates')) {
    tags.add('mat_pilates');
  }
  if (categories.includes('core')) {
    tags.add('core_focus');
  }
  if (categories.includes('flexibility')) {
    tags.add('flexibility_length');
  }
  if (
    (isDynamicMovement(record) || record.category === 'cardio') &&
    !categories.includes('pilates')
  ) {
    tags.add('cardio_burn');
  }

  if (tags.size === 0 && categories.includes('pilates')) {
    tags.add('mat_pilates');
  }

  return [...tags];
}

function assignSessionRole(record: FreeExerciseDbRecord): ExerciseSessionRole {
  if (isDynamicMovement(record) || record.category === 'strength' || record.category === 'plyometrics') {
    return 'main';
  }
  if (/\b(inchworm|arm circle|hip circle|march|walk|dynamic)\b/i.test(record.name)) {
    return 'warmup';
  }
  if (record.category === 'stretching' && /\b(stretch|pose|child|cat|cool)\b/i.test(record.name.toLowerCase())) {
    return 'cooldown';
  }
  return 'main';
}

function buildDescription(record: FreeExerciseDbRecord, muscleGroup: ExerciseMuscleGroup): string {
  const lead = record.instructions[0] ?? '';
  if (isDynamicMovement(record)) {
    return `${lead} A dynamic bodyweight movement emphasizing ${muscleGroup.replace(/^\w/, (c) => c.toUpperCase())}.`;
  }
  return `${lead} A controlled functional movement for ${muscleGroup}.`;
}

function buildCommonMistakes(record: FreeExerciseDbRecord): string[] {
  if (isDynamicMovement(record)) {
    return [
      'Landing or moving with loose form instead of controlled alignment.',
      'Holding your breath during the effort phase.',
      'Rushing reps and losing core stability.',
    ];
  }

  return [
    'Using momentum instead of controlled muscle engagement.',
    'Letting form break down as fatigue sets in.',
    'Choosing too much range before you can stabilize the movement.',
  ];
}

function assignPrescription(record: FreeExerciseDbRecord): {
  repsBaseline: number | null;
  holdSeconds: number | null;
  caloriesFactor: number;
} {
  if (isDynamicMovement(record)) {
    return { repsBaseline: 12, holdSeconds: null, caloriesFactor: 0.08 };
  }
  if (record.category === 'cardio' || record.category === 'plyometrics') {
    return { repsBaseline: 12, holdSeconds: null, caloriesFactor: 0.08 };
  }
  if (record.force === 'static' || /\bplank|bridge hold|wall sit\b/i.test(record.name)) {
    return { repsBaseline: null, holdSeconds: 30, caloriesFactor: 0.05 };
  }
  if (record.category === 'stretching') {
    return { repsBaseline: null, holdSeconds: 30, caloriesFactor: 0.04 };
  }
  return { repsBaseline: 12, holdSeconds: null, caloriesFactor: 0.06 };
}

export function selectExercises(
  records: FreeExerciseDbRecord[],
  targetCount = 160,
): ImportSelectionResult {
  const removed: ImportSelectionResult['removed'] = [];
  const eligible: FreeExerciseDbRecord[] = [];

  for (const record of records) {
    const reason = getDisqualifyReason(record);
    if (reason) {
      removed.push({ id: record.id, name: record.name, reason });
      continue;
    }
    eligible.push(record);
  }

  const scored = eligible
    .map((record) => ({ record, score: scoreFreeExercise(record) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name));

  const selected: FreeExerciseDbRecord[] = [];
  const seenNames = new Set<string>();
  const seenIds = new Set<string>();

  const priority = eligible.filter((record) => PRIORITY_EXERCISE_IDS.has(record.id));
  for (const record of priority) {
    const normalized = normalizeName(record.name);
    if (seenNames.has(normalized) || seenIds.has(record.id)) {
      continue;
    }
    seenNames.add(normalized);
    seenIds.add(record.id);
    selected.push(record);
  }

  for (const { record } of scored) {
    if (selected.length >= targetCount) {
      break;
    }
    const normalized = normalizeName(record.name);
    if (seenNames.has(normalized) || seenIds.has(record.id)) {
      continue;
    }
    seenNames.add(normalized);
    seenIds.add(record.id);
    selected.push(record);
  }

  return { selected, removed };
}

export function transformToTuneExercise(
  record: FreeExerciseDbRecord,
  thumbnailUri: string,
  gifUri: string,
): Exercise {
  const muscles = inferMuscleGroup(record);
  const categories = assignCategories(record, muscles.muscleGroup);
  const prescription = assignPrescription(record);

  return {
    id: record.id,
    name: record.name,
    description: buildDescription(record, muscles.muscleGroup),
    instructions: record.instructions,
    commonMistakes: buildCommonMistakes(record),
    difficulty: mapDifficulty(record.level),
    muscleGroup: muscles.muscleGroup,
    secondaryMuscles: muscles.secondaryMuscles,
    equipment: mapEquipment(record.equipment),
    thumbnailUri,
    gifUri,
    tags: assignTags(categories, record),
    categories,
    sessionRole: assignSessionRole(record),
    source: EXERCISE_LIBRARY_SOURCE,
    repsBaseline: prescription.repsBaseline,
    holdSeconds: prescription.holdSeconds,
    caloriesFactor: prescription.caloriesFactor,
  };
}
