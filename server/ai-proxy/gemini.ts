export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export type GeminiContentPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
};

export interface GenerateGeminiJsonOptions {
  parts?: GeminiContentPart[];
  temperature?: number;
}

function normalizeImageBase64(imageBase64: string): string {
  return imageBase64.replace(/^data:image\/\w+;base64,/, '');
}

export async function generateGeminiJson(
  config: GeminiConfig,
  prompt: string,
  images?: string | string[],
  options?: GenerateGeminiJsonOptions,
): Promise<string> {
  const temperature = options?.temperature ?? 0.2;

  let parts: GeminiContentPart[];

  if (options?.parts) {
    parts = options.parts;
  } else {
    parts = [{ text: prompt }];
    const imageList = images ? (Array.isArray(images) ? images : [images]) : [];
    for (const imageBase64 of imageList) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: normalizeImageBase64(imageBase64),
        },
      });
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body.slice(0, 300)}`);
  }

  const json = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}
