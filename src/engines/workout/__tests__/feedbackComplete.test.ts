import { isFeedbackComplete } from '../feedback';

describe('isFeedbackComplete', () => {
  it('requires feedback for every exercise', () => {
    const required = [
      { exerciseId: 'ex_001', sortOrder: 1 },
      { exerciseId: 'ex_002', sortOrder: 2 },
    ];

    expect(isFeedbackComplete(required, { 'ex_001:1': 'completed' })).toBe(false);
    expect(
      isFeedbackComplete(required, {
        'ex_001:1': 'completed',
        'ex_002:2': 'skipped',
      }),
    ).toBe(true);
  });
});
