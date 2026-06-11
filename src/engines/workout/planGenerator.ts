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

type WorkoutFocus = 'core_control' | 'posterior_chain' | 'mobility_recovery' | 'full_body_control';

const TARGET_MIN = 9;
const TARGET_MAX = 12;
const MIN_PILATES_ALIGNED = 8;
const TARGET_DISTINCT_MUSCLE_GROUPS = 4;
const DATE_VARIETY_WEIGHT = 6;

const GOAL_WEEKLY_FOCUS: Record<Profile['fitnessGoal'], WorkoutFocus[]> = {
  get_toned: [
    'full_body_control',
    'posterior_chain',
    'mobility_recovery',
    'core_control',
    'posterior_chain',
    'full_body_control',
    'mobility_recovery',
  ],
  maintain: [
    'full_body_control',
    'mobility_recovery',
    'core_control',
    'posterior_chain',
    'mobility_recovery',
    'full_body_control',
    'mobility_recovery',
  ],
  build_muscle: [
    'posterior_chain',
    'core_control',
    'full_body_control',
    'posterior_chain',
    'mobility_recovery',
    'posterior_chain',
    'core_control',
  ],
};

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function dateVarietyBonus(exercise: Exercise, planDate: string): number {
  return (stableHash(`${planDate}:${exercise.id}`) % 1000) / 1000 * DATE_VARIETY_WEIGHT;
}

