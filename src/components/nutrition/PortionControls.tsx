import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { PORTION_PRESETS } from '@/types/nutrition';
import { colors, metrics, radius, spacing } from '@/theme';

interface PortionControlsProps {
  multiplier: number;
  onChange: (multiplier: number) => void;
  onStep: (direction: 1 | -1) => void;
}

export function PortionControls({ multiplier, onChange, onStep }: PortionControlsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.stepRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease portion by 10 percent"
          onPress={() => onStep(-1)}
          style={styles.stepButton}
        >
          <Text variant="body" style={styles.stepLabel}>
            −10%
          </Text>
        </Pressable>
        <Text variant="bodyMuted">{multiplier.toFixed(1)}× portion</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase portion by 10 percent"
          onPress={() => onStep(1)}
          style={styles.stepButton}
        >
          <Text variant="body" style={styles.stepLabel}>
            +10%
          </Text>
        </Pressable>
      </View>
      <View style={styles.chipRow}>
        {PORTION_PRESETS.map((preset) => {
          const selected = multiplier === preset;
          return (
            <Pressable
              key={preset}
              accessibilityRole="button"
              accessibilityLabel={`Set portion to ${preset}x`}
              accessibilityState={{ selected }}
              onPress={() => onChange(preset)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text variant="body" style={selected ? styles.chipTextSelected : undefined}>
                {preset}x
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    minHeight: metrics.touchTargetMin,
    minWidth: 56,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surfaceCanvas,
  },
  stepLabel: {
    color: colors.brandPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    minHeight: metrics.touchTargetMin,
    backgroundColor: colors.surfaceCanvas,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceSelected,
  },
  chipTextSelected: {
    color: colors.brandPrimary,
  },
});
