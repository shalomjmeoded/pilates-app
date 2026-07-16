import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';

import { VisualAsset, muscleGroupIcon } from '@/components/media';
import { resolveExerciseDisplayMedia } from '@/constants/exerciseMedia';
import type { Exercise } from '@/types/exercise';
import { colors, radius, createDynamicStyles } from '@/theme';

const FRAME_INTERVAL_MS = 850;

interface ExerciseFrameAnimationProps {
  exercise: Exercise;
  size?: number;
  fillWidth?: boolean;
}

export function ExerciseFrameAnimation({
  exercise,
  size = 120,
  fillWidth = false,
}: ExerciseFrameAnimationProps) {
  const media = resolveExerciseDisplayMedia(exercise);
  const startFrame = media.thumbnail;
  const endFrame = media.motionFrame;
  const [showEndFrame, setShowEndFrame] = useState(false);
  const canAnimate = media.animate;

  const hasTwoFrames = Boolean(startFrame && endFrame && canAnimate);

  useEffect(() => {
    if (!hasTwoFrames) {
      return;
    }
    const timer = setInterval(() => {
      setShowEndFrame((value) => !value);
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [exercise.id, hasTwoFrames]);

  if (!startFrame && !endFrame) {
    return (
      <VisualAsset
        icon={muscleGroupIcon(exercise.muscleGroup)}
        fallback="icon"
        size={size}
        fillWidth={fillWidth}
        fillHeight={260}
        accessibilityLabel={`${exercise.name} movement demonstration`}
      />
    );
  }

  const source = showEndFrame && endFrame ? endFrame : startFrame ?? endFrame;

  const frameStyle = fillWidth
    ? styles.fillWidth
    : { width: size, height: size, borderRadius: size > 100 ? radius.card : radius.square };

  return (
    <View style={[styles.frame, frameStyle]}>
      <Image
        source={source!}
        style={fillWidth ? styles.fillImage : { width: size, height: size }}
        resizeMode="cover"
        accessibilityLabel={`${exercise.name} movement demonstration`}
      />
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  frame: {
    backgroundColor: colors.surfaceRose,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillWidth: {
    width: '100%',
    height: 260,
    borderRadius: radius.card,
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
}));
