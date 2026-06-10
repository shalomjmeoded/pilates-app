import type { GenderIdentity } from '@/types/profile';

export interface PhysiqueAssessmentPromptInput {
  notes?: string;
  genderIdentity?: GenderIdentity;
  ageYears?: number;
  hasSidePhoto: boolean;
  hasBackPhoto: boolean;
}

function formatGenderGuidance(genderIdentity?: GenderIdentity): string {
  switch (genderIdentity) {
    case 'male':
      return `Subject context: male adult.
Use these visual calibration anchors (do not default to the middle of "average"):
- 6–12%: very lean/athletic — sharp ab definition, clear muscle separation, often visible vascularity, lean face
- 12–18%: lean — visible abs in good lighting, defined arms/shoulders
- 18–25%: average — softer midsection, some definition in arms
- 25%+: higher body fat — little visible muscle definition, fuller midsection
If you see clear six-pack abs and striated shoulders on a male, the range should usually be 8–14%, not 18–28%.`;

    case 'female':
      return `Subject context: female adult.
Use these visual calibration anchors:
- 14–20%: athletic — visible muscle tone, flat firm midsection, defined shoulders/arms
- 20–25%: lean — athletic shape with softer lower abs
- 25–32%: average — curves with some tone but limited ab visibility
- 32%+: higher body fat — softer contours throughout
Do not apply male body-fat anchors to a female subject.`;

    case 'non_binary':
    case 'prefer_not_to_say':
    default:
      return `Subject context: gender not specified — infer from visible anatomy only if clear; otherwise use the wider of male/female ranges and lower confidence.
Never assume male ranges for a clearly feminine physique or vice versa.`;
  }
}

export function buildPhysiqueAssessmentPrompt(input: PhysiqueAssessmentPromptInput): string {
  const ageLine =
    input.ageYears !== undefined ? `Approximate age: ${input.ageYears} years.` : 'Age: not provided.';

  const photoLine = [
    'front (required)',
    input.hasSidePhoto ? 'side (provided — use heavily for body-fat estimation)' : 'side (not provided)',
    input.hasBackPhoto ? 'back (provided)' : 'back (not provided)',
  ].join(', ');

  return `You are an experienced body-composition coach using progress photos (not a doctor, not DEXA).
Estimate visible body-fat percentage from the photos using standard fitness-industry visual ranges.

${formatGenderGuidance(input.genderIdentity)}
${ageLine}

Photo angles: ${photoLine}.

Return ONLY valid JSON:
{
  "physiqueCategory": "lean" | "average" | "athletic" | "higher_body_fat",
  "estimatedBodyFatRange": { "minPercent": number, "maxPercent": number },
  "confidence": "low" | "medium" | "high",
  "nutritionAdjustmentSuggestion": string,
  "workoutFocusSuggestion": string
}

Estimation rules:
- Base the range on visible cues: abdominal definition, oblique visibility, limb separation, lower-back/glute contour (side view), overall leanness.
- Use integer percent endpoints only. Typical range width: 4–8% when photos are clear; up to 12% only if lighting/posing is poor.
- Do NOT systematically overestimate body fat. Avoid anchoring on "average" when the subject is clearly lean or athletic.
- physiqueCategory must align with the range (e.g. athletic/lean males are usually below 18%, not 22–30%).
- If only a front photo is provided, cap confidence at "medium" unless definition is unmistakable.
- No medical diagnosis, no shaming language.
- nutritionAdjustmentSuggestion and workoutFocusSuggestion: brief, supportive, optional ideas — not prescriptions.

User notes: ${input.notes?.trim() || 'none'}`;
}

export interface PhysiqueAssessmentImageSet {
  frontImageBase64: string;
  sideImageBase64?: string;
  backImageBase64?: string;
}

/** Interleaved text labels help vision models attribute each image to an angle. */
export function buildPhysiqueAssessmentGeminiParts(
  prompt: string,
  images: PhysiqueAssessmentImageSet,
): Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> {
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
    { text: prompt },
    { text: 'FRONT VIEW (assess abdominal definition and overall leanness):' },
    { inline_data: { mime_type: 'image/jpeg', data: stripBase64(images.frontImageBase64) } },
  ];

  if (images.sideImageBase64) {
    parts.push({
      text: 'SIDE VIEW (primary for body-fat level — profile of stomach, chest, thighs, glutes):',
    });
    parts.push({
      inline_data: { mime_type: 'image/jpeg', data: stripBase64(images.sideImageBase64) },
    });
  }

  if (images.backImageBase64) {
    parts.push({ text: 'BACK VIEW (assess back leanness and glute/hamstring definition):' });
    parts.push({
      inline_data: { mime_type: 'image/jpeg', data: stripBase64(images.backImageBase64) },
    });
  }

  return parts;
}

function stripBase64(imageBase64: string): string {
  return imageBase64.replace(/^data:image\/\w+;base64,/, '');
}
