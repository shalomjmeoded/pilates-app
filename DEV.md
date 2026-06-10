# Tune — Developer Notes

## Running locally

```bash
npm install --legacy-peer-deps
npm run typecheck
npm test
npx expo start
```

## Expo Go vs dev client

| Feature | Expo Go | Dev client / production build |
|---------|---------|-------------------------------|
| SQLite (`expo-sqlite`) | Supported | Supported |
| MMKV (`react-native-mmkv`) | Supported on recent Expo Go | Supported |
| Notifications (`expo-notifications`) | Supported with limitations | Full support |
| Reanimated onboarding animations | Supported | Supported |

### Practical guidance

- **Expo Go** is fine for Phase 2 onboarding QA on a physical device or simulator.
- If MMKV fails to initialize, Tune falls back to **in-memory preferences**. Onboarding completion will not survive app restarts until MMKV/native storage works.
- For production-like testing of notifications and MMKV persistence, use a **development build**:

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

## Storage model

- **SQLite** — all structured fitness/nutrition/workout data
- **MMKV** — onboarding flag, theme, units, lightweight cache flags only
- **Memory fallback** — session-only prefs if MMKV unavailable (see Settings → storage note)

## Reset onboarding (manual QA)

1. Delete and reinstall the app, or
2. Clear app data on device, or
3. Set `onboarding_completed` to false via dev tools (future debug helper)
