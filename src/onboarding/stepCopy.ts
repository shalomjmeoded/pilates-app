export function getOnboardingPhase(step: number): string {
  if (step <= 5) {
    return 'Your rhythm';
  }
  if (step <= 8) {
    return 'Your body';
  }
  if (step <= 12) {
    return 'Your goals';
  }
  return 'Your plan';
}

export function getOnboardingPhaseIndex(step: number): number {
  if (step <= 5) {
    return 1;
  }
  if (step <= 8) {
    return 2;
  }
  if (step <= 12) {
    return 3;
  }
  return 4;
}
