# Phase 9A — Premium Monetization Foundation

## Business model

- **7-day free trial** → subscription required
- No forever-free path after onboarding paywall
- Entire personalized Tune experience is premium; AI is a headline benefit, not the only gate

## Onboarding flow

1. Steps 1–15 — profile and plan generation (unchanged)
2. **Step 16** — `Your Personalized Plan` (calories, protein, workouts/week)
3. **Step 17** — mandatory paywall (`Unlock Your Plan`)
   - Start Free Trial
   - Restore Purchase
   - No Skip / Continue Free

## Subscription states

| Status | Meaning |
|--------|---------|
| `inactive` | No access (`subscription_status = inactive`) |
| `trial` | 7-day trial active |
| `active` | Paid subscription (mock until RevenueCat) |

Access check: `hasPremiumAccess()` in `src/engines/monetization/premiumAccess.ts`

## Components

| Component | Role |
|-----------|------|
| `PremiumGate` | Full-screen upsell with benefits + trial CTA + restore |
| `UpsellModal` | Feature-specific locked modal |
| `GlobalUpsellModal` | Mounted in root layout |
| `PremiumBadge` | Settings subscription status |

## Locked surfaces

| Area | Gate |
|------|------|
| App entry | `/paywall` if onboarding done but no access |
| Workout | Start Workout |
| Nutrition | Add Meal, Saved Meals, full dashboard |
| Progress | Analytics dashboard |
| AI | Meal text/photo, exercise swap, weekly coach, physique |
| Settings | Premium badge |

## Analytics (local only)

Events in `src/services/monetization/premiumAnalytics.ts` (MMKV, dev console):

- `paywall_viewed`
- `trial_started`
- `feature_locked`
- `upsell_opened`
- `restore_purchase_tapped`
- `restore_purchase_succeeded`

## Mock billing (Phase 9A)

RevenueCat is **not** integrated. Trial/subscribe uses `subscriptionService.ts` + `setMockPremiumStatus`.

## Verification checklist

1. Onboarding ends on paywall (step 17)
2. No skip path exists
3. Locked features show upsell modal or `PremiumGate`
4. Trial CTA visible on paywall
5. Restore purchase visible on paywall
