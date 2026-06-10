import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { ExerciseFeedback } from '@/types/exercise';
import { colors, radius, spacing } from '@/theme';

const OPTIONS: Array<{ value: ExerciseFeedback; label: string }> = [
  { value: 'completed', label: 'Completed smoothly' },
  { value: 'skipped', label: 'Skipped / inaccessible' },
  { value: 'modified', label: 'Modified movement' },
];

interface FeedbackSelectorProps {
  value?: ExerciseFeedback;
  onChange: (value: ExerciseFeedback) => void;
}

export function FeedbackSelector({ value, onChange }: FeedbackSelectorProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text variant="body" style={selected ? styles.chipTextSelected : undefined}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const FEEDBACK_LABELS: Record<ExerciseFeedback, string> = {
  completed: 'Completed',
  skipped: 'Skipped',
  modified: 'Modified',
};

export function feedbackLabel(feedback: ExerciseFeedback): string {
  return FEEDBACK_LABELS[feedback];
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: '#FFF8F7',
  },
  chipTextSelected: {
    color: colors.brandPrimary,
  },
});
