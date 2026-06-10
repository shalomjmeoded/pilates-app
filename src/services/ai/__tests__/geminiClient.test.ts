import { generateGeminiJson } from '../geminiClient';

describe('generateGeminiJson', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns JSON text from Gemini', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"mealTitle":"Salad"}' }] } }],
      }),
    }) as typeof fetch;

    const text = await generateGeminiJson('estimate meal', undefined, {
      apiKey: 'test-key',
      model: 'gemini-2.5-flash',
    });

    expect(text).toBe('{"mealTitle":"Salad"}');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws when Gemini returns a non-OK status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'API key invalid',
    }) as typeof fetch;

    await expect(
      generateGeminiJson('hello', undefined, { apiKey: 'bad-key', model: 'gemini-2.5-flash' }),
    ).rejects.toThrow(/Gemini API error 403/);
  });
});
