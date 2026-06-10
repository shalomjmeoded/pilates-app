import { buildPhysiqueAssessmentGeminiParts } from '../../src/services/ai/physiqueAssessmentPrompt';

import { generateGeminiJson } from './gemini';
import { getBase64DecodedByteLength, isImageWithinLimit, MAX_IMAGE_BYTES } from './imageSize';
import { buildPrompt } from './prompts';
import { checkRateLimit, recordRateLimitUse } from './rateLimit';
import { isAiRoute, ROUTE_TO_FEATURE, type AiRoute } from './routes';
import type { AiFeature, AiProxyResponse, AiRouteRequest } from './types';

const MAX_TEXT_BODY_BYTES = 100 * 1024;
/** Room for 3 MB image base64 plus JSON envelope. */
const MAX_PHOTO_BODY_BYTES = 5 * 1024 * 1024;
/** Room for up to three compressed physique photos plus JSON envelope. */
const MAX_PHYSIQUE_BODY_BYTES = 14 * 1024 * 1024;

function promptFingerprint(feature: AiFeature, payload: Record<string, unknown>): string {
  if (feature === 'meal_text_estimate') {
    return String(payload.description ?? '');
  }
  if (feature === 'meal_photo_estimate') {
    const image = String(payload.imageBase64 ?? '');
    return `${image.slice(0, 128)}:${image.length}`;
  }
  if (feature === 'physique_assessment') {
    const angles = ['front', 'side', 'back'] as const;
    return angles
      .map((angle) => {
        const image = String(payload[`${angle}ImageBase64`] ?? '');
        return image ? `${angle}:${image.length}:${image.slice(0, 32)}` : '';
      })
      .filter(Boolean)
      .join('|');
  }
  return JSON.stringify(payload);
}

function maxBodyForFeature(feature: AiFeature): number {
  if (feature === 'physique_assessment') {
    return MAX_PHYSIQUE_BODY_BYTES;
  }
  if (feature === 'meal_photo_estimate') {
    return MAX_PHOTO_BODY_BYTES;
  }
  return MAX_TEXT_BODY_BYTES;
}

function parseRouteRequest(raw: string): AiRouteRequest | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AiRouteRequest>;
    if (
      typeof parsed.deviceInstallId !== 'string' ||
      parsed.deviceInstallId.length < 8 ||
      typeof parsed.isPremium !== 'boolean' ||
      typeof parsed.payload !== 'object' ||
      parsed.payload === null
    ) {
      return null;
    }
    return parsed as AiRouteRequest;
  } catch {
    return null;
  }
}

function validateSingleImage(
  imageBase64: string,
  label: string,
): { ok: true } | { ok: false; code: 'IMAGE_TOO_LARGE' | 'INVALID_REQUEST'; message: string } {
  if (!imageBase64) {
    return { ok: false, code: 'INVALID_REQUEST', message: `${label} is required.` };
  }

  if (!isImageWithinLimit(imageBase64)) {
    const sizeMb = (getBase64DecodedByteLength(imageBase64) / (1024 * 1024)).toFixed(1);
    const maxMb = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      code: 'IMAGE_TOO_LARGE',
      message: `${label} is too large (${sizeMb} MB). Maximum is ${maxMb} MB.`,
    };
  }

  return { ok: true };
}

function validateImagePayload(
  feature: AiFeature,
  payload: Record<string, unknown>,
): { ok: true } | { ok: false; code: 'IMAGE_TOO_LARGE' | 'INVALID_REQUEST'; message: string } {
  if (feature === 'meal_photo_estimate') {
    return validateSingleImage(String(payload.imageBase64 ?? ''), 'imageBase64');
  }

  if (feature === 'physique_assessment') {
    const frontCheck = validateSingleImage(
      String(payload.frontImageBase64 ?? ''),
      'frontImageBase64',
    );
    if (!frontCheck.ok) {
      return frontCheck;
    }

    for (const angle of ['side', 'back'] as const) {
      const image = String(payload[`${angle}ImageBase64`] ?? '');
      if (!image) {
        continue;
      }
      const optionalCheck = validateSingleImage(image, `${angle}ImageBase64`);
      if (!optionalCheck.ok) {
        return optionalCheck;
      }
    }

    return { ok: true };
  }

  return { ok: true };
}

function logMetadata(feature: AiFeature, deviceInstallId: string, bodyBytes: number): void {
  const shortId = deviceInstallId.slice(0, 8);
  console.info(
    JSON.stringify({
      event: 'ai_proxy_request',
      feature,
      deviceInstallId: shortId,
      bodyBytes,
      at: new Date().toISOString(),
    }),
  );
}

