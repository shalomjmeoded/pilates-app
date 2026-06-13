import { VisualAsset, muscleGroupIcon } from '@/components/media';
import {
  getExerciseGifSource,
  getExerciseThumbnailSource,
  hasAnimatedExerciseDemo,
} from '@/constants/exerciseMedia';
import type { Exercise } from '@/types/exercise';

interface ExerciseMediaViewProps {
  exercise: Exercise;
  variant?: 'thumbnail' | 'gif';
  size?: number;
  fillWidth?: boolean;
  fillHeight?: number;
}

export function ExerciseMediaView({
  exercise,
  variant = 'thumbnail',
  size = 120,
  fillWidth = false,
  fillHeight,
}: ExerciseMediaViewProps) {
  const thumbnail = getExerciseThumbnailSource(exercise.id);
  const gif = getExerciseGifSource(exercise.id);
  const animateDemo = variant === 'gif' && hasAnimatedExerciseDemo(exercise.id);
  const resolvedFillHeight = fillHeight ?? (variant === 'gif' ? 260 : 112);

  return (
    <VisualAsset
      image={thumbnail}
      gif={gif}
      preferGif={animateDemo}
      animateFrames={animateDemo}
      icon={muscleGroupIcon(exercise.muscleGroup)}
      fallback="icon"
      size={size}
      fillWidth={fillWidth}
      fillHeight={resolvedFillHeight}
      accessibilityLabel={`${exercise.name} ${
        variant === 'gif'
          ? animateDemo
            ? 'demonstration animation'
            : 'demonstration preview image'
          : 'thumbnail'
      }`}
    />
  );
}
