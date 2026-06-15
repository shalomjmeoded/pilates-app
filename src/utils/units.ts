export function cmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

export function formatFeetInches(inches: number, compact = false): string {
  const totalInches = Math.max(0, Math.round(inches));
  const feet = Math.floor(totalInches / 12);
  const remainingInches = totalInches % 12;

  return compact ? `${feet}'${remainingInches}"` : `${feet} ft ${remainingInches} in`;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}

export function displayHeight(cm: number, unit: 'cm' | 'in'): string {
  return unit === 'cm' ? `${cm} cm` : formatFeetInches(cmToInches(cm));
}

export function displayWeight(kg: number, unit: 'kg' | 'lb'): string {
  return unit === 'kg' ? `${kg} kg` : `${kgToLb(kg)} lb`;
}
