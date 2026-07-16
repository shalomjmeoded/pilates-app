import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { colors, metrics, radius, createDynamicStyles } from '@/theme';

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
      <MaterialCommunityIcons name="chevron-left" size={24} color={colors.brandPrimary} />
    </Pressable>
  );
}

const styles = createDynamicStyles(() => ({
  button: {
    minWidth: metrics.touchTargetMin,
    minHeight: metrics.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
  },
  pressed: {
    opacity: 0.88,
  },
}));
