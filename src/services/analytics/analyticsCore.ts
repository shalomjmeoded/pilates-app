export type ProductAnalyticsEvent =
  | 'onboarding started'
  | 'onboarding step viewed'
  | 'onboarding step completed'
  | 'onboarding resumed'
  | 'onboarding restarted'
  | 'onboarding backgrounded'
  | 'plan revealed'
  | 'paywall viewed'
  | 'subscription purchase started'
  | 'trial started'
  | 'onboarding completed'
  | 'first workout ready'
  | 'first workout started';

export type AnalyticsPropertyKey =
  | 'route_key'
  | 'phase_number'
  | 'phase_name'
  | 'step_index'
  | 'entry_mode'
  | 'selected_plan'
  | 'app_version'
  | 'platform'
  | 'elapsed_onboarding_seconds';

export type AnalyticsProperties = Partial<
  Record<AnalyticsPropertyKey, string | number | boolean>
>;

type AnalyticsSink = (event: ProductAnalyticsEvent, properties: AnalyticsProperties) => void;

const ALLOWED_PROPERTY_KEYS = new Set<AnalyticsPropertyKey>([
  'route_key',
  'phase_number',
  'phase_name',
  'step_index',
  'entry_mode',
  'selected_plan',
  'app_version',
  'platform',
  'elapsed_onboarding_seconds',
]);

let sink: AnalyticsSink | null = null;
let onboardingStartedAt: number | null = null;

export function setProductAnalyticsSink(nextSink: AnalyticsSink | null): void {
  sink = nextSink;
}

export function beginOnboardingAnalyticsSession(): void {
  onboardingStartedAt ??= Date.now();
}

export function resetOnboardingAnalyticsSession(): void {
  onboardingStartedAt = Date.now();
}

export function getElapsedOnboardingSeconds(): number {
  if (onboardingStartedAt === null) {
    return 0;
  }
  return Math.max(0, Math.round((Date.now() - onboardingStartedAt) / 1000));
}

export function sanitizeAnalyticsProperties(
  properties: Record<string, unknown> = {},
): AnalyticsProperties {
  const sanitized: AnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!ALLOWED_PROPERTY_KEYS.has(key as AnalyticsPropertyKey)) {
      continue;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key as AnalyticsPropertyKey] = value;
    }
  }

  return sanitized;
}

export function captureProductEvent(
  event: ProductAnalyticsEvent,
  properties: AnalyticsProperties = {},
): void {
  sink?.(event, sanitizeAnalyticsProperties(properties));
}
