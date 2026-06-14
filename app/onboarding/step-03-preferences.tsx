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

  const clearPreferences = () => {
    patchDraft({ exercisePreferences: [] });
  };

  return (
    <OnboardingShell
      step={step}
      title="What movement speaks to you?"
      subtitle="Choose what you enjoy. Your plan will lean into these styles."
      onBack={goBack}
      onNext={goNext}
    >
      <OptionCard
        label="No preference"
        description="Build me a balanced plan."
        selected={exercisePreferences.length === 0}
        onPress={clearPreferences}
      />
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
