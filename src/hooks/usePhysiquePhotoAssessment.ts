import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { PHYSIQUE_PHOTO_AI_DISCLOSURE } from '@/constants/compliance';
import { MealPhotoTooLargeError } from '@/engines/nutrition/mealPhotoCompression';
import { runPhysiqueAssessment } from '@/services/physique/physiqueAssessmentService';
import { AiProxyError } from '@/services/ai/aiProxyClient';
import { compressPhysiquePhotoForUpload } from '@/services/physique/compressPhysiquePhoto';
import { usePhysiqueAssessmentReviewStore } from '@/stores/physiqueAssessmentReviewStore';
import type { PhysiquePhotoAngle, PhysiquePhotos } from '@/types/physiqueAssessment';
import { confirmThirdPartyAiUse } from '@/utils/confirmThirdPartyAiUse';

const EMPTY_PHOTOS: PhysiquePhotos = {
  front: null,
  side: null,
  back: null,
};

async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Camera permission is required.');
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true });
    return result.canceled || !result.assets[0]?.uri ? null : result.assets[0].uri;
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: true,
  });
  return result.canceled || !result.assets[0]?.uri ? null : result.assets[0].uri;
}

export function usePhysiquePhotoAssessment(disclaimerAcceptedAt: string) {
  const router = useRouter();
  const setPendingReview = usePhysiqueAssessmentReviewStore((state) => state.setPendingReview);

  const [photos, setPhotos] = useState<PhysiquePhotos>(EMPTY_PHOTOS);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  const selectPhoto = useCallback(
    async (angle: PhysiquePhotoAngle, source: 'camera' | 'library') => {
      setError(null);
      try {
        const uri = await pickImage(source);
        if (!uri) {
          return;
        }
        setPhotos((current) => ({ ...current, [angle]: uri }));
      } catch (pickError) {
        setError(pickError instanceof Error ? pickError.message : 'Could not open photo picker.');
      }
    },
    [],
  );

  const clearPhoto = useCallback((angle: PhysiquePhotoAngle) => {
    setPhotos((current) => ({ ...current, [angle]: null }));
  }, []);

  const assess = useCallback(async () => {
    if (!disclaimerAcceptedAt) {
      setError('Accept the disclaimer before uploading photos.');
      return;
    }

    if (!photos.front) {
      setError('A front photo is required.');
      return;
    }

    const accepted = await confirmThirdPartyAiUse({
      title: 'Send photos to AI?',
      message: PHYSIQUE_PHOTO_AI_DISCLOSURE,
    });

    if (!accepted) {
      return;
    }

    setIsAssessing(true);
    setError(null);

    try {
      const [frontImageBase64, sideImageBase64, backImageBase64] = await Promise.all([
        compressPhysiquePhotoForUpload(photos.front),
        photos.side ? compressPhysiquePhotoForUpload(photos.side) : Promise.resolve(undefined),
        photos.back ? compressPhysiquePhotoForUpload(photos.back) : Promise.resolve(undefined),
      ]);

      const result = await runPhysiqueAssessment({
        frontImageBase64,
        sideImageBase64,
        backImageBase64,
        notes: notes.trim() || undefined,
      });

      setPendingReview({
        assessment: result,
        disclaimerAcceptedAt,
        notes: notes.trim() || undefined,
      });
      router.push('/(tabs)/progress/physique-assessment-review');
    } catch (assessError) {
      if (assessError instanceof MealPhotoTooLargeError) {
        setError(assessError.message);
        return;
      }
      if (assessError instanceof AiProxyError && assessError.code === 'UNAUTHORIZED') {
        setError('Visual physique assessment requires BetterMe Premium.');
        return;
      }
      if (assessError instanceof AiProxyError && assessError.code === 'RATE_LIMITED') {
        setError('Monthly physique assessment limit reached. Try again next month.');
        return;
      }
      setError(
        assessError instanceof Error
          ? assessError.message
          : 'Could not complete physique assessment.',
      );
    } finally {
      setIsAssessing(false);
    }
  }, [disclaimerAcceptedAt, notes, photos, router, setPendingReview]);

  return {
    photos,
    notes,
    setNotes,
    error,
    isAssessing,
    selectPhoto,
    clearPhoto,
    assess,
  };
}
