export const MIGRATION_005 = `
CREATE TABLE IF NOT EXISTS saved_meals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  calories REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL,
  fiber_g REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coaching_insights (
  id TEXT PRIMARY KEY,
  insight_date TEXT NOT NULL UNIQUE,
  daily_tip TEXT NOT NULL,
  weekly_insight TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE workout_sessions ADD COLUMN current_exercise_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workout_sessions ADD COLUMN elapsed_seconds INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_meals_logged_at ON meals(logged_at);
CREATE INDEX IF NOT EXISTS idx_meals_date_logged ON meals(meal_date, logged_at);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status_ended ON workout_sessions(status, ended_at);
CREATE INDEX IF NOT EXISTS idx_workout_plans_date ON workout_plans(plan_date);
`;
