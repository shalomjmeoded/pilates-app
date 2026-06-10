import { MIGRATION_001 } from './001_initial';
import { MIGRATION_002 } from './002_nutrition_daily_totals';
import { MIGRATION_003 } from './003_progress_future';
import { MIGRATION_004 } from './004_settings_audit';
import { MIGRATION_005 } from './005_phase7_hardening';
import { MIGRATION_006 } from './006_app_preferences';
import { MIGRATION_007 } from './007_exercise_library_v2';
import { MIGRATION_008 } from './008_free_exercise_db_library';
import { MIGRATION_009 } from './009_exercise_session_role';
import { MIGRATION_010 } from './010_ai_usage';
import { MIGRATION_011 } from './011_physique_assessments';

export const MIGRATIONS: Array<{ version: number; sql: string }> = [
  { version: 1, sql: MIGRATION_001 },
  { version: 2, sql: MIGRATION_002 },
  { version: 3, sql: MIGRATION_003 },
  { version: 4, sql: MIGRATION_004 },
  { version: 5, sql: MIGRATION_005 },
  { version: 6, sql: MIGRATION_006 },
  { version: 7, sql: MIGRATION_007 },
  { version: 8, sql: MIGRATION_008 },
  { version: 9, sql: MIGRATION_009 },
  { version: 10, sql: MIGRATION_010 },
  { version: 11, sql: MIGRATION_011 },
];
