import { Pressable, View } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Text } from '@/components/ui/Text';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { OPTIONAL_EXERCISE_EQUIPMENT } from '@/types/exercise';
import type { AvailableEquipmentPreference } from '@/types/preferences';
import { colors, createDynamicStyles, metrics, radius, spacing } from '@/theme';

const LABELS: Record<AvailableEquipmentPreference, { label: string; description: string }> = {
  reformer: {
    label: 'Reformer',
    description: 'Studio reformer machine',
  },
  'magic circle': {
    label: 'Magic circle',
    description: 'Pilates ring for arms and inner thighs',
  },
  'light weights': {
    label: 'Light weights',
    description: '1–5 lb dumbbells or hand weights',
  },
  'resistance band': {
    label: 'Resistance band',
    description: 'Mini-band or long band',
  },
  'pilates ball': {
    label: 'Pilates ball',
    description: 'Soft ball or stability ball',
  },
};

export default function EquipmentSettingsScreen() {
  const availableEquipment = usePreferencesStore(
    (state) => state.preferences.availableEquipment,
  );
  const setAvailableEquipment = usePreferencesStore((state) => state.setAvailableEquipment);

  const toggle = async (value: AvailableEquipmentPreference) => {
    const previous = availableEquipment;
    const next = previous.includes(value)
      ? previous.filter((item) => item !== value)
      : [...previous, value];
    await logSettingChange('availableEquipment', previous, next);
    setAvailableEquipment(next);
  };

  return (
    <SettingsScreenShell
      title="Equipment I have"
      subtitle="Mat and bodyweight moves are always available. Turn on the props you own so workouts can include them."
    >
      <View style={styles.list}>
        {OPTIONAL_EXERCISE_EQUIPMENT.map((value) => {
          const selected = availableEquipment.includes(value);
          const copy = LABELS[value];
          return (
            <Pressable
              key={value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => void toggle(value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text variant="body" style={selected ? styles.optionLabelSelected : undefined}>
                {copy.label}
              </Text>
              <Text variant="caption" style={styles.optionDescription}>
                {copy.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingsScreenShell>
  );
}

const styles = createDynamicStyles(() => ({
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
