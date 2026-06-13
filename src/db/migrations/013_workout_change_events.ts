export const MIGRATION_013 = `
CREATE TABLE IF NOT EXISTS workout_change_events (
  id TEXT PRIMARY KEY NOT NULL,
  event_date TEXT NOT NULL,
  plan_date TEXT NOT NULL,
  focus_area TEXT NOT NULL CHECK (focus_area IN ('core', 'glutes', 'posture', 'mobility', 'full_body')),
  target_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('lighter', 'balanced', 'challenging')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_workout_change_events_date
ON workout_change_events(event_date DESC);
`;
