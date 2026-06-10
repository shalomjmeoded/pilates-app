import { StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';
import { fontFamily } from '@/theme/typography';

interface MealFormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'decimal-pad';
  placeholder?: string;
}

export function MealFormField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
}: MealFormFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textDark,
  },
});
