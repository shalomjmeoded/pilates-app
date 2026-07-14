import { AiProxyError } from '@/services/ai/aiProxyClient';

export function isMealEstimateRecoverableError(error: unknown): boolean {
  if (error instanceof AiProxyError) {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      error.code === 'UPSTREAM_TIMEOUT' ||
      error.code === 'UPSTREAM_ERROR'
    );
  }
  return error instanceof Error && error.name === 'AbortError';
}

export function mealEstimateErrorMessage(error: unknown, fallback: string): string {
  if (isMealEstimateRecoverableError(error)) {
    return 'Could not reach the AI service. Check your connection or enter macros manually.';
  }
  if (error instanceof AiProxyError && error.code === 'UNAUTHORIZED') {
    return 'AI meal estimates require BetterMe Premium.';
  }
  return error instanceof Error ? error.message : fallback;
}
