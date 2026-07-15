# YouTube 1:1 mapping audit (library v16)

Source: `assets/seed/exercises.json` + `assets/seed/exerciseYoutubeMap.json`.

## Summary (v16)

| Metric | Value |
|--------|------:|
| Exercises in library | **104** |
| With YouTube embed | **104 / 104** |
| Unique YouTube IDs | 63+ |
| Removed (no curated demo) | **18** |
| Thumbnails synced from YouTube frames | **104** |
| Distinct thumb ≠ gif (animation) | **104 / 104** |

## Removed exercises (v16)

These were dropped from the seed (not shown in-app):

Ball Roll-Out, Ball Seated March, Band Side Step, Flat Bench Lying Leg Raise, Flutter Kicks, Hip Circles, Light Weight Arm Circles, Magic Circle Arm Press, Magic Circle Chest Opener, Magic Circle Inner Thigh Squeeze, Magic Circle Standing Press, Reformer Arms Supine, Reformer Knee Stretches, Reformer Short Box Round Back, Reformer Stomach Massage, Seal, Superman, Toe Taps.

## Media policy

1. Every remaining exercise has a curated `youtubeVideoId`.
2. Thumbnail = YouTube frame `0.jpg`; gif/detail = frame `1.jpg` (or `2` / `mqdefault` fallback) so **pic matches the video**.
3. Shared video IDs only for true variations (Hundred family, bridge family, push-up variants, etc.).
4. Bump `EXERCISE_LIBRARY_VERSION` after seed changes (currently **16**).

## Status

Full library recheck applied. Restart app with clean cache to reseed v16.
