import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import { isDuplicateTimestamp, validateWeightKg } from '@/engines/progress';
import { updateProfileWeight } from '@/db/repositories/profileRepository';
import type { WeightLog, WeightLogInput } from '@/types/progress';

interface WeightLogRow {
  id: string;
  logged_at: string;
  weight_kg: number;
  note: string | null;
}

function mapWeightLogRow(row: WeightLogRow): WeightLog {
  return {
    id: row.id,
    loggedAt: row.logged_at,
    weightKg: row.weight_kg,
    note: row.note ?? undefined,
  };
}

export async function getAllWeightLogs(): Promise<WeightLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WeightLogRow>(
    'SELECT * FROM weight_logs ORDER BY logged_at ASC',
  );
  return rows.map(mapWeightLogRow);
}

export async function getWeightLogTimestamps(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ logged_at: string }>(
    'SELECT logged_at FROM weight_logs ORDER BY logged_at ASC',
  );
  return rows.map((row) => row.logged_at);
}

export async function countWeightLogs(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM weight_logs',
  );
  return row?.count ?? 0;
}

export async function countWeightLogDaysInLast(days: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT date(logged_at)) as count
     FROM weight_logs
     WHERE logged_at >= datetime('now', ?)`,
    `-${days} days`,
  );
  return row?.count ?? 0;
}

export async function getWeightLogById(id: string): Promise<WeightLog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WeightLogRow>('SELECT * FROM weight_logs WHERE id = ?', id);
  return row ? mapWeightLogRow(row) : null;
}

export async function searchWeightLogs(query: string): Promise<WeightLog[]> {
  const db = await getDatabase();
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return getAllWeightLogs();
  }

  const rows = await db.getAllAsync<WeightLogRow>(
    `SELECT * FROM weight_logs
     WHERE lower(note) LIKE ? OR CAST(weight_kg AS TEXT) LIKE ?
     ORDER BY logged_at DESC`,
    `%${trimmed}%`,
    `%${trimmed}%`,
  );
  return rows.map(mapWeightLogRow);
}

export async function updateWeightLog(
  id: string,
  input: WeightLogInput,
): Promise<WeightLog> {
  const validation = validateWeightKg(input.weightKg);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  const existing = await getWeightLogById(id);
  if (!existing) {
    throw new Error('Weight entry not found.');
  }

  const loggedAt = input.loggedAt ?? existing.loggedAt;
  const timestamps = (await getWeightLogTimestamps()).filter((stamp) => stamp !== existing.loggedAt);
  if (isDuplicateTimestamp(loggedAt, timestamps)) {
    throw new Error('A weight entry was already logged at this time.');
  }

  const db = await getDatabase();
  const note = input.note?.trim() || null;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE weight_logs SET logged_at = ?, weight_kg = ?, note = ? WHERE id = ?',
      loggedAt,
      input.weightKg,
      note,
      id,
    );
  });

  const latest = await getAllWeightLogs();
  const newest = latest[latest.length - 1];
  if (newest?.id === id) {
    await updateProfileWeight(input.weightKg);
  }

  return {
    id,
    loggedAt,
    weightKg: input.weightKg,
    note: note ?? undefined,
  };
}

export async function deleteWeightLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM weight_logs WHERE id = ?', id);
  });

  const remaining = await getAllWeightLogs();
  if (remaining.length > 0) {
    await updateProfileWeight(remaining[remaining.length - 1].weightKg);
  }
}

export async function saveWeightLog(input: WeightLogInput): Promise<WeightLog> {
  const validation = validateWeightKg(input.weightKg);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  const loggedAt = input.loggedAt ?? new Date().toISOString();
  const existingTimestamps = await getWeightLogTimestamps();

  if (isDuplicateTimestamp(loggedAt, existingTimestamps)) {
    throw new Error('A weight entry was already logged at this time. Wait a moment and try again.');
  }

  const db = await getDatabase();
  const id = createId();
  const note = input.note?.trim() || null;

  await db.runAsync(
    'INSERT INTO weight_logs (id, logged_at, weight_kg, note) VALUES (?, ?, ?, ?)',
    id,
    loggedAt,
    input.weightKg,
    note,
  );

  await updateProfileWeight(input.weightKg);

  return {
    id,
    loggedAt,
    weightKg: input.weightKg,
    note: note ?? undefined,
  };
}
