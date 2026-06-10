import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface OptionCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
}

export function OptionCard({ label, description, selected = false, onPress }: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
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
      <View style={[styles.indicator, selected && styles.indicatorSelected]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceRose,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  labelSelected: {
    color: colors.brandPrimary,
  },
  description: {
    marginTop: 2,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  indicatorSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
});
