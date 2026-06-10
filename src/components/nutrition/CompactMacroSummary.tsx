import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { macroProgress } from '@/engines/nutrition';
import type { MacroTotals, NutritionTargets } from '@/types/nutrition';
import { colors, radius, spacing } from '@/theme';

interface MacroColumnProps {
  label: string;
  consumed: number;
  target: number;
  accentColor: string;
}

function MacroColumn({ label, consumed, target, accentColor }: MacroColumnProps) {
  const progress = macroProgress(consumed, target);

  return (
    <View style={styles.column}>
      <Text variant="label">{label}</Text>
      <Text variant="body" style={styles.values}>
        {Math.round(consumed)}
        <Text variant="bodyMuted"> / {Math.round(target)}g</Text>
      </Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: accentColor },
          ]}
        />
      </View>
    </View>
  );
}

interface CompactMacroSummaryProps {
  consumed: MacroTotals;
  targets: Pick<NutritionTargets, 'proteinG' | 'carbsG' | 'fatG'>;
}

export function CompactMacroSummary({ consumed, targets }: CompactMacroSummaryProps) {
  return (
    <View style={styles.wrap}>
      <MacroColumn
        label="Protein"
        consumed={consumed.proteinG}
        target={targets.proteinG}
        accentColor={colors.brandPrimary}
      />
      <MacroColumn
        label="Carbs"
        consumed={consumed.carbsG}
        target={targets.carbsG}
        accentColor={colors.accentWarm}
      />
      <MacroColumn
        label="Fat"
        consumed={consumed.fatG}
        target={targets.fatG}
        accentColor={colors.accentCool}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  column: {
    flex: 1,
    gap: 2,
  },
  values: {
    color: colors.textDark,
  },
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: '#F3E8E4',
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
