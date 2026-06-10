/** Matches server MAX_IMAGE_BYTES (3 MB decoded). */
export const MAX_MEAL_PHOTO_BYTES = 3 * 1024 * 1024;

export const MEAL_PHOTO_MAX_DIMENSION = 1280;
export const MEAL_PHOTO_JPEG_QUALITY = 0.72;

export class MealPhotoTooLargeError extends Error {
  constructor(message = 'Photo is too large. Try a simpler photo or use text estimate.') {
    super(message);
    this.name = 'MealPhotoTooLargeError';
  }
}

export function stripDataUriPrefix(base64: string): string {
  return base64.replace(/^data:image\/\w+;base64,/, '').trim();
}

export function getBase64ByteLength(base64: string): number {
  const normalized = stripDataUriPrefix(base64);
  if (!normalized) {
    return 0;
  }

  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

export function isPhotoWithinUploadLimit(base64: string): boolean {
  return getBase64ByteLength(base64) <= MAX_MEAL_PHOTO_BYTES;
}

export function assertPhotoWithinUploadLimit(base64: string): void {
  if (!isPhotoWithinUploadLimit(base64)) {
    throw new MealPhotoTooLargeError();
  }
}

export function toJpegDataUri(base64: string): string {
  const normalized = stripDataUriPrefix(base64);
  return `data:image/jpeg;base64,${normalized}`;
}
