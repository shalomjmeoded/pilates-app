export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) {
    return 0;
  }
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
