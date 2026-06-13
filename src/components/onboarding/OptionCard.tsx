import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface OptionCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  accessibilityLabel?: string;
  selectionMode?: 'single' | 'multiple';
  onPress: () => void;
}

export function OptionCard({
  label,
  description,
  selected = false,
  accessibilityLabel,
  selectionMode = 'single',
  onPress,
}: OptionCardProps) {
  const accessibilityRole = selectionMode === 'multiple' ? 'checkbox' : 'radio';
  const accessibilityState =
    selectionMode === 'multiple' ? { checked: selected } : { selected };

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.cardPressed]}
    >
      <View style={styles.content}>
        <Text variant="body" style={selected ? styles.labelSelected : undefined}>
          {label}
        </Text>
        {description ? (
          <Text variant="bodyMuted" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.indicator,
          selectionMode === 'multiple' && styles.indicatorMultiple,
          selected && styles.indicatorSelected,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceRose,
  },
  cardPressed: {
    opacity: 0.9,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  labelSelected: {
    color: colors.brandPrimary,
  },
  description: {
    lineHeight: 20,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  indicatorMultiple: {
    borderRadius: radius.square,
  },
  indicatorSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
});
