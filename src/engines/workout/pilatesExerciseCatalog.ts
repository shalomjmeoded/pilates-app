import type { Exercise } from '@/types/exercise';
import type { Profile } from '@/types/profile';

/** Generic gym / HIIT movements that are not Pilates-aligned. */
const HARD_EXCLUDE_NAME_PATTERN =
  /\b(squat|squats|lunge|lunges|burpee|burpees|jump|jumps|hop|hops|jack|jacks|mountain climber|frog hop|walking lunge|forward lunge|reverse lunge|box jump|broad jump|sprint|barbell|bench|decline|physioball|exercise ball|stability ball|swiss ball|hanging|suspended|parallel bars|deadlift|kettlebell|leg press|calf raise|hamstring curl|leg curl|leg extension|tricep dip|bicep curl|lat pulldown|smith machine|clean and press|snatch|thruster|farmer.?s walk|push press|military press|incline press|decline press|dip|chin-up|pull-up|muscle up|rower|treadmill)\b/i;

/** Classical and mat Pilates naming cues. */
const PILATES_NAME_PATTERN =
  /\b(pilates|hundred|roll up|rollup|teaser|swan|mermaid|corkscrew|saw|spine twist|swimming|leg pull|side kick|pelvic tilt|side bridge|side plank|dead bug|bird dog|clamshell|clam shell|scissor kick|scissor|hollow body|spine stretch|seal|boomerang|jackknife|open leg rocker|short spine|control balance|single leg stretch|double leg stretch|spine corrector|crisscross|toe tap|cat cow|cat-cow|child.?s pose|spinal|thoracic rotation|inner thigh|outer thigh lift|hip circle|glute bridge|bridge|plank|leg lift|leg raise|reverse crunch|cross-body crunch|glute kickback|fire hydrant|donkey kick|superman|swan dive|neck pull|saw|saw|mermaid|side bend)\b/i;

const CONTROLLED_HOLD_PATTERN = /\b(plank|bridge|hold|bird dog|dead bug|side bridge|hundred|teaser)\b/i;

export function isHardExcludedExercise(exercise: Exercise): boolean {
  return HARD_EXCLUDE_NAME_PATTERN.test(exercise.name);
}

export function isPilatesAlignedExercise(exercise: Exercise): boolean {
  if (isHardExcludedExercise(exercise)) {
    return false;
  }

  if (exercise.categories.includes('pilates')) {
    return true;
  }

  if (PILATES_NAME_PATTERN.test(exercise.name)) {
    return true;
  }

  const propFriendly =
    exercise.equipment === 'mat' ||
    exercise.equipment === 'none' ||
    exercise.equipment === 'magic circle' ||
    exercise.equipment === 'resistance band' ||
    exercise.equipment === 'light weights' ||
    exercise.equipment === 'pilates ball' ||
    exercise.equipment === 'reformer';

  const controlFocused =
    exercise.categories.includes('core') ||
    exercise.categories.includes('posture') ||
    exercise.categories.includes('flexibility') ||
    exercise.categories.includes('pilates');

  const controlledPrescription =
    exercise.holdSeconds !== null ||
    CONTROLLED_HOLD_PATTERN.test(exercise.name) ||
    exercise.sessionRole === 'cooldown' ||
    exercise.source === 'curated_betterme';

  return propFriendly && controlFocused && controlledPrescription;
}

