import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  buildManualFallbackParams,
  shouldFallbackToManual,
} from '@/engines/nutrition/mealTextEstimateFlow';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { aiFacade } from '@/services/ai';
import { AiProxyError } from '@/services/ai/aiProxyClient';
import { useAiMealReviewStore } from '@/stores/aiMealReviewStore';

export function useMealTextEstimate(mealDate: string) {
  const router = useRouter();
  const setPendingReview = useAiMealReviewStore((state) => state.setPendingReview);

  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const openManualFallback = useCallback(
    (text: string) => {
      router.replace({
        pathname: '/(tabs)/nutrition/add-manual',
        params: buildManualFallbackParams(mealDate, text),
      });
    },
    [mealDate, router],
  );

  const estimate = useCallback(async () => {
    const trimmed = description.trim();
    if (!trimmed) {
      setError('Describe your meal so AI can estimate macros.');
      return;
    }

    setIsEstimating(true);
    setError(null);

    try {
      const premium = await getPremiumStatus();
      if (!premium.isPremium) {
        setError('AI meal estimates require BetterMe Premium.');
        return;
      }

      const result = await aiFacade.estimateMealFromText(trimmed);
      setPendingReview({
        estimate: result,
        originalDescription: trimmed,
        mealDate,
        source: 'ai_text',
      });
      router.push({
        pathname: '/(tabs)/nutrition/review-ai-meal',
        params: { mealDate },
      });
    } catch (estimateError) {
      if (estimateError instanceof AiProxyError && estimateError.code === 'UNAUTHORIZED') {
        setError('AI meal estimates require BetterMe Premium.');
        return;
      }

      setError(
        estimateError instanceof Error
          ? estimateError.message
          : 'Could not estimate this meal.',
      );

      if (shouldFallbackToManual(estimateError)) {
        openManualFallback(trimmed);
      }
    } finally {
      setIsEstimating(false);
    }
  }, [description, mealDate, openManualFallback, router, setPendingReview]);

  return {
    description,
    setDescription,
    error,
    isEstimating,
    estimate,
    openManualFallback: () => openManualFallback(description),
  };
}
