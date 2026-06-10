import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import type { MilestoneKey } from '@/types/progress';

interface MilestoneRow {
  id: string;
  milestone_key: MilestoneKey;
  unlocked_at: string;
}

export async function getUnlockedMilestones(): Promise<
  Array<{ key: MilestoneKey; unlockedAt: string }>
> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MilestoneRow>(
    'SELECT * FROM user_milestones ORDER BY unlocked_at ASC',
  );

  return rows.map((row) => ({
    key: row.milestone_key,
    unlockedAt: row.unlocked_at,
  }));
}

export async function unlockMilestone(key: MilestoneKey): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM user_milestones WHERE milestone_key = ?',
    key,
  );

  if (existing) {
    return;
  }

  await db.runAsync(
    'INSERT INTO user_milestones (id, milestone_key, unlocked_at) VALUES (?, ?, datetime(\'now\'))',
    createId(),
    key,
  );
}

export async function unlockMilestones(keys: MilestoneKey[]): Promise<void> {
  for (const key of keys) {
    await unlockMilestone(key);
  }
}