export async function handleAiRoute(
  route: AiRoute,
  rawBody: string,
  options?: { apiKey?: string; model?: string },
): Promise<{ status: number; body: AiProxyResponse }> {
  const feature = ROUTE_TO_FEATURE[route];
  const bodyBytes = Buffer.byteLength(rawBody, 'utf8');

  const request = parseRouteRequest(rawBody);
  if (!request) {
    return {
      status: 400,
      body: { ok: false, error: 'Invalid request body.', code: 'INVALID_REQUEST' },
    };
  }

  const imageCheck = validateImagePayload(feature, request.payload);
  if (!imageCheck.ok) {
    return {
      status: imageCheck.code === 'IMAGE_TOO_LARGE' ? 413 : 400,
      body: { ok: false, error: imageCheck.message, code: imageCheck.code },
    };
  }

  if (bodyBytes > maxBodyForFeature(feature)) {
    return {
      status: 413,
      body: { ok: false, error: 'Request body too large.', code: 'PAYLOAD_TOO_LARGE' },
    };
  }

  const fingerprint = promptFingerprint(feature, request.payload);
  const rate = checkRateLimit({
    deviceInstallId: request.deviceInstallId,
    feature,
    isPremium: request.isPremium,
    promptFingerprint: fingerprint,
  });

  if (!rate.allowed) {
    return {
      status: rate.code === 'UNAUTHORIZED' ? 403 : 429,
      body: { ok: false, error: rate.message, code: rate.code },
    };
  }

  const apiKey = options?.apiKey ?? process.env.GEMINI_API_KEY;
  const model = options?.model ?? process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

  if (!apiKey) {
    return {
      status: 503,
      body: { ok: false, error: 'AI proxy is not configured.', code: 'NOT_CONFIGURED' },
    };
  }

  logMetadata(feature, request.deviceInstallId, bodyBytes);

  try {
    const prompt = buildPrompt(feature, request.payload);

    if (feature === 'physique_assessment') {
      const parts = buildPhysiqueAssessmentGeminiParts(prompt, {
        frontImageBase64: String(request.payload.frontImageBase64 ?? ''),
        sideImageBase64: request.payload.sideImageBase64
          ? String(request.payload.sideImageBase64)
          : undefined,
        backImageBase64: request.payload.backImageBase64
          ? String(request.payload.backImageBase64)
          : undefined,
      });
      const text = await generateGeminiJson(
        { apiKey, model },
        '',
        undefined,
        { parts, temperature: 0 },
      );
      const data = JSON.parse(text) as unknown;

      recordRateLimitUse({
        deviceInstallId: request.deviceInstallId,
        feature,
        isPremium: request.isPremium,
        promptFingerprint: fingerprint,
      });

      return {
        status: 200,
        body: {
          ok: true,
          feature,
          data,
          quotaRemaining: rate.remaining,
        },
      };
    }

    let images: string | string[] | undefined;
    if (feature === 'meal_photo_estimate') {
      images = String(request.payload.imageBase64 ?? '');
    }

    const text = await generateGeminiJson({ apiKey, model }, prompt, images);
    const data = JSON.parse(text) as unknown;

    recordRateLimitUse({
      deviceInstallId: request.deviceInstallId,
      feature,
      isPremium: request.isPremium,
      promptFingerprint: fingerprint,
    });

    return {
      status: 200,
      body: {
        ok: true,
        feature,
        data,
        quotaRemaining: rate.remaining,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed.';
    return {
      status: 502,
      body: { ok: false, error: message, code: 'UPSTREAM_ERROR' },
    };
  }
}

/** Resolves a URL pathname to a route handler input. */
export function resolveAiRoute(pathname: string): AiRoute | null {
  const normalized = pathname.split('?')[0];
  return isAiRoute(normalized) ? normalized : null;
}

/** @deprecated Use handleAiRoute with an explicit route path. */
export async function handleAiProxyRequest(
  rawBody: string,
  options?: { apiKey?: string; model?: string },
): Promise<{ status: number; body: AiProxyResponse }> {
  try {
    const parsed = JSON.parse(rawBody) as {
      feature?: AiFeature;
      deviceInstallId?: string;
      isPremium?: boolean;
      payload?: Record<string, unknown>;
    };
    const routeEntry = Object.entries(ROUTE_TO_FEATURE).find(([, f]) => f === parsed.feature);
    if (!routeEntry || !parsed.deviceInstallId || typeof parsed.isPremium !== 'boolean' || !parsed.payload) {
      return {
        status: 400,
        body: { ok: false, error: 'Invalid request body.', code: 'INVALID_REQUEST' },
      };
    }
    return handleAiRoute(
      routeEntry[0] as AiRoute,
      JSON.stringify({
        deviceInstallId: parsed.deviceInstallId,
        isPremium: parsed.isPremium,
        payload: parsed.payload,
      }),
      options,
    );
  } catch {
    return {
      status: 400,
      body: { ok: false, error: 'Invalid request body.', code: 'INVALID_REQUEST' },
    };
  }
}
