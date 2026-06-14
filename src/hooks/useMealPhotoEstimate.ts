import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { MEAL_PHOTO_AI_DISCLOSURE } from '@/constants/compliance';
import {
  buildManualFallbackParams,
  shouldFallbackToManual,
} from '@/engines/nutrition/mealTextEstimateFlow';
import { MealPhotoTooLargeError } from '@/engines/nutrition/mealPhotoCompression';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { aiFacade } from '@/services/ai';
import { AiProxyError } from '@/services/ai/aiProxyClient';
import { compressMealPhotoForUpload } from '@/services/nutrition/compressMealPhoto';
import { useAiMealReviewStore } from '@/stores/aiMealReviewStore';
import { confirmThirdPartyAiUse } from '@/utils/confirmThirdPartyAiUse';

const PHOTO_MEAL_FALLBACK_TITLE = 'Photo meal';

async function pickImageFromCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Camera permission is required to take a meal photo.');
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 1,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

async function pickImageFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

export function useMealPhotoEstimate(mealDate: string) {
  const router = useRouter();
  const setPendingReview = useAiMealReviewStore((state) => state.setPendingReview);

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const openManualFallback = useCallback(() => {
    router.replace({
      pathname: '/(tabs)/nutrition/add-manual',
      params: buildManualFallbackParams(mealDate, PHOTO_MEAL_FALLBACK_TITLE),
    });
  }, [mealDate, router]);

  const estimateFromUri = useCallback(
    async (uri: string) => {
      setIsEstimating(true);
      setError(null);

      try {
        const premium = await getPremiumStatus();
        if (!premium.isPremium) {
          setError('AI photo estimates require BetterMe Premium.');
          return;
        }

        const imageBase64 = await compressMealPhotoForUpload(uri);
        const result = await aiFacade.estimateMealFromPhoto(imageBase64);

        setPendingReview({
          estimate: result,
          originalDescription: PHOTO_MEAL_FALLBACK_TITLE,
          mealDate,
          source: 'ai_photo',
        });
        router.push({
          pathname: '/(tabs)/nutrition/review-ai-meal',
          params: { mealDate },
        });
      } catch (estimateError) {
        if (estimateError instanceof MealPhotoTooLargeError) {
          setError(estimateError.message);
          return;
        }

        if (estimateError instanceof AiProxyError && estimateError.code === 'IMAGE_TOO_LARGE') {
          setError('Photo is too large for AI upload. Try a simpler photo or use text estimate.');
          return;
        }

        if (estimateError instanceof AiProxyError && estimateError.code === 'UNAUTHORIZED') {
          setError('AI photo estimates require BetterMe Premium.');
          return;
        }

        setError(
          estimateError instanceof Error
            ? estimateError.message
            : 'Could not estimate this meal from the photo.',
        );

        if (shouldFallbackToManual(estimateError)) {
          openManualFallback();
        }
      } finally {
        setIsEstimating(false);
      }
    },
    [mealDate, openManualFallback, router, setPendingReview],
  );

  const selectPhoto = useCallback(
    async (source: 'camera' | 'library') => {
      setError(null);
      try {
        const accepted = await confirmThirdPartyAiUse({
          title: 'Send photo to AI?',
          message: MEAL_PHOTO_AI_DISCLOSURE,
        });

        if (!accepted) {
          return;
        }

        const uri =
          source === 'camera' ? await pickImageFromCamera() : await pickImageFromLibrary();
        if (!uri) {
          return;
        }
        setPreviewUri(uri);
        await estimateFromUri(uri);
      } catch (pickError) {
        setError(pickError instanceof Error ? pickError.message : 'Could not open photo picker.');
      }
    },
    [estimateFromUri],
  );

  const estimateSelectedPhoto = useCallback(async () => {
    if (!previewUri) {
      setError('Choose or take a photo first.');
      return;
    }
    await estimateFromUri(previewUri);
  }, [estimateFromUri, previewUri]);

  return {
    previewUri,
    error,
    isEstimating,
    selectPhoto,
    estimateSelectedPhoto,
    openManualFallback,
  };
}
