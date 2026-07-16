import { VisualAsset, muscleGroupIcon } from '@/components/media';
import { resolveExerciseDisplayMedia } from '@/constants/exerciseMedia';
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
  const media = resolveExerciseDisplayMedia(exercise);
  const animateDemo = variant === 'gif' && media.animate;
  const nativeGif = animateDemo && media.preferNativeGif;
  const resolvedFillHeight = fillHeight ?? (variant === 'gif' ? 260 : 112);

  return (
    <VisualAsset
      image={media.thumbnail}
      gif={media.motionFrame}
      preferGif={animateDemo}
      animateFrames={animateDemo && !nativeGif}
      icon={muscleGroupIcon(exercise.muscleGroup)}
      fallback="icon"
      size={size}
      fillWidth={fillWidth}
      fillHeight={resolvedFillHeight}
      resizeMode={variant === 'gif' ? 'contain' : 'cover'}
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
