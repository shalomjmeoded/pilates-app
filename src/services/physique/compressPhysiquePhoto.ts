import * as ImageManipulator from 'expo-image-manipulator';

import {
  assertPhotoWithinUploadLimit,
  MealPhotoTooLargeError,
  toJpegDataUri,
} from '@/engines/nutrition/mealPhotoCompression';

/** Higher resolution than meal photos — physique estimation needs muscle-definition detail. */
const PHYSIQUE_PHOTO_MAX_DIMENSION = 1600;
const PHYSIQUE_PHOTO_JPEG_QUALITY = 0.84;
const FALLBACK_QUALITIES = [0.72, 0.6] as const;

async function manipulateToBase64(uri: string, quality: number): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: PHYSIQUE_PHOTO_MAX_DIMENSION } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!result.base64) {
    throw new Error('Could not read the selected photo.');
  }

  return toJpegDataUri(result.base64);
}

export async function compressPhysiquePhotoForUpload(uri: string): Promise<string> {
  let compressed = await manipulateToBase64(uri, PHYSIQUE_PHOTO_JPEG_QUALITY);

  try {
    assertPhotoWithinUploadLimit(compressed);
    return compressed;
  } catch {
    for (const quality of FALLBACK_QUALITIES) {
      compressed = await manipulateToBase64(uri, quality);
      try {
        assertPhotoWithinUploadLimit(compressed);
        return compressed;
      } catch (error) {
        if (error instanceof MealPhotoTooLargeError) {
          continue;
        }
        throw error;
      }
    }
  }

  throw new MealPhotoTooLargeError(
    'Photo is too large. Try a closer crop or use fewer angles.',
  );
}
