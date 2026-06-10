import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';

export interface AiOutputLogInput {
  feature: string;
  requestHash?: string;
  requestPayloadSummary: Record<string, unknown>;
  responseJson?: unknown;
  model?: string;
  success: boolean;
}

function sanitizePayloadSummary(summary: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(summary)) {
    if (key.toLowerCase().includes('base64') || key.toLowerCase().includes('image')) {
      sanitized[key] = typeof value === 'string' ? { byteLength: value.length } : '[omitted]';
      continue;
    }
    sanitized[key] = value;
  }

  return sanitized;
}

export async function logAiOutput(input: AiOutputLogInput): Promise<void> {
  const db = await getDatabase();
  const summary = sanitizePayloadSummary(input.requestPayloadSummary);

  await db.runAsync(
    `INSERT INTO ai_outputs (
      id, feature, request_hash, request_payload_json, response_json, model, success, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    createId(),
    input.feature,
    input.requestHash ?? null,
    JSON.stringify(summary),
    input.responseJson ? JSON.stringify(input.responseJson) : null,
    input.model ?? null,
    input.success ? 1 : 0,
    new Date().toISOString(),
  );
}
