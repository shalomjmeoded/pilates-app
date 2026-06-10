import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { NUTRITION_MODE_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step08NutritionMode() {
  const { step, goNext, goBack } = useOnboardingNavigation(9);
  const nutritionMode = useOnboardingStore((state) => state.draft.nutritionMode);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="Nutrition tracking"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!nutritionMode}
    >
      {NUTRITION_MODE_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          description={option.description}
          selected={nutritionMode === option.value}
          onPress={() => patchDraft({ nutritionMode: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
