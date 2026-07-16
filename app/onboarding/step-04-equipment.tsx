import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { ONBOARDING_EQUIPMENT_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { AvailableEquipmentPreference } from '@/types/preferences';

export default function Step04Equipment() {
  const { step, goNext, goBack } = useOnboardingNavigation(5);
  const availableEquipment = useOnboardingStore((state) => state.draft.availableEquipment);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  const toggleEquipment = (value: AvailableEquipmentPreference) => {
    const next = availableEquipment.includes(value)
      ? availableEquipment.filter((item) => item !== value)
      : [...availableEquipment, value];
    patchDraft({ availableEquipment: next });
  };

  const selectMatOnly = () => {
    patchDraft({ availableEquipment: [] });
  };

  return (
    <OnboardingShell
      step={step}
      title="Equipment I have"
      subtitle="Mat and bodyweight are always included. Add any props you own — or keep mat only."
      onBack={goBack}
      onNext={goNext}
      centerBody
      scrollFallbackOnCompact
    >
      <OptionCard
        label="Mat only"
        index={0}
        selected={availableEquipment.length === 0}
        onPress={selectMatOnly}
      />
      {ONBOARDING_EQUIPMENT_OPTIONS.map((option, index) => (
        <OptionCard
          key={option.value}
          label={option.label}
          index={index + 1}
          selectionMode="multiple"
          selected={availableEquipment.includes(option.value)}
          onPress={() => toggleEquipment(option.value)}
        />
      ))}
    </OnboardingShell>
  );
}
