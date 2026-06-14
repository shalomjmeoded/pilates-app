import { logAiOutput } from '@/db/repositories/aiOutputRepository';
import { recordAiUsage } from '@/db/repositories/aiUsageRepository';

import type { AiFeature } from './types';

function hashPrompt(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export interface AiAuditInput {
  feature: AiFeature;
  requestSummary: Record<string, unknown>;
  promptFingerprint: string;
  response?: unknown;
  model?: string;
  success: boolean;
}

export async function logAiAudit(input: AiAuditInput): Promise<void> {
  const requestHash = hashPrompt(input.promptFingerprint);

  try {
    await logAiOutput({
      feature: input.feature,
      requestHash,
      requestPayloadSummary: input.requestSummary,
      responseJson: input.response,
      model: input.model,
      success: input.success,
    });
  } catch (error) {
    console.warn('[BetterMe] Failed to write ai_outputs audit row.', error);
  }

  if (!input.success) {
    return;
  }

  try {
    await recordAiUsage(input.feature, requestHash);
  } catch (error) {
    console.warn('[BetterMe] Failed to write ai_usage row.', error);
  }
}
