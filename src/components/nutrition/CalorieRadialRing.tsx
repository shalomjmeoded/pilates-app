import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieRadialRingProps {
  consumed: number;
  target: number;
  remaining: number;
  size?: number;
}

const DEFAULT_SIZE = 220;
export function CalorieRadialRing({
  consumed,
  target,
  remaining,
  size = DEFAULT_SIZE,
}: CalorieRadialRingProps) {
  const progress = useSharedValue(0);
  const ratio = target > 0 ? Math.min(1, consumed / target) : 0;
  const stroke = Math.max(12, Math.round(size * 0.073));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, ratio]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.brandPrimary} />
            <Stop offset="100%" stopColor={colors.accentWarm} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.borderLight}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#calorieGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text variant="h1" style={styles.remaining}>
          {Math.max(0, remaining)}
        </Text>
        <Text variant="label">kcal remaining</Text>
        <Text variant="bodyMuted" style={styles.consumed}>
          {Math.round(consumed)} / {target}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  remaining: {
    color: colors.brandPrimary,
  },
  consumed: {
    marginTop: spacing.xs,
  },
});
