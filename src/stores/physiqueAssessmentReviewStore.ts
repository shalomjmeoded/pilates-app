import { create } from 'zustand';

import type { AiPhysiqueAssessment } from '@/types/ai';

interface PhysiqueAssessmentReviewState {
  assessment: AiPhysiqueAssessment | null;
  disclaimerAcceptedAt: string;
  notes: string;
  setPendingReview: (input: {
    assessment: AiPhysiqueAssessment;
    disclaimerAcceptedAt: string;
    notes?: string;
  }) => void;
  clear: () => void;
}

export const usePhysiqueAssessmentReviewStore = create<PhysiqueAssessmentReviewState>((set) => ({
  assessment: null,
  disclaimerAcceptedAt: '',
  notes: '',
  setPendingReview: (input) =>
    set({
      assessment: input.assessment,
      disclaimerAcceptedAt: input.disclaimerAcceptedAt,
      notes: input.notes ?? '',
    }),
  clear: () =>
    set({
      assessment: null,
      disclaimerAcceptedAt: '',
      notes: '',
    }),
}));
