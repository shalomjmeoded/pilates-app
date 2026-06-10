import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { getBirthYearOptions } from '@/onboarding/helpers';
import { colors, radius, spacing } from '@/theme';

const YEAR_OPTIONS = getBirthYearOptions();

interface CompactYearPickerProps {
  value: number;
  onChange: (year: number) => void;
}

export function CompactYearPicker({ value, onChange }: CompactYearPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="h1" style={styles.selectedYear}>
        {value}
      </Text>
      <Text variant="bodyMuted" style={styles.caption}>
        Birth year
      </Text>
      <View style={styles.pickerShell}>
        <Picker
          selectedValue={value}
          onValueChange={(year) => onChange(Number(year))}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {YEAR_OPTIONS.map((year) => (
            <Picker.Item key={year} label={String(year)} value={year} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectedYear: {
    color: colors.brandPrimary,
    fontSize: 48,
    lineHeight: 52,
  },
  caption: {
    marginBottom: spacing.xs,
  },
  pickerShell: {
    width: '100%',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    minHeight: Platform.OS === 'ios' ? 148 : 128,
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: 18,
    color: colors.textDark,
  },
});
