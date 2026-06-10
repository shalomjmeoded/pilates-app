import { ReactNode } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { MOTION } from '@/theme';

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down';
}

export function FadeInView({ children, delay = 0, direction = 'up' }: FadeInViewProps) {
  const entering =
    direction === 'down'
      ? FadeInDown.duration(MOTION.normal).delay(delay)
      : FadeInUp.duration(MOTION.normal).delay(delay);

  return <Animated.View entering={entering}>{children}</Animated.View>;
}
