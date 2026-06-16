import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  buildMealInputFromAiReview,
  type ReviewedMealFields,
} from '@/engines/nutrition/mealTextEstimateFlow';
import { parseMealNumber, validateMealInput } from '@/engines/nutrition';
import { saveReviewedAiMeal } from '@/engines/nutrition/saveReviewedAiMeal';
import type { AiMealEstimate } from '@/types/ai';
import { useAiMealReviewStore } from '@/stores/aiMealReviewStore';

export function useSaveReviewedAiMeal(mealDate: string, estimate: AiMealEstimate | null) {
  const router = useRouter();
  const clear = useAiMealReviewStore((state) => state.clear);
  const estimateSource = useAiMealReviewStore((state) => state.source);

  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (fields: ReviewedMealFields, saveToLibrary: boolean) => {
      if (!estimate) {
        return false;
      }

      const input = buildMealInputFromAiReview(estimate, fields, mealDate, estimateSource);
      const validation = validateMealInput(input);
      if (!validation.valid) {
        setErrors(validation.errors);
        return false;
      }

      setIsSaving(true);
      setErrors([]);

      try {
        await saveReviewedAiMeal({ meal: input, saveToLibrary });
        clear();
        router.dismissAll();
        router.navigate({
          pathname: '/(tabs)/nutrition',
          params: { mealDate },
        });
        return true;
      } catch (saveError) {
        setErrors([
          saveError instanceof Error ? saveError.message : 'Could not save meal.',
        ]);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [clear, estimate, estimateSource, mealDate, router],
  );

  return {
    save,
    errors,
    isSaving,
    parseField: parseMealNumber,
  };
}
