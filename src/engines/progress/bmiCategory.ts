import { calculateBmi } from '@/engines/calculations';
import type { BmiCategory, BmiInfo } from '@/types/progress';

const CATEGORY_LABELS: Record<BmiCategory, string> = {
  underweight: 'Underweight',
  normal: 'Normal',
  overweight: 'Overweight',
  above_typical: 'Above typical range',
};

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return 'underweight';
  }
  if (bmi < 25) {
    return 'normal';
  }
  if (bmi < 30) {
    return 'overweight';
  }
  return 'above_typical';
}

export function buildBmiInfo(weightKg: number, heightCm: number): BmiInfo {
  const value = calculateBmi(weightKg, heightCm);
  const category = getBmiCategory(value);
  return {
    value,
    category,
    categoryLabel: CATEGORY_LABELS[category],
  };
}
