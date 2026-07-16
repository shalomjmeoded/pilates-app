/**
 * Optional check: hit YouTube oEmbed for each curated video id and flag
 * non-resolvable / likely non-embeddable entries.
 *
 *   npm run validate-youtube
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Exercise } from '../src/types/exercise';

const projectRoot = resolve(__dirname, '..');
const seedPath = resolve(projectRoot, 'assets/seed/exercises.json');
const youtubeMapPath = resolve(projectRoot, 'assets/seed/exerciseYoutubeMap.json');

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

interface YoutubeMapEntry {
  exerciseId: string;
  youtubeVideoId: string;
  title: string;
  attribution: string;
}

async function checkOEmbed(videoId: string): Promise<{ ok: boolean; detail: string }> {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`,
  )}&format=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { ok: false, detail: `HTTP ${response.status}` };
    }
    const payload = (await response.json()) as { title?: string; author_name?: string };
    return {
      ok: true,
      detail: `${payload.author_name ?? 'unknown'} — ${payload.title ?? videoId}`,
    };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

async function main(): Promise<void> {
  const exercises = JSON.parse(readFileSync(seedPath, 'utf8')) as Exercise[];
  const map = JSON.parse(readFileSync(youtubeMapPath, 'utf8')) as YoutubeMapEntry[];

  const seedMapped = exercises.filter((exercise) => exercise.youtubeVideoId);
  const failures: string[] = [];

  for (const exercise of seedMapped) {
    const id = exercise.youtubeVideoId!;
    if (!YOUTUBE_ID_PATTERN.test(id)) {
      failures.push(`${exercise.id}: invalid youtubeVideoId shape "${id}"`);
      continue;
    }
  }

  for (const entry of map) {
    if (!YOUTUBE_ID_PATTERN.test(entry.youtubeVideoId)) {
      failures.push(`map ${entry.exerciseId}: invalid id shape`);
    }
  }

  console.log(`Checking oEmbed for ${seedMapped.length} curated embeds…`);
  for (const exercise of seedMapped) {
    const result = await checkOEmbed(exercise.youtubeVideoId!);
    if (!result.ok) {
      failures.push(`${exercise.id}: oEmbed failed (${result.detail})`);
      console.log(`  FAIL ${exercise.id} → ${result.detail}`);
    } else {
      console.log(`  OK   ${exercise.id} → ${result.detail}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\nFAIL: ${failures.length} issue(s)`);
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nPASS: curated YouTube embeds look resolvable.');
}

void main();
