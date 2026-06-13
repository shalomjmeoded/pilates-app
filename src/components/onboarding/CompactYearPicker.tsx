import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { getBirthYearOptions } from '@/onboarding/helpers';
import { colors, metrics, radius, spacing } from '@/theme';

const YEAR_OPTIONS = getBirthYearOptions();

interface CompactYearPickerProps {
  value: number;
  onChange: (year: number) => void;
}

export function CompactYearPicker({ value, onChange }: CompactYearPickerProps) {
  const latestYear = YEAR_OPTIONS[0]!;
  const earliestYear = YEAR_OPTIONS[YEAR_OPTIONS.length - 1]!;

  const nudgeYear = (delta: number) => {
    const nextYear = Math.min(latestYear, Math.max(earliestYear, value + delta));
    if (nextYear !== value) {
      onChange(nextYear);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text variant="display" style={styles.selectedYear}>
        {value}
      </Text>

      <View style={styles.nudgeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select previous year"
          onPress={() => nudgeYear(-1)}
          style={({ pressed }) => [styles.nudgeButton, pressed && styles.nudgePressed]}
        >
          <Text variant="body" style={styles.nudgeLabel}>
            −1
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select next year"
          onPress={() => nudgeYear(1)}
          style={({ pressed }) => [styles.nudgeButton, pressed && styles.nudgePressed]}
        >
          <Text variant="body" style={styles.nudgeLabel}>
            +1
          </Text>
        </Pressable>
      </View>

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
                onPress={() => onChange(year)}
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
    fontSize: 42,
    lineHeight: 48,
  },
  nudgeRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  nudgeButton: {
    flex: 1,
    minHeight: metrics.touchTargetMin,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgePressed: {
    opacity: 0.9,
  },
  nudgeLabel: {
    color: colors.brandPrimary,
  },
  yearStripShell: {
    width: '100%',
    minHeight: 84,
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
