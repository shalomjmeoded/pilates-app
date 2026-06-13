import { createHash } from 'node:crypto';
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

interface AuditIssue {
  category: string;
  message: string;
}

const issues: AuditIssue[] = [];
const staticMediaPairs: string[] = [];

function report(category: string, message: string): void {
  issues.push({ category, message });
}

const names = new Map<string, string[]>();
for (const exercise of exercises) {
  const bucket = names.get(exercise.name) ?? [];
  bucket.push(exercise.id);
  names.set(exercise.name, bucket);
}

for (const [name, ids] of names) {
  if (ids.length > 1) {
    report('duplicate_name', `Duplicate name "${name}" → ${ids.join(', ')}`);
  }
}

function fileHash(filePath: string): string {
  return createHash('sha1').update(readFileSync(filePath)).digest('hex');
}

let thumbsOk = 0;
let detailOk = 0;

for (const exercise of exercises) {
  const thumbPath = resolve(projectRoot, exercise.thumbnailUri);
  const gifPath = resolve(projectRoot, exercise.gifUri);

  if (!existsSync(thumbPath)) {
    report('missing_thumbnail', `${exercise.id}: ${exercise.thumbnailUri}`);
  } else {
    thumbsOk += 1;
  }

  if (!existsSync(gifPath)) {
    report('missing_detail_frame', `${exercise.id}: ${exercise.gifUri}`);
  } else {
    detailOk += 1;
  }

  if (existsSync(thumbPath) && existsSync(gifPath) && fileHash(thumbPath) === fileHash(gifPath)) {
    staticMediaPairs.push(exercise.id);
  }

  if (isBodyPartLikeName(exercise.name)) {
    report('body_part_name', `${exercise.id}: "${exercise.name}"`);
  }

  if (!exercise.muscleGroup || !EXERCISE_MUSCLE_GROUPS.includes(exercise.muscleGroup)) {
    report('invalid_muscle_group', `${exercise.id}: ${String(exercise.muscleGroup)}`);
  }
  if (!exercise.equipment || !EXERCISE_EQUIPMENT.includes(exercise.equipment)) {
    report('invalid_equipment', `${exercise.id}: ${String(exercise.equipment)}`);
  }
  if (!VALID_DIFFICULTIES.has(exercise.difficulty)) {
    report('invalid_difficulty', `${exercise.id}: ${String(exercise.difficulty)}`);
  }
  if (!exercise.source || !EXERCISE_SOURCES.includes(exercise.source)) {
    report('invalid_source', `${exercise.id}: ${String(exercise.source)}`);
  }
  if (!exercise.instructions?.length) {
    report('missing_instructions', exercise.id);
  }
  if (!exercise.gifUri?.trim()) {
    report('missing_gif_uri', exercise.id);
  }
  if (!EXERCISE_SESSION_ROLES.includes(exercise.sessionRole)) {
    report('invalid_session_role', exercise.id);
  }
  for (const category of exercise.categories ?? []) {
    if (!EXERCISE_CATEGORIES.includes(category)) {
      report('invalid_category', `${exercise.id}: ${category}`);
    }
  }
}

const byDifficulty = Object.fromEntries(
  (['beginner', 'intermediate', 'advanced'] as const).map((level) => [
    level,
    exercises.filter((e) => e.difficulty === level).length,
  ]),
);

const byMuscleGroup: Record<string, number> = {};
const byEquipment: Record<string, number> = {};
const byCategory: Record<string, number> = {};

for (const exercise of exercises) {
  byMuscleGroup[exercise.muscleGroup] = (byMuscleGroup[exercise.muscleGroup] ?? 0) + 1;
  byEquipment[exercise.equipment] = (byEquipment[exercise.equipment] ?? 0) + 1;
  for (const category of exercise.categories) {
    byCategory[category] = (byCategory[category] ?? 0) + 1;
  }
}

const thumbPct = Math.round((thumbsOk / exercises.length) * 100);
const detailPct = Math.round((detailOk / exercises.length) * 100);

console.log(`\nExercise library audit — ${exercises.length} exercises\n`);
console.log('By difficulty:', byDifficulty);
console.log('By muscle group:', byMuscleGroup);
console.log('By equipment:', byEquipment);
console.log('By category:', byCategory);
console.log('\nMedia coverage:');
console.log(`  Thumbnails: ${thumbsOk}/${exercises.length} (${thumbPct}%)`);
console.log(`  Detail frames (gifUri): ${detailOk}/${exercises.length} (${detailPct}%)`);
console.log(`  Static thumbnail/gif duplicates: ${staticMediaPairs.length}`);
if (staticMediaPairs.length > 0) {
  console.log(`  Duplicate IDs: ${staticMediaPairs.slice(0, 12).join(', ')}`);
}

const examples = exercises.filter((e) =>
  ['Crossover_Reverse_Lunge', 'Frog_Hops', 'Dead_Bug', 'Plank', 'Butt_Lift_Bridge'].includes(e.id),
);
console.log('\nKey exercise muscle mapping:');
for (const e of examples) {
  console.log(`  ${e.name} → ${e.muscleGroup} (${e.secondaryMuscles.join(', ')})`);
}

if (issues.length > 0) {
  console.log('\nIssues:');
  const grouped = new Map<string, string[]>();
  for (const issue of issues) {
    const list = grouped.get(issue.category) ?? [];
    list.push(issue.message);
    grouped.set(issue.category, list);
  }
  for (const [category, messages] of grouped) {
    console.log(`  ${category}: ${messages.length}`);
    for (const message of messages.slice(0, 5)) {
      console.log(`    - ${message}`);
    }
  }
}

if (exercises.length < 120) {
  console.error(`\nFAIL: minimum 120 exercises required, found ${exercises.length}`);
  process.exit(1);
}

if (issues.length > 0) {
  console.error(`\nFAIL: ${issues.length} issue(s)`);
  process.exit(1);
}

console.log('\nPASS: exercise library quality checks passed.');
