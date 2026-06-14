import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { isBodyPartLikeName } from './lib/exerciseQualityRules';
import {
  EXERCISE_CATEGORIES,
  EXERCISE_EQUIPMENT,
  EXERCISE_MUSCLE_GROUPS,
  EXERCISE_SESSION_ROLES,
  EXERCISE_SOURCES,
  type Difficulty,
  type Exercise,
} from '../src/types/exercise';

const projectRoot = resolve(__dirname, '..');
const seedPath = resolve(projectRoot, 'assets/seed/exercises.json');
const raw = readFileSync(seedPath, 'utf8');
const exercises = JSON.parse(raw) as Exercise[];

const VALID_DIFFICULTIES = new Set<Difficulty>(['beginner', 'intermediate', 'advanced']);

if (exercises.length < 60) {
  throw new Error(`Expected at least 60 curated exercises, found ${exercises.length}`);
}

const ids = new Set<string>();
const names = new Set<string>();

for (const exercise of exercises) {
  if (ids.has(exercise.id)) {
    throw new Error(`Duplicate exercise id: ${exercise.id}`);
  }
  ids.add(exercise.id);

  if (names.has(exercise.name)) {
    throw new Error(`Duplicate exercise name: ${exercise.name}`);
  }
  names.add(exercise.name);

  if (isBodyPartLikeName(exercise.name)) {
    throw new Error(`Body-part-only name not allowed: ${exercise.name}`);
  }

  if (!exercise.name || !exercise.description) {
    throw new Error(`Invalid exercise payload for ${exercise.id}`);
  }
  if (!exercise.instructions?.length) {
    throw new Error(`Missing instructions for ${exercise.id}`);
  }
  if (!exercise.commonMistakes?.length) {
    throw new Error(`Missing common mistakes for ${exercise.id}`);
  }
  if (!VALID_DIFFICULTIES.has(exercise.difficulty)) {
    throw new Error(`Invalid difficulty for ${exercise.id}`);
  }
  if (!EXERCISE_MUSCLE_GROUPS.includes(exercise.muscleGroup)) {
    throw new Error(`Invalid muscle group for ${exercise.id}`);
  }
  if (!EXERCISE_EQUIPMENT.includes(exercise.equipment)) {
    throw new Error(`Invalid equipment for ${exercise.id}`);
  }
  if (!exercise.thumbnailUri || !exercise.gifUri) {
    throw new Error(`Missing media URI for ${exercise.id}`);
  }
  if (!EXERCISE_SOURCES.includes(exercise.source)) {
    throw new Error(`Invalid source for ${exercise.id}`);
  }
  if (!EXERCISE_SESSION_ROLES.includes(exercise.sessionRole)) {
    throw new Error(`Invalid session role for ${exercise.id}`);
  }
  if (!exercise.categories?.length) {
    throw new Error(`Missing categories for ${exercise.id}`);
  }
  for (const category of exercise.categories) {
    if (!EXERCISE_CATEGORIES.includes(category)) {
      throw new Error(`Invalid category ${category} for ${exercise.id}`);
    }
  }

  const thumbPath = resolve(projectRoot, exercise.thumbnailUri);
  const gifPath = resolve(projectRoot, exercise.gifUri);
  if (!existsSync(thumbPath)) {
    throw new Error(`Missing thumbnail file for ${exercise.id}`);
  }
  if (!existsSync(gifPath)) {
    throw new Error(`Missing detail frame file for ${exercise.id}`);
  }
}

const crossover = exercises.find((e) => e.id === 'Crossover_Reverse_Lunge');
if (crossover && crossover.muscleGroup === 'lower back') {
  throw new Error('Crossover Reverse Lunge must not map to lower back');
}

const frog = exercises.find((e) => e.id === 'Frog_Hops');
if (frog && frog.muscleGroup === 'lower back') {
  throw new Error('Frog Hops must not map to lower back');
}

const byDifficulty = Object.fromEntries(
  (['beginner', 'intermediate', 'advanced'] as const).map((level) => [
    level,
    exercises.filter((e) => e.difficulty === level).length,
  ]),
);

console.log(`Validated ${exercises.length} exercises.`);
console.log('By difficulty:', byDifficulty);
console.log(`Thumbnails: ${exercises.length}/${exercises.length}`);
console.log(`Detail frames: ${exercises.length}/${exercises.length}`);
