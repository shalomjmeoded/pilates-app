import { VisualAsset, muscleGroupIcon } from '@/components/media';
import { ExerciseMediaView } from '@/components/workout/ExerciseMediaView';
import type { Exercise } from '@/types/exercise';

interface ExercisePlaceholderVisualProps {
  muscleGroup: string;
  exercise?: Exercise;
  compact?: boolean;
  large?: boolean;
}

export function ExercisePlaceholderVisual({
  muscleGroup,
  exercise,
  compact = false,
  large = false,
}: ExercisePlaceholderVisualProps) {
  const size = large ? 220 : compact ? 72 : 120;

  if (exercise) {
    return <ExerciseMediaView exercise={exercise} variant="thumbnail" size={size} />;
  }

  return (
    <VisualAsset
      icon={muscleGroupIcon(muscleGroup)}
      fallback="icon"
      size={size}
      accessibilityLabel={`${muscleGroup} exercise`}
    />
  );
}
