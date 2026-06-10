import { getPremiumStatus } from '@/db/repositories/premiumRepository';

import { buildAiEndpointUrl } from './aiProxyEndpoints';
import { getAiProxyBaseUrl } from './config';
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

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AiProxyError';
    this.code = code;
  }
}

export function getAiEndpointUrl(feature: AiFeature): string {
  const base = getAiProxyBaseUrl();
  if (!base) {
    throw new AiProxyError('AI proxy base URL is not configured.', 'NOT_CONFIGURED');
  }
  return buildAiEndpointUrl(base, feature);
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

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceInstallId,
      isPremium: premium.isPremium,
      payload,
    }),
  });

  const body = (await response.json()) as {
    ok: boolean;
    error?: string;
    code?: string;
    data?: T;
  };

  if (!body.ok) {
    throw new AiProxyError(body.error ?? 'AI request failed.', body.code ?? 'UNKNOWN');
  }

  if (body.data === undefined) {
    throw new AiProxyError('AI proxy returned an empty response.', 'INVALID_RESPONSE');
  }

  return body.data;
}
