import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

import { confirmDiscardBack } from './confirmDiscardBack';
import { useDiscardBackHandler } from './useDiscardBackHandler';

interface BackButtonProps {
  hasUnsavedChanges?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function BackButton({
  hasUnsavedChanges = false,
  onPress,
  accessibilityLabel = 'Go back',
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    const goBack = () => {
      if (onPress) {
        onPress();
        return;
      }
      router.back();
    };

    confirmDiscardBack(goBack, hasUnsavedChanges);
  }, [hasUnsavedChanges, onPress, router]);

  useDiscardBackHandler(handlePress);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text variant="h2" style={styles.arrow}>
        ←
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.72,
  },
  arrow: {
    color: colors.brandPrimary,
    fontSize: 28,
    lineHeight: 32,
  },
});
