# Tune — QA Checklist

## Phase 6 — Settings

- [ ] Settings hub with grouped sections (Profile, Goals, Nutrition, Notifications, Units, Privacy, Data, About)
- [ ] Profile recalibration saves and shows plan-updated confirmation
- [ ] Goals recalibration updates BMR/TDEE/macros
- [ ] Nutrition: auto vs manual override with calorie safety warning
- [ ] Notifications: permission flow, enable/time per reminder type
- [ ] Reminders reschedule on edit and cancel when disabled
- [ ] Units switch updates Workout, Nutrition, Progress, Settings instantly
- [ ] Privacy center shows on-device / AI / no-ads copy + storage backend
- [ ] Export JSON via share sheet
- [ ] Import placeholder visible
- [ ] Rebuild my plan keeps history, replaces profile/targets
- [ ] MMKV fallback restores onboarding from SQLite
- [ ] Workouts-only Progress shows “Nutrition tracking disabled” (not 0%)
- [ ] `settings_audit_log` records changes
- [ ] No network calls

---

## Phase 5 — Progress

- [ ] Progress tab has no calendar strip
- [ ] Empty state: “Log your first weight…” + Log Weight CTA (no chart)
- [ ] Weight Journey hero: start → current → goal, delta, progress %
- [ ] Weight chart: 7D / 30D (default) / 90D / 1Y / All ranges
- [ ] Chart shows goal line, smooth curve, points, current marker
- [ ] Goal projection shows date or “Add more weight entries…”
- [ ] Adherence cards: calories, protein, fiber (7-day avg from `nutrition_daily_totals`)
- [ ] Consistency score ring 0–100 with breakdown
- [ ] BMI + category card (gentle labels)
- [ ] TDEE card with BMR sublabel
- [ ] Milestones: locked/unlocked (4 milestones)
- [ ] Log Weight modal: weight + optional note, unit toggle
- [ ] Weight validation: > 0, ≤ 500 kg, duplicate timestamp blocked
- [ ] Logging updates `weight_logs` + `profile.current_weight_kg`
- [ ] Migration v3: `user_milestones`, `body_measurements`, `progress_photos`, `progress_analytics_snapshots`

---

## Phase 4 — Nutrition

- [ ] Nutrition tab shows 7-day calendar strip
- [ ] Today card shows target + remaining calories
- [ ] Animated radial calorie ring renders
- [ ] Macro bars show protein/carbs/fat/fiber
- [ ] Nutrition score displays 0–100
- [ ] Empty state with + Add Meal CTA
- [ ] Manual meal form validates inputs
- [ ] Quick presets fill meal name
- [ ] Portion chips (0.5x–2x) and ±10% update totals
- [ ] Meals persist to SQLite `meals`
- [ ] `nutrition_daily_totals` updates after each change
- [ ] Workouts-only mode shows simplified message
- [ ] No network calls

---

## Phase 3 — Workout

- [ ] Workout tab shows 7-day calendar strip centered on today
- [ ] Today generates 9–12 exercises from seeded library only
- [ ] Past days are read-only (no new sessions)
- [ ] Future days show “not available yet” empty state
- [ ] Plan generation failure shows error card + retry
- [ ] Tap exercise card opens detail modal (static preview, no video)
- [ ] Start Workout opens full-screen player
- [ ] Player advances through all exercises
- [ ] Feedback screen blocks Complete until every exercise has feedback
- [ ] Completed session persists to `workout_sessions` + `workout_session_exercises`
- [ ] Completing today’s workout pre-generates tomorrow’s adapted plan
- [ ] Resume appears for in-progress session

---

## Phase 2 — Onboarding

- [ ] Branded Tune loader shows during boot (not blank screen)
- [ ] Fresh install routes to onboarding step 1
- [ ] All 17 steps navigable forward/back (except loading step blocks Android back)
- [ ] Height/weight use numeric inputs with cm/kg internal storage
- [ ] Birth year picker works on iOS and Android
- [ ] Roadmap chart renders 24-week projection
- [ ] Loading step computes baseline plan and advances automatically
- [ ] Plan reveal shows calories + macros + safety warning when applicable
- [ ] Paywall mock: premium and free paths both complete onboarding
- [ ] After completion, relaunch skips onboarding and opens Workout tab
- [ ] SQLite contains `profile`, `nutrition_targets`, `onboarding_answers` rows
- [ ] MMKV `onboarding_completed = true` after finish (or memory fallback documented)
- [ ] Notification permission explainer appears before OS prompt
- [ ] No network calls during onboarding

---

## Phase 1 QA Checklist

## Environment

- [ ] `npm install` completes without errors
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes calculation engine tests
- [ ] `npm run validate-seed` reports at least 100 exercises
- [ ] `npx expo start` launches on iOS simulator or Android emulator

## App boot

- [ ] Plus Jakarta Sans loads without fallback system font
- [ ] App shows loading state until SQLite migration completes
- [ ] App lands on Workout tab shell after boot
- [ ] No network calls on cold start

## Design system

- [ ] Background uses `#F9EFEC`
- [ ] Cards use `#FFFFFF` with 16 radius
- [ ] Primary actions use `#C97A87`
- [ ] Typography matches H1/H2/Body specs
- [ ] Spacing uses only 8/16/24/32

## SQLite

- [ ] `schema_migrations` records version 1
- [ ] All planned tables exist after first launch
- [ ] `exercise_library` contains 120 seeded rows
- [ ] `premium_status` default row exists with `source = mock`
- [ ] Re-launch does not duplicate exercise seed

## MMKV

- [ ] `onboarding_completed` defaults to false
- [ ] `units` defaults to cm/kg
- [ ] `cached_flags.exercise_library_seeded` becomes true after seed
- [ ] No structured fitness data stored in MMKV

## Calculation engines

- [ ] Female BMR uses `-161` offset
- [ ] Male BMR uses `+5` offset
- [ ] Non-binary uses `-78` neutral offset
- [ ] TDEE multipliers: 1.2 / 1.375 / 1.55 / 1.725
- [ ] Safety warning triggers below 1200 (female) and 1500 (male)
- [ ] `buildBaselinePlan` returns macros + 25-point roadmap

## AI layer (Phase 1 only)

- [ ] Zod schemas validate sample payloads
- [ ] `aiService` throws `AiNotConfiguredError` when called
- [ ] No API keys required in `.env` for Phase 1

## Explicitly out of scope

- [ ] No onboarding screens
- [ ] No ruler UI
- [ ] No camera / video / webview
- [ ] No RevenueCat
- [ ] No live AI provider

## Manual smoke path

1. Launch app
2. Open each tab: Workout, Nutrition, Progress, Settings
3. Confirm Workout tab shows seeded exercise count
4. Confirm Settings shows privacy copy and unit defaults
5. Kill app and relaunch — seed count unchanged
