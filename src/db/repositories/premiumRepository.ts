import { getDatabase } from '@/db/connection';
import { mapPremiumStatusRow } from '@/db/mappers';
import type { PremiumStatus } from '@/types/premium';

interface PremiumStatusRow {
  is_premium: number;
  product_id: string | null;
  expires_at: string | null;
  trial_used: number;
  source: 'mock' | 'revenuecat';
}

export async function getPremiumStatus(): Promise<PremiumStatus> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PremiumStatusRow>(
    'SELECT is_premium, product_id, expires_at, trial_used, source FROM premium_status WHERE id = 1',
  );

  if (!row) {
    return {
      subscriptionStatus: 'inactive',
      isPremium: false,
      trialUsed: false,
      source: 'mock',
    };
  }

  return mapPremiumStatusRow(row);
}

export async function ensurePremiumStatusRow(): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM premium_status WHERE id = 1');

  if (!row) {
    await db.runAsync(
      'INSERT INTO premium_status (id, is_premium, trial_used, source) VALUES (1, 0, 0, ?)',
      'mock',
    );
  }
}

export async function setMockPremiumStatus(status: PremiumStatus): Promise<void> {
  const db = await getDatabase();
  await ensurePremiumStatusRow();

  await db.runAsync(
    `UPDATE premium_status SET
      is_premium = ?,
      product_id = ?,
      expires_at = ?,
      trial_used = ?,
      source = ?
    WHERE id = 1`,
    status.isPremium ? 1 : 0,
    status.productId ?? null,
    status.expiresAt ?? null,
    status.trialUsed ? 1 : 0,
    status.source,
  );
}
