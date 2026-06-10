import { REPAIRABLE_DDL_STATEMENTS, REPAIRABLE_TABLES } from '@/db/migrations/repair';

describe('ensureAiSchema DDL', () => {
  it('uses standalone execAsync-friendly statements for each AI table', () => {
    const joined = REPAIRABLE_DDL_STATEMENTS.join('\n');
    for (const table of REPAIRABLE_TABLES) {
      expect(joined).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
    expect(REPAIRABLE_DDL_STATEMENTS.every((statement) => !statement.trim().endsWith(';'))).toBe(
      true,
    );
  });
});
