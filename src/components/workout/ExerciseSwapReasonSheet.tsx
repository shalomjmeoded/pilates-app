import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { EXERCISE_SWAP_REASONS, type ExerciseSwapReason } from '@/types/exerciseSwap';
import { colors, radius, spacing } from '@/theme';

interface ExerciseSwapReasonSheetProps {
  visible: boolean;
  isLoading?: boolean;
  onSelectReason: (reason: ExerciseSwapReason) => void;
  onClose: () => void;
}

export function ExerciseSwapReasonSheet({
  visible,
  isLoading = false,
  onSelectReason,
  onClose,
}: ExerciseSwapReasonSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text variant="h2" style={styles.title}>
            Why swap this exercise?
          </Text>
          <Text variant="bodyMuted" style={styles.copy}>
            Choose a reason so Tune can suggest a better fit from your local library.
          </Text>

          <View style={styles.reasonList}>
            {EXERCISE_SWAP_REASONS.map((reason) => (
              <Pressable
                key={reason.id}
                accessibilityRole="button"
                disabled={isLoading}
                onPress={() => onSelectReason(reason.id)}
                style={styles.reasonChip}
              >
                <Text variant="body">{reason.label}</Text>
              </Pressable>
            ))}
          </View>

          <Button label="Cancel" variant="secondary" onPress={onClose} disabled={isLoading} />
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
  title: {
    color: colors.textDark,
  },
  copy: {
    lineHeight: 22,
  },
  reasonList: {
    gap: spacing.xs,
  },
  reasonChip: {
    minHeight: 48,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
});
