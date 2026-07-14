import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radius, spacing, createDynamicStyles } from '@/theme';

interface DevPremiumBypassProps {
  onUnlock: () => void;
  disabled?: boolean;
}

export function DevPremiumBypass({ onUnlock, disabled = false }: DevPremiumBypassProps) {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text variant="caption" style={styles.label}>
        Development only
      </Text>
      <Button
        label="Unlock fake premium"
        variant="secondary"
        onPress={onUnlock}
        disabled={disabled}
      />
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  wrap: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    textAlign: 'center',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
}));
