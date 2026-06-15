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

function isPurchasesError(error: unknown): error is PurchasesError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
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

  if (Platform.OS !== 'ios') {
    throw new Error('RevenueCat is configured for iOS testing only right now.');
  }

  const apiKey = getRevenueCatAppleApiKey();
  if (!apiKey) {
    throw new Error('RevenueCat Apple API key is missing.');
  }

  if (__DEV__) {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
  configured = true;
}

export async function purchaseRevenueCatCurrentOffering(
  plan: PremiumPlanId = 'yearly',
): Promise<PremiumStatus> {
  await configureRevenueCat();

  try {
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
    throw error;
  }
}

export async function restoreRevenueCatPurchases(): Promise<PremiumStatus> {
  trackPremiumEvent('restore_purchase_tapped');
  await configureRevenueCat();

  const customerInfo = await Purchases.restorePurchases();
  const status = mapCustomerInfoToPremiumStatus(customerInfo);
  await setMockPremiumStatus(status);

  if (!status.isPremium) {
    throw new Error('No active purchase found for this Apple account.');
  }

  trackPremiumEvent('restore_purchase_succeeded', { metadata: { source: 'revenuecat' } });
  return status;
}

export async function refreshRevenueCatPremiumStatus(): Promise<PremiumStatus | null> {
  if (!isRevenueCatConfigured() || Platform.OS !== 'ios') {
    return null;
  }

  await configureRevenueCat();
  const customerInfo = await Purchases.getCustomerInfo();
  const status = mapCustomerInfoToPremiumStatus(customerInfo);
  await setMockPremiumStatus(status);
  return status;
}
