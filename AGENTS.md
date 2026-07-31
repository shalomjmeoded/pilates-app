# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Cursor Cloud specific instructions

This is BetterMe, a local-first Expo (React Native) Pilates and wellness app.

### Setup

- Dependencies: `npm install --legacy-peer-deps` (required; peer deps do not resolve cleanly without it).
- Node: use the version in `.nvmrc` (22.x).
- Local env: copy `.env.example` → `.env` and `server/ai-proxy/.env.example` → `server/ai-proxy/.env` if missing. Do not commit `.env` files.
- Secrets (`GEMINI_API_KEY`, analytics keys, etc.): prefer Cursor Cloud Secrets / environment-scoped secrets over committing credentials.

### Verify changes

```bash
npm run typecheck
npm test
```

Optional exercise seed tooling:

```bash
npm run validate-seed
```

### Running the app in Cloud

- Prefer Expo web for UI verification: `npm run web` (Metro on port 8081).
- iOS/Android simulators are typically unavailable; do not rely on `npm run ios` / `npm run android` in cloud VMs.
- Optional local AI proxy: `npm run ai-proxy` (port 8787). Set `EXPO_PUBLIC_AI_PROXY_URL` accordingly; use `EXPO_PUBLIC_AI_MOCK=true` when no Gemini key is available.
- After changing `.env`, restart Metro with cache clear: `npx expo start -c`.

### Notes

- App code lives under `app/` (Expo Router) and `src/`.
- Optional AI proxy lives under `server/ai-proxy/`.
- See `DEV.md` for Expo Go vs dev client notes and `QA.md` for manual QA checklists.
