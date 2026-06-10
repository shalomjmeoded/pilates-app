import { StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';
import { fontFamily } from '@/theme/typography';

interface NumericMeasurementInputProps {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  unitLabel: string;
  onToggleUnit: () => void;
  placeholder?: string;
}

export function NumericMeasurementInput({
  label,
  value,
  onChangeValue,
  unitLabel,
  onToggleUnit,
  placeholder,
}: NumericMeasurementInputProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <View style={styles.row}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          onChangeText={onChangeValue}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={value}
        />
        <Text variant="body" onPress={onToggleUnit} style={styles.unitToggle}>
          {unitLabel}
        </Text>
      </View>
      <Text variant="bodyMuted">Tap the unit label to switch display. Values are stored in metric internally.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    minHeight: 56,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 24,
    color: colors.textDark,
    paddingVertical: spacing.xs,
  },
  unitToggle: {
    color: colors.brandPrimary,
    minWidth: 48,
    textAlign: 'right',
  },
});
