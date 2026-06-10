import { MIGRATION_010 } from '../010_ai_usage';
import { MIGRATIONS } from '../index';

describe('ai_usage migration', () => {
  it('creates ai_usage rate-limit table', () => {
    expect(MIGRATION_010).toContain('CREATE TABLE IF NOT EXISTS ai_usage');
    expect(MIGRATION_010).toContain('period_key');
    expect(MIGRATION_010).toContain('request_count');
    expect(MIGRATION_010).not.toContain('ai_usage_log');
  });

  it('is registered as migration version 10', () => {
    const migration = MIGRATIONS.find((item) => item.version === 10);
    expect(migration).toBeDefined();
    expect(migration?.sql).toContain('ai_usage');
  });
});
