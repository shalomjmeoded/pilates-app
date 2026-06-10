import {
  buildStoredPhysiqueAssessment,
  formatBodyFatRange,
  formatPhysiqueCategory,
  formatPhysiqueConfidence,
  PHYSIQUE_DISCLAIMER_COPY,
} from '../physiqueAssessmentFlow';

describe('physiqueAssessmentFlow', () => {
  it('exposes required disclaimer copy', () => {
    expect(PHYSIQUE_DISCLAIMER_COPY).toContain('experimental');
    expect(PHYSIQUE_DISCLAIMER_COPY).toContain('not a medical measurement');
  });

  it('formats category, confidence, and body fat range', () => {
    expect(formatPhysiqueCategory('athletic')).toBe('Athletic');
    expect(formatPhysiqueConfidence('low')).toBe('Low confidence');
    expect(formatBodyFatRange({ minPercent: 18, maxPercent: 24 })).toBe('18–24%');
  });

  it('builds stored assessment from AI output', () => {
    const stored = buildStoredPhysiqueAssessment(
      {
        physiqueCategory: 'lean',
        estimatedBodyFatRange: { minPercent: 14, maxPercent: 18 },
        confidence: 'high',
        nutritionAdjustmentSuggestion: 'Keep protein steady.',
        workoutFocusSuggestion: 'Add core control work.',
      },
      '2026-06-09T12:00:00.000Z',
      'morning light',
    );

    expect(stored.physiqueCategory).toBe('lean');
    expect(stored.estimatedBodyFatRange.maxPercent).toBe(18);
    expect(stored.notes).toBe('morning light');
    expect(stored.disclaimerAcceptedAt).toBe('2026-06-09T12:00:00.000Z');
  });
});
