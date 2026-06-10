import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { ConsistencyBreakdown } from '@/types/progress';
import { colors, spacing } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ConsistencyScoreRingProps {
  consistency: ConsistencyBreakdown;
}

const SIZE = 168;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ConsistencyScoreRing({ consistency }: ConsistencyScoreRingProps) {
  const progress = useSharedValue(0);
  const ratio = consistency.score / 100;

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, ratio]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <Card style={styles.card}>
      <Text variant="label" style={styles.eyebrow}>
        Consistency score
      </Text>
      <View style={styles.wrap}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="consistencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.accentCool} />
              <Stop offset="100%" stopColor={colors.brandPrimary} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.borderLight}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#consistencyGradient)"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.center}>
          <Text variant="h1" style={styles.score}>
            {consistency.score}
          </Text>
          <Text variant="bodyMuted">out of 100</Text>
        </View>
      </View>
      <View style={styles.breakdown}>
        <BreakdownRow label="Workouts" value={consistency.workoutScore} />
        <BreakdownRow label="Calories" value={consistency.calorieScore} />
        <BreakdownRow label="Protein" value={consistency.proteinScore} />
        <BreakdownRow label="Weigh-ins" value={consistency.weightLoggingScore} />
      </View>
    </Card>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text variant="bodyMuted">{label}</Text>
      <Text variant="body">{value}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  score: {
    fontSize: 40,
    lineHeight: 44,
  },
  breakdown: {
    width: '100%',
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