export function pilatesAffinityScore(exercise: Exercise, profile: Profile): number {
  if (isHardExcludedExercise(exercise)) {
    return -100;
  }

  let score = 0;

  if (exercise.categories.includes('pilates')) {
    score += 12;
  }
  if (PILATES_NAME_PATTERN.test(exercise.name)) {
    score += 10;
  }
  if (exercise.sessionRole === 'main' && exercise.categories.includes('pilates')) {
    score += 5;
  }
  if (exercise.sessionRole === 'warmup' || exercise.sessionRole === 'cooldown') {
    score -= 3;
  }
  if (exercise.categories.includes('core') || exercise.categories.includes('posture')) {
    score += 4;
  }
  if (exercise.categories.includes('pilates')) {
    score += 2;
  }
  if (
    exercise.categories.includes('flexibility') &&
    profile.exercisePreferences.includes('flexibility_length')
  ) {
    score += 2;
  }
  if (exercise.equipment === 'mat' || exercise.equipment === 'magic circle') {
    score += 3;
  }
  if (
    exercise.equipment === 'pilates ball' ||
    exercise.equipment === 'light weights' ||
    exercise.equipment === 'resistance band'
  ) {
    score += 2;
  }
  if (exercise.holdSeconds !== null) {
    score += 2;
  }
  if (exercise.tags.includes('cardio_burn') && !PILATES_NAME_PATTERN.test(exercise.name)) {
    score -= 8;
  }

  if (profile.exercisePreferences.includes('reformer_pilates')) {
    if (exercise.equipment === 'reformer') {
      score += 6;
    }
  }
  if (profile.exercisePreferences.includes('mat_pilates')) {
    if (exercise.equipment === 'mat' || exercise.equipment === 'none') {
      score += 4;
    }
  }
  if (profile.exercisePreferences.includes('core_focus') && exercise.categories.includes('core')) {
    score += 3;
  }
  if (
    profile.exercisePreferences.includes('flexibility_length') &&
    exercise.categories.includes('flexibility')
  ) {
    score += 3;
  }

  return score;
}

/** Soft-filter the pool by optional equipment the user says they own. */
export function filterExercisesByAvailableEquipment(
  exercises: Exercise[],
  availableEquipment: ReadonlyArray<
    'reformer' | 'resistance band' | 'magic circle' | 'light weights' | 'pilates ball'
  >,
): Exercise[] {
  const owned = new Set(availableEquipment);
  const filtered = exercises.filter((exercise) => {
    if (exercise.equipment === 'mat' || exercise.equipment === 'none') {
      return true;
    }
    return owned.has(
      exercise.equipment as
        | 'reformer'
        | 'resistance band'
        | 'magic circle'
        | 'light weights'
        | 'pilates ball',
    );
  });

  return filtered.length >= 9 ? filtered : exercises;
}

/** Normalize seed/library rows so Pilates-aligned moves carry the pilates category. */
export function normalizePilatesExercise(exercise: Exercise): Exercise {
  if (!isPilatesAlignedExercise(exercise)) {
    return {
      ...exercise,
      youtubeVideoId: exercise.youtubeVideoId ?? null,
      youtubeAttribution: exercise.youtubeAttribution ?? null,
    };
  }

  const categories = exercise.categories.includes('pilates')
    ? exercise.categories
    : (['pilates', ...exercise.categories] as Exercise['categories']);

  const tags = new Set(exercise.tags);
  if (exercise.equipment === 'reformer') {
    tags.add('reformer_pilates');
  } else {
    tags.add('mat_pilates');
  }
  if (exercise.categories.includes('core')) {
    tags.add('core_focus');
  }
  if (
    exercise.tags.includes('cardio_burn') &&
    !PILATES_NAME_PATTERN.test(exercise.name) &&
    exercise.holdSeconds === null
  ) {
    tags.delete('cardio_burn');
  }

  return {
    ...exercise,
    categories,
    tags: [...tags],
    youtubeVideoId: exercise.youtubeVideoId ?? null,
    youtubeAttribution: exercise.youtubeAttribution ?? null,
  };
}

export function selectPilatesCandidatePool(
  exercises: Exercise[],
  availableEquipment?: ReadonlyArray<
    'reformer' | 'resistance band' | 'magic circle' | 'light weights' | 'pilates ball'
  >,
): Exercise[] {
  const scoped = availableEquipment
    ? filterExercisesByAvailableEquipment(exercises, availableEquipment)
    : exercises;
  const aligned = scoped.filter(isPilatesAlignedExercise);
  if (aligned.length >= 9) {
    return aligned;
  }

  return scoped.filter((exercise) => !isHardExcludedExercise(exercise));
}
