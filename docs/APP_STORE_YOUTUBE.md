# App Store submit checklist — YouTube embeds

Use this before the next iOS update that includes exercise video demos.

## In-app (already shipped in this change)

- [x] Official YouTube IFrame embed with **native controls** (`controls: 1`)
- [x] Visible credit under the player: `Demo via YouTube · {attribution}`
- [x] Channel / search navigations blocked in the WebView
- [x] Streaming demos can be disabled in Preferences
- [x] Settings → Privacy discloses optional YouTube / Google network loads
- [x] Embed Referer / `baseUrl` kept as app identity (avoids Error 153)

## Hosted privacy policy

Update `https://clearday-seven.vercel.app/betterme` (paywall Privacy Policy URL) to state:

- Optional exercise demos use the official YouTube embed when the user enables streaming demos
- Playback may involve data processed by Google / YouTube
- Users can turn demos off in Preferences
- BetterMe does not download or re-host YouTube video files

## App Store Connect

- [ ] Privacy Nutrition Label / privacy answers reflect YouTube network use when demos play
- [ ] Also keep anonymous product analytics disclosures current (see `docs/PRODUCT_ANALYTICS.md`)
- [ ] Screenshots / description do not claim BetterMe owns third-party demo videos

## Review Notes (paste into ASC)

```
Exercise demos use the official YouTube IFrame Player API for curated public video IDs only.
We do not scrape YouTube, download video files, or open channel/search pages in-app.
Users can disable streaming demos under Settings → Preferences.
Each demo shows a “Demo via YouTube” attribution line (plus source when available).
```

## Pre-submit smoke test (TestFlight)

- [ ] Open an exercise with a video: native YouTube controls visible; credit line visible
- [ ] Confirm playback works (no Error 153)
- [ ] Prefer Preferences → turn off video demos: embed hidden / enable CTA works
- [ ] Tap-through does not open YouTube channel or search UI inside the app
