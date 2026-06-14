import { Share } from 'react-native';

import { getDatabase } from '@/db/connection';
import { getUnlockedMilestones } from '@/db/repositories/milestoneRepository';
import { getAllNutritionTargets } from '@/db/repositories/nutritionRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getReminders } from '@/db/repositories/remindersRepository';
import { getAllWeightLogs } from '@/db/repositories/weightLogRepository';
import type { BetterMeExportPayload } from '@/types/settings';

export async function buildExportPayload(): Promise<BetterMeExportPayload> {
  const db = await getDatabase();

  const meals = await db.getAllAsync('SELECT * FROM meals ORDER BY logged_at ASC');
  const workoutSessions = await db.getAllAsync(
    `SELECT ws.*, wp.plan_date
     FROM workout_sessions ws
     LEFT JOIN workout_plans wp ON wp.id = ws.plan_id
     ORDER BY ws.started_at ASC`,
  );

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: await getProfile(),
    weightLogs: await getAllWeightLogs(),
    meals,
    workoutSessions,
    nutritionTargets: await getAllNutritionTargets(),
    milestones: await getUnlockedMilestones(),
    reminders: await getReminders(),
  };
}

export async function exportDataViaShareSheet(): Promise<void> {
  const payload = await buildExportPayload();
  const json = JSON.stringify(payload, null, 2);

  await Share.share({
    title: 'BetterMe Data Export',
    message: json,
  });
}
