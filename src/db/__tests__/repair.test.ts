import {
  REPAIRABLE_DDL_STATEMENTS,
  REPAIRABLE_MIGRATION_SQL,
  REPAIRABLE_TABLES,
} from '@/db/migrations/repair';

describe('database repair SQL', () => {
  it('creates ai_usage and physique_assessments', () => {
    expect(REPAIRABLE_TABLES).toContain('ai_usage');
    expect(REPAIRABLE_TABLES).toContain('physique_assessments');
    expect(REPAIRABLE_DDL_STATEMENTS.join('\n')).toContain('CREATE TABLE IF NOT EXISTS ai_usage');
    expect(REPAIRABLE_DDL_STATEMENTS.join('\n')).toContain(
      'CREATE TABLE IF NOT EXISTS physique_assessments',
    );
    expect(REPAIRABLE_MIGRATION_SQL).toContain('ai_usage');
  });
});
