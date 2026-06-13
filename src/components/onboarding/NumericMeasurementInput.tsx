import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, metrics, radius, spacing } from '@/theme';
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch unit. Current unit ${unitLabel}`}
          accessibilityHint="Toggles between metric and imperial units"
          onPress={onToggleUnit}
          style={({ pressed }) => [styles.unitToggleButton, pressed && styles.unitTogglePressed]}
        >
          <Text variant="body" style={styles.unitToggle}>
            {unitLabel}
          </Text>
        </Pressable>
      </View>
      <Text variant="bodyMuted">Tap the unit to switch between kilograms and pounds.</Text>
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
    textAlign: 'center',
  },
  unitToggleButton: {
    minWidth: metrics.touchTargetMin,
    minHeight: metrics.touchTargetMin,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
  unitTogglePressed: {
    opacity: 0.9,
  },
});
