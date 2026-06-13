import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { PREFERENCE_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { ExercisePreference } from '@/types/profile';

export default function Step03Preferences() {
  const { step, goNext, goBack } = useOnboardingNavigation(3);
  const exercisePreferences = useOnboardingStore((state) => state.draft.exercisePreferences);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  const togglePreference = (value: ExercisePreference) => {
    const next = exercisePreferences.includes(value)
      ? exercisePreferences.filter((item) => item !== value)
      : [...exercisePreferences, value];
    patchDraft({ exercisePreferences: next });
  };

  return (
    <OnboardingShell
      step={step}
      title="What do you enjoy?"
      subtitle="Choose one or more. Your plan will prioritize these styles."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={exercisePreferences.length === 0}
      nextDisabledReason="Select at least one movement style to continue."
    >
      {PREFERENCE_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selectionMode="multiple"
          selected={exercisePreferences.includes(option.value)}
          onPress={() => togglePreference(option.value)}
        />
      ))}
    </OnboardingShell>
  );
}
