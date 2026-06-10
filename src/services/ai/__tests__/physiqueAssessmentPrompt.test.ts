import {
  buildPhysiqueAssessmentGeminiParts,
  buildPhysiqueAssessmentPrompt,
} from '../physiqueAssessmentPrompt';

describe('physiqueAssessmentPrompt', () => {
  it('includes male calibration anchors and anti-overestimate guidance', () => {
    const prompt = buildPhysiqueAssessmentPrompt({
      genderIdentity: 'male',
      ageYears: 30,
      hasSidePhoto: true,
      hasBackPhoto: false,
    });

    expect(prompt).toContain('6–12%');
    expect(prompt).toContain('Do NOT systematically overestimate');
    expect(prompt).toContain('side (provided');
    expect(prompt).not.toContain('Be conservative when photos are limited');
  });

  it('labels each physique photo angle in Gemini parts', () => {
    const parts = buildPhysiqueAssessmentGeminiParts('prompt', {
      frontImageBase64: 'data:image/jpeg;base64,front',
      sideImageBase64: 'data:image/jpeg;base64,side',
    });

    expect(parts.filter((part) => part.text?.includes('FRONT VIEW'))).toHaveLength(1);
    expect(parts.filter((part) => part.text?.includes('SIDE VIEW'))).toHaveLength(1);
    expect(parts.filter((part) => part.inline_data)).toHaveLength(2);
  });
});
