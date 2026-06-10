# Phase 8 — Tune AI Premium

Final deliverable for Phase 8.8. RevenueCat integration is intentionally out of scope.

## Architecture summary

```
Mobile app (Expo)
  └─ UI screens / hooks
       └─ aiFacade (AiFacade.ts) — single entry point
            ├─ MockAiProvider (EXPO_PUBLIC_AI_MOCK=true)
            └─ GeminiProxyProvider
                 └─ callAiProxy → POST {EXPO_PUBLIC_AI_PROXY_URL}/ai/{feature}

AI proxy (server/ai-proxy/)
  └─ Per-route HTTP handler
       ├─ Premium gate (isPremium flag from client, enforced server-side)
       ├─ Rate limits per deviceInstallId
       ├─ Image size validation (3 MB decoded per image)
       └─ generateGeminiJson → Gemini API (GEMINI_API_KEY server-only)
```

**Hard rules enforced**

| Rule | Implementation |
|------|----------------|
| No Gemini key in mobile app | `architecture.test.ts` + `phase8Qa.test.ts` scan `app/` and `src/` |
| All AI via proxy | `GeminiProxyProvider` only; no Gemini SDK in app |
| Premium-gated | Proxy returns `403 UNAUTHORIZED` when `isPremium: false` |
| Review before save | Meals + physique assessments use review stores; save engines run after user action |
| Strict JSON validation | Zod schemas in `src/services/ai/schemas.ts`; `parseAiResponse` throws `AiValidationError` |
| Rate limits | Server `rateLimit.ts` + client `ai_usage` audit counters |
| No direct AI from UI | `app/` routes use hooks/services only; `phase8Qa.test.ts` asserts no `aiFacade` in UI |

## Endpoints

Base URL: `EXPO_PUBLIC_AI_PROXY_URL` (e.g. `http://localhost:8787`)

| HTTP route | Feature | Premium quota |
|------------|---------|---------------|
| `POST /ai/meal-text` | `meal_text_estimate` | 20 / day |
| `POST /ai/meal-photo` | `meal_photo_estimate` | 10 / day |
| `POST /ai/exercise-swap` | `exercise_substitution` | 10 / day |
| `POST /ai/weekly-coach` | `weekly_coach` | 2 / week |
| `POST /ai/physique-assessment` | `physique_assessment` | 2 / month |

**Additional limits (all features):** 10 s cooldown between requests; duplicate prompt blocked for 60 s; free tier = 0 calls.

Run proxy locally: `npm run ai-proxy`

## Request envelope

```json
{
  "deviceInstallId": "stable-install-uuid",
  "isPremium": true,
  "payload": { }
}
```

### Payload examples

**Meal text**

```json
{ "description": "Grilled salmon, quinoa, roasted broccoli, olive oil" }
```

**Meal photo**

```json
{ "imageBase64": "data:image/jpeg;base64,..." }
```

**Exercise swap**

```json
{
  "exerciseId": "ex_123",
  "exerciseName": "Side plank",
  "muscleGroup": "core",
  "libraryExerciseIds": ["ex_123", "ex_456"],
  "swapReason": "knee_discomfort"
}
```

**Weekly coach** (aggregates only)

```json
{
  "weekStart": "2026-06-02",
  "workoutsCompleted": 3,
  "workoutsPlanned": 4,
  "calorieAdherencePercent": 82,
  "proteinAdherencePercent": 78,
  "weightTrend": "stable",
  "skippedExerciseCount": 1,
  "topSkippedExerciseNames": ["Teaser"],
  "goal": "maintain"
}
```

**Physique assessment**

```json
{
  "frontImageBase64": "data:image/jpeg;base64,...",
  "sideImageBase64": "data:image/jpeg;base64,...",
  "backImageBase64": "data:image/jpeg;base64,...",
  "notes": "Morning light, fasted"
}
```

## Database migrations (AI-related)

| Version | Table / change | Purpose |
|---------|----------------|---------|
| 001 | `ai_outputs` | Local audit log (feature, request summary, response, success) |
| 001 | `premium_status` | Premium gate (mock until RevenueCat) |
| 005 | `coaching_insights` | Weekly coach storage |
| 010 | `ai_usage` | Client-side quota counters per feature / period |
| 011 | `physique_assessments` | Saved physique assessment results (photos not stored) |

## App flows

| Feature | Entry | Review / save |
|---------|-------|---------------|
| Meal text | Nutrition → Add Meal → Text Estimate | `review-ai-meal` → save |
| Meal photo | Nutrition → Add Meal → Photo Estimate | `review-ai-meal` → save |
| Exercise swap | Exercise detail → Swap | In-modal confirmation |
| Weekly coach | Progress → Generate weekly summary | Cached in `coaching_insights` |
| Physique | Progress / Settings → Visual physique assessment | Disclaimer → photos → `physique-assessment-review` → save |

Physique and weekly coach do **not** auto-modify workout or nutrition plans.

## QA results (Phase 8.8)

Automated coverage in `phase8Qa.test.ts` (client + proxy) plus existing suites.

