import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import {
  WORKOUT_CHANGE_FOCUS_OPTIONS,
  WORKOUT_CHANGE_INTENSITY_OPTIONS,
  WORKOUT_CHANGE_MINUTE_OPTIONS,
} from '@/services/workout/workoutChangeOptions';
import type { WorkoutChangeRequest } from '@/types/workout';
import { colors, metrics, radius, spacing } from '@/theme';

interface ChangeWorkoutSheetProps {
  visible: boolean;
  value: WorkoutChangeRequest;
  isApplying?: boolean;
  applyError?: string | null;
  onChange: (next: WorkoutChangeRequest) => void;
  onApply: () => void;
  onClose: () => void;
}

export function ChangeWorkoutSheet({
  visible,
  value,
  isApplying = false,
  applyError = null,
  onChange,
  onApply,
  onClose,
}: ChangeWorkoutSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text variant="h2">Change today&apos;s workout</Text>
          <Text variant="bodyMuted">
            Tell BetterMe what you want to focus on and we&apos;ll rebuild this week around it.
          </Text>

          <View style={styles.section}>
            <Text variant="label">Focus area</Text>
            <View style={styles.chipRow}>
              {WORKOUT_CHANGE_FOCUS_OPTIONS.map((option) => {
                const selected = value.focusArea === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onChange({ ...value, focusArea: option.value })}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text variant="body" style={selected ? styles.chipTextSelected : undefined}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="label">Session time</Text>
            <View style={styles.chipRow}>
              {WORKOUT_CHANGE_MINUTE_OPTIONS.map((minutes) => {
                const selected = value.targetMinutes === minutes;
                return (
                  <Pressable
                    key={minutes}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onChange({ ...value, targetMinutes: minutes })}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text variant="body" style={selected ? styles.chipTextSelected : undefined}>
                      {minutes} min
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="label">Intensity</Text>
            <View style={styles.chipRow}>
              {WORKOUT_CHANGE_INTENSITY_OPTIONS.map((option) => {
                const selected = value.intensity === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onChange({ ...value, intensity: option.value })}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text variant="body" style={selected ? styles.chipTextSelected : undefined}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="label">Optional note to coach</Text>
            <TextInput
              value={value.coachNote ?? ''}
              onChangeText={(coachNote) => onChange({ ...value, coachNote })}
              placeholder="Example: lower knee load this week and prioritize posture"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={styles.noteInput}
              textAlignVertical="top"
            />
          </View>

          {applyError ? (
            <Text variant="body" style={styles.errorText}>
              {applyError}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} disabled={isApplying} />
            <Button label={isApplying ? 'Updating...' : 'Apply changes'} onPress={onApply} disabled={isApplying} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(46, 42, 41, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceCanvas,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: metrics.touchTargetMin,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  noteInput: {
    minHeight: 88,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundPrimary,
    color: colors.textDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 16,
    lineHeight: 22,
  },
  errorText: {
    color: colors.destructive,
  },
  actions: {
    gap: spacing.xs,
  },
});
