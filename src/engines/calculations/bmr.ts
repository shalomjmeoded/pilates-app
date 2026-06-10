import type { GenderIdentity } from '@/types/profile';

import { calculateAge } from './age';

import { calculateLeanMassKg } from '@/engines/physique/bodyFatAssumptions';
import type { BmrFormula } from '@/types/calculations';

export interface BmrInput {
  genderIdentity: GenderIdentity;
  weightKg: number;
  heightCm: number;
  birthYear: number;
  bodyFatPercent?: number;
}

export function calculateBmr(input: BmrInput): { bmr: number; formula: BmrFormula } {
  if (input.bodyFatPercent !== undefined) {
    const leanMassKg = calculateLeanMassKg(input.weightKg, input.bodyFatPercent);
    return { bmr: Math.round(370 + 21.6 * leanMassKg), formula: 'katch_mcardle' };
  }

  const age = calculateAge(input.birthYear);
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * age;

  switch (input.genderIdentity) {
    case 'female':
      return { bmr: Math.round(base - 161), formula: 'female' };
    case 'male':
      return { bmr: Math.round(base + 5), formula: 'male' };
    case 'non_binary':
    case 'prefer_not_to_say':
      return { bmr: Math.round(base - 78), formula: 'neutral' };
  }
}
