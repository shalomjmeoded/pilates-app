export function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export const MIN_SUPPORTED_AGE = 13;
export const MAX_SUPPORTED_AGE = 100;

export interface BirthYearBounds {
  minYear: number;
  maxYear: number;
}

export function getBirthYearBounds(referenceDate: Date = new Date()): BirthYearBounds {
  const currentYear = referenceDate.getFullYear();
  return {
    minYear: currentYear - MAX_SUPPORTED_AGE,
    maxYear: currentYear - MIN_SUPPORTED_AGE,
  };
}

export function isBirthYearWithinSupportedAge(
  birthYear: number,
  referenceDate: Date = new Date(),
): boolean {
  const { minYear, maxYear } = getBirthYearBounds(referenceDate);
  return Number.isFinite(birthYear) && birthYear >= minYear && birthYear <= maxYear;
}

export function getBirthYearOptions(): number[] {
  const { minYear, maxYear } = getBirthYearBounds();
  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    years.push(year);
  }
  return years;
}
