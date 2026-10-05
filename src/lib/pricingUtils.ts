import { CartItem, BundleConfig, PromoCode, PromoPopupConfig, PaymentSettings, ShippingSettings } from '../types';

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

export function formatINR(amount: number | undefined | null, includeDecimals = true): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  if (!includeDecimals && amount % 1 === 0) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `₹${amount.toFixed(2)}`;
}

export interface ItemBundleInfo {
  discountPercent: number;
  badge: string | null;
  tier: number;
  unitPrice: number;
  discountedUnitPrice: number;
  originalLineTotal: number;
  discountAmount: number;
  finalLineTotal: number;
}

export interface EffectiveProductBundle {
  enabled: boolean;
  tier2Quantity: number;
  tier2DiscountPercent: number;
  tier2Badge: string;
  tier3Quantity: number;
  tier3DiscountPercent: number;
  tier3Badge: string;
}

export function getEffectiveProductBundle(productId: string, bundleConfig?: BundleConfig): EffectiveProductBundle {
  if (!bundleConfig) {
    return {
      enabled: false,
      tier2Quantity: 2,
      tier2DiscountPercent: 15,
      tier2Badge: 'MOST POPULAR — SAVE 15%',
      tier3Quantity: 3,
      tier3DiscountPercent: 25,
      tier3Badge: 'BEST VALUE — SAVE 25%'
    };
  }

  const override = bundleConfig.productOverrides?.[productId];
  const isEnabled = override?.enabled !== undefined ? override.enabled : bundleConfig.enabled;
  const isCustom = override?.customRules === true;

  return {
    enabled: isEnabled,
    tier2Quantity: isCustom && override?.tier2Quantity !== undefined ? override.tier2Quantity : bundleConfig.tier2Quantity,
    tier2DiscountPercent: isCustom && override?.tier2DiscountPercent !== undefined ? override.tier2DiscountPercent : bundleConfig.tier2DiscountPercent,
    tier2Badge: isCustom && override?.tier2Badge ? override.tier2Badge : (bundleConfig.tier2Badge || 'MOST POPULAR — SAVE 15%'),
    tier3Quantity: isCustom && override?.tier3Quantity !== undefined ? override.tier3Quantity : bundleConfig.tier3Quantity,
    tier3DiscountPercent: isCustom && override?.tier3DiscountPercent !== undefined ? override.tier3DiscountPercent : bundleConfig.tier3DiscountPercent,
    tier3Badge: isCustom && override?.tier3Badge ? override.tier3Badge : (bundleConfig.tier3Badge || 'BEST VALUE — SAVE 25%')
  };
}

export function getItemBundleInfo(item: CartItem, bundleConfig?: BundleConfig): ItemBundleInfo {
  const quantity = typeof item?.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1;
  const unitPrice = typeof item?.product?.price === 'number' && !isNaN(item.product.price) ? item.product.price : 0;
  const originalLineTotal = Math.round(unitPrice * quantity * 100) / 100;
  let discountPercent = 0;
  let badge: string | null = null;
  let tier = 1;

  const effective = item?.product?.id ? getEffectiveProductBundle(item.product.id, bundleConfig) : {
    enabled: false,
    tier2Quantity: 2,
    tier2DiscountPercent: 15,
    tier2Badge: 'MOST POPULAR — SAVE 15%',
    tier3Quantity: 3,
    tier3DiscountPercent: 25,
    tier3Badge: 'BEST VALUE — SAVE 25%'
  };

  if (effective.enabled) {
    if (quantity === effective.tier3Quantity) {
      discountPercent = effective.tier3DiscountPercent;
      badge = effective.tier3Badge || `Tier 3 (${discountPercent}% OFF)`;
      tier = 3;
    } else if (quantity === effective.tier2Quantity) {
      discountPercent = effective.tier2DiscountPercent;
      badge = effective.tier2Badge || `Tier 2 (${discountPercent}% OFF)`;
      tier = 2;
    } else {
      discountPercent = 0;
      badge = null;
      tier = 1;
    }
  } else {
    discountPercent = 0;
    badge = null;
    tier = 1;
  }

  const discountAmount = Math.round(((originalLineTotal * discountPercent) / 100) * 100) / 100;
  const finalLineTotal = Math.max(0, originalLineTotal - discountAmount);
  const discountedUnitPrice = quantity > 0 ? Math.round((finalLineTotal / quantity) * 100) / 100 : unitPrice;

  return {
    discountPercent,
    badge,
    tier,
    unitPrice,
    discountedUnitPrice,
    originalLineTotal,
    discountAmount,
    finalLineTotal
  };
}

export interface CartCalculationResult {
  itemsOriginalSubtotal: number;
  totalBundleDiscount: number;
  subtotalAfterBundle: number;
  promoDiscount: number;
  promoTargetProductTitle?: string;
  isPromoProductScoped: boolean;
  paymentDiscount: number;
  shippingFee: number;
  grandTotal: number;
  onlineAmountDueNow: number;
  codAmountDueLater: number;
  upfrontPercent: number;
}

