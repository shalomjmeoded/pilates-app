export const MIGRATION_004 = `
CREATE TABLE IF NOT EXISTS settings_audit_log (
  id TEXT PRIMARY KEY,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  setting_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT
);
CREATE INDEX IF NOT EXISTS idx_settings_audit_at ON settings_audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_settings_audit_key ON settings_audit_log(setting_key);
`;
