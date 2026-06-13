export const MIGRATION_012 = `
CREATE TABLE IF NOT EXISTS workout_change_feedback (
  id TEXT PRIMARY KEY NOT NULL,
  week_start TEXT NOT NULL UNIQUE,
  source_date TEXT NOT NULL,
  focus_area TEXT NOT NULL CHECK (focus_area IN ('core', 'glutes', 'posture', 'mobility', 'full_body')),
  target_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('lighter', 'balanced', 'challenging')),
  coach_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_workout_change_feedback_week_start
ON workout_change_feedback(week_start DESC);
`;
