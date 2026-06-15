import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { colors, shadows, spacing } from '@/theme';

interface BetterMeBootLoaderProps {
  message?: string;
}

export function BetterMeBootLoader({ message = 'Preparing your rhythm...' }: BetterMeBootLoaderProps) {
  const outerScale = useSharedValue(1);
  const innerOpacity = useSharedValue(0.5);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    outerScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    innerOpacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.45, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [fadeIn, innerOpacity, outerScale]);

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerScale.value }],
    opacity: innerOpacity.value,
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + innerOpacity.value * 0.35,
    transform: [{ scale: 0.92 + innerOpacity.value * 0.06 }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: (1 - fadeIn.value) * 12 }],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, contentStyle]}>
        <View style={styles.markWrap}>
          <Animated.View style={[styles.outerRing, outerRingStyle]} />
          <Animated.View style={[styles.innerRing, innerRingStyle]} />
          <View style={[styles.core, shadows.hero]}>
            <Text
              variant="hero"
              style={styles.logo}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
            >
              BetterMe
            </Text>
          </View>
        </View>
        <Text variant="bodyMuted" style={styles.tagline}>
          Movement, nourishment, and calm progress — in one rhythm.
        </Text>
        <Text variant="caption" style={styles.message}>
          {message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  markWrap: {
    width: 220,
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  outerRing: {
    position: 'absolute',
    width: 208,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: colors.accentWarm,
  },
  innerRing: {
    position: 'absolute',
    width: 176,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: colors.brandSecondary,
  },
  core: {
    width: 156,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceHero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    color: colors.brandPrimary,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  message: {
    textAlign: 'center',
    color: colors.brandSecondary,
  },
});
