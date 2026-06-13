import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { WeightChartRange } from '@/types/progress';
import { colors, metrics, radius, spacing } from '@/theme';

const RANGES: Array<{ key: WeightChartRange; label: string }> = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '1y', label: '1Y' },
  { key: 'all', label: 'All' },
];

interface WeightChartRangeSwitcherProps {
  value: WeightChartRange;
  onChange: (range: WeightChartRange) => void;
}

export function WeightChartRangeSwitcher({ value, onChange }: WeightChartRangeSwitcherProps) {
  return (
    <View style={styles.row}>
      {RANGES.map((range) => {
        const selected = range.key === value;
        return (
          <Pressable
            key={range.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(range.key)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text variant="label" style={selected ? styles.chipTextSelected : styles.chipText}>
              {range.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    minHeight: metrics.touchTargetMin,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.surfaceSelected,
    borderColor: colors.brandPrimary,
  },
  chipText: {
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.brandPrimary,
  },
});
