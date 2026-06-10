import type { PremiumAnalyticsEvent, PremiumFeatureKey } from '@/types/premium';
import { preferencesStorage } from '@/storage/mmkv';

const PREMIUM_ANALYTICS_FLAG = 'premium_analytics_events';
const MAX_STORED_EVENTS = 200;

export interface PremiumAnalyticsRecord {
  event: PremiumAnalyticsEvent;
  at: string;
  feature?: PremiumFeatureKey;
  metadata?: Record<string, string>;
}

function readEvents(): PremiumAnalyticsRecord[] {
  const raw = preferencesStorage.getCachedFlags()[PREMIUM_ANALYTICS_FLAG];
  if (typeof raw !== 'string') {
    return [];
  }

  try {
    return JSON.parse(raw) as PremiumAnalyticsRecord[];
  } catch {
    return [];
  }
}

function writeEvents(events: PremiumAnalyticsRecord[]): void {
  preferencesStorage.setCachedFlag(
    PREMIUM_ANALYTICS_FLAG,
    JSON.stringify(events.slice(-MAX_STORED_EVENTS)),
  );
}

export function trackPremiumEvent(
  event: PremiumAnalyticsEvent,
  options?: { feature?: PremiumFeatureKey; metadata?: Record<string, string> },
): void {
  const record: PremiumAnalyticsRecord = {
    event,
    at: new Date().toISOString(),
    feature: options?.feature,
    metadata: options?.metadata,
  };

  writeEvents([...readEvents(), record]);

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.info('[premium_analytics]', record);
  }
}

export function getPremiumAnalyticsEvents(): PremiumAnalyticsRecord[] {
  return readEvents();
}

export function clearPremiumAnalyticsEvents(): void {
  preferencesStorage.setCachedFlag(PREMIUM_ANALYTICS_FLAG, JSON.stringify([]));
}
