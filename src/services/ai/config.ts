import Constants from 'expo-constants';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

function readConfigExtra(): { geminiApiKey?: string; geminiModel?: string } {
  const extra = Constants.expoConfig?.extra;
  if (!extra || typeof extra !== 'object') {
    return {};
  }

  return {
    geminiApiKey:
      typeof extra.geminiApiKey === 'string' && extra.geminiApiKey.trim().length > 0
        ? extra.geminiApiKey.trim()
        : undefined,
    geminiModel:
      typeof extra.geminiModel === 'string' && extra.geminiModel.trim().length > 0
        ? extra.geminiModel.trim()
        : undefined,
  };
}

/** Gemini API key from app.config.js extra (sourced from GEMINI_API_KEY in .env). */
export function getGeminiApiKey(): string | undefined {
  const { geminiApiKey } = readConfigExtra();
  return geminiApiKey;
}

export function getGeminiModel(): string {
  const { geminiModel } = readConfigExtra();
  return geminiModel ?? DEFAULT_GEMINI_MODEL;
}

export function isGeminiDirectMode(): boolean {
  return Boolean(getGeminiApiKey());
}

/** Base URL for the AI proxy, e.g. http://localhost:8787 */
export function getAiProxyBaseUrl(): string | undefined {
  const raw = process.env.EXPO_PUBLIC_AI_PROXY_URL?.trim();
  if (!raw) {
    return undefined;
  }

  return raw.replace(/\/$/, '').replace(/\/api\/ai-proxy$/, '');
}

/** @deprecated Use getAiProxyBaseUrl */
export function getAiProxyUrl(): string | undefined {
  return getAiProxyBaseUrl();
}

export function isAiMockMode(): boolean {
  return process.env.EXPO_PUBLIC_AI_MOCK === 'true';
}

export function isAiConfigured(): boolean {
  return isAiMockMode() || isGeminiDirectMode() || Boolean(getAiProxyBaseUrl());
}
