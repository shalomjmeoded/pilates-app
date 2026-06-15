import Constants from 'expo-constants';

const DEFAULT_ENTITLEMENT_ID = 'BetterMe Premium';

interface RevenueCatExtraConfig {
  revenueCatAppleApiKey?: string;
  revenueCatEntitlementId?: string;
}

function readRevenueCatExtra(): RevenueCatExtraConfig {
  const extra = Constants.expoConfig?.extra;
  if (!extra || typeof extra !== 'object') {
    return {};
  }

  const appleApiKey =
    typeof extra.revenueCatAppleApiKey === 'string' && extra.revenueCatAppleApiKey.trim().length > 0
      ? extra.revenueCatAppleApiKey.trim()
      : undefined;
  const entitlementId =
    typeof extra.revenueCatEntitlementId === 'string' && extra.revenueCatEntitlementId.trim().length > 0
      ? extra.revenueCatEntitlementId.trim()
      : undefined;

  return {
    revenueCatAppleApiKey: appleApiKey,
    revenueCatEntitlementId: entitlementId,
  };
}

export function getRevenueCatAppleApiKey(): string | undefined {
  return readRevenueCatExtra().revenueCatAppleApiKey;
}

export function getRevenueCatEntitlementId(): string {
  return readRevenueCatExtra().revenueCatEntitlementId ?? DEFAULT_ENTITLEMENT_ID;
}
