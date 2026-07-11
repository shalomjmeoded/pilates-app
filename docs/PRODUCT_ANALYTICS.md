# BetterMe Product Analytics

BetterMe sends a small anonymous conversion funnel to PostHog. It does not send onboarding answers,
body measurements, meals, photos, goals, or free text. Autocapture, session replay, GeoIP, and remote
feature flags are disabled.

## Production configuration

Create a PostHog Cloud project and copy its public project token and ingestion host. Set these EAS
production variables:

```sh
npx eas-cli env:create --name EXPO_PUBLIC_POSTHOG_API_KEY --value YOUR_PUBLIC_PROJECT_TOKEN --environment production --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_POSTHOG_HOST --value https://us.i.posthog.com --environment production --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_ANALYTICS_ENABLED --value true --environment production --visibility plaintext
```

Use `https://eu.i.posthog.com` instead if the PostHog project is hosted in the EU. Development builds
explicitly set `EXPO_PUBLIC_ANALYTICS_ENABLED=false` in `eas.json`.

## Dashboard setup

In PostHog, open **Product Analytics → Funnels** and create:

1. `onboarding started`
2. `plan revealed`
3. `paywall viewed`
4. `trial started`
5. `onboarding completed`
6. `first workout started`

Create a second funnel from `onboarding step viewed` to `onboarding step completed`, broken down by
`route_key`. Users whose last event is `onboarding backgrounded` or `onboarding step viewed` and who
do not continue within 24 hours count as abandonment.

Recommended dashboard cards:

- Onboarding completion rate
- Median onboarding duration from `elapsed_onboarding_seconds`
- Paywall-to-trial conversion
- First-workout activation
- Returning versus fresh onboarding completion using `entry_mode`
- Abandonment by `phase_name` and `route_key`

Before the next App Store submission, update the hosted privacy policy and App Store Connect privacy
answers to disclose anonymous product-interaction analytics.
