import type { AiPhysiqueAssessment } from '@/types/ai';
import type {
  PhysiqueCategory,
  PhysiqueConfidence,
  StoredPhysiqueAssessment,
} from '@/types/physiqueAssessment';

export const PHYSIQUE_DISCLAIMER_COPY =
  'Visual physique assessment is experimental and may be inaccurate. It is not a medical measurement.';

export const PHYSIQUE_EXPERIMENTAL_NOTE =
  'Experimental visual estimate — when saved, it informs calories, protein, and workout selection.';

const CATEGORY_LABELS: Record<PhysiqueCategory, string> = {
  lean: 'Lean',
  average: 'Average',
  athletic: 'Athletic',
  higher_body_fat: 'Higher body fat',
};

const CONFIDENCE_LABELS: Record<PhysiqueConfidence, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
};

export function formatPhysiqueCategory(category: PhysiqueCategory): string {
  return CATEGORY_LABELS[category];
}

export function formatPhysiqueConfidence(confidence: PhysiqueConfidence): string {
  return CONFIDENCE_LABELS[confidence];
}

export function formatBodyFatRange(range: { minPercent: number; maxPercent: number }): string {
  return `${range.minPercent}–${range.maxPercent}%`;
}

export function buildStoredPhysiqueAssessment(
  assessment: AiPhysiqueAssessment,
  disclaimerAcceptedAt: string,
  notes?: string,
): Omit<StoredPhysiqueAssessment, 'id'> {
  return {
    assessedAt: new Date().toISOString(),
    physiqueCategory: assessment.physiqueCategory,
    estimatedBodyFatRange: assessment.estimatedBodyFatRange,
    confidence: assessment.confidence,
    nutritionAdjustmentSuggestion: assessment.nutritionAdjustmentSuggestion,
    workoutFocusSuggestion: assessment.workoutFocusSuggestion,
    notes,
    disclaimerAcceptedAt,
  };
}
