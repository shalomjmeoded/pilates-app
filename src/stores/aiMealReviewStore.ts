import { create } from 'zustand';

import type { AiMealEstimateSource } from '@/engines/nutrition/mealTextEstimateFlow';
import type { AiMealEstimate } from '@/types/ai';

interface AiMealReviewState {
  estimate: AiMealEstimate | null;
  originalDescription: string;
  mealDate: string;
  source: AiMealEstimateSource;
  setPendingReview: (input: {
    estimate: AiMealEstimate;
    originalDescription: string;
    mealDate: string;
    source?: AiMealEstimateSource;
  }) => void;
  clear: () => void;
}

export const useAiMealReviewStore = create<AiMealReviewState>((set) => ({
  estimate: null,
  originalDescription: '',
  mealDate: '',
  source: 'ai_text',
  setPendingReview: (input) =>
    set({
      estimate: input.estimate,
      originalDescription: input.originalDescription,
      mealDate: input.mealDate,
      source: input.source ?? 'ai_text',
    }),
  clear: () =>
    set({
      estimate: null,
      originalDescription: '',
      mealDate: '',
      source: 'ai_text',
    }),
}));
