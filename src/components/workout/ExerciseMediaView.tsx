import { VisualAsset, muscleGroupIcon } from '@/components/media';
import { getExerciseGifSource, getExerciseThumbnailSource } from '@/constants/exerciseMedia';
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

  return (
    <VisualAsset
      image={thumbnail}
      gif={gif}
      preferGif={variant === 'gif'}
      icon={muscleGroupIcon(exercise.muscleGroup)}
      fallback="icon"
      size={size}
      fillWidth={fillWidth}
      fillHeight={variant === 'gif' ? 260 : 240}
      accessibilityLabel={`${exercise.name} ${variant === 'gif' ? 'demonstration' : 'thumbnail'}`}
    />
  );
}
