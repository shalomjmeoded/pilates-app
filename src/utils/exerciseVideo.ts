import type { Exercise } from '@/types/exercise';

/** App identity YouTube requires as HTTP Referer for embeds (Error 153). */
export const YOUTUBE_EMBED_REFERER = 'https://com.renatovanerven.betterme';

export function buildExerciseYouTubeSearchUrl(exercise: Exercise): string {
  const videoId = exercise.youtubeVideoId?.trim();
  if (videoId) {
    return buildYouTubeWatchUrl(videoId);
  }

  const query = encodeURIComponent(`${exercise.name} exercise tutorial proper form`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    controls: '1',
    fs: '0',
    iv_load_policy: '3',
  });
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

/**
 * Official YouTube IFrame embed with native player controls.
 * Referer / baseUrl must stay set to YOUTUBE_EMBED_REFERER (Error 153).
 */
export function buildYouTubeEmbedHtml(videoId: string): string {
  const safeId = JSON.stringify(videoId);
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #000;
        height: 100%;
        overflow: hidden;
      }
      #player {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script>
      var videoId = ${safeId};

      function onYouTubeIframeAPIReady() {
        new YT.Player('player', {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            playsinline: 1,
            rel: 0,
            controls: 1,
            fs: 0,
            iv_load_policy: 3,
          }
        });
      }

      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    </script>
  </body>
</html>`;
}

export function resolveExerciseYouTube(exercise: Exercise): {
  videoId: string | null;
  embedUrl: string | null;
  watchUrl: string | null;
} {
  const videoId = exercise.youtubeVideoId?.trim() || null;
  return {
    videoId,
    embedUrl: videoId ? buildYouTubeEmbedUrl(videoId) : null,
    watchUrl: videoId ? buildYouTubeWatchUrl(videoId) : null,
  };
}
