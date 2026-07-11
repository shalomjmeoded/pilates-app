import * as Application from 'expo-application';
import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
import { setProductAnalyticsSink } from './analyticsCore';

const enabled = process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true';
const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim();
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim();

export const productAnalyticsEnabled = Boolean(enabled && apiKey && host);

export const productAnalyticsClient = productAnalyticsEnabled
  ? new PostHog(apiKey!, {
      host,
      captureAppLifecycleEvents: false,
      disableGeoip: true,
      enableSessionReplay: false,
      preloadFeatureFlags: false,
      disableRemoteFeatureFlags: true,
      sendFeatureFlagEvent: false,
    })
  : null;

if (productAnalyticsClient) {
  setProductAnalyticsSink((event, properties) => {
    productAnalyticsClient.capture(event, {
      ...properties,
      app_version: Application.nativeApplicationVersion ?? 'unknown',
      platform: Platform.OS,
    });
  });
} else {
  setProductAnalyticsSink(null);
}
