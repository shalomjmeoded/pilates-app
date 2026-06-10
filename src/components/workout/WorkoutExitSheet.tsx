import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface WorkoutExitSheetProps {
  visible: boolean;
  onResumeLater: () => void;
  onDiscard: () => void;
  onContinue: () => void;
}

export function WorkoutExitSheet({
  visible,
  onResumeLater,
  onDiscard,
  onContinue,
}: WorkoutExitSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <Pressable style={styles.backdrop} onPress={onContinue}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text variant="h2" style={styles.title}>
            Leave workout?
          </Text>
          <Text variant="bodyMuted" style={styles.copy}>
            Your progress is saved automatically. Choose what to do next.
          </Text>
          <View style={styles.actions}>
            <Button label="Resume later" variant="secondary" onPress={onResumeLater} />
            <Button label="Discard session" variant="secondary" onPress={onDiscard} />
            <Button label="Continue workout" onPress={onContinue} />
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
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  copy: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
