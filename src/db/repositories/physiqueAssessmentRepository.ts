import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import type { StoredPhysiqueAssessment } from '@/types/physiqueAssessment';

interface PhysiqueAssessmentRow {
  id: string;
  assessed_at: string;
  physique_category: string;
  body_fat_min_percent: number;
  body_fat_max_percent: number;
  confidence: string;
  nutrition_suggestion: string;
  workout_suggestion: string;
  notes: string | null;
  disclaimer_accepted_at: string;
}

function mapRow(row: PhysiqueAssessmentRow): StoredPhysiqueAssessment {
  return {
    id: row.id,
    assessedAt: row.assessed_at,
    physiqueCategory: row.physique_category as StoredPhysiqueAssessment['physiqueCategory'],
    estimatedBodyFatRange: {
      minPercent: row.body_fat_min_percent,
      maxPercent: row.body_fat_max_percent,
    },
    confidence: row.confidence as StoredPhysiqueAssessment['confidence'],
    nutritionAdjustmentSuggestion: row.nutrition_suggestion,
    workoutFocusSuggestion: row.workout_suggestion,
    notes: row.notes ?? undefined,
    disclaimerAcceptedAt: row.disclaimer_accepted_at,
  };
}

export async function getLatestPhysiqueAssessment(): Promise<StoredPhysiqueAssessment | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PhysiqueAssessmentRow>(
    'SELECT * FROM physique_assessments ORDER BY assessed_at DESC LIMIT 1',
  );
  return row ? mapRow(row) : null;
}

export async function insertPhysiqueAssessment(
  assessment: Omit<StoredPhysiqueAssessment, 'id'>,
): Promise<StoredPhysiqueAssessment> {
  const db = await getDatabase();
  const id = createId();

  await db.runAsync(
    `INSERT INTO physique_assessments (
      id, assessed_at, physique_category, body_fat_min_percent, body_fat_max_percent,
      confidence, nutrition_suggestion, workout_suggestion, notes, disclaimer_accepted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    assessment.assessedAt,
    assessment.physiqueCategory,
    assessment.estimatedBodyFatRange.minPercent,
    assessment.estimatedBodyFatRange.maxPercent,
    assessment.confidence,
    assessment.nutritionAdjustmentSuggestion,
    assessment.workoutFocusSuggestion,
    assessment.notes ?? null,
    assessment.disclaimerAcceptedAt,
  );

  return { id, ...assessment };
}

export async function deletePhysiqueAssessment(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM physique_assessments WHERE id = ?', id);
}
