/**
 * Add one curated Pilates exercise to the seed library.
 *
 * Usage:
 *   npx tsx scripts/add-exercise.ts --id Ring_Squeeze --name "Magic Circle Squeeze" \
 *     --equipment "magic circle" --muscle core --donor Pilates_Hundred
 *
 * Optional flags:
 *   --youtube VIDEO_ID   Curated Pilates Anytime embed id (must allow embed)
 *   --difficulty beginner|intermediate|advanced
 *   --role main|warmup|cooldown
 *   --thumb PATH         Copy this file to assets/exercises/thumbnails/{id}.ext
 *   --gif PATH           Copy this file to assets/exercises/gifs/{id}.ext (.gif/.webp/.jpg)
 *   --dry-run            Print the payload without writing
 *
 * After adding media, bump EXERCISE_LIBRARY_VERSION in src/db/seed/exerciseSeed.ts
 * so devices reseed on next launch.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

import {
  EXERCISE_EQUIPMENT,
  EXERCISE_MUSCLE_GROUPS,
  EXERCISE_SESSION_ROLES,
  type Difficulty,
  type Exercise,
  type ExerciseEquipment,
  type ExerciseMuscleGroup,
  type ExerciseSessionRole,
} from '../src/types/exercise';
import { writeExerciseAssetManifest } from './lib/exerciseManifest';

const projectRoot = resolve(__dirname, '..');
const seedPath = resolve(projectRoot, 'assets/seed/exercises.json');
const youtubeMapPath = resolve(projectRoot, 'assets/seed/exerciseYoutubeMap.json');
const thumbnailDir = resolve(projectRoot, 'assets/exercises/thumbnails');
const gifDir = resolve(projectRoot, 'assets/exercises/gifs');

const PILATES_ANYTIME = 'Pilates Anytime';
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const ALLOWED_MEDIA_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function requireString(args: Record<string, string | boolean>, key: string): string {
  const value = args[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required --${key}`);
  }
  return value.trim();
}

function mediaExtFor(dir: string, id: string): string {
  for (const ext of ['.gif', '.webp', '.jpg', '.jpeg', '.png']) {
    if (existsSync(resolve(dir, `${id}${ext}`))) {
      return ext;
    }
  }
  return '.jpg';
}

function copyMediaFile(sourcePath: string, destDir: string, id: string): string {
  mkdirSync(destDir, { recursive: true });
  const ext = extname(sourcePath).toLowerCase();
  if (!ALLOWED_MEDIA_EXT.has(ext)) {
    throw new Error(`Unsupported media extension ${ext} for ${sourcePath}`);
  }
  const destName = `${id}${ext === '.jpeg' ? '.jpg' : ext}`;
  const dest = resolve(destDir, destName);
  copyFileSync(resolve(sourcePath), dest);
  const folder = basename(destDir);
  return `assets/exercises/${folder}/${destName}`;
}

function copyDonorMedia(donorId: string, newId: string): { thumb: string; gif: string } {
  const donorThumbExt = mediaExtFor(thumbnailDir, donorId);
  const donorGifExt = mediaExtFor(gifDir, donorId);
  const thumbDest = resolve(thumbnailDir, `${newId}.jpg`);
  const gifDest = resolve(gifDir, `${newId}.jpg`);
  const donorThumb = resolve(thumbnailDir, `${donorId}${donorThumbExt}`);
  const donorGif = resolve(gifDir, `${donorId}${donorGifExt}`);
  if (!existsSync(donorThumb) || !existsSync(donorGif)) {
    throw new Error(`Donor media missing for ${donorId}`);
  }
  copyFileSync(donorThumb, thumbDest);
  copyFileSync(donorGif, gifDest);
  return {
    thumb: `assets/exercises/thumbnails/${newId}.jpg`,
    gif: `assets/exercises/gifs/${newId}.jpg`,
  };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args['dry-run']);

  const id = requireString(args, 'id');
  const name = requireString(args, 'name');
  const equipment = requireString(args, 'equipment') as ExerciseEquipment;
  const muscle = requireString(args, 'muscle') as ExerciseMuscleGroup;

  if (!/^[A-Za-z0-9_]+$/.test(id)) {
    throw new Error('id must be alphanumeric/underscore (e.g. Magic_Circle_Squeeze)');
  }
  if (!EXERCISE_EQUIPMENT.includes(equipment)) {
    throw new Error(`Invalid equipment: ${equipment}`);
  }
  if (!EXERCISE_MUSCLE_GROUPS.includes(muscle)) {
    throw new Error(`Invalid muscle: ${muscle}`);
  }

  const difficulty = (typeof args.difficulty === 'string'
    ? args.difficulty
    : 'beginner') as Difficulty;
  const sessionRole = (typeof args.role === 'string'
    ? args.role
    : 'main') as ExerciseSessionRole;
  if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  if (!EXERCISE_SESSION_ROLES.includes(sessionRole)) {
    throw new Error(`Invalid role: ${sessionRole}`);
  }

  const youtubeVideoId =
    typeof args.youtube === 'string' && args.youtube.trim() ? args.youtube.trim() : null;
  if (youtubeVideoId && !YOUTUBE_ID_PATTERN.test(youtubeVideoId)) {
    throw new Error(`Invalid YouTube video id: ${youtubeVideoId}`);
  }

  const existing = JSON.parse(readFileSync(seedPath, 'utf8')) as Exercise[];
  if (existing.some((exercise) => exercise.id === id)) {
    throw new Error(`Exercise id already exists: ${id}`);
  }
  if (existing.some((exercise) => exercise.name === name)) {
    throw new Error(`Exercise name already exists: ${name}`);
  }

  let thumbnailUri: string;
  let gifUri: string;
  if (typeof args.thumb === 'string' && typeof args.gif === 'string') {
    thumbnailUri = copyMediaFile(args.thumb, thumbnailDir, id);
    gifUri = copyMediaFile(args.gif, gifDir, id);
  } else if (typeof args.donor === 'string') {
    const media = copyDonorMedia(args.donor, id);
    thumbnailUri = media.thumb;
    gifUri = media.gif;
  } else {
    throw new Error('Provide --donor DONOR_ID or both --thumb and --gif paths');
  }

  const exercise: Exercise = {
    id,
    name,
    description:
      typeof args.description === 'string'
        ? args.description
        : `A controlled Pilates movement for ${muscle}.`,
    instructions: [
      'Set your alignment and engage your center before moving.',
      'Move with control on the exhale; return with control on the inhale.',
      'Keep shoulders soft and neck long throughout.',
      'Stop if form breaks; reset rather than forcing range.',
    ],
    commonMistakes: [
      'Using momentum instead of controlled muscle engagement.',
      'Holding breath or bracing the neck.',
      'Losing pelvic or ribcage stability mid-rep.',
    ],
    difficulty,
    muscleGroup: muscle,
    secondaryMuscles: [],
    equipment,
    thumbnailUri,
    gifUri,
    tags: equipment === 'reformer' ? ['reformer_pilates'] : ['mat_pilates'],
    categories: ['pilates', muscle === 'core' ? 'core' : 'bodyweight'],
    sessionRole,
    source: 'curated_betterme',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.08,
    youtubeVideoId,
    youtubeAttribution: youtubeVideoId ? PILATES_ANYTIME : null,
  };

  if (dryRun) {
    console.log(JSON.stringify(exercise, null, 2));
    return;
  }

  const merged = [...existing, exercise];
  writeFileSync(seedPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  writeExerciseAssetManifest(merged, 'scripts/add-exercise.ts');

  const youtubeMap = merged
    .filter((row) => row.youtubeVideoId)
    .map((row) => ({
      exerciseId: row.id,
      youtubeVideoId: row.youtubeVideoId,
      title: row.name,
      attribution: row.youtubeAttribution ?? PILATES_ANYTIME,
    }));
  writeFileSync(youtubeMapPath, `${JSON.stringify(youtubeMap, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        added: id,
        total: merged.length,
        youtubeMapped: youtubeMap.length,
        note: 'Bump EXERCISE_LIBRARY_VERSION in src/db/seed/exerciseSeed.ts, then run npm run validate-seed',
      },
      null,
      2,
    ),
  );
}

main();
