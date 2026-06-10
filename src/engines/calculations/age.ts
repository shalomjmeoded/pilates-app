export function calculateAge(birthYear: number, referenceYear: number = new Date().getFullYear()): number {
  const clampedYear = Math.min(Math.max(birthYear, 1920), referenceYear);
  return referenceYear - clampedYear;
}
