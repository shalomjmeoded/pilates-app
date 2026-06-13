export function getOnboardingPhase(step: number): string {
  if (step <= 5) {
    return 'Getting to know you';
  }
  if (step <= 12) {
    return 'Your body & goals';
  }
  if (step <= 14) {
    return 'Building your rhythm';
  }
  if (step === 15) {
    return 'Creating your plan';
  }
  if (step === 16) {
    return 'Your reveal';
  }
  return 'Unlock your plan';
}

export function getOnboardingReason(step: number): string | undefined {
  const reasons: Partial<Record<number, string>> = {
    1: 'Helps us personalize movement and energy recommendations — inclusive of every body.',
    2: 'Your weekly rhythm shapes realistic workout scheduling, not guilt.',
    3: 'We prioritize movement styles you actually enjoy.',
    4: 'Keeps workouts comfortable on your connection and device.',
    5: 'Optional gentle reminders — never ads or marketing.',
    6: 'Height refines calorie and macro calculations on your device.',
    7: 'Your starting point helps us chart a sustainable path forward.',
    8: 'Age supports safe, on-device metabolic estimates — never shared.',
    9: 'Your goal shapes workout focus and daily nourishment targets.',
    10: 'A clear destination makes milestones feel achievable.',
    11: 'We match nutrition and movement to the direction you chose.',
    12: 'Pace sets how gently we guide change — you stay in control.',
    13: 'See how your choices come together over time.',
  };
  return reasons[step];
}
