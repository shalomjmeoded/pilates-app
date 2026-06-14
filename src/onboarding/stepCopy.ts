export function getOnboardingPhase(step: number): string {
  if (step <= 4) {
    return 'Getting to know you';
  }
  if (step <= 11) {
    return 'Your body & goals';
  }
  if (step <= 12) {
    return 'Building your rhythm';
  }
  if (step === 13) {
    return 'Creating your plan';
  }
  if (step === 14) {
    return 'Your reveal';
  }
  return 'Unlock your plan';
}

export function getOnboardingReason(step: number): string | undefined {
  const reasons: Partial<Record<number, string>> = {
    1: 'Helps us personalize movement and energy recommendations — inclusive of every body.',
    2: 'Your weekly rhythm shapes realistic workout scheduling, not guilt.',
    3: 'We prioritize movement styles you enjoy, or keep the plan balanced if you have no preference.',
    4: 'Optional gentle reminders — never ads or marketing.',
    5: 'Height refines calorie and macro calculations on your device.',
    6: 'Your starting point helps us chart a sustainable path forward.',
    7: 'Age supports safe, on-device metabolic estimates — never shared.',
    8: 'Your goal shapes workout focus and daily nourishment targets.',
    9: 'A clear destination makes milestones feel achievable.',
    10: 'We match nutrition and movement to the direction you chose.',
    11: 'Pace sets how gently we guide change — you stay in control.',
    12: 'See how your choices come together over time.',
  };
  return reasons[step];
}
