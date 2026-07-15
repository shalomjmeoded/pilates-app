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

  // #region agent log
  if (
    exercise.id === 'Leg_Lift' ||
    exercise.id === 'Pelvic_Tilt_Into_Bridge' ||
    exercise.id === 'Mat_Boomerang' ||
    exercise.id === 'Mat_Double_Leg_Kick' ||
    exercise.id === 'Mat_Leg_Pull_Back' ||
    exercise.id === 'Cat_Cow' ||
    exercise.id === 'Mat_Kneeling_Side_Kick' ||
    exercise.id === 'Side_Kick' ||
    exercise.id === 'Pilates_Roll_Up' ||
    exercise.id === 'Mat_Neck_Pull'
  ) {
    fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1efa2d' },
      body: JSON.stringify({
        sessionId: '1efa2d',
        runId: 'content-fix-v1',
        hypothesisId: 'M1',
        location: 'ExerciseMediaView.tsx',
        message: 'resolved exercise media',
        data: {
          exerciseId: exercise.id,
          variant,
          yt: exercise.youtubeVideoId,
          source: media.source,
          animate: animateDemo,
          nativeGif,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

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
