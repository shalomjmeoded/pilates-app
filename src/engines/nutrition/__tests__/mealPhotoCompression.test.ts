import {
  assertPhotoWithinUploadLimit,
  getBase64ByteLength,
  isPhotoWithinUploadLimit,
  MAX_MEAL_PHOTO_BYTES,
  MealPhotoTooLargeError,
  stripDataUriPrefix,
  toJpegDataUri,
} from '../mealPhotoCompression';

describe('mealPhotoCompression', () => {
  it('calculates decoded base64 byte length', () => {
    const encoded = Buffer.from('meal-photo').toString('base64');
    expect(getBase64ByteLength(encoded)).toBe('meal-photo'.length);
    expect(getBase64ByteLength(toJpegDataUri(encoded))).toBe('meal-photo'.length);
  });

  it('strips data uri prefix', () => {
    expect(stripDataUriPrefix('data:image/jpeg;base64,abc')).toBe('abc');
  });

  it('accepts images within upload limit', () => {
    const ok = Buffer.alloc(1024, 1).toString('base64');
    expect(isPhotoWithinUploadLimit(ok)).toBe(true);
    expect(() => assertPhotoWithinUploadLimit(ok)).not.toThrow();
  });

  it('rejects images above upload limit', () => {
    const oversized = Buffer.alloc(MAX_MEAL_PHOTO_BYTES + 1, 1).toString('base64');
    expect(isPhotoWithinUploadLimit(oversized)).toBe(false);
    expect(() => assertPhotoWithinUploadLimit(oversized)).toThrow(MealPhotoTooLargeError);
  });
});
