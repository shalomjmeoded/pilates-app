import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { getBirthYearOptions } from '@/onboarding/helpers';
import { colors, metrics, radius, spacing } from '@/theme';
import { selectionHaptic } from '@/utils/haptics';

const YEAR_OPTIONS = getBirthYearOptions();

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

      <View style={styles.yearStripShell}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearStripContent}
          accessibilityLabel="Birth year options"
          accessibilityHint="Swipe left or right and tap a year"
        >
          {YEAR_OPTIONS.map((year) => {
            const selected = year === value;
            return (
              <Pressable
                key={year}
                accessibilityRole="button"
                accessibilityLabel={`Select birth year ${year}`}
                accessibilityState={{ selected }}
                onPress={() => {
                  selectionHaptic();
                  onChange(year);
                }}
                style={({ pressed }) => [
                  styles.yearChip,
                  selected && styles.yearChipSelected,
                  pressed && styles.yearChipPressed,
                ]}
              >
                <Text variant="body" style={selected ? styles.yearChipTextSelected : styles.yearChipText}>
                  {year}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
    fontSize: 36,
    lineHeight: 40,
  },
  yearStripShell: {
    width: '100%',
    minHeight: 76,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  yearStripContent: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  yearChip: {
    minHeight: metrics.touchTargetMin,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearChipSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceSelected,
  },
  yearChipPressed: {
    opacity: 0.9,
  },
  yearChipText: {
    color: colors.textMuted,
  },
  yearChipTextSelected: {
    color: colors.brandPrimary,
  },
});
