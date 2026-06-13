import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface LockedPreviewCardProps {
  eyebrow: string;
  children: ReactNode;
  lockLabel?: string;
}

export function LockedPreviewCard({
  eyebrow,
  children,
  lockLabel = 'Unlock with free trial',
}: LockedPreviewCardProps) {
  return (
    <View style={styles.card}>
      <Text variant="label" style={styles.eyebrow}>
        {eyebrow}
      </Text>
      <View style={styles.preview}>
        <View style={styles.previewContent}>{children}</View>
        <View style={styles.lockOverlay} pointerEvents="none">
          <Text variant="label" style={styles.lockLabel}>
            {lockLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.brandSecondary,
  },
  preview: {
    position: 'relative',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCanvas,
    overflow: 'hidden',
  },
  previewContent: {
    opacity: 0.42,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247, 243, 237, 0.35)',
  },
  lockLabel: {
    color: colors.brandPrimary,
    backgroundColor: colors.surfaceRose,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
});
