import type { AiProvider } from './AiProvider';
import { getAiProxyUrl, isAiMockMode, isGeminiDirectMode } from './config';
import { GeminiDirectProvider } from './providers/GeminiDirectProvider';
import { GeminiProxyProvider } from './providers/GeminiProxyProvider';
import { MockAiProvider } from './providers/MockAiProvider';

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      'AI provider is not configured. Set GEMINI_API_KEY in .env, EXPO_PUBLIC_AI_PROXY_URL, or EXPO_PUBLIC_AI_MOCK=true.',
    );
    this.name = 'AiNotConfiguredError';
  }
}

class UnconfiguredAiProvider implements AiProvider {
  private fail(): never {
    throw new AiNotConfiguredError();
  }

  estimateMealFromPhoto(): Promise<never> {
    return Promise.reject(this.fail());
  }

  estimateMealFromText(): Promise<never> {
    return Promise.reject(this.fail());
  }

  generateWeeklyCoach(): Promise<never> {
    return Promise.reject(this.fail());
  }

  substituteExercise(): Promise<never> {
    return Promise.reject(this.fail());
  }

  suggestWorkoutChange(): Promise<never> {
    return Promise.reject(this.fail());
  }

  assessPhysique(): Promise<never> {
    return Promise.reject(this.fail());
  }
}

function createAiProvider(): AiProvider {
  if (isAiMockMode()) {
    return new MockAiProvider();
  }
  if (isGeminiDirectMode()) {
    return new GeminiDirectProvider();
  }
  if (getAiProxyUrl()) {
    return new GeminiProxyProvider();
  }
  return new UnconfiguredAiProvider();
}

/** Single entry point for AI — UI must use this, never Gemini directly. */
export const aiFacade: AiProvider = createAiProvider();

/** @deprecated Use aiFacade */
export const aiService = aiFacade;

export type { AiProvider };
