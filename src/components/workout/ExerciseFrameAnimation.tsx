import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { VisualAsset, muscleGroupIcon } from '@/components/media';
import { getExerciseGifSource, getExerciseThumbnailSource } from '@/constants/exerciseMedia';
import type { Exercise } from '@/types/exercise';
import { colors, radius } from '@/theme';

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
  const startFrame = getExerciseThumbnailSource(exercise.id);
  const endFrame = getExerciseGifSource(exercise.id);
  const [showEndFrame, setShowEndFrame] = useState(false);

  const hasTwoFrames = Boolean(startFrame && endFrame && startFrame !== endFrame);

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

const styles = StyleSheet.create({
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
});
