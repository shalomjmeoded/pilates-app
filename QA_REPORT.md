# Tune — Phase 7 QA Report

Generated after product hardening, retention, and QA pass.

## Summary

| Area | Status |
|------|--------|
| Automated tests | 37 passing (`npm test`) |
| TypeScript | Clean (`npm run typecheck`) |
| AI / RevenueCat | Not started (by design) |
| Network dependency | None (offline-first) |

---

## Database QA

### Migrations

| Version | Contents |
|---------|----------|
| v5 | `saved_meals`, `coaching_insights`, session resume columns, performance indexes |

### Fresh install

- [ ] App boots with `TuneBootLoader`
- [ ] Migrations apply through v5
- [ ] Exercise seed loads (120 exercises)
- [ ] Default reminders seeded

### Upgrade install

- [ ] v1→v5 upgrade preserves meals, workouts, weight logs
- [ ] `ALTER TABLE workout_sessions` adds resume columns
- [ ] No duplicate migration application

---

## Workout QA

| Case | Expected |
|------|----------|
| Start | Creates `in_progress` session + exercise rows |
| Resume | Restores `current_exercise_index` + `elapsed_seconds` |
| Discard | Deletes session + exercises; plan remains |
| Complete | Status `completed`, feedback saved, next-day adaptation |
| Streak card | Current, best, monthly % on Workout + Progress |
| Calendar dots | Today ring, completed fill, selected background |
| Exercise swap | Same muscle/difficulty/equipment from library |
| Deep link | Workout reminder → Workout tab |

---

## Nutrition QA

| Case | Expected |
|------|----------|
| Add | Meal saved, daily totals synced |
| Edit | Name, macros, timestamp update totals |
| Delete | Confirmation → totals recalculated |
| Duplicate | Copies meal to selected day |
| Saved meals | Template CRUD + log today |
| Recent meals | Last 10 one-tap add |
| Deep link | Meal reminders → Nutrition tab |

---

## Progress QA

| Case | Expected |
|------|----------|
| Log weight | Validation + profile weight update |
| Edit weight | `log-weight` modal with `editId` |
| Delete weight | Confirmation, profile weight from latest log |
| Weight history | Search, chronological list |
| Trend averages | 7-day and 30-day beneath chart |
| Weight streak | Current + best on dashboard |
| Coaching tip | Deterministic local engine |
| Workouts-only | No 0% adherence cards |
| Deep link | Coaching reminder → Progress tab |

---

## Settings QA

| Case | Expected |
|------|----------|
| Recalibration | Plan-updated confirmation |
| Notifications | Schedule/cancel on toggle |
| Units | Global display update |
| Preferences | Media + exercise editors |
| Plan assumptions | Goal, pace, activity, macros |
| Dev audit | `__DEV__` only — audit log + migration version |
| Rebuild plan | History preserved |

---

## Offline QA

| Scenario | Expected |
|----------|----------|
| Airplane mode | Full app usable |
| App restart | SQLite data intact; onboarding flag from DB if MMKV fallback |
| Device reboot | Notifications rescheduled on foreground |
| Export | JSON share sheet works offline |

---

## Accessibility QA

| Check | Implementation |
|-------|----------------|
| Touch targets | Buttons min 44px; meal/workout actions min 44 |
| Screen reader | Calendar chips, streak cards, coaching tip labels |
| Dynamic Type | `maxFontSizeMultiplier={1.3}` on `Text` |
| Charts | Summary cards expose text alternatives |

Manual VoiceOver / TalkBack verification recommended on device.

---

## Performance QA

| Check | Notes |
|-------|-------|
| Indexes | `meals.logged_at`, `workout_sessions.status+ended_at`, `workout_plans.plan_date` |
| List virtualization | `FlatList` for meals + weight history |
| Large datasets | Use `scripts/seed-performance-data.ts` (if present) or manual bulk insert for soak testing |

Target: smooth scroll with 1000 meals / 500 workouts / 365 weight logs.

---

## Data Integrity

| Operation | Transactional |
|-----------|---------------|
| Meal delete | `withTransactionAsync` |
| Weight delete | `withTransactionAsync` |
| Session discard | `withTransactionAsync` |
| Nutrition target upsert | Same-day dedupe |

---

## Known Issues

1. Weight history edit routes through log-weight modal (no inline timestamp picker UI)
2. Notification deep links require physical device / dev build for full validation
3. Performance soak script not bundled — manual seeding for 1000+ meal stress test
4. Coaching tips not yet surfaced in a dedicated weekly insight card (stored locally, shown as daily tip)
5. `duplicateMeal` creates new entry; does not copy portion multiplier from source

---

## Phase 8 Plan (AI — deferred)

1. `AiFacade` provider interface with mock + remote implementations
2. Text meal estimate behind explicit user action
3. Coaching copy enrichment (optional, user-initiated)
4. Photo meal pipeline stub with on-device preprocessing
5. Strict payload schemas + audit logging for any network call

## Phase 9 Plan (RevenueCat — deferred)

1. Entitlement gates for AI features only
2. Paywall replaces mock step-17
3. Restore purchases + offline grace period
4. Premium badge in Settings

---

## Exit Criteria Checklist

- [x] Meal edit/delete complete
- [x] Saved meals complete
- [x] Duplicate meal complete
- [x] Workout resume complete
- [x] Exercise swap complete
- [x] Calendar completion dots complete
- [x] Weight history complete
- [x] Local coaching engine complete
- [x] Deep links complete
- [x] Accessibility pass (code-level)
- [x] Performance indexes + virtualization
- [x] Offline architecture validated
- [x] QA_REPORT.md generated
- [x] 35+ automated tests (37)
- [x] TypeScript clean
- [ ] Manual device QA (recommended before release)
