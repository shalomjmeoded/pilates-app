# BetterMe

Local-first Pilates and wellness app built with **Expo (React Native)**. Workouts, nutrition, progress tracking, and premium AI features (meal estimates, weekly coach, physique assessment) with data stored on-device in SQLite.

## Prerequisites

- **Node.js** 20+ and **npm**
- **Expo Go** on your phone, or Android Studio / Xcode for emulators
- (Optional) AI proxy URL for live AI features

## Quick start

```bash
git clone https://github.com/shalomjmeoded/pilates-app.git
cd pilates-app
npm install --legacy-peer-deps
cp .env.example .env
```

Edit `.env` (see [Environment](#environment)), then:

```bash
npx expo start -c
```

- Press **`a`** for Android emulator  
- Press **`i`** for iOS simulator  
- Scan the QR code with **Expo Go** on a physical device  

On a **physical device**, use your computer’s LAN IP instead of `localhost` for local proxy testing. TestFlight builds should use a deployed HTTPS proxy URL.

## Environment

Copy `.env.example` to `.env`:

```bash
# AI proxy used by the mobile app
EXPO_PUBLIC_AI_PROXY_URL=https://your-ai-proxy.example.com
EXPO_PUBLIC_AI_MOCK=false

# Server-side AI key, used by `npm run ai-proxy` or your deployed proxy
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional: local proxy port
# AI_PROXY_PORT=8787

# Optional: direct Gemini from the app for local development only
# EXPO_PUBLIC_ENABLE_DIRECT_GEMINI=true

# Optional: fake AI responses (no API key)
# EXPO_PUBLIC_AI_MOCK=true
```

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Gemini API key for the AI proxy. Only bundled in-app if `EXPO_PUBLIC_ENABLE_DIRECT_GEMINI=true` |
| `GEMINI_MODEL` | Model id, e.g. `gemini-2.5-flash` |
| `EXPO_PUBLIC_AI_MOCK` | `true` = canned AI responses, no network |
| `EXPO_PUBLIC_AI_PROXY_URL` | Backend proxy base URL used by the mobile app |
| `EXPO_PUBLIC_ENABLE_DIRECT_GEMINI` | Local-development escape hatch for direct app-to-Gemini calls |

After changing `.env`, restart Metro with cache clear:

```bash
npx expo start -c
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run typecheck` | TypeScript check |
| `npm test` | Jest unit tests |
| `npm run ai-proxy` | Optional local AI proxy (`GEMINI_API_KEY` in shell) |

## Premium / onboarding

The app expects onboarding and an active trial or subscription for most features. Complete onboarding in the app, then start the free trial on the paywall.

## App tools

- **Settings → Rebuild my plan**: regenerate today’s Pilates-focused workout  
- **Settings → Plan assumptions**: view calories, macros, and body-fat assumptions  

See [DEV.md](./DEV.md) for Expo Go vs dev client notes and [QA.md](./QA.md) for manual QA checklists.

## Project layout

```
app/           Expo Router screens (tabs, onboarding, modals)
src/           App logic, DB, engines, services, components
server/        Optional AI proxy (Node)
assets/        Icons, exercise seed library, media
scripts/       Exercise import and validation tooling
```

## Tech stack

- Expo SDK 56, Expo Router, TypeScript  
- SQLite (`expo-sqlite`), MMKV preferences  
- Zustand, Zod  
- Gemini API through a backend proxy  

## License

Private / all rights reserved unless otherwise noted.