| Scenario | Status | Where verified |
|----------|--------|----------------|
| Success | Pass | `phase8Qa.test.ts`, `mockProvider.test.ts`, handler tests |
| Failure / upstream error | Pass | `phase8Qa.test.ts` (502 `UPSTREAM_ERROR`) |
| Invalid JSON | Pass | `schemas.test.ts`, `phase8Qa.test.ts` (Zod + upstream parse) |
| Offline | Pass | `phase8Qa.test.ts` (fetch rejection propagates) |
| Quota exceeded | Pass | `rateLimit.test.ts`, `phase8Qa.test.ts` |
| Cooldown | Pass | `handler.test.ts`, `rateLimit.test.ts`, `phase8Qa.test.ts` |
| Non-premium blocked | Pass | `handler.test.ts`, `phase8Qa.test.ts` |
| Review before save | Pass | `phase8Qa.test.ts`, `aiMealReviewStore.test.ts` |
| No direct Gemini in UI | Pass | `architecture.test.ts`, `phase8Qa.test.ts` |
| Privacy copy visible | Pass | `phase8Qa.test.ts` reads `settings/privacy.tsx` |

Run full AI test suite:

```bash
npm test -- --testPathPattern="server/ai-proxy|src/services/ai|mealTextEstimate|mealPhotoCompression|exerciseSubstitution|weeklyCoach|physiqueAssessment|phase8Qa"
npm run typecheck
```

## Cost estimate (Gemini 2.5 Flash)

Pricing reference: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) — **$0.30 / 1M input tokens**, **$2.50 / 1M output tokens** (text/image/video input).

### Assumptions (moderate premium usage / user / month)

| Feature | Calls / user / month | Est. tokens (in → out) | Est. cost / call |
|---------|----------------------|-------------------------|------------------|
| Meal text | 30 | 400 → 180 | ~$0.0006 |
| Meal photo | 8 | 1,200 → 200 | ~$0.0009 |
| Exercise swap | 6 | 600 → 120 | ~$0.0005 |
| Weekly coach | 4 | 900 → 350 | ~$0.0012 |
| Physique | 0.5 | 3,500 → 250 | ~$0.0020 |

**Blended ~$0.07 / premium user / month** at moderate usage (well below server-enforced caps).

| Monthly active premium users | Est. Gemini API cost / month |
|-----------------------------|------------------------------|
| 1,000 | ~$70 |
| 5,000 | ~$350 |
| 10,000 | ~$700 |

Heavy users hitting daily caps could reach ~$0.25–0.40 / user / month; server quotas cap worst-case spend.

Proxy hosting (e.g. single small VPS or serverless) is additional but small relative to model cost at these scales.

## Key files

### Client AI layer

- `src/services/ai/AiFacade.ts` — entry point
- `src/services/ai/AiProvider.ts` — interface
- `src/services/ai/providers/MockAiProvider.ts`
- `src/services/ai/providers/GeminiProxyProvider.ts`
- `src/services/ai/aiProxyClient.ts` — HTTP client
- `src/services/ai/schemas.ts` — Zod validation
- `src/services/ai/aiAudit.ts` — `ai_outputs` + `ai_usage` logging

### Feature hooks / services

- `src/hooks/useMealTextEstimate.ts`, `useMealPhotoEstimate.ts`, `useSaveReviewedAiMeal.ts`
- `src/hooks/useExerciseSubstitution.ts`
- `src/hooks/useWeeklyCoach.ts` → `src/services/coaching/weeklyCoachService.ts`
- `src/hooks/usePhysiqueAssessment.ts`, `usePhysiquePhotoAssessment.ts`, `useSavePhysiqueAssessment.ts`

### Proxy server

- `server/ai-proxy/index.ts` — HTTP server
- `server/ai-proxy/routes.ts`, `handler.ts`, `rateLimit.ts`, `gemini.ts`, `prompts.ts`

### UI

- `app/(tabs)/nutrition/add-meal.tsx`, `add-text-estimate.tsx`, `add-photo-estimate.tsx`, `review-ai-meal.tsx`
- `app/modals/exercise-detail.tsx`
- `app/(tabs)/progress/index.tsx`, `physique-assessment*.tsx`
- `app/(tabs)/settings/privacy.tsx`

## Remaining risks

1. **Premium trust model** — Client sends `isPremium`; proxy trusts it until RevenueCat server validation is added.
2. **In-memory rate limits** — Proxy `rateLimit.ts` resets on process restart; production needs Redis or DB-backed limits.
3. **Offline handling** — Network errors surface as thrown exceptions; UI shows generic errors but no dedicated offline queue.
4. **Physique assessment accuracy** — Experimental; disclaimer required; not a medical measurement.
5. **Photo privacy** — Photos are compressed and sent to proxy; not stored locally after assessment save (only text results persist).
6. **Gemini output drift** — Prompt + Zod reduce risk; monitor `ai_outputs` failures in production.
7. **Cost spikes** — Quotas mitigate abuse; consider alerting on proxy request volume per `deviceInstallId`.

## Environment

```bash
# Mobile (.env)
EXPO_PUBLIC_AI_PROXY_URL=http://localhost:8787
EXPO_PUBLIC_AI_MOCK=true   # dev without proxy

# Proxy (server/ai-proxy/.env)
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```
