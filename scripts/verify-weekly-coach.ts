/**
 * Live verification of Weekly AI Coach unlock + feedback using fake data.
 * Run: npx tsx scripts/verify-weekly-coach.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { z } from 'zod';

import {
  WEEKLY_COACH_UNLOCK_PERCENT,
  computeWeeklyCoachReadiness,
} from '../src/engines/coaching/weeklyCoachReadiness';
import type { NutritionDailyTotalsRow } from '../src/types/nutrition';
import type { WeightLog } from '../src/types/progress';

const aiWeeklyCoachSchema = z.object({
  summary: z.string().min(1),
  wins: z.array(z.string().min(1)).min(1).max(5),
  focusForNextWeek: z.string().min(1),
  nutritionTip: z.string().min(1),
  weightTip: z.string().min(1),
  workoutTip: z.string().min(1),
});

function loadEnvFile(): Record<string, string> {
  const envPath = resolve(__dirname, '../.env');
  const out: Record<string, string> = {};
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
  } catch {
    // optional
  }
  return out;
}

function makeNutritionDays(days: number[], weekPrefix = '2026-06-0'): NutritionDailyTotalsRow[] {
  return days.map((day) => ({
    mealDate: `${weekPrefix}${day}`,
    caloriesConsumed: 1850,
    proteinG: 95,
    carbsG: 190,
    fatG: 60,
    fiberG: 22,
    mealCount: 3,
    nutritionScore: 72,
    targetCalories: 2000,
    targetProteinG: 120,
    targetCarbsG: 200,
    targetFatG: 65,
    targetFiberG: 28,
    updatedAt: `${weekPrefix}${day}`,
  }));
}

function makeWeightDays(days: number[], weekPrefix = '2026-06-0'): WeightLog[] {
  return days.map((day, index) => ({
    id: `w-${day}`,
    loggedAt: `${weekPrefix}${day}T08:00:00.000Z`,
    weightKg: 70 - index * 0.1,
  }));
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERT FAIL: ${message}`);
  }
}

function printSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function buildCoachPrompt(summary: Record<string, unknown>): string {
  return `You are an experienced Pilates + lifestyle coach for Pilates at Home — warm, direct, and specific. Speak in second person like a real coach reviewing THEIR week, not a generic wellness blog. Celebrate real effort, call out patterns kindly, and give concrete next actions.
Return ONLY JSON:
{
  "summary": string,
  "wins": string[],
  "focusForNextWeek": string,
  "nutritionTip": string,
  "weightTip": string,
  "workoutTip": string
}
Guidance:
- summary: 2-3 sentences weaving food, weight trend, and sessions together for LAST week. workoutsPlanned is training days on their plan (e.g. 4), NOT 7 calendar days.
- wins: 1-3 specific wins grounded ONLY in the numbers. Never invent adherence, meals, or workouts.
- focusForNextWeek: one clear priority tied to their goal — invitation, not guilt.
- nutritionTip: genuine feedback on food choices using calorieAdherencePercent, proteinAdherencePercent, averageCalories, averageProteinG, and nutritionLogDays. Be specific (e.g. protein gaps, overshoot days) without shaming.
- weightTip: genuine feedback on weightTrend and weightLogDays — logging rhythm + what the trend means for their goal.
- workoutTip: genuine feedback on sessions done vs planned and topSkippedExerciseNames — how the work went, recovery, swaps if skips.
- Never say they planned 7 sessions unless workoutsPlanned is actually 7.
Use ONLY the provided aggregates. Do NOT fabricate history.
Context: ${JSON.stringify(summary)}`;
}

async function callGeminiJson(apiKey: string, model: string, prompt: string): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body.slice(0, 400)}`);
  }
  const json = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned empty content');
  }
  return JSON.parse(text);
}

async function main(): Promise<void> {
  const env = loadEnvFile();
  let failures = 0;

  printSection('1) Readiness unlock at 70% (fake data)');

  const locked = computeWeeklyCoachReadiness({
    reviewWeekStart: '2026-06-02',
    reviewWeekEnd: '2026-06-08',
    weightLogs: makeWeightDays([2]),
    nutritionRows: makeNutritionDays([2]),
    workoutsCompleted: 1,
    workoutsPlanned: 4,
  });
  console.log('LOCKED case:', {
    overall: locked.overallPercent,
    unlocked: locked.unlocked,
    weight: locked.weight.percent,
    nutrition: locked.nutrition.percent,
    sessions: locked.sessions.percent,
    threshold: WEEKLY_COACH_UNLOCK_PERCENT,
  });
  try {
    assert(locked.unlocked === false, 'sparse logging must stay locked');
    assert(locked.overallPercent < WEEKLY_COACH_UNLOCK_PERCENT, 'locked overall must be < 70');
    console.log('PASS: sparse week stays locked → Generate grayed out');
  } catch (error) {
    failures += 1;
    console.error(String(error));
  }

  const unlocked = computeWeeklyCoachReadiness({
    reviewWeekStart: '2026-06-02',
    reviewWeekEnd: '2026-06-08',
    weightLogs: makeWeightDays([2, 3, 4, 5, 6]),
    nutritionRows: makeNutritionDays([2, 3, 4, 5, 6]),
    workoutsCompleted: 3,
    workoutsPlanned: 4,
  });
  console.log('UNLOCKED case:', {
    overall: unlocked.overallPercent,
    unlocked: unlocked.unlocked,
    weight: unlocked.weight.percent,
    nutrition: unlocked.nutrition.percent,
    sessions: unlocked.sessions.percent,
  });
  try {
    assert(unlocked.overallPercent >= WEEKLY_COACH_UNLOCK_PERCENT, 'overall must be >= 70');
    assert(unlocked.unlocked === true, '70%+ must unlock Generate');
    console.log('PASS: strong week unlocks Generate');
  } catch (error) {
    failures += 1;
    console.error(String(error));
  }

  const edge = computeWeeklyCoachReadiness({
    reviewWeekStart: '2026-06-02',
    reviewWeekEnd: '2026-06-08',
    weightLogs: makeWeightDays([2, 3, 4, 5]),
    nutritionRows: makeNutritionDays([2, 3, 4, 5, 6]),
    workoutsCompleted: 3,
    workoutsPlanned: 4,
  });
  console.log('EDGE case:', {
    overall: edge.overallPercent,
    unlocked: edge.unlocked,
    parts: {
      weight: edge.weight.percent,
      nutrition: edge.nutrition.percent,
      sessions: edge.sessions.percent,
    },
  });
  try {
    assert(
      edge.unlocked === edge.overallPercent >= WEEKLY_COACH_UNLOCK_PERCENT,
      'edge unlock must match threshold math',
    );
    console.log(
      edge.unlocked
        ? 'INFO: edge case unlocks (at/above 70%)'
        : 'INFO: edge case stays locked (below 70%)',
    );
  } catch (error) {
    failures += 1;
    console.error(String(error));
  }

  printSection('2) Live Gemini coach feedback (fake weekly summary)');

  const fakeSummary = {
    weekStart: '2026-06-02',
    workoutsCompleted: 3,
    workoutsPlanned: 4,
    calorieAdherencePercent: 88,
    proteinAdherencePercent: 72,
    weightTrend: 'down' as const,
    skippedExerciseCount: 1,
    topSkippedExerciseNames: ['Roll Up'],
    goal: 'lose_weight',
    weightLogDays: 5,
    nutritionLogDays: 5,
    averageCalories: 1850,
    averageProteinG: 95,
  };

  const apiKey = env.GEMINI_API_KEY?.trim();
  const model = env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  if (!apiKey) {
    console.log('SKIP: GEMINI_API_KEY not set in .env');
    failures += 1;
  } else {
    try {
      const prompt = buildCoachPrompt(fakeSummary);
      const raw = await callGeminiJson(apiKey, model, prompt);
      const live = aiWeeklyCoachSchema.parse(raw);
      console.log('LIVE Gemini insight:');
      console.log(JSON.stringify(live, null, 2));
      assert(live.summary.length > 20, 'live summary should be substantive');
      assert(live.nutritionTip.length > 20, 'live nutrition tip should be substantive');
      assert(live.weightTip.length > 20, 'live weight tip should be substantive');
      assert(live.workoutTip.length > 20, 'live workout tip should be substantive');
      assert(
        /you|your/i.test(
          `${live.summary} ${live.nutritionTip} ${live.weightTip} ${live.workoutTip}`,
        ),
        'coach voice should be second-person',
      );
      assert(
        !/7 sessions|planned 7/i.test(live.summary),
        'must not invent 7 planned sessions',
      );
      console.log('PASS: live Gemini returns coach-like food/weight/session feedback');
    } catch (error) {
      failures += 1;
      console.error('LIVE Gemini FAILED:', error instanceof Error ? error.message : error);
    }
  }

  printSection('Result');
  if (failures > 0) {
    console.error(`FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log('ALL CHECKS PASSED');
}

void main();
