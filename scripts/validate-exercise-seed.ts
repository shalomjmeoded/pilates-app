import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { isBodyPartLikeName } from './lib/exerciseQualityRules';
import {
  EXERCISE_CATEGORIES,
  EXERCISE_EQUIPMENT,
  EXERCISE_MUSCLE_GROUPS,
  EXERCISE_SESSION_ROLES,
  EXERCISE_SOURCES,
  OPTIONAL_EXERCISE_EQUIPMENT,
  type Difficulty,
  type Exercise,
} from '../src/types/exercise';

const projectRoot = resolve(__dirname, '..');
const seedPath = resolve(projectRoot, 'assets/seed/exercises.json');
const youtubeMapPath = resolve(projectRoot, 'assets/seed/exerciseYoutubeMap.json');
const raw = readFileSync(seedPath, 'utf8');
const exercises = JSON.parse(raw) as Exercise[];

const VALID_DIFFICULTIES = new Set<Difficulty>(['beginner', 'intermediate', 'advanced']);
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const MIN_LIBRARY = 90;
const ALLOWED_MEDIA_EXT = /\.(jpg|jpeg|png|gif|webp)$/i;

if (exercises.length < MIN_LIBRARY) {
  throw new Error(`Expected at least ${MIN_LIBRARY} curated exercises, found ${exercises.length}`);
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
  if (!ALLOWED_MEDIA_EXT.test(exercise.thumbnailUri) || !ALLOWED_MEDIA_EXT.test(exercise.gifUri)) {
    throw new Error(`Unsupported media extension for ${exercise.id}`);
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

  if (exercise.youtubeVideoId != null) {
    if (!YOUTUBE_ID_PATTERN.test(exercise.youtubeVideoId)) {
      throw new Error(`Invalid youtubeVideoId for ${exercise.id}: ${exercise.youtubeVideoId}`);
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

for (const equipment of OPTIONAL_EXERCISE_EQUIPMENT) {
  const count = exercises.filter((exercise) => exercise.equipment === equipment).length;
  if (count < 3) {
    throw new Error(`Expected at least 3 exercises for equipment "${equipment}", found ${count}`);
  }
}

if (existsSync(youtubeMapPath)) {
  const map = JSON.parse(readFileSync(youtubeMapPath, 'utf8')) as Array<{
    exerciseId: string;
    youtubeVideoId: string;
  }>;
  for (const entry of map) {
    if (!ids.has(entry.exerciseId)) {
      throw new Error(`youtube map references unknown exercise ${entry.exerciseId}`);
    }
    if (!YOUTUBE_ID_PATTERN.test(entry.youtubeVideoId)) {
      throw new Error(`youtube map has invalid id for ${entry.exerciseId}`);
    }
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

const byEquipment = Object.fromEntries(
  EXERCISE_EQUIPMENT.map((equipment) => [
    equipment,
    exercises.filter((e) => e.equipment === equipment).length,
  ]),
);

const youtubeCount = exercises.filter((e) => e.youtubeVideoId).length;

console.log(`Validated ${exercises.length} exercises.`);
console.log('By difficulty:', byDifficulty);
console.log('By equipment:', byEquipment);
console.log(`YouTube embeds: ${youtubeCount}`);
console.log(`Thumbnails: ${exercises.length}/${exercises.length}`);
console.log(`Detail frames: ${exercises.length}/${exercises.length}`);
