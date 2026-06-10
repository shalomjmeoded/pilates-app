import * as ImageManipulator from 'expo-image-manipulator';

import {
  assertPhotoWithinUploadLimit,
  MEAL_PHOTO_JPEG_QUALITY,
  MEAL_PHOTO_MAX_DIMENSION,
  MealPhotoTooLargeError,
  toJpegDataUri,
} from '@/engines/nutrition/mealPhotoCompression';

const FALLBACK_QUALITIES = [0.6, 0.45] as const;

async function manipulateToBase64(
  uri: string,
  quality: number,
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MEAL_PHOTO_MAX_DIMENSION } }],
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

export async function compressMealPhotoForUpload(uri: string): Promise<string> {
  let compressed = await manipulateToBase64(uri, MEAL_PHOTO_JPEG_QUALITY);

  if (!compressed) {
    throw new Error('Could not compress the selected photo.');
  }

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
        if (!(error instanceof MealPhotoTooLargeError)) {
          throw error;
        }
      }
    }
  }

  throw new MealPhotoTooLargeError();
}
