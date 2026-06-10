/** Max decoded image bytes (3 MB). */
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export function getBase64DecodedByteLength(base64: string): number {
  const normalized = base64.replace(/^data:image\/\w+;base64,/, '').trim();
  if (!normalized) {
    return 0;
  }

  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

export function isImageWithinLimit(base64: string, maxBytes = MAX_IMAGE_BYTES): boolean {
  return getBase64DecodedByteLength(base64) <= maxBytes;
}
