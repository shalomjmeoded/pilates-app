import * as fs from 'node:fs';
import * as path from 'node:path';

jest.mock('@/db/repositories/aiOutputRepository', () => ({
  logAiOutput: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/repositories/aiUsageRepository', () => ({
  recordAiUsage: jest.fn().mockResolvedValue(undefined),
  getAiUsageCount: jest.fn().mockResolvedValue(0),
  getQuotaPeriodKey: jest.fn().mockReturnValue('2026-06-09'),
}));

import { MockAiProvider } from '../providers/MockAiProvider';

const MOBILE_ROOTS = [
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), 'app'),
];

const GEMINI_DIRECT_ALLOWLIST = new Set([
  path.join(process.cwd(), 'src/services/ai/AiFacade.ts'),
  path.join(process.cwd(), 'src/services/ai/config.ts'),
  path.join(process.cwd(), 'src/services/ai/geminiClient.ts'),
  path.join(process.cwd(), 'src/services/ai/providers/GeminiDirectProvider.ts'),
  path.join(process.cwd(), 'src/services/ai/prompts.ts'),
]);

const FORBIDDEN_PATTERNS = [
  /GEMINI_API_KEY/,
  /generativelanguage\.googleapis\.com/,
  /EXPO_PUBLIC_GEMINI/,
];

function collectSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !fullPath.includes('__tests__')) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Phase 8.1 AI architecture', () => {
  it('keeps Gemini HTTP calls inside the AI service layer only', () => {
    const files = MOBILE_ROOTS.flatMap(collectSourceFiles);
    const violations: string[] = [];

    for (const file of files) {
      if (GEMINI_DIRECT_ALLOWLIST.has(file)) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${path.relative(process.cwd(), file)} matches ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('uses mock provider when EXPO_PUBLIC_AI_MOCK=true', async () => {
    const previous = process.env.EXPO_PUBLIC_AI_MOCK;
    process.env.EXPO_PUBLIC_AI_MOCK = 'true';

    const provider = new MockAiProvider();
    const estimate = await provider.estimateMealFromText('Greek yogurt bowl');

    expect(estimate.mealTitle).toContain('Greek yogurt');
    expect(estimate.calories).toBeGreaterThan(0);

    process.env.EXPO_PUBLIC_AI_MOCK = previous;
  });
});
