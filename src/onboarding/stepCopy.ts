export function getOnboardingPhase(step: number): string {
  if (step <= 4) {
    return 'Your rhythm';
  }
  if (step <= 7) {
    return 'Your body';
  }
  if (step <= 11) {
    return 'Your goals';
  }
  return 'Your plan';
}

export function getOnboardingPhaseIndex(step: number): number {
  if (step <= 4) {
    return 1;
  }
  if (step <= 7) {
    return 2;
  }
  if (step <= 11) {
    return 3;
  }
  return 4;
}
