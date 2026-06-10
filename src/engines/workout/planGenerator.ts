import type { Exercise } from '@/types/exercise';
import type { Profile } from '@/types/profile';
import type { PhysiqueCategory } from '@/types/physiqueAssessment';
import type { WorkoutPlan, WorkoutPlanExercise } from '@/types/workout';

import {
  isPilatesAlignedExercise,
  pilatesAffinityScore,
  selectPilatesCandidatePool,
} from './pilatesExerciseCatalog';
import type { AdaptationContext } from './progression';
import { swapSkippedExercises } from './progression';

export interface PhysiquePlanContext {
  physiqueCategory: PhysiqueCategory;
}

const TARGET_MIN = 9;
const TARGET_MAX = 12;
const MIN_PILATES_ALIGNED = 8;

function physiqueExerciseBonus(exercise: Exercise, physique?: PhysiquePlanContext): number {
  if (!physique) {
    return 0;
  }

  switch (physique.physiqueCategory) {
    case 'higher_body_fat':
      if (exercise.difficulty === 'beginner') {
        return 2;
      }
      if (
        exercise.categories.includes('pilates') ||
        exercise.categories.includes('core') ||
        exercise.categories.includes('flexibility')
      ) {
        return 2;
      }
      if (exercise.difficulty === 'advanced') {
        return -2;
      }
      return 0;
    case 'athletic':
    case 'lean':
      if (exercise.difficulty === 'advanced' || exercise.difficulty === 'intermediate') {
        return 2;
      }
      if (exercise.categories.includes('pilates') || exercise.categories.includes('core')) {
        return 1;
      }
      return 0;
    case 'average':
      if (exercise.categories.includes('pilates') || exercise.categories.includes('core')) {
        return 1;
      }
      return 0;
    default:
      return 0;
  }
}

function scoreExercise(
  exercise: Exercise,
  profile: Profile,
  usedMuscleGroups: Set<string>,
  deprioritizedIds: Set<string>,
  physique?: PhysiquePlanContext,
): number {
  let score = pilatesAffinityScore(exercise, profile) + physiqueExerciseBonus(exercise, physique);

  if (deprioritizedIds.has(exercise.id)) {
    score -= 5;
  }
  if (!usedMuscleGroups.has(exercise.muscleGroup)) {
    score += 2;
  }
  if (profile.fitnessGoal === 'get_toned' && exercise.difficulty === 'intermediate') {
    score += 1;
  }
  if (profile.fitnessGoal === 'build_muscle' && exercise.difficulty !== 'beginner') {
    score += 1;
  }

  return score;
}

export function validatePlanExerciseIds(
  planExercises: WorkoutPlanExercise[],
  library: Exercise[],
): boolean {
  const libraryIds = new Set(library.map((exercise) => exercise.id));
  return planExercises.every((item) => libraryIds.has(item.exerciseId));
}

export function generateWorkoutPlan(
  profile: Profile,
  exercises: Exercise[],
  planDate: string,
  planId: string,
  adaptation?: AdaptationContext,
  physique?: PhysiquePlanContext,
): WorkoutPlan {
  const deprioritizedIds = adaptation?.skippedFrequentIds ?? new Set<string>();
  const pilatesPool = selectPilatesCandidatePool(exercises);

  const preferencePool = pilatesPool.filter(
    (exercise) =>
      exercise.tags.some((tag) => profile.exercisePreferences.includes(tag)) ||
      isPilatesAlignedExercise(exercise),
  );

  const candidates =
    preferencePool.length >= TARGET_MIN
      ? preferencePool
      : pilatesPool.filter((exercise) => !deprioritizedIds.has(exercise.id));

  const finalCandidates =
    candidates.length >= TARGET_MIN
      ? candidates
      : pilatesPool.length >= TARGET_MIN
        ? pilatesPool
        : exercises.filter((exercise) => !deprioritizedIds.has(exercise.id));

  const usedMuscleGroups = new Set<string>();
  const selected: Exercise[] = [];

  const sorted = [...finalCandidates].sort(
    (a, b) =>
      scoreExercise(b, profile, usedMuscleGroups, deprioritizedIds, physique) -
      scoreExercise(a, profile, usedMuscleGroups, deprioritizedIds, physique),
  );

  for (const exercise of sorted) {
    if (selected.length >= TARGET_MAX) {
      break;
    }
    if (selected.some((item) => item.id === exercise.id)) {
      continue;
    }
    selected.push(exercise);
    usedMuscleGroups.add(exercise.muscleGroup);
  }

  while (selected.length < TARGET_MIN && selected.length < finalCandidates.length) {
    const next = finalCandidates.find(
      (exercise) => !selected.some((item) => item.id === exercise.id),
    );
    if (!next) {
      break;
    }
    selected.push(next);
  }

  let pilatesAlignedCount = selected.filter(isPilatesAlignedExercise).length;
  if (pilatesAlignedCount < MIN_PILATES_ALIGNED && pilatesPool.length >= MIN_PILATES_ALIGNED) {
    const selectedIds = new Set(selected.map((exercise) => exercise.id));
    const upgrades = [...pilatesPool]
      .filter((exercise) => !selectedIds.has(exercise.id))
      .sort(
        (a, b) =>
          scoreExercise(b, profile, usedMuscleGroups, deprioritizedIds, physique) -
          scoreExercise(a, profile, usedMuscleGroups, deprioritizedIds, physique),
      );

    for (const upgrade of upgrades) {
      if (pilatesAlignedCount >= MIN_PILATES_ALIGNED) {
        break;
      }
      const replaceIndex = selected.findIndex((exercise) => !isPilatesAlignedExercise(exercise));
      if (replaceIndex === -1) {
        break;
      }
      selectedIds.delete(selected[replaceIndex]!.id);
      selected[replaceIndex] = upgrade;
      selectedIds.add(upgrade.id);
      pilatesAlignedCount += 1;
    }
  }

  let planExercises: WorkoutPlanExercise[] = selected.map((exercise, index) => ({
    exerciseId: exercise.id,
    sortOrder: index + 1,
    sets: exercise.difficulty === 'advanced' ? 4 : 3,
    reps: exercise.repsBaseline,
    holdSeconds: exercise.holdSeconds,
  }));

  if (adaptation && adaptation.lastSessionFeedback.length > 0) {
    planExercises = swapSkippedExercises(planExercises, adaptation.lastSessionFeedback, adaptation);
  }

  if (planExercises.length < TARGET_MIN) {
    throw new Error(`Plan must include at least ${TARGET_MIN} exercises.`);
  }

  if (!validatePlanExerciseIds(planExercises, exercises)) {
    throw new Error('Plan contains exercises outside the seeded library.');
  }

  return {
    id: planId,
    planDate,
    exercises: planExercises.slice(0, TARGET_MAX),
    source: 'deterministic',
    generatedAt: new Date().toISOString(),
  };
}
