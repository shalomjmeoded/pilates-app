import { Image, StyleSheet, View } from 'react-native';

import { ExerciseIllustration } from '@/components/illustrations/ExerciseIllustration';
import { ExerciseFrameAnimation } from '@/components/workout/ExerciseFrameAnimation';
import { getExerciseThumbnailSource } from '@/constants/exerciseMedia';
import type { Exercise } from '@/types/exercise';
import { colors, radius } from '@/theme';

interface ExerciseMediaViewProps {
  exercise: Exercise;
  variant?: 'thumbnail' | 'gif';
  size?: number;
  fillWidth?: boolean;
}

export function ExerciseMediaView({
  exercise,
  variant = 'thumbnail',
  size = 120,
  fillWidth = false,
}: ExerciseMediaViewProps) {
  if (variant === 'gif') {
    return (
      <ExerciseFrameAnimation exercise={exercise} size={size} fillWidth={fillWidth} />
    );
  }

  const source = getExerciseThumbnailSource(exercise.id);

  if (!source) {
    return <ExerciseIllustration muscleGroup={exercise.muscleGroup} size={size} />;
  }

  return (
    <View
      style={[
        styles.frame,
        fillWidth ? styles.fillWidth : { width: size, height: size },
        { borderRadius: size > 100 ? radius.card : radius.square },
      ]}
    >
      <Image
        source={source}
        style={fillWidth ? styles.fillImage : { width: size, height: size }}
        resizeMode="cover"
        accessibilityLabel={`${exercise.name} thumbnail`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.illustrationBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillWidth: {
    width: '100%',
    height: 240,
    borderRadius: radius.card,
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
});
