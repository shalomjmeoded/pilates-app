import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import type {
  CoachingInsight,
  WeeklyCoachInsightContent,
  WeeklyCoachSummary,
} from '@/types/coaching';

interface CoachingRow {
  id: string;
  insight_date: string;
  daily_tip: string;
  weekly_insight: string | null;
  payload_json: string;
}

export async function getCoachingInsightForDate(date: string): Promise<CoachingInsight | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CoachingRow>(
    'SELECT * FROM coaching_insights WHERE insight_date = ?',
    date,
  );
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    insightDate: row.insight_date,
    dailyTip: row.daily_tip,
    weeklyInsight: row.weekly_insight ?? undefined,
    payload: JSON.parse(row.payload_json),
  };
}

export async function getWeeklyCoachInsight(
  weekStart: string,
): Promise<CoachingInsight | null> {
  return getCoachingInsightForDate(weekStart);
}

export async function upsertWeeklyCoachInsight(
  weekStart: string,
  weeklyCoach: WeeklyCoachInsightContent,
  inputSummary: WeeklyCoachSummary,
): Promise<void> {
  const existing = await getCoachingInsightForDate(weekStart);
  const dailyTip = existing?.dailyTip ?? weeklyCoach.nutritionTip;

  await upsertCoachingInsight({
    id: existing?.id,
    insightDate: weekStart,
    dailyTip,
    weeklyInsight: weeklyCoach.summary,
    payload: {
      ...(existing?.payload ?? {}),
      weeklyCoach,
      weeklyCoachInput: inputSummary,
      proteinAdherencePercent: inputSummary.proteinAdherencePercent ?? undefined,
      calorieAdherencePercent: inputSummary.calorieAdherencePercent ?? undefined,
      workoutsThisWeek: inputSummary.workoutsCompleted,
    },
  });
}

export async function upsertCoachingInsight(insight: CoachingInsight): Promise<void> {
  const db = await getDatabase();
  const existing = await getCoachingInsightForDate(insight.insightDate);
  const payloadJson = JSON.stringify(insight.payload);

  if (existing?.id) {
    await db.runAsync(
      `UPDATE coaching_insights
       SET daily_tip = ?, weekly_insight = ?, payload_json = ?
       WHERE id = ?`,
      insight.dailyTip,
      insight.weeklyInsight ?? null,
      payloadJson,
      existing.id,
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO coaching_insights (id, insight_date, daily_tip, weekly_insight, payload_json)
     VALUES (?, ?, ?, ?, ?)`,
    createId(),
    insight.insightDate,
    insight.dailyTip,
    insight.weeklyInsight ?? null,
    payloadJson,
  );
}
