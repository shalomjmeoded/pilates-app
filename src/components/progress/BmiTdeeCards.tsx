import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { formatPhysiqueCategory } from '@/engines/physique/physiqueAssessmentFlow';
import type { BodyFatAssumption, BmiInfo, TdeeInfo } from '@/types/progress';
import { colors, spacing } from '@/theme';

interface BmiTdeeCardsProps {
  bmi: BmiInfo;
  tdee: TdeeInfo;
  bodyFatAssumption?: BodyFatAssumption | null;
}

function bmrFormulaLabel(formula?: TdeeInfo['bmrFormula']): string {
  switch (formula) {
    case 'katch_mcardle':
      return 'BMR from lean mass (visual BF)';
    case 'female':
      return 'BMR Mifflin-St Jeor (female)';
    case 'male':
      return 'BMR Mifflin-St Jeor (male)';
    case 'neutral':
      return 'BMR Mifflin-St Jeor (neutral)';
    default:
      return 'BMR estimate';
  }
}

export function BmiTdeeCards({ bmi, tdee, bodyFatAssumption }: BmiTdeeCardsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Card style={styles.card}>
          <Text variant="label" style={styles.label}>
            BMI
          </Text>
          <Text variant="h1" style={styles.value}>
            {bmi.value}
          </Text>
          <Text variant="bodyMuted">{bmi.categoryLabel}</Text>
        </Card>
        <Card style={styles.card}>
          <Text variant="label" style={styles.label}>
            TDEE
          </Text>
          <Text variant="h1" style={styles.value}>
            {Math.round(tdee.value)}
          </Text>
          <Text variant="bodyMuted">kcal / day</Text>
          <Text variant="bodyMuted" style={styles.sub}>
            BMR {Math.round(tdee.bmr)}
          </Text>
        </Card>
      </View>

      {bodyFatAssumption ? (
        <Card style={styles.bodyFatCard}>
          <Text variant="label" style={styles.label}>
            Assumed body fat
          </Text>
          <Text variant="h1" style={styles.value}>
            {bodyFatAssumption.minPercent}–{bodyFatAssumption.maxPercent}%
          </Text>
          <Text variant="bodyMuted">
            Midpoint {bodyFatAssumption.midpointPercent}% ·{' '}
            {formatPhysiqueCategory(bodyFatAssumption.physiqueCategory)}
          </Text>
          <Text variant="bodyMuted" style={styles.sub}>
            From visual assessment · informs calories, protein, and workouts
          </Text>
          <Text variant="bodyMuted" style={styles.sub}>
            {bmrFormulaLabel(tdee.bmrFormula)}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    gap: 4,
  },
  bodyFatCard: {
    gap: 4,
  },
  label: {
    color: colors.textMuted,
  },
  value: {
    fontSize: 32,
    lineHeight: 36,
  },
  sub: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
});
