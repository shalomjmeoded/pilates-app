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
}

export function ExerciseMediaView({
  exercise,
  variant = 'thumbnail',
  size = 120,
  fillWidth = false,
}: ExerciseMediaViewProps) {
  const thumbnail = getExerciseThumbnailSource(exercise.id);
  const gif = getExerciseGifSource(exercise.id);
  const animateDemo = variant === 'gif' && hasAnimatedExerciseDemo(exercise.id);

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
      fillHeight={variant === 'gif' ? 260 : 240}
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
