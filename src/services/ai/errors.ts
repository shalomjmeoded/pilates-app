import type { ZodError } from 'zod';

export class AiValidationError extends Error {
  readonly zodError: ZodError;

  constructor(zodError: ZodError) {
    super('AI response failed JSON validation.');
    this.name = 'AiValidationError';
    this.zodError = zodError;
  }
}
