import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { macroProgress } from '@/engines/nutrition';
import { colors, radius, spacing } from '@/theme';

interface MacroProgressBarProps {
  label: string;
  consumed: number;
  target: number;
  unit?: string;
  accentColor?: string;
}

export function MacroProgressBar({
  label,
  consumed,
  target,
  unit = 'g',
  accentColor = colors.brandPrimary,
}: MacroProgressBarProps) {
  const progress = macroProgress(consumed, target);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text variant="body">{label}</Text>
        <Text variant="bodyMuted">
          {Math.round(consumed)}
          {unit} / {Math.round(target)}
          {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: '#F3E8E4',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
