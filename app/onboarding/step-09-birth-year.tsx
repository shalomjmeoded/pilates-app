import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import {
  getBirthYearBounds,
  isBirthYearWithinSupportedAge,
  MIN_SUPPORTED_AGE,
  MAX_SUPPORTED_AGE,
} from '@/onboarding/helpers';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';
import { fontFamily } from '@/theme/typography';

const { minYear: MIN_BIRTH_YEAR, maxYear: MAX_BIRTH_YEAR } = getBirthYearBounds();

export default function Step09BirthYear() {
  const { step, goNext, goBack } = useOnboardingNavigation(8);
  const birthYear = useOnboardingStore((state) => state.draft.birthYear);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const [birthYearInput, setBirthYearInput] = useState('');
  const parsedBirthYear = birthYearInput.length === 4 ? Number(birthYearInput) : null;
  const isValidBirthYear =
    parsedBirthYear !== null && isBirthYearWithinSupportedAge(parsedBirthYear);

  useEffect(() => {
    if (birthYear && isBirthYearWithinSupportedAge(birthYear)) {
      setBirthYearInput(String(birthYear));
    }
  }, [birthYear]);

  const handleChangeBirthYear = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 4);
    setBirthYearInput(sanitized);

    if (sanitized.length !== 4) {
      patchDraft({ birthYear: null });
      return;
    }

    const year = Number(sanitized);
    patchDraft({ birthYear: isBirthYearWithinSupportedAge(year) ? year : null });
  };

  return (
    <OnboardingShell
      step={step}
      title="When were you born?"
      subtitle={`Used only on-device for safe metabolic estimates (${MIN_SUPPORTED_AGE}–${MAX_SUPPORTED_AGE} years).`}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!isValidBirthYear}
      nextDisabledReason={`Select a year between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR} to continue.`}
    >
      <View style={styles.fieldWrap}>
        <Text variant="label">Birth year</Text>
        <TextInput
          accessibilityLabel="Birth year"
          accessibilityHint={`Enter a year between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}`}
          keyboardType="number-pad"
          maxLength={4}
          onChangeText={handleChangeBirthYear}
          placeholder="1994"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={birthYearInput}
        />
      </View>

      {birthYearInput.length === 4 && !isValidBirthYear ? (
        <Text variant="body" style={styles.error}>
          Enter a valid year between {MIN_BIRTH_YEAR} and {MAX_BIRTH_YEAR}.
        </Text>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    minHeight: 52,
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    color: colors.textDark,
  },
  error: {
    color: colors.destructive,
  },
});
