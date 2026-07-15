import { View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import type { Exercise } from '@/types/exercise';
import { colors, createDynamicStyles, radius, spacing } from '@/theme';
import {
  YOUTUBE_EMBED_REFERER,
  buildYouTubeEmbedHtml,
  resolveExerciseYouTube,
} from '@/utils/exerciseVideo';

interface ExerciseYouTubeEmbedProps {
  exercise: Exercise;
  /** When false, hide streaming demos entirely. */
  allowStreaming: boolean;
  /** Persist turning streaming demos on (e.g. from exercise detail). */
  onEnableStreaming?: () => void;
}

function buildDemoCredit(attribution: string | null | undefined): string {
  const source = attribution?.trim();
  return source ? `Demo via YouTube · ${source}` : 'Demo via YouTube';
}

/**
 * In-app YouTube embed only. Renders nothing when there is no curated video id —
 * never redirects to a channel or search page.
 */
export function ExerciseYouTubeEmbed({
  exercise,
  allowStreaming,
  onEnableStreaming,
}: ExerciseYouTubeEmbedProps) {
  const { videoId, embedUrl } = resolveExerciseYouTube(exercise);

  // #region agent log
  if (
    exercise.id === 'Cat_Cow' ||
    exercise.id === 'Leg_Lift' ||
    exercise.id === 'Pelvic_Tilt_Into_Bridge' ||
    exercise.id === 'Mat_Boomerang' ||
    exercise.id === 'Mat_Double_Leg_Kick' ||
    exercise.id === 'Mat_Leg_Pull_Back' ||
    exercise.id === 'Mat_Kneeling_Side_Kick' ||
    exercise.id === 'Side_Kick' ||
    exercise.id === 'Pilates_Roll_Up' ||
    exercise.id === 'Mat_Neck_Pull' ||
    exercise.equipment === 'magic circle'
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1efa2d'},body:JSON.stringify({sessionId:'1efa2d',runId:'reverse-crunch-v17',hypothesisId:'RC1',location:'ExerciseYouTubeEmbed.tsx',message:'youtube resolve',data:{exerciseId:exercise.id,videoId,expectedReverseCrunchId:exercise.id==='Reverse_Crunch'?'XY8KzdDcMFg':null,hasEmbed:Boolean(embedUrl),attr:exercise.youtubeAttribution},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }
  // #endregion

  if (!videoId || !embedUrl) {
    return null;
  }

  if (!allowStreaming) {
    return (
      <View style={styles.wrap}>
        <Text variant="label" style={styles.label}>
          Video demo
        </Text>
        <Text variant="bodyMuted" style={styles.copy}>
          Video demos are off in your preferences.
        </Text>
        {onEnableStreaming ? (
          <Button label="Enable video demos" onPress={onEnableStreaming} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text variant="label" style={styles.label}>
        Video demo
      </Text>
      <View style={styles.player}>
        <WebView
          key={`${videoId}-native-controls`}
          source={{
            html: buildYouTubeEmbedHtml(videoId),
            baseUrl: YOUTUBE_EMBED_REFERER,
            headers: {
              Referer: YOUTUBE_EMBED_REFERER,
              'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
          }}
          style={styles.webview}
          allowsFullscreenVideo={false}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          setSupportMultipleWindows={false}
          nestedScrollEnabled
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url;
            if (url.includes('/@') || url.includes('/channel/') || url.includes('/results?')) {
              return false;
            }
            return true;
          }}
        />
      </View>
      <Text variant="caption" style={styles.credit}>
        {buildDemoCredit(exercise.youtubeAttribution)}
      </Text>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.brandPrimary,
  },
  copy: {
    lineHeight: 22,
  },
  credit: {
    color: colors.textMuted,
    lineHeight: 18,
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
}));
