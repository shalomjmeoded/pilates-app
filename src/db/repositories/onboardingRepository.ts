import { getDatabase } from '@/db/connection';

export async function hasCompletedOnboardingInDb(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ completed_at: string | null }>(
    'SELECT completed_at FROM onboarding_answers WHERE id = 1',
  );
  return Boolean(row?.completed_at);
}

export async function saveOnboardingAnswers(rawJson: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM onboarding_answers WHERE id = 1',
  );

  if (existing) {
    await db.runAsync(
      `UPDATE onboarding_answers
       SET raw_json = ?, completed_at = datetime('now')
       WHERE id = 1`,
      rawJson,
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO onboarding_answers (id, raw_json, completed_at) VALUES (1, ?, datetime('now'))`,
    rawJson,
  );
}
