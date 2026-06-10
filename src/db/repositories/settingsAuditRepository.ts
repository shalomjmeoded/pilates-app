import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';

export async function logSettingChange(
  settingKey: string,
  oldValue: unknown,
  newValue: unknown,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO settings_audit_log (id, setting_key, old_value, new_value)
     VALUES (?, ?, ?, ?)`,
    createId(),
    settingKey,
    serializeAuditValue(oldValue),
    serializeAuditValue(newValue),
  );
}

function serializeAuditValue(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}
