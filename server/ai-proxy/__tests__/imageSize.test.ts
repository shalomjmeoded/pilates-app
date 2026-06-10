import { getBase64DecodedByteLength, isImageWithinLimit, MAX_IMAGE_BYTES } from '../imageSize';

describe('imageSize', () => {
  it('calculates decoded base64 length', () => {
    const encoded = Buffer.from('hello').toString('base64');
    expect(getBase64DecodedByteLength(encoded)).toBe(5);
  });

  it('rejects images above max bytes', () => {
    const oversized = Buffer.alloc(MAX_IMAGE_BYTES + 1, 1).toString('base64');
    expect(isImageWithinLimit(oversized)).toBe(false);
  });

  it('accepts images within max bytes', () => {
    const ok = Buffer.alloc(1024, 1).toString('base64');
    expect(isImageWithinLimit(ok)).toBe(true);
  });
});
