import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  type PurchasesError,
} from 'react-native-purchases';

import { setMockPremiumStatus } from '@/db/repositories/premiumRepository';
import { trackPremiumEvent } from '@/services/monetization/premiumAnalytics';
import {
  getRevenueCatAppleApiKey,
  getRevenueCatEntitlementId,
} from '@/services/monetization/revenueCatConfig';
import type { PremiumPlanId, PremiumStatus } from '@/types/premium';

let configured = false;
const REVENUECAT_NATIVE_UNAVAILABLE_MESSAGE =
  'In-app purchases require a BetterMe development build or TestFlight build. Expo Go cannot open the Apple sandbox purchase sheet.';

function isPurchasesError(error: unknown): error is PurchasesError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

function isRevenueCatNativeUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('setLogLevel') ||
    message.includes('configure') ||
    message.includes('getOfferings') ||
    message.includes('purchasePackage') ||
    message.includes('restorePurchases') ||
    message.includes('getCustomerInfo') ||
    message.includes('null is not an object') ||
    message.includes('undefined is not an object')
  );
}

function assertRevenueCatNativeAvailable(): void {
  const purchasesModule = Purchases as unknown as
    | {
        setLogLevel?: unknown;
        configure?: unknown;
        getOfferings?: unknown;
        purchasePackage?: unknown;
        restorePurchases?: unknown;
        getCustomerInfo?: unknown;
      }
    | null;

  if (
    !purchasesModule ||
    typeof purchasesModule.setLogLevel !== 'function' ||
    typeof purchasesModule.configure !== 'function' ||
    typeof purchasesModule.getOfferings !== 'function' ||
    typeof purchasesModule.purchasePackage !== 'function' ||
    typeof purchasesModule.restorePurchases !== 'function' ||
    typeof purchasesModule.getCustomerInfo !== 'function'
  ) {
    throw new Error(REVENUECAT_NATIVE_UNAVAILABLE_MESSAGE);
  }
}

function getActiveEntitlement(customerInfo: CustomerInfo) {
  const entitlementId = getRevenueCatEntitlementId();
  return (
    customerInfo.entitlements.active[entitlementId] ??
    Object.values(customerInfo.entitlements.active)[0]
  );
}

function mapCustomerInfoToPremiumStatus(customerInfo: CustomerInfo): PremiumStatus {
  const entitlement = getActiveEntitlement(customerInfo);
  const productId =
    entitlement?.productIdentifier ??
    customerInfo.activeSubscriptions[0] ??
    customerInfo.allPurchasedProductIdentifiers[0];

  if (!entitlement && customerInfo.activeSubscriptions.length === 0) {
    return {
      subscriptionStatus: 'inactive',
      isPremium: false,
      trialUsed: false,
      source: 'revenuecat',
    };
  }

  return {
    subscriptionStatus: entitlement?.periodType === 'TRIAL' ? 'trial' : 'active',
    isPremium: true,
    trialUsed: entitlement?.periodType === 'TRIAL',
    source: 'revenuecat',
    productId,
    expiresAt: entitlement?.expirationDate ?? customerInfo.latestExpirationDate ?? undefined,
  };
}

function findPackageByPlan(offering: PurchasesOffering, plan: PremiumPlanId): PurchasesPackage | null {
  if (plan === 'yearly') {
    return (
      offering.annual ??
      offering.availablePackages.find((item) => item.product.identifier === 'premium_yearly') ??
      null
    );
  }

  return (
    offering.monthly ??
    offering.availablePackages.find((item) => item.product.identifier === 'premium_monthly') ??
    null
  );
}

export function isRevenueCatConfigured(): boolean {
  return Boolean(getRevenueCatAppleApiKey());
}

export async function configureRevenueCat(): Promise<void> {
  if (configured) {
    return;
  }

  assertRevenueCatNativeAvailable();

  if (Platform.OS !== 'ios') {
    throw new Error('RevenueCat is configured for iOS testing only right now.');
  }

  const apiKey = getRevenueCatAppleApiKey();
  if (!apiKey) {
    throw new Error('RevenueCat Apple API key is missing.');
  }

  try {
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
  } catch (error) {
    if (isRevenueCatNativeUnavailableError(error)) {
      throw new Error(REVENUECAT_NATIVE_UNAVAILABLE_MESSAGE);
    }
    throw error;
  }
  configured = true;
}

export async function purchaseRevenueCatCurrentOffering(
  plan: PremiumPlanId = 'yearly',
): Promise<PremiumStatus> {
  try {
    await configureRevenueCat();
    const offerings = await Purchases.getOfferings();
    const currentPackage = offerings.current ? findPackageByPlan(offerings.current, plan) : null;

    if (!currentPackage) {
      throw new Error(`No RevenueCat ${plan} package is available yet.`);
    }

    const { customerInfo } = await Purchases.purchasePackage(currentPackage);
    const status = mapCustomerInfoToPremiumStatus(customerInfo);
    await setMockPremiumStatus(status);
    trackPremiumEvent('trial_started', { metadata: { source: 'revenuecat' } });
    return status;
  } catch (error) {
    if (
      isPurchasesError(error) &&
      error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
    ) {
      throw new Error('Purchase cancelled.');
    }
    if (isRevenueCatNativeUnavailableError(error)) {
      throw new Error(REVENUECAT_NATIVE_UNAVAILABLE_MESSAGE);
    }
    throw error;
  }
}

export async function restoreRevenueCatPurchases(): Promise<PremiumStatus> {
  trackPremiumEvent('restore_purchase_tapped');
  try {
    await configureRevenueCat();

    const customerInfo = await Purchases.restorePurchases();
    const status = mapCustomerInfoToPremiumStatus(customerInfo);
    await setMockPremiumStatus(status);

    if (!status.isPremium) {
      throw new Error('No active purchase found for this Apple account.');
    }

    trackPremiumEvent('restore_purchase_succeeded', { metadata: { source: 'revenuecat' } });
    return status;
  } catch (error) {
    if (isRevenueCatNativeUnavailableError(error)) {
      throw new Error(REVENUECAT_NATIVE_UNAVAILABLE_MESSAGE);
    }
    throw error;
  }
}

export async function refreshRevenueCatPremiumStatus(): Promise<PremiumStatus | null> {
  if (!isRevenueCatConfigured() || Platform.OS !== 'ios') {
    return null;
  }

  try {
    await configureRevenueCat();
    const customerInfo = await Purchases.getCustomerInfo();
    const status = mapCustomerInfoToPremiumStatus(customerInfo);
    await setMockPremiumStatus(status);
    return status;
  } catch (error) {
    if (isRevenueCatNativeUnavailableError(error)) {
      return null;
    }
    throw error;
  }
}
