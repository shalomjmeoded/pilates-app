import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import { ensureAiSchema } from '@/db/ensureAiSchema';
import type { AiFeature, AiQuotaPeriod } from '@/services/ai/types';
import { PREMIUM_AI_QUOTAS } from '@/services/ai/types';

interface AiUsageRow {
  id: string;
  feature: string;
  period_key: string;
  request_count: number;
  last_request_at: string;
  last_prompt_hash: string | null;
}

function periodKey(period: AiQuotaPeriod, now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  if (period === 'day') {
    return `${y}-${m}-${d}`;
  }

  if (period === 'week') {
    const date = new Date(Date.UTC(y, now.getUTCMonth(), now.getUTCDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  return `${y}-${m}`;
}

export function getQuotaPeriodKey(feature: AiFeature, at = new Date()): string {
  return periodKey(PREMIUM_AI_QUOTAS[feature].period, at);
}

async function withAiUsageTable<T>(action: (db: Awaited<ReturnType<typeof getDatabase>>) => Promise<T>): Promise<T> {
  const db = await getDatabase();
  await ensureAiSchema(db);
  return action(db);
}

export async function getAiUsageCount(feature: AiFeature, at = new Date()): Promise<number> {
  return withAiUsageTable(async (db) => {
  const key = getQuotaPeriodKey(feature, at);
  const row = await db.getFirstAsync<Pick<AiUsageRow, 'request_count'>>(
    'SELECT request_count FROM ai_usage WHERE feature = ? AND period_key = ?',
    feature,
    key,
  );
  return row?.request_count ?? 0;
  });
}

export async function recordAiUsage(
  feature: AiFeature,
  promptHash: string,
  at = new Date(),
): Promise<void> {
  await withAiUsageTable(async (db) => {
  const key = getQuotaPeriodKey(feature, at);
  const nowIso = at.toISOString();

  const existing = await db.getFirstAsync<AiUsageRow>(
    'SELECT * FROM ai_usage WHERE feature = ? AND period_key = ?',
    feature,
    key,
  );

  if (existing) {
    await db.runAsync(
      `UPDATE ai_usage SET
        request_count = request_count + 1,
        last_request_at = ?,
        last_prompt_hash = ?
      WHERE id = ?`,
      nowIso,
      promptHash,
      existing.id,
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO ai_usage (id, feature, period_key, request_count, last_request_at, last_prompt_hash)
     VALUES (?, ?, ?, 1, ?, ?)`,
    createId(),
    feature,
    key,
    nowIso,
    promptHash,
  );
  });
}