export function calculateCartPricing(
  cart: CartItem[],
  bundleConfig: BundleConfig,
  activePromo: PromoCode | null,
  promoPopupConfig: PromoPopupConfig,
  paymentMethod: 'COD' | 'PayOnline' | 'PartialPayment',
  paymentSettings: PaymentSettings,
  shippingSettings?: ShippingSettings
): CartCalculationResult {
  let itemsOriginalSubtotal = 0;
  let totalBundleDiscount = 0;

  if (Array.isArray(cart)) {
    cart.forEach((item) => {
      if (!item || !item.product) return;
      const info = getItemBundleInfo(item, bundleConfig);
      itemsOriginalSubtotal += (typeof info.originalLineTotal === 'number' && !isNaN(info.originalLineTotal)) ? info.originalLineTotal : 0;
      totalBundleDiscount += (typeof info.discountAmount === 'number' && !isNaN(info.discountAmount)) ? info.discountAmount : 0;
    });
  }

  itemsOriginalSubtotal = Math.round(itemsOriginalSubtotal * 100) / 100;
  totalBundleDiscount = Math.round(totalBundleDiscount * 100) / 100;
  const subtotalAfterBundle = Math.max(0, itemsOriginalSubtotal - totalBundleDiscount);

  // Promo Code calculation (support strict product-level scoping for flash sale or promo codes with productId)
  let promoDiscount = 0;
  let promoTargetProductTitle: string | undefined = undefined;
  let isPromoProductScoped = false;

  if (activePromo && Array.isArray(cart)) {
    const isFlashSaleCode = promoPopupConfig?.enabled && 
      promoPopupConfig?.promoCode && 
      activePromo.code?.trim().toUpperCase() === promoPopupConfig.promoCode?.trim().toUpperCase();

    const targetProductId = activePromo.productId || (isFlashSaleCode ? promoPopupConfig?.featuredProductId : undefined);

    if (targetProductId) {
      isPromoProductScoped = true;
      const matchingItem = cart.find((i) => i?.product?.id === targetProductId);
      if (matchingItem) {
        promoTargetProductTitle = matchingItem.product?.title;
        const itemInfo = getItemBundleInfo(matchingItem, bundleConfig);
        promoDiscount = Math.round(((itemInfo.finalLineTotal * (activePromo.discountPercent || 0)) / 100) * 100) / 100;
      } else {
        promoDiscount = 0;
      }
    } else {
      promoDiscount = Math.round(((subtotalAfterBundle * (activePromo.discountPercent || 0)) / 100) * 100) / 100;
    }
  }

  const subtotalAfterPromo = Math.max(0, subtotalAfterBundle - promoDiscount);

  // Payment Method Discount
  let paymentDiscount = 0;
  if (paymentMethod === 'PayOnline' && paymentSettings?.payOnlineEnabled) {
    paymentDiscount = Math.round(((subtotalAfterPromo * (paymentSettings.payOnlineDiscountPercent || 0)) / 100) * 100) / 100;
  } else if (paymentMethod === 'PartialPayment' && paymentSettings?.partialPaymentEnabled) {
    paymentDiscount = Math.round(((subtotalAfterPromo * (paymentSettings.partialPaymentDiscountPercent || 0)) / 100) * 100) / 100;
  }

  // Dynamic Shipping Fee calculation based on Admin settings
  const isShippingEnabled = shippingSettings?.enabled !== false;
  const standardFee = (typeof shippingSettings?.standardFee === 'number' && !isNaN(shippingSettings.standardFee) && shippingSettings.standardFee >= 0)
    ? shippingSettings.standardFee
    : 49;
  const freeThreshold = (typeof shippingSettings?.freeShippingThreshold === 'number' && !isNaN(shippingSettings.freeShippingThreshold) && shippingSettings.freeShippingThreshold >= 0)
    ? (shippingSettings.freeShippingThreshold === 150 ? 999 : shippingSettings.freeShippingThreshold)
    : 999;

  let shippingFee = 0;
  if (!Array.isArray(cart) || cart.length === 0 || !isShippingEnabled) {
    shippingFee = 0;
  } else if (freeThreshold > 0 && subtotalAfterBundle >= freeThreshold) {
    shippingFee = 0;
  } else {
    shippingFee = standardFee;
  }

  const grandTotal = Math.max(0, Math.round((subtotalAfterPromo - paymentDiscount + shippingFee) * 100) / 100);

  const upfrontPercent = paymentSettings?.partialPaymentUpfrontPercent || 20;
  const onlineAmountDueNow = paymentMethod === 'PartialPayment'
    ? Math.round(((grandTotal * upfrontPercent) / 100) * 100) / 100
    : paymentMethod === 'PayOnline' ? grandTotal : 0;

  const codAmountDueLater = paymentMethod === 'PartialPayment'
    ? Math.round((grandTotal - onlineAmountDueNow) * 100) / 100
    : paymentMethod === 'COD' ? grandTotal : 0;

  return {
    itemsOriginalSubtotal,
    totalBundleDiscount,
    subtotalAfterBundle,
    promoDiscount,
    promoTargetProductTitle,
    isPromoProductScoped,
    paymentDiscount,
    shippingFee,
    grandTotal,
    onlineAmountDueNow,
    codAmountDueLater,
    upfrontPercent
  };
}
