import { displayWeight } from '../units';

describe('displayWeight', () => {
  it('rounds floating point artifacts in kilogram values', () => {
    expect(displayWeight(5.6000000000001, 'kg')).toBe('5.6 kg');
  });

  it('omits unnecessary trailing decimals for whole kilogram values', () => {
    expect(displayWeight(6, 'kg')).toBe('6 kg');
  });

  it('rounds pound display to one decimal place', () => {
    expect(displayWeight(2.5400000000001, 'lb')).toBe('5.6 lb');
  });
});
