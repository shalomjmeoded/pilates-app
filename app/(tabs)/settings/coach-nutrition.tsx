import { Pressable, View } from 'react-native';
import { useEffect, useState } from 'react';

import { SettingsScreenShell, SettingsToggleRow } from '@/components/settings';
import { Text } from '@/components/ui/Text';
import { getCalorieSafetyThreshold } from '@/engines/calculations/safety';
import { getProfile } from '@/db/repositories/profileRepository';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { CoachDeficitCutPreference } from '@/types/preferences';
import type { GenderIdentity } from '@/types/profile';
import { colors, createDynamicStyles, metrics, radius, spacing } from '@/theme';

const CUT_OPTIONS: Array<{ value: CoachDeficitCutPreference; label: string; description: string }> =
  [
    {
      value: 'carbs',
      label: 'Carbs first',
      description: 'Prefer trimming carbs when a decrease is needed',
    },
    {
      value: 'fat',
      label: 'Fat first',
      description: 'Prefer trimming fat when a decrease is needed',
    },
    {
      value: 'balanced',
      label: 'Balanced',
      description: 'Split any decrease across carbs and fat',
    },
  ];

export default function CoachNutritionSettingsScreen() {
  const coachNutrition = usePreferencesStore((state) => state.preferences.coachNutrition);
  const setCoachNutrition = usePreferencesStore((state) => state.setCoachNutrition);
  const [genderIdentity, setGenderIdentity] = useState<GenderIdentity>('female');

  useEffect(() => {
    void getProfile().then((profile) => {
      if (profile?.genderIdentity) {
        setGenderIdentity(profile.genderIdentity);
      }
    });
  }, []);

  const safeguardFloor = getCalorieSafetyThreshold(genderIdentity);

  const patch = async (
    key: keyof typeof coachNutrition,
    nextValue: boolean | CoachDeficitCutPreference,
  ) => {
    const previous = coachNutrition;
    const next = { ...coachNutrition, [key]: nextValue };
    await logSettingChange(`coachNutrition.${String(key)}`, previous[key], nextValue);
    setCoachNutrition(next);
  };

  return (
    <SettingsScreenShell
      title="Weekly coach targets"
      subtitle="After each weekly check-in, the coach can gently nudge calories if your pace is off. Manual nutrition targets always block this. Auto-adjust starts off — turn it on only if you want help."
    >
      <SettingsToggleRow
        label="Coach may adjust targets"
        description={
          coachNutrition.adjustEnabled
            ? 'On for weight-loss plans when weekly data is ready'
            : 'Adjustments are paused (recommended default)'
        }
        enabled={coachNutrition.adjustEnabled}
        onToggle={() => void patch('adjustEnabled', !coachNutrition.adjustEnabled)}
      />
      <SettingsToggleRow
        label="Calorie safeguard"
        description={`Never auto-decrease below ${safeguardFloor} kcal for your profile. Keeps targets supportive.`}
        enabled={coachNutrition.calorieSafeguardEnabled}
        onToggle={() =>
          void patch('calorieSafeguardEnabled', !coachNutrition.calorieSafeguardEnabled)
        }
      />
      <SettingsToggleRow
        label="Allow calorie increases"
        description="If loss is faster than planned, raise calories gently"
        enabled={coachNutrition.allowIncrease}
        onToggle={() => void patch('allowIncrease', !coachNutrition.allowIncrease)}
      />
      <SettingsToggleRow
        label="Allow calorie decreases"
        description="If progress is slower than planned, lower calories within your safeguard"
        enabled={coachNutrition.allowDecrease}
        onToggle={() => void patch('allowDecrease', !coachNutrition.allowDecrease)}
      />

      <Text variant="label" style={styles.sectionLabel}>
        When nudging calories down
      </Text>
      <View style={styles.list}>
        {CUT_OPTIONS.map((option) => {
          const selected = coachNutrition.deficitCutPreference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => void patch('deficitCutPreference', option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text variant="body" style={selected ? styles.optionLabelSelected : undefined}>
                {option.label}
              </Text>
              <Text variant="caption" style={styles.optionDescription}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingsScreenShell>
  );
}

const styles = createDynamicStyles(() => ({
  sectionLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  list: {
    gap: spacing.xs,
  },
  option: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: metrics.touchTargetMin,
    gap: 4,
  },
  optionSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceSelected,
  },
  optionLabelSelected: {
    color: colors.brandPrimary,
  },
  optionDescription: {
    color: colors.textMuted,
  },
}));
