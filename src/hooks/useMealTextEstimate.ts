import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { buildManualFallbackParams } from '@/engines/nutrition/mealTextEstimateFlow';
import {
  isMealEstimateRecoverableError,
  mealEstimateErrorMessage,
} from '@/engines/nutrition/mealEstimateErrors';
import { reconcileMealEstimate } from '@/engines/nutrition/reconcileMealEstimate';
import { aiFacade } from '@/services/ai';
import { AiProxyError } from '@/services/ai/aiProxyClient';
import { captureProductEvent } from '@/services/analytics/analyticsCore';
import { getCurrentPremiumStatus } from '@/services/monetization/currentPremiumStatus';
import { useAiMealReviewStore } from '@/stores/aiMealReviewStore';

export function useMealTextEstimate(mealDate: string) {
  const router = useRouter();
  const setPendingReview = useAiMealReviewStore((state) => state.setPendingReview);

  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showManualFallbackCta, setShowManualFallbackCta] = useState(false);
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
    setShowManualFallbackCta(false);

    try {
      const premium = await getCurrentPremiumStatus();
      if (!premium.isPremium) {
        setError('AI meal estimates require Pilates at Home Premium.');
        return;
      }

      const result = await aiFacade.estimateMealFromText(trimmed);
      const { estimate: reconciled } = reconcileMealEstimate(result);
      captureProductEvent('meal_text_estimated');
      setPendingReview({
        estimate: reconciled,
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
        setError('AI meal estimates require Pilates at Home Premium.');
        setShowManualFallbackCta(false);
        return;
      }

      setError(
        mealEstimateErrorMessage(estimateError, 'Could not estimate this meal.'),
      );
      setShowManualFallbackCta(isMealEstimateRecoverableError(estimateError));

    } finally {
      setIsEstimating(false);
    }
  }, [description, mealDate, router, setPendingReview]);

  return {
    description,
    setDescription,
    error,
    showManualFallbackCta,
    isEstimating,
    estimate,
    openManualFallback: () => openManualFallback(description),
  };
}
