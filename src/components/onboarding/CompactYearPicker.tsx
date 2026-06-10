import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { getBirthYearOptions } from '@/onboarding/helpers';
import { colors, radius, spacing } from '@/theme';

const YEAR_OPTIONS = getBirthYearOptions();
const PICKER_MAX_HEIGHT = 220;

interface CompactYearPickerProps {
  value: number;
  onChange: (year: number) => void;
}

export function CompactYearPicker({ value, onChange }: CompactYearPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="display" style={styles.selectedYear}>
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
    gap: spacing.sm,
  },
  selectedYear: {
    color: colors.brandPrimary,
    fontSize: 42,
    lineHeight: 48,
  },
  caption: {
    marginBottom: spacing.xs,
  },
  pickerShell: {
    width: '100%',
    maxHeight: PICKER_MAX_HEIGHT,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? PICKER_MAX_HEIGHT : 180,
  },
  picker: {
    width: '100%',
    height: PICKER_MAX_HEIGHT,
  },
  pickerItem: {
    fontSize: 20,
    color: colors.textDark,
    height: PICKER_MAX_HEIGHT,
  },
});
