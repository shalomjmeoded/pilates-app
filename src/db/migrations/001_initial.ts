export const MIGRATION_001 = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  gender_identity TEXT NOT NULL CHECK (gender_identity IN (
    'female', 'male', 'non_binary', 'prefer_not_to_say'
  )),
  birth_year INTEGER NOT NULL,
  height_cm REAL NOT NULL,
  current_weight_kg REAL NOT NULL,
  goal_weight_kg REAL NOT NULL,
  training_frequency TEXT NOT NULL,
  fitness_goal TEXT NOT NULL CHECK (fitness_goal IN (
    'get_toned', 'maintain', 'build_muscle'
  )),
  exercise_preferences TEXT NOT NULL,
  media_preference TEXT NOT NULL CHECK (media_preference IN (
    'video_streaming', 'static_only'
  )),
  nutrition_mode TEXT NOT NULL CHECK (nutrition_mode IN (
    'full_tracking', 'workouts_only'
  )),
  weight_trajectory TEXT NOT NULL,
  pace_kg_per_week REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS onboarding_answers (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  raw_json TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS exercise_library (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  reps_baseline INTEGER,
  hold_seconds INTEGER,
  calories_factor REAL NOT NULL,
  video_search_query TEXT NOT NULL,
  thumbnail_uri TEXT,
  tags TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY,
  plan_date TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'deterministic'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_plans_date ON workout_plans(plan_date);

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercise_library(id),
  sort_order INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER,
  hold_seconds INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES workout_plans(id),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('in_progress','completed','abandoned'))
);

CREATE TABLE IF NOT EXISTS workout_session_exercises (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercise_library(id),
  sort_order INTEGER NOT NULL,
  feedback TEXT CHECK (feedback IN ('completed','skipped','modified')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS nutrition_targets (
  id TEXT PRIMARY KEY,
  effective_date TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL,
  fiber_g REAL NOT NULL,
  is_manual_override INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_nutrition_targets_date ON nutrition_targets(effective_date);

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  meal_date TEXT NOT NULL,
  logged_at TEXT NOT NULL,
  title TEXT NOT NULL,
  calories REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL,
  fiber_g REAL NOT NULL,
  portion_multiplier REAL NOT NULL DEFAULT 1.0,
  source TEXT NOT NULL CHECK (source IN ('ai_photo','ai_text','manual')),
  ai_confidence REAL,
  ai_ingredients_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(meal_date);

CREATE TABLE IF NOT EXISTS weight_logs (
  id TEXT PRIMARY KEY,
  logged_at TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  note TEXT
);
CREATE INDEX IF NOT EXISTS idx_weight_logs_at ON weight_logs(logged_at);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'breakfast','lunch','dinner','workout','coaching_tip'
  )),
  enabled INTEGER NOT NULL DEFAULT 0,
  hour INTEGER NOT NULL,
  minute INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_outputs (
  id TEXT PRIMARY KEY,
  feature TEXT NOT NULL,
  request_hash TEXT,
  request_payload_json TEXT NOT NULL,
  response_json TEXT,
  model TEXT,
  success INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS premium_status (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  is_premium INTEGER NOT NULL DEFAULT 0,
  product_id TEXT,
  expires_at TEXT,
  trial_used INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'mock'
);
`;
