import type { ZodSchema } from 'zod';

import { AiValidationError } from './errors';

export function parseAiResponse<T>(schema: ZodSchema<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AiValidationError(result.error);
  }
  return result.data;
}
