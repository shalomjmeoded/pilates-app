import { getDatabase } from '@/db/connection';
import type { Reminder, ReminderType } from '@/types/settings';
import { REMINDER_LABELS } from '@/types/settings';

interface ReminderRow {
  id: string;
  type: ReminderType;
  enabled: number;
  hour: number;
  minute: number;
}

const DEFAULT_REMINDERS: Array<Omit<Reminder, 'id'>> = [
  { type: 'breakfast', enabled: false, hour: 8, minute: 0 },
  { type: 'lunch', enabled: false, hour: 12, minute: 30 },
  { type: 'dinner', enabled: false, hour: 18, minute: 30 },
  { type: 'workout', enabled: false, hour: 7, minute: 0 },
  { type: 'coaching_tip', enabled: false, hour: 20, minute: 0 },
];

function mapReminderRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    type: row.type,
    enabled: row.enabled === 1,
    hour: row.hour,
    minute: row.minute,
  };
}

export async function ensureDefaultReminders(): Promise<void> {
  const db = await getDatabase();
  const count = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM reminders',
  );

  if ((count?.total ?? 0) > 0) {
    return;
  }

  for (const reminder of DEFAULT_REMINDERS) {
    await db.runAsync(
      'INSERT INTO reminders (id, type, enabled, hour, minute) VALUES (?, ?, ?, ?, ?)',
      `reminder_${reminder.type}`,
      reminder.type,
      reminder.enabled ? 1 : 0,
      reminder.hour,
      reminder.minute,
    );
  }
}

export async function getReminders(): Promise<Reminder[]> {
  await ensureDefaultReminders();
  const db = await getDatabase();
  const rows = await db.getAllAsync<ReminderRow>(
    `SELECT * FROM reminders ORDER BY CASE type
      WHEN 'breakfast' THEN 1
      WHEN 'lunch' THEN 2
      WHEN 'dinner' THEN 3
      WHEN 'workout' THEN 4
      ELSE 5 END`,
  );
  return rows.map(mapReminderRow);
}

export async function updateReminder(
  type: ReminderType,
  patch: Partial<Pick<Reminder, 'enabled' | 'hour' | 'minute'>>,
): Promise<Reminder | null> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<ReminderRow>(
    'SELECT * FROM reminders WHERE type = ?',
    type,
  );

  if (!existing) {
    return null;
  }

  const enabled = patch.enabled !== undefined ? (patch.enabled ? 1 : 0) : existing.enabled;
  const hour = patch.hour ?? existing.hour;
  const minute = patch.minute ?? existing.minute;

  await db.runAsync(
    'UPDATE reminders SET enabled = ?, hour = ?, minute = ? WHERE type = ?',
    enabled,
    hour,
    minute,
    type,
  );

  return {
    id: existing.id,
    type: existing.type,
    enabled: enabled === 1,
    hour,
    minute,
  };
}

export function getReminderLabel(type: ReminderType): string {
  return REMINDER_LABELS[type];
}
