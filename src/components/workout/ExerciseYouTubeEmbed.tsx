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