function dayIndex(planDate: string): number {
  const parsed = new Date(`${planDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }
  return parsed.getUTCDay();
}

function weeklyFocusFor(profile: Profile, planDate: string): WorkoutFocus {
  const weeklyFocus = GOAL_WEEKLY_FOCUS[profile.fitnessGoal];
  return weeklyFocus[dayIndex(planDate)] ?? 'full_body_control';
}

function focusExerciseBonus(exercise: Exercise, focus: WorkoutFocus): number {
  switch (focus) {
    case 'core_control':
      if (exercise.muscleGroup === 'core') {
        return 5;
      }
      if (exercise.muscleGroup === 'lower back' || exercise.categories.includes('posture')) {
        return 2;
      }
      return 0;
    case 'posterior_chain':
      if (exercise.muscleGroup === 'glutes') {
        return 5;
      }
      if (
        exercise.muscleGroup === 'hamstrings' ||
        exercise.muscleGroup === 'outer thighs' ||
        exercise.muscleGroup === 'lower back'
      ) {
        return 3;
      }
      if (/\b(bridge|kickback|leg lift|swan|swimming)\b/i.test(exercise.name)) {
        return 2;
      }
      return 0;
    case 'mobility_recovery':
      if (exercise.sessionRole === 'warmup' || exercise.sessionRole === 'cooldown') {
        return 5;
      }
      if (exercise.categories.includes('flexibility') || exercise.categories.includes('mobility')) {
        return 4;
      }
      if (exercise.difficulty === 'beginner') {
        return 2;
      }
      if (exercise.difficulty === 'advanced') {
        return -4;
      }
      return 0;
    case 'full_body_control':
      if (
        exercise.muscleGroup === 'core' ||
        exercise.muscleGroup === 'glutes' ||
        exercise.muscleGroup === 'lower back' ||
        exercise.muscleGroup === 'outer thighs'
      ) {
        return 2;
      }
      return 0;
    default:
      return 0;
  }
}

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
  muscleGroupCounts: Map<string, number>,
  deprioritizedIds: Set<string>,
  planDate: string,
  focus: WorkoutFocus,
  physique?: PhysiquePlanContext,
): number {
  let score =
    pilatesAffinityScore(exercise, profile) +
    physiqueExerciseBonus(exercise, physique) +
    focusExerciseBonus(exercise, focus) +
    dateVarietyBonus(exercise, planDate);

  if (deprioritizedIds.has(exercise.id)) {
    score -= 5;
  }
  const muscleGroupCount = muscleGroupCounts.get(exercise.muscleGroup) ?? 0;
  if (muscleGroupCount === 0) {
    score += 2;
  } else if (muscleGroupCount === 1) {
    score -= 3;
  } else {
    score -= 7 + muscleGroupCount;
  }
  if (profile.fitnessGoal === 'get_toned' && exercise.difficulty === 'intermediate') {
    score += 1;
  }
  if (profile.fitnessGoal === 'build_muscle' && exercise.difficulty !== 'beginner') {
    score += 1;
  }

  return score;
}

function countMuscleGroups(exercises: Exercise[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const exercise of exercises) {
    counts.set(exercise.muscleGroup, (counts.get(exercise.muscleGroup) ?? 0) + 1);
  }
  return counts;
}

function targetDistinctMuscleGroups(candidates: Exercise[]): number {
  return Math.min(
    TARGET_DISTINCT_MUSCLE_GROUPS,
    new Set(candidates.map((exercise) => exercise.muscleGroup)).size,
    TARGET_MIN,
  );
}

function selectBalancedExercises(
  candidates: Exercise[],
  profile: Profile,
  deprioritizedIds: Set<string>,
  planDate: string,
  focus: WorkoutFocus,
  physique?: PhysiquePlanContext,
): Exercise[] {
  const selected: Exercise[] = [];
  const selectedIds = new Set<string>();
  const targetGroups = targetDistinctMuscleGroups(candidates);

  while (selected.length < TARGET_MAX && selected.length < candidates.length) {
    const muscleGroupCounts = countMuscleGroups(selected);
    const distinctGroups = muscleGroupCounts.size;
    const shouldPrioritizeNewGroup =
      selected.length < TARGET_MIN && distinctGroups < targetGroups;

    const next = candidates
      .filter((exercise) => !selectedIds.has(exercise.id))
      .sort((a, b) => {
        if (shouldPrioritizeNewGroup) {
          const aNewGroup = !muscleGroupCounts.has(a.muscleGroup);
          const bNewGroup = !muscleGroupCounts.has(b.muscleGroup);
          if (aNewGroup !== bNewGroup) {
            return aNewGroup ? -1 : 1;
          }
        }

        return (
          scoreExercise(b, profile, muscleGroupCounts, deprioritizedIds, planDate, focus, physique) -
          scoreExercise(a, profile, muscleGroupCounts, deprioritizedIds, planDate, focus, physique)
        );
      })[0];

    if (!next) {
      break;
    }

    selected.push(next);
    selectedIds.add(next.id);
  }

  return selected;
}

function sessionRoleOrder(exercise: Exercise): number {
  switch (exercise.sessionRole) {
    case 'warmup':
      return 0;
    case 'main':
      return 1;
    case 'cooldown':
      return 2;
    default:
      return 1;
  }
}

function orderWorkoutFlow(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => sessionRoleOrder(a) - sessionRoleOrder(b));
}

function setsForExercise(profile: Profile, exercise: Exercise, focus: WorkoutFocus): number {
  if (focus === 'mobility_recovery' && exercise.difficulty === 'beginner') {
    return 2;
  }
  if (
    profile.fitnessGoal === 'build_muscle' &&
    focus !== 'mobility_recovery' &&
    exercise.difficulty !== 'beginner'
  ) {
    return 4;
  }
  return exercise.difficulty === 'advanced' ? 4 : 3;
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
  const focus = weeklyFocusFor(profile, planDate);

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

  const selected = selectBalancedExercises(
    finalCandidates,
    profile,
    deprioritizedIds,
    planDate,
    focus,
    physique,
  );

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
          scoreExercise(
            b,
            profile,
            countMuscleGroups(selected),
            deprioritizedIds,
            planDate,
            focus,
            physique,
          ) -
          scoreExercise(
            a,
            profile,
            countMuscleGroups(selected),
            deprioritizedIds,
            planDate,
            focus,
            physique,
          ),
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

  let planExercises: WorkoutPlanExercise[] = orderWorkoutFlow(selected).map((exercise, index) => ({
    exerciseId: exercise.id,
    sortOrder: index + 1,
    sets: setsForExercise(profile, exercise, focus),
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
