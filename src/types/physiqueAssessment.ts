export type PhysiqueCategory = 'lean' | 'average' | 'athletic' | 'higher_body_fat';

export type PhysiqueConfidence = 'low' | 'medium' | 'high';

export type PhysiquePhotoAngle = 'front' | 'side' | 'back';

export interface BodyFatRange {
  minPercent: number;
  maxPercent: number;
}

export interface StoredPhysiqueAssessment {
  id: string;
  assessedAt: string;
  physiqueCategory: PhysiqueCategory;
  estimatedBodyFatRange: BodyFatRange;
  confidence: PhysiqueConfidence;
  nutritionAdjustmentSuggestion: string;
  workoutFocusSuggestion: string;
  notes?: string;
  disclaimerAcceptedAt: string;
}

export type PhysiquePhotos = Record<PhysiquePhotoAngle, string | null>;
