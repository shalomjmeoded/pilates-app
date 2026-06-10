export function cmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}

export function displayHeight(cm: number, unit: 'cm' | 'in'): string {
  return unit === 'cm' ? `${cm} cm` : `${cmToInches(cm)} in`;
}

export function displayWeight(kg: number, unit: 'kg' | 'lb'): string {
  return unit === 'kg' ? `${kg} kg` : `${kgToLb(kg)} lb`;
}
