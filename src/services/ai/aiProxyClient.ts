import { getPremiumStatus } from '@/db/repositories/premiumRepository';

import { buildAiEndpointUrl } from './aiProxyEndpoints';
import { getAiProxyBaseUrl, isAiMockMode, isGeminiDirectMode } from './config';
import { getDeviceInstallId } from './deviceInstallId';
import type { AiFeature } from './types';

export type { AiFeature };
export { buildAiEndpointUrl, AI_PROXY_ENDPOINTS } from './aiProxyEndpoints';

export interface AiProxySuccess<T> {
  ok: true;
  data: T;
  quotaRemaining?: number;
}

export interface AiProxyFailure {
  ok: false;
  error: string;
  code: string;
}

export type AiProxyResult<T> = AiProxySuccess<T> | AiProxyFailure;

export class AiProxyError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'AiProxyError';
    this.code = code;
    this.status = status;
  }
}

export const AI_CLIENT_TIMEOUT_MS = 45_000;
const AI_WARMUP_TIMEOUT_MS = 35_000;
const AI_WARM_TTL_MS = 10 * 60 * 1000;
const RETRY_DELAY_MS = 350;
const RETRYABLE_HTTP_STATUSES = new Set([502, 503, 504]);

let warmupPromise: Promise<boolean> | null = null;
let lastWarmAt = 0;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function isRetryableError(error: unknown): boolean {
  return (
    error instanceof AiProxyError &&
    (error.code === 'NETWORK_ERROR' ||
      error.code === 'UPSTREAM_ERROR' ||
      error.code === 'UPSTREAM_TIMEOUT' ||
      (error.status !== undefined && RETRYABLE_HTTP_STATUSES.has(error.status)))
  );
}

export function getAiEndpointUrl(feature: AiFeature): string {
  const base = getAiProxyBaseUrl();
  if (!base) {
    throw new AiProxyError('AI proxy base URL is not configured.', 'NOT_CONFIGURED');
  }
  return buildAiEndpointUrl(base, feature);
}

async function fetchAiResponse<T>(
  endpoint: string,
  requestBody: string,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_CLIENT_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
        signal: controller.signal,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw new AiProxyError(
          'Your Form: Pilates Studio coach took too long to respond. Please try again.',
          'TIMEOUT',
        );
      }
      throw new AiProxyError(
        'Could not reach your Form: Pilates Studio coach. Check your connection and try again.',
        'NETWORK_ERROR',
      );
    }

    let body: {
      ok: boolean;
      error?: string;
      code?: string;
      data?: T;
    };

    try {
      body = (await response.json()) as typeof body;
    } catch {
      throw new AiProxyError(
        'The AI service returned an unreadable response. Please try again.',
        'INVALID_RESPONSE',
        response.status,
      );
    }

    if (!body.ok) {
      throw new AiProxyError(
        body.error ?? 'AI request failed.',
        body.code ?? `HTTP_${response.status}`,
        response.status,
      );
    }

    if (body.data === undefined) {
      throw new AiProxyError('AI proxy returned an empty response.', 'INVALID_RESPONSE');
    }

    return body.data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function callAiProxy<T>(
  feature: AiFeature,
  payload: Record<string, unknown>,
): Promise<T> {
  const endpoint = getAiEndpointUrl(feature);

  const [deviceInstallId, premium] = await Promise.all([
    getDeviceInstallId(),
    getPremiumStatus(),
  ]);
  const requestBody = JSON.stringify({
    deviceInstallId,
    isPremium: premium.isPremium,
    payload,
  });

  try {
    return await fetchAiResponse<T>(endpoint, requestBody);
  } catch (error) {
    if (!isRetryableError(error)) {
      throw error;
    }
    await wait(RETRY_DELAY_MS);
    return fetchAiResponse<T>(endpoint, requestBody);
  }
}

export function warmAiProxy(): Promise<boolean> {
  if (isAiMockMode() || isGeminiDirectMode()) {
    return Promise.resolve(true);
  }

  const baseUrl = getAiProxyBaseUrl();
  if (!baseUrl) {
    return Promise.resolve(false);
  }

  if (Date.now() - lastWarmAt < AI_WARM_TTL_MS) {
    return Promise.resolve(true);
  }

  if (warmupPromise) {
    return warmupPromise;
  }

  warmupPromise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_WARMUP_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl}/health`, { signal: controller.signal });
      if (!response.ok) {
        return false;
      }
      lastWarmAt = Date.now();
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
      warmupPromise = null;
    }
  })();

  return warmupPromise;
}
