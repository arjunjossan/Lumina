import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  CartItem, 
  ActivePage, 
  AdminTab, 
  Category, 
  OrderStatus, 
  ShippingAddress,
  ProductReview,
  PromoCode,
  BundleConfig,
  SupportInquiry,
  InquiryStatus,
  CustomerProfile,
  CustomerUser,
  CustomerPortalTab,
  ChatMessage,
  ChatSession,
  PaymentSettings,
  ShippingSettings,
  PromoPopupConfig,
  SuccessStory,
  TopNotificationConfig,
  StoreBrandingConfig,
  DesktopHeroConfig,
  MobileHeroConfig
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_MOBILE_PRODUCTS, INITIAL_ORDERS, INITIAL_PROMOS, DEFAULT_SOCIAL_SETTINGS, INITIAL_SUCCESS_STORIES, DEFAULT_TOP_NOTIFICATION_CONFIG, DEFAULT_DESKTOP_HERO_CONFIG, DEFAULT_MOBILE_HERO_CONFIG } from '../data/initialData';
import { 
  SocialSettings 
} from '../types';
import { 
  supabase, 
  diagnoseSupabaseConnection, 
  fetchProducts, 
  upsertProduct, 
  deleteProductFromDb, 
  fetchMobileProducts,
  upsertMobileProduct,
  deleteMobileProductFromDb,
  saveAllMobileProductsToDb,
  fetchOrders, 
  upsertOrder, 
  deleteOrderFromDb, 
  fetchPromos, 
  upsertPromo, 
  deletePromoFromDb, 
  fetchSupportInquiries, 
  upsertSupportInquiry, 
  deleteSupportInquiryFromDb,
  fetchReviews, 
  upsertReview, 
  deleteReviewFromDb, 
  fetchChatSessions, 
  upsertChatSession, 
  deleteChatSessionFromDb,
  fetchCustomerProfileFromDb,
  upsertCustomerProfileToDb,
  cleanCustomerProfilesFromStoreConfigs,
  saveConfigToDb, 
  fetchConfigFromDb,
  fetchSuccessStories,
  upsertSuccessStory,
  deleteSuccessStoryFromDb,
  fetchStoreBranding,
  saveStoreBranding,
  fetchSocialSettings,
  saveSocialSettings,
  fetchShippingSettings,
  saveShippingSettings,
  fetchDesktopHeroConfig,
  saveDesktopHeroConfig,
  deleteDesktopHeroConfigFromDb,
  fetchMobileHeroConfig,
  saveMobileHeroConfig,
  deleteMobileHeroConfigFromDb
} from '../lib/supabase';
import { deleteVideoBlob } from '../lib/videoStorage';
import { calculateCartPricing, getItemBundleInfo } from '../lib/pricingUtils';
import { 
  deleteProductMedia, 
  deleteReviewMedia, 
  deleteSuccessStoryMedia,
  cleanupProductVideoBlobsOnDeletion,
  cleanupStoryVideoBlobsOnDeletion,
  reconcileInterruptedVideoCleanups,
  scanAndCleanOrphanVideoBlobs,
  setupInterruptedCleanupListeners,
  deleteFileFromStorage
} from '../lib/storageCleanup';

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  enabled: true,
  standardFee: 49,
  freeShippingThreshold: 999,
  estimatedDeliveryDays: '2–4 Business Days',
  freeDeliveryLabel: 'Free Express Delivery'
};

export const sanitizeShippingSettings = (raw: any): ShippingSettings => {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SHIPPING_SETTINGS };
  let standardFee = typeof raw.standardFee === 'number' && !isNaN(raw.standardFee) && raw.standardFee >= 0
    ? raw.standardFee
    : (raw.standardFee !== undefined && !isNaN(Number(raw.standardFee)) && Number(raw.standardFee) >= 0 ? Number(raw.standardFee) : DEFAULT_SHIPPING_SETTINGS.standardFee);
  
  let freeShippingThreshold = typeof raw.freeShippingThreshold === 'number' && !isNaN(raw.freeShippingThreshold) && raw.freeShippingThreshold >= 0
    ? raw.freeShippingThreshold
    : (raw.freeShippingThreshold !== undefined && !isNaN(Number(raw.freeShippingThreshold)) && Number(raw.freeShippingThreshold) >= 0 ? Number(raw.freeShippingThreshold) : DEFAULT_SHIPPING_SETTINGS.freeShippingThreshold);

  // Upgrade legacy USD threshold ($150) and fee ($45) to INR defaults
  if (freeShippingThreshold === 150) {
    freeShippingThreshold = 999;
  }
  if (standardFee === 45) {
    standardFee = 49;
  }

  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : true,
    standardFee,
    freeShippingThreshold,
    estimatedDeliveryDays: typeof raw.estimatedDeliveryDays === 'string' && raw.estimatedDeliveryDays.trim() ? raw.estimatedDeliveryDays.trim() : DEFAULT_SHIPPING_SETTINGS.estimatedDeliveryDays,
    freeDeliveryLabel: typeof raw.freeDeliveryLabel === 'string' && raw.freeDeliveryLabel.trim() ? raw.freeDeliveryLabel.trim() : DEFAULT_SHIPPING_SETTINGS.freeDeliveryLabel
  };
};

const DEFAULT_PROMO_POPUP_CONFIG: PromoPopupConfig = {
  enabled: true,
  title: 'FLASH SALE & EXCLUSIVE DROP',
  subtitle: 'Claim an instant 20% OFF on our featured winning product for a limited time.',
  badgeText: '🔥 LIMITED TIME FLASH OFFER',
  promoCode: 'FLASH20',
  discountPercent: 20,
  discountValueText: 'Save 20% Instantly + Free Express Shipping',
  buttonText: 'Claim 20% OFF & View Deal',
  imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  delaySeconds: 2,
  featuredProductId: 'prod-001',
  featuredProductIds: ['prod-001']
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  codEnabled: true,
  codNoticeMessage: 'Cash on delivery is available for eligible products in your cart.',
  payOnlineEnabled: true,
  payOnlineDiscountPercent: 5,
  payOnlineDiscountLabel: '5% Extra Instant Discount on Full Online Payment',
  partialPaymentEnabled: true,
  partialPaymentUpfrontPercent: 20,
  partialPaymentDiscountPercent: 2,
  razorpayKeyId: 'rzp_test_LuminaPay2026',
  razorpayKeySecret: 'secret_lumina_rzp_998877',
  razorpayTestMode: true,
};

export const sanitizePaymentSettings = (raw: any): PaymentSettings => {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PAYMENT_SETTINGS };
  return {
    codEnabled: typeof raw.codEnabled === 'boolean' ? raw.codEnabled : true,
    codNoticeMessage: typeof raw.codNoticeMessage === 'string' ? raw.codNoticeMessage : DEFAULT_PAYMENT_SETTINGS.codNoticeMessage,
    payOnlineEnabled: typeof raw.payOnlineEnabled === 'boolean' ? raw.payOnlineEnabled : true,
    payOnlineDiscountPercent: typeof raw.payOnlineDiscountPercent === 'number' ? raw.payOnlineDiscountPercent : 5,
    payOnlineDiscountLabel: typeof raw.payOnlineDiscountLabel === 'string' ? raw.payOnlineDiscountLabel : (DEFAULT_PAYMENT_SETTINGS.payOnlineDiscountLabel || ''),
    partialPaymentEnabled: typeof raw.partialPaymentEnabled === 'boolean' ? raw.partialPaymentEnabled : true,
    partialPaymentUpfrontPercent: typeof raw.partialPaymentUpfrontPercent === 'number' ? raw.partialPaymentUpfrontPercent : 20,
    partialPaymentDiscountPercent: typeof raw.partialPaymentDiscountPercent === 'number' ? raw.partialPaymentDiscountPercent : 2,
    razorpayKeyId: typeof raw.razorpayKeyId === 'string' ? raw.razorpayKeyId : '',
    razorpayKeySecret: typeof raw.razorpayKeySecret === 'string' ? raw.razorpayKeySecret : '',
    razorpayTestMode: typeof raw.razorpayTestMode === 'boolean' ? raw.razorpayTestMode : true,
  };
};

const DEFAULT_BUNDLE_CONFIG: BundleConfig = {
  enabled: true,
  tier2Quantity: 2,
  tier2DiscountPercent: 15,
  tier2Badge: 'MOST POPULAR — SAVE 15%',
  tier3Quantity: 3,
  tier3DiscountPercent: 25,
  tier3Badge: 'BEST VALUE — SAVE 25%'
};

export const DEFAULT_STORE_BRANDING: StoreBrandingConfig = {
  id: 'current',
  storeName: 'LUMINA',
  storeNameFont: 'serif',
  storeNameSize: 24,
  storeNameColor: '#0f172a',
  storeNameWeight: 'black',
  
  subtitle: 'WINNING PRODUCTS',
  subtitleFontSize: 10,
  subtitleColor: '#d97706',
  subtitleFontWeight: 'extrabold',
  subtitleLetterSpacing: 'widest',
  subtitleStyle: 'normal',
  subtitleTransform: 'uppercase',

  logoType: 'icon',
  logoImageUrl: '',
  logoIcon: 'sparkles',
  logoGradient: 'from-amber-500 via-orange-500 to-red-500',
  logoHeight: 40,
  logoRounded: 'xl'
};

interface StoreContextType {
  products: Product[];
  mobileProducts: Product[];
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  activePage: ActivePage;
  adminTab: AdminTab;
  selectedProductId: string | null;
  lastPlacedOrder: Order | null;
  searchTerm: string;
  selectedCategory: Category;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  quickViewProduct: Product | null;
  activePromo: PromoCode | null;
  promos: PromoCode[];
  promoCodes: PromoCode[];
  bundleConfig: BundleConfig;
  reviewsMap: Record<string, ProductReview[]>;
  notification: string | null;
  
  // Admin Auth & Theme
  isAdminAuthenticated: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  adminTheme: 'dark' | 'light';
  setAdminTheme: (theme: 'dark' | 'light') => void;
  toggleAdminTheme: () => void;

  // Customer Auth (OTP + Resend API) & Profile
  customerUser: CustomerUser | null;
  isCustomerAuthenticated: boolean;
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;
  customerAuthModalReason: string | null;
  setCustomerAuthModalReason: (reason: string | null) => void;
  authRedirectTarget: ActivePage | null;
  setAuthRedirectTarget: (target: ActivePage | null) => void;
  openCustomerAuthForCheckout: () => void;
  navigateToLogin: (redirectTarget?: ActivePage, reason?: string) => void;
  customerPortalTab: CustomerPortalTab;
  setCustomerPortalTab: (tab: CustomerPortalTab) => void;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => Promise<{ success: boolean; dbSuccess?: boolean; message?: string }>;
  sendCustomerOtp: (email: string) => Promise<{ success: boolean; message: string; debugOtp?: string }>;
  verifyCustomerOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logoutCustomer: () => void;

  // Navigation & UI controls
  navigateTo: (page: ActivePage, productId?: string, portalTab?: CustomerPortalTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (cat: Category) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setQuickViewProduct: (prod: Product | null) => void;
  isFlashSalePopupOpen: boolean;
  setIsFlashSalePopupOpen: (open: boolean) => void;
  openFlashSalePopup: () => void;
  showNotification: (msg: string) => void;
  mobileCartNotification: {
    product: Product;
    quantity: number;
    bundleDiscount?: number;
    bundleTier?: number;
    timestamp: number;
  } | null;
  setMobileCartNotification: (item: {
    product: Product;
    quantity: number;
    bundleDiscount?: number;
    bundleTier?: number;
    timestamp: number;
  } | null) => void;

  // Shopping Cart & Wishlist
  addToCart: (product: Product, quantity?: number, bundleDiscount?: number, bundleTier?: number, skipNotification?: boolean) => void;
  removeFromCart: (productId: string, variantColor?: string) => void;
  updateCartQuantity: (productId: string, quantityOrColor?: any, maybeQuantity?: any) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Product Comparison
  compareList: string[];
  toggleCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  // Bundle & Promo Code Admin Controls
  updateBundleConfig: (config: Partial<BundleConfig>) => Promise<boolean>;
  promoPopupConfig: PromoPopupConfig;
  updatePromoPopupConfig: (config: Partial<PromoPopupConfig>) => Promise<boolean>;
  topNotificationConfig: TopNotificationConfig;
  updateTopNotificationConfig: (config: Partial<TopNotificationConfig>) => Promise<boolean>;
  storeBranding: StoreBrandingConfig;
  updateStoreBranding: (config: Partial<StoreBrandingConfig>) => Promise<boolean>;
  desktopHeroConfig: DesktopHeroConfig;
  updateDesktopHeroConfig: (config: Partial<DesktopHeroConfig>) => Promise<boolean>;
  deleteDesktopHeroBanner: () => Promise<boolean>;
  mobileHeroConfig: MobileHeroConfig;
  updateMobileHeroConfig: (config: Partial<MobileHeroConfig>) => Promise<boolean>;
  deleteMobileHeroBanner: () => Promise<boolean>;
  addPromoCode: (codeData: Omit<PromoCode, 'active'> | PromoCode) => Promise<boolean>;
  updatePromoCode: (codeData: Partial<PromoCode> & { code: string }) => Promise<boolean>;
  togglePromoCode: (codeStr: string) => Promise<void>;
  deletePromoCode: (codeStr: string) => Promise<void>;
  saveAllPromosToDb: () => Promise<boolean>;

  // Orders
  placeOrder: (
    shippingAddress: ShippingAddress, 
    paymentMethod: string,
    paymentDetails?: {
      paymentStatus?: 'Pending' | 'Paid' | 'Partially Paid' | 'Failed';
      paidOnlineAmount?: number;
      codDueAmount?: number;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      paymentDiscountAmount?: number;
    }
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, carrier?: string) => void;
  updateOrderPaymentDetails: (
    orderId: string, 
    details: {
      paymentStatus?: 'Pending' | 'Paid' | 'Partially Paid' | 'Failed';
      paidOnlineAmount?: number;
      codDueAmount?: number;
      paymentMethod?: string;
      notes?: string;
    }
  ) => void;
  deleteOrder: (orderId: string) => void;

  // Payment Settings
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => Promise<boolean>;

  // Shipping & Delivery Settings
  shippingSettings: ShippingSettings;
  updateShippingSettings: (settings: Partial<ShippingSettings>) => Promise<boolean>;

  // Social Media Settings
  socialSettings: SocialSettings;
  updateSocialSettings: (settings: Partial<SocialSettings>) => void;

  // Desktop Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  resetProductsToDefault: () => void;

  // Dedicated Mobile Product Catalog CRUD
  addMobileProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  updateMobileProduct: (product: Product) => void;
  deleteMobileProduct: (id: string) => void;
  toggleMobileProductStatus: (id: string) => void;
  resetMobileProductsToDefault: () => void;
  copyDesktopProductsToMobile: () => void;
  copyMobileProductsToDesktop: () => void;
  saveAllMobileProductsToDb: () => Promise<boolean>;

  // Review Management & Manual Seeding
  addReview: (productId: string, review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'> & { date?: string }) => void;
  deleteReview: (productId: string, reviewId: string) => void;
  seedSampleReviewsForProduct: (productId: string) => void;

  // Video Success Stories Management
  successStories: SuccessStory[];
  addSuccessStory: (story: Omit<SuccessStory, 'id' | 'createdAt'>) => SuccessStory;
  updateSuccessStory: (id: string, updates: Partial<SuccessStory>) => void;
  deleteSuccessStory: (id: string) => void;
  toggleSuccessStoryPublish: (id: string) => void;
  seedSampleSuccessStoriesForProduct: (productId: string) => void;

  // Support Inquiries
  supportInquiries: SupportInquiry[];
  submitSupportInquiry: (inquiry: Omit<SupportInquiry, 'id' | 'createdAt' | 'status'>) => Promise<SupportInquiry>;
  updateInquiryStatus: (id: string, status: InquiryStatus, adminReply?: string) => void;
  deleteInquiry: (id: string) => void;
  refreshSupportInquiries: () => Promise<void>;

  // Live Chat
  chatSessions: ChatSession[];
  sendChatMessage: (sessionId: string, sender: 'customer' | 'admin', text: string, customerInfo?: { name?: string; email?: string; phone?: string }, userType?: 'member' | 'guest') => void;
  markChatReadByAdmin: (sessionId: string) => void;
  markChatReadByCustomer: (sessionId: string) => void;
  updateChatSessionStatus: (sessionId: string, status: 'Open' | 'Resolved') => void;
  deleteChatSession: (sessionId: string) => void;
  customerChatSessionId: string;
  guestChatUser: { name: string; email: string; phone: string; sessionId: string } | null;
  setGuestChatUser: (guest: { name: string; email: string; phone: string; sessionId: string } | null) => void;
  refreshChatSessions: () => Promise<void>;

  // Supabase Syncing Controls
  supabaseStatus: {
    connected: boolean;
    allTablesOk: boolean;
    missingTables: string[];
    isSyncing: boolean;
    error?: string;
  };
  checkSupabaseDb: () => Promise<void>;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  pullAllFromSupabase: () => Promise<{ success: boolean; message: string }>;

  // Storage Video Cleanup & Interruption Recovery
  reconcileInterruptedVideoCleanups: () => Promise<number>;
  scanAndCleanOrphanVideoBlobs: () => Promise<{ scanned: number; purged: number; verifiedAbsent: string[] }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_INQUIRIES: SupportInquiry[] = [
  {
    id: 'INQ-1001',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    name: 'Alexander Wright',
    email: 'alex.wright@example.com',
    category: 'Order Tracking',
    subject: 'Package Tracking Status for Order #LUM-98214',
    orderNumber: 'LUM-98214',
    message: 'Hello Lumina Support, I ordered the Magnetic Levitating Speaker yesterday. Could you confirm if the package has been handed over to FedEx? Thank you!',
    status: 'New'
  },
  {
    id: 'INQ-1002',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    name: 'Sophia Martinez',
    email: 'sophia.m@example.com',
    category: 'Product Inquiry',
    subject: 'Ultrasonic Cleaner voltage compatibility in EU',
    message: 'Does the Pro Ultrasonic Cleaner support 220V power outlets in Europe or do I need a separate transformer adapter?',
    status: 'In Progress',
    adminReply: 'Hi Sophia! Yes, all Lumina electronics feature universal dual-voltage adapters (100V-240V) suitable worldwide.'
  }
];

const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat-sarah-jenkins',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    unreadForAdmin: 1,
    unreadForCustomer: 0,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'Open',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Sarah Jenkins',
        text: 'Hi there! Is the Magnetic Levitating Speaker waterproof or water-resistant?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'msg-2',
        sender: 'admin',
        senderName: 'Lumina Concierge',
        text: 'Hello Sarah! It features an IPX4 splash-resistance rating, ideal for desk, bedside, or patio placement!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'msg-3',
        sender: 'customer',
        senderName: 'Sarah Jenkins',
        text: 'Awesome! Can I apply coupon code WINNING20 for 20% off my order?',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      }
    ]
  },
  {
    id: 'chat-liam-miller',
    customerName: 'Liam Miller',
    customerEmail: 'liam.m@example.com',
    unreadForAdmin: 0,
    unreadForCustomer: 0,
    lastMessageAt: new Date(Date.now() - 1000 * 3600 * 3).toISOString(),
    status: 'Resolved',
    messages: [
      {
        id: 'msg-101',
        sender: 'customer',
        senderName: 'Liam Miller',
        text: 'Hello! What is the estimated express delivery time to California?',
        timestamp: new Date(Date.now() - 1000 * 3600 * 5).toISOString()
      },
      {
        id: 'msg-102',
        sender: 'admin',
        senderName: 'Lumina Concierge',
        text: 'Hi Liam! Express delivery to California takes 2 to 3 business days with free live tracking.',
        timestamp: new Date(Date.now() - 1000 * 3600 * 3).toISOString()
      }
    ]
  }
];

const INITIAL_REVIEWS: Record<string, ProductReview[]> = {
  'prod-001': [
    {
      id: 'rev-101',
      author: 'David K.',
      rating: 5,
      date: 'Aug 02, 2026',
      title: 'Mind-blowing levitation & surreal ambient vibe!',
      comment: 'Everyone who comes into my office instantly asks where I got this. Floating orb looks unreal, and the built-in speaker sound is surprisingly crisp and deep.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 24
    },
    {
      id: 'rev-102',
      author: 'Jessica M.',
      rating: 5,
      date: 'Jul 29, 2026',
      title: 'Worth every single penny',
      comment: 'Super easy magnetic setup. The auto-catch feature works perfectly if power trips. Build quality is luxury walnut.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 18
    }
  ],
  'prod-002': [
    {
      id: 'rev-201',
      author: 'Robert B.',
      rating: 5,
      date: 'Aug 04, 2026',
      title: 'Restored my gold watch and eyeglasses like magic',
      comment: 'I put my glasses in for 3 minutes and the amount of invisible oils that came out was insane. Clear crystal vision again!',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 15
    }
  ]
};

// Known demo / mock product IDs to prevent from lingering as default fallbacks
export const DEMO_PRODUCT_IDS = new Set([
  'prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005',
  'prod-006', 'prod-007', 'prod-008', 'prod-009', 'prod-010',
  'prod-011', 'prod-012', 'prod-013', 'prod-014', 'prod-015',
  'prod-016', 'prod-017', 'prod-018', 'prod-019', 'prod-020',
  'mob-prod-001', 'mob-prod-002', 'mob-prod-003', 'mob-prod-004', 'mob-prod-005'
]);

/**
 * Synchronizes Desktop Product Catalog into Mobile Product Catalog.
 * - Every product in desktopList has an exact matching counterpart in mobileProducts with the same ID.
 * - Fixed core identity fields (title, marketingSubtitle, subtitle, shortDescription)
 *   are locked and strictly mirror the desktop product.
 * - Mobile-specific customizations (images, gifs, description, specifications, shippingWarranty,
 *   pricing, stock, badges, visibility flags, category) are preserved individually.
 */
export function syncDesktopToMobileProducts(desktopList: Product[], currentMobileList: Product[]): Product[] {
  const currentMobileMap = new Map<string, Product>();
  for (const mp of currentMobileList) {
    if (mp && mp.id) {
      currentMobileMap.set(mp.id, mp);
    }
  }

  return desktopList.map((dp) => {
    const existing = currentMobileMap.get(dp.id);
    if (existing) {
      return {
        ...existing,
        id: dp.id,
        title: dp.title,
        marketingSubtitle: dp.marketingSubtitle ?? dp.subtitle,
        subtitle: dp.subtitle ?? dp.marketingSubtitle,
        shortDescription: dp.shortDescription,
        category: existing.category || dp.category,
      };
    }
    // Automatically clone desktop product into mobile catalog with identical ID
    return {
      ...dp,
      id: dp.id,
    };
  });
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage state initialization with zero default products (no fallback)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lumina_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        if (Array.isArray(parsed)) {
          // Filter out default demo products so they never appear as fallback
          const cleaned = parsed.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('lumina_products', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [mobileProducts, setMobileProducts] = useState<Product[]>(() => {
    const savedDesktop = localStorage.getItem('lumina_products');
    let desktopList: Product[] = [];
    if (savedDesktop) {
      try {
        const parsed = JSON.parse(savedDesktop) as Product[];
        if (Array.isArray(parsed)) {
          desktopList = parsed.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
        }
      } catch (e) {}
    }

    const saved = localStorage.getItem('lumina_mobile_products');
    let rawMobileList: Product[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        if (Array.isArray(parsed)) {
          // Filter out default demo products so they never appear as fallback
          rawMobileList = parsed.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
        }
      } catch (e) {}
    }

    // Always maintain 1:1 synchronization with desktop catalog
    if (desktopList.length > 0) {
      const synced = syncDesktopToMobileProducts(desktopList, rawMobileList);
      localStorage.setItem('lumina_mobile_products', JSON.stringify(synced));
      return synced;
    }
    return rawMobileList;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const isCurrencyMigrated = localStorage.getItem('lumina_currency_inr_v2');
    if (!isCurrencyMigrated) return INITIAL_ORDERS;
    const saved = localStorage.getItem('lumina_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('lumina_cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => ({
        ...item,
        quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1
      }));
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_wishlist');
    return saved ? JSON.parse(saved) : ['prod-001'];
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_compare');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const [reviewsMap, setReviewsMap] = useState<Record<string, ProductReview[]>>(() => {
    const saved = localStorage.getItem('lumina_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [successStories, setSuccessStories] = useState<SuccessStory[]>(() => {
    const saved = localStorage.getItem('lumina_success_stories');
    if (saved) {
      try {
        const parsed: SuccessStory[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userStoriesOnly = parsed.filter(
            (s) => !s.id.startsWith('story-00') && !s.id.startsWith('story-1789977538978-')
          );
          localStorage.setItem('lumina_success_stories', JSON.stringify(userStoriesOnly));
          return userStoriesOnly;
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  const [supportInquiries, setSupportInquiries] = useState<SupportInquiry[]>(() => {
    const saved = localStorage.getItem('lumina_support_inquiries');
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('lumina_chat_sessions');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_SESSIONS;
  });

  const [bundleConfig, setBundleConfig] = useState<BundleConfig>(() => {
    const saved = localStorage.getItem('lumina_bundle_config');
    return saved ? JSON.parse(saved) : DEFAULT_BUNDLE_CONFIG;
  });

  const [promoPopupConfig, setPromoPopupConfig] = useState<PromoPopupConfig>(() => {
    const saved = localStorage.getItem('lumina_promo_popup_config');
    return saved ? JSON.parse(saved) : DEFAULT_PROMO_POPUP_CONFIG;
  });

  const [topNotificationConfig, setTopNotificationConfig] = useState<TopNotificationConfig>(() => {
    const saved = localStorage.getItem('lumina_top_notification_config');
    return saved ? JSON.parse(saved) : DEFAULT_TOP_NOTIFICATION_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('lumina_promo_popup_config', JSON.stringify(promoPopupConfig));
  }, [promoPopupConfig]);

  useEffect(() => {
    localStorage.setItem('lumina_top_notification_config', JSON.stringify(topNotificationConfig));
  }, [topNotificationConfig]);

  const [storeBranding, setStoreBranding] = useState<StoreBrandingConfig>(() => {
    const saved = localStorage.getItem('lumina_store_branding');
    return saved ? { ...DEFAULT_STORE_BRANDING, ...JSON.parse(saved) } : DEFAULT_STORE_BRANDING;
  });

  useEffect(() => {
    localStorage.setItem('lumina_store_branding', JSON.stringify(storeBranding));
  }, [storeBranding]);

  const [desktopHeroConfig, setDesktopHeroConfig] = useState<DesktopHeroConfig>(() => {
    try {
      const saved = localStorage.getItem('lumina_desktop_hero_config');
      return saved ? { ...DEFAULT_DESKTOP_HERO_CONFIG, ...JSON.parse(saved) } : DEFAULT_DESKTOP_HERO_CONFIG;
    } catch {
      return DEFAULT_DESKTOP_HERO_CONFIG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lumina_desktop_hero_config', JSON.stringify(desktopHeroConfig));
    } catch (e) {
      console.warn('[StoreContext] Could not persist desktop hero config to localStorage:', e);
    }
  }, [desktopHeroConfig]);

  const [mobileHeroConfig, setMobileHeroConfig] = useState<MobileHeroConfig>(() => {
    try {
      const saved = localStorage.getItem('lumina_mobile_hero_config');
      return saved ? { ...DEFAULT_MOBILE_HERO_CONFIG, ...JSON.parse(saved) } : DEFAULT_MOBILE_HERO_CONFIG;
    } catch {
      return DEFAULT_MOBILE_HERO_CONFIG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lumina_mobile_hero_config', JSON.stringify(mobileHeroConfig));
    } catch (e) {
      console.warn('[StoreContext] Could not persist mobile hero config to localStorage:', e);
    }
  }, [mobileHeroConfig]);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem('lumina_payment_settings');
    return saved ? sanitizePaymentSettings(JSON.parse(saved)) : DEFAULT_PAYMENT_SETTINGS;
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(() => {
    const saved = localStorage.getItem('lumina_shipping_settings');
    return saved ? sanitizeShippingSettings(JSON.parse(saved)) : DEFAULT_SHIPPING_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('lumina_shipping_settings', JSON.stringify(shippingSettings));
  }, [shippingSettings]);

  // Setup persistent video cleanup listeners for interrupted deletions (online, pagehide, interval)
  useEffect(() => {
    const unbind = setupInterruptedCleanupListeners();
    return () => {
      unbind();
    };
  }, []);

  const [promos, setPromos] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('lumina_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOS;
  });
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);

  // Supabase State & Loading
  const [supabaseStatus, setSupabaseStatus] = useState({
    connected: false,
    allTablesOk: false,
    missingTables: [] as string[],
    isSyncing: false,
    error: undefined as string | undefined
  });

  const checkSupabaseDb = async () => {
    const diag = await diagnoseSupabaseConnection();
    setSupabaseStatus(prev => ({
      ...prev,
      connected: diag.connected,
      allTablesOk: diag.allTablesOk,
      missingTables: diag.missingTables,
      error: diag.error
    }));
  };

  useEffect(() => {
    const loadFromSupabase = async () => {
      const diag = await diagnoseSupabaseConnection();
      setSupabaseStatus(prev => ({
        ...prev,
        connected: diag.connected,
        allTablesOk: diag.allTablesOk,
        missingTables: diag.missingTables,
        error: diag.error
      }));

      if (diag.connected && diag.allTablesOk) {
        setSupabaseStatus(prev => ({ ...prev, isSyncing: true }));
        try {
          const [dbProducts, dbMobileProducts, dbOrders, dbPromos, dbInquiries, dbReviews, dbChats, dbStories] = await Promise.all([
            fetchProducts(),
            fetchMobileProducts(),
            fetchOrders(),
            fetchPromos(),
            fetchSupportInquiries(),
            fetchReviews(),
            fetchChatSessions(),
            fetchSuccessStories()
          ]);

          if (Array.isArray(dbProducts)) {
            const cleaned = dbProducts.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
            setProducts(cleaned);
            localStorage.setItem('lumina_products', JSON.stringify(cleaned));
            // Asynchronously delete any lingering demo products from Supabase
            const demoProds = dbProducts.filter(p => DEMO_PRODUCT_IDS.has(p.id));
            if (demoProds.length > 0) {
              demoProds.forEach(dp => {
                deleteProductFromDb(dp.id).catch(() => {});
              });
            }

            const rawMobile = Array.isArray(dbMobileProducts)
              ? dbMobileProducts.filter(p => !DEMO_PRODUCT_IDS.has(p.id))
              : [];
            const syncedMobile = syncDesktopToMobileProducts(cleaned, rawMobile);
            setMobileProducts(syncedMobile);
            localStorage.setItem('lumina_mobile_products', JSON.stringify(syncedMobile));
          } else if (Array.isArray(dbMobileProducts)) {
            const cleaned = dbMobileProducts.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
            setMobileProducts(cleaned);
            localStorage.setItem('lumina_mobile_products', JSON.stringify(cleaned));
          }

          if (dbOrders) {
            setOrders(dbOrders);
            localStorage.setItem('lumina_orders', JSON.stringify(dbOrders));
          }

          if (dbPromos && dbPromos.length > 0) {
            setPromos(dbPromos);
            localStorage.setItem('lumina_promos', JSON.stringify(dbPromos));
          } else if (dbPromos && dbPromos.length === 0) {
            console.log("Supabase promos table is empty. Auto-seeding default promos...");
            setPromos(INITIAL_PROMOS);
            localStorage.setItem('lumina_promos', JSON.stringify(INITIAL_PROMOS));
            INITIAL_PROMOS.forEach(pr => {
              upsertPromo(pr).catch(() => {});
            });
          }

          if (dbInquiries) {
            setSupportInquiries(dbInquiries);
            localStorage.setItem('lumina_support_inquiries', JSON.stringify(dbInquiries));
          }

          if (dbReviews) {
            const newReviewsMap: Record<string, ProductReview[]> = {};
            dbReviews.forEach(r => {
              const pId = r.productId || '';
              if (!newReviewsMap[pId]) {
                newReviewsMap[pId] = [];
              }
              newReviewsMap[pId].push(r);
            });
            setReviewsMap(newReviewsMap);
            localStorage.setItem('lumina_reviews', JSON.stringify(newReviewsMap));
          }

          if (dbChats) {
            setChatSessions(dbChats);
            localStorage.setItem('lumina_chat_sessions', JSON.stringify(dbChats));
          }

          if (dbStories && dbStories.length > 0) {
            const userStories = dbStories.filter(
              (s) => !s.id.startsWith('story-00') && !s.id.startsWith('story-1789977538978-')
            );
            setSuccessStories(userStories);
            localStorage.setItem('lumina_success_stories', JSON.stringify(userStories));
          } else {
            setSuccessStories([]);
            localStorage.setItem('lumina_success_stories', JSON.stringify([]));
          }

          // Fetch configs
          const dbBundle = await fetchConfigFromDb<BundleConfig>('bundle_config');
          if (dbBundle) {
            setBundleConfig(dbBundle);
            localStorage.setItem('lumina_bundle_config', JSON.stringify(dbBundle));
          }

          const dbPopup = await fetchConfigFromDb<PromoPopupConfig>('promo_popup_config');
          if (dbPopup) {
            setPromoPopupConfig(dbPopup);
            localStorage.setItem('lumina_promo_popup_config', JSON.stringify(dbPopup));
          }

          const dbPayment = await fetchConfigFromDb<any>('payment_settings');
          if (dbPayment) {
            const cleanPayment = sanitizePaymentSettings(dbPayment);
            setPaymentSettings(cleanPayment);
            localStorage.setItem('lumina_payment_settings', JSON.stringify(cleanPayment));
          }

          const dbShipping = await fetchShippingSettings();
          if (dbShipping) {
            const cleanShipping = sanitizeShippingSettings(dbShipping);
            setShippingSettings(cleanShipping);
            localStorage.setItem('lumina_shipping_settings', JSON.stringify(cleanShipping));
          }

          const dbNotification = await fetchConfigFromDb<TopNotificationConfig>('top_notification');
          if (dbNotification) {
            setTopNotificationConfig(dbNotification);
            localStorage.setItem('lumina_top_notification_config', JSON.stringify(dbNotification));
          }

          const dbBranding = await fetchStoreBranding();
          if (dbBranding) {
            setStoreBranding(dbBranding);
            localStorage.setItem('lumina_store_branding', JSON.stringify(dbBranding));
          }

          const dbSocial = await fetchSocialSettings();
          if (dbSocial) {
            const mergedSocial = { ...DEFAULT_SOCIAL_SETTINGS, ...dbSocial };
            setSocialSettings(mergedSocial);
            localStorage.setItem('lumina_social_settings', JSON.stringify(mergedSocial));
          }

          const dbDesktopHero = await fetchDesktopHeroConfig();
          if (dbDesktopHero) {
            setDesktopHeroConfig(dbDesktopHero);
            localStorage.setItem('lumina_desktop_hero_config', JSON.stringify(dbDesktopHero));
          }

          const dbMobileHero = await fetchMobileHeroConfig();
          if (dbMobileHero) {
            setMobileHeroConfig(dbMobileHero);
            localStorage.setItem('lumina_mobile_hero_config', JSON.stringify(dbMobileHero));
          }

          // Clean legacy customer profile keys from store_configs
          cleanCustomerProfilesFromStoreConfigs().catch(() => {});
        } catch (err) {
          console.warn('Supabase initial sync notice:', err);
        } finally {
          setSupabaseStatus(prev => ({ ...prev, isSyncing: false }));
        }
      }
    };

    loadFromSupabase();
  }, []);

  // Admin Auth & Theme State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lumina_admin_auth') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('lumina_admin_pass') || 'admin123';
  });
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lumina_admin_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('lumina_admin_theme', adminTheme);
  }, [adminTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('lumina_success_stories', JSON.stringify(successStories));
    } catch (e) {
      console.warn('[StoreContext] Could not persist success stories to localStorage:', e);
    }
  }, [successStories]);

  const toggleAdminTheme = () => {
    setAdminTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Customer Auth State (OTP + Resend API) & Profile
  const [customerPortalTab, setCustomerPortalTab] = useState<CustomerPortalTab>('orders');
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('lumina_customer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState<boolean>(false);
  const [customerAuthModalReason, setCustomerAuthModalReason] = useState<string | null>(null);
  const [authRedirectTarget, setAuthRedirectTarget] = useState<ActivePage | null>(null);

  const navigateToLogin = (redirectTarget: ActivePage = 'my-orders', reason?: string) => {
    setAuthRedirectTarget(redirectTarget);
    setCustomerAuthModalReason(reason || (redirectTarget === 'checkout' ? 'checkout' : null));
    setIsCustomerAuthModalOpen(false); // Close any modal prompt
    navigateTo('login');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openCustomerAuthForCheckout = () => {
    navigateToLogin('checkout', 'checkout');
    showNotification('Please sign in or verify your email to proceed to shipping details.');
  };

  const [guestChatUser, setGuestChatUser] = useState<{ name: string; email: string; phone: string; sessionId: string } | null>(() => {
    const saved = localStorage.getItem('lumina_guest_chat_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (guestChatUser) {
      localStorage.setItem('lumina_guest_chat_user', JSON.stringify(guestChatUser));
    } else {
      localStorage.removeItem('lumina_guest_chat_user');
    }
  }, [guestChatUser]);

  const customerChatSessionId = customerUser 
    ? `chat-member-${customerUser.email.replace(/[^a-zA-Z0-9]/g, '-')}` 
    : (guestChatUser ? guestChatUser.sessionId : '');

  useEffect(() => {
    if (customerUser?.email) {
      fetchCustomerProfileFromDb(customerUser.email)
        .then((dbProfile) => {
          if (dbProfile) {
            setCustomerUser((prev) => {
              if (!prev) return dbProfile;
              return {
                ...prev,
                name: dbProfile.name || prev.name,
                phone: dbProfile.phone || prev.phone,
                address: dbProfile.address || prev.address,
                city: dbProfile.city || prev.city,
                state: dbProfile.state || prev.state,
                zipCode: dbProfile.zipCode || prev.zipCode,
                country: dbProfile.country || prev.country
              };
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('lumina_customer_user', JSON.stringify(customerUser));
      try {
        localStorage.setItem(`lumina_customer_profile_${customerUser.email.toLowerCase()}`, JSON.stringify(customerUser));
      } catch (e) {
        // ignore
      }
    } else {
      localStorage.removeItem('lumina_customer_user');
    }
  }, [customerUser]);

  const updateCustomerProfile = async (updates: Partial<CustomerProfile>): Promise<{ success: boolean; dbSuccess?: boolean; message?: string }> => {
    if (!customerUser) return { success: false, message: 'No customer logged in' };
    const updated: CustomerUser = { ...customerUser, ...updates };
    setCustomerUser(updated);
    try {
      localStorage.setItem(`lumina_customer_profile_${updated.email.toLowerCase()}`, JSON.stringify(updated));
      localStorage.setItem('lumina_customer_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving customer profile locally:', e);
    }
    
    let dbSuccess = false;
    try {
      dbSuccess = await upsertCustomerProfileToDb(updated);
    } catch (e) {
      console.warn('upsertCustomerProfileToDb error:', e);
    }

    if (dbSuccess) {
      showNotification('✅ Profile changes saved & synced to database!');
    } else {
      showNotification('✅ Profile updated successfully!');
    }
    return { success: true, dbSuccess };
  };

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [selectedProductId, setSelectedProductId] = useState<string | null>('prod-001');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  
  const [isCartOpenState, setIsCartOpenState] = useState<boolean>(false);

  const setIsCartOpen = (open: boolean) => {
    if (open && typeof window !== 'undefined' && window.innerWidth < 768) {
      setActivePage('cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsCartOpenState(false);
      return;
    }
    setIsCartOpenState(open);
  };
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isFlashSalePopupOpen, setIsFlashSalePopupOpen] = useState<boolean>(false);
  const openFlashSalePopup = () => setIsFlashSalePopupOpen(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [mobileCartNotification, setMobileCartNotification] = useState<{
    product: Product;
    quantity: number;
    bundleDiscount?: number;
    bundleTier?: number;
    timestamp: number;
  } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('lumina_products', JSON.stringify(products));
    // Keep mobile products aligned with desktop catalog products
    if (products.length > 0) {
      setMobileProducts((prevMobile) => {
        const synced = syncDesktopToMobileProducts(products, prevMobile);
        const isDiff = synced.length !== prevMobile.length || synced.some((p, i) => {
          const prev = prevMobile[i];
          return !prev || prev.id !== p.id || prev.title !== p.title || prev.subtitle !== p.subtitle || prev.shortDescription !== p.shortDescription || prev.category !== p.category;
        });
        if (isDiff) {
          try {
            localStorage.setItem('lumina_mobile_products', JSON.stringify(synced));
          } catch (e) {}
          return synced;
        }
        return prevMobile;
      });
    } else if (products.length === 0) {
      setMobileProducts((prevMobile) => {
        if (prevMobile.length > 0) {
          localStorage.setItem('lumina_mobile_products', JSON.stringify([]));
          return [];
        }
        return prevMobile;
      });
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lumina_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('lumina_compare', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('lumina_reviews', JSON.stringify(reviewsMap));
  }, [reviewsMap]);

  useEffect(() => {
    localStorage.setItem('lumina_success_stories', JSON.stringify(successStories));
  }, [successStories]);

  useEffect(() => {
    localStorage.setItem('lumina_support_inquiries', JSON.stringify(supportInquiries));
  }, [supportInquiries]);

  useEffect(() => {
    localStorage.setItem('lumina_chat_sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem('lumina_bundle_config', JSON.stringify(bundleConfig));
  }, [bundleConfig]);

  const [socialSettings, setSocialSettings] = useState<SocialSettings>(() => {
    const saved = localStorage.getItem('lumina_social_settings');
    return saved ? { ...DEFAULT_SOCIAL_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SOCIAL_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('lumina_social_settings', JSON.stringify(socialSettings));
  }, [socialSettings]);

  const updateSocialSettings = async (updated: Partial<SocialSettings>): Promise<boolean> => {
    const newSettings: SocialSettings = { ...socialSettings, ...updated };
    setSocialSettings(newSettings);
    localStorage.setItem('lumina_social_settings', JSON.stringify(newSettings));
    try {
      const ok = await saveSocialSettings(newSettings);
      if (ok) {
        showNotification('✅ Social media links updated & saved to database!');
        return true;
      } else {
        showNotification('Social media links updated locally!');
        return false;
      }
    } catch (e) {
      console.warn('Failed to sync social settings to Supabase:', e);
      showNotification('Social media links updated locally!');
      return false;
    }
  };

  useEffect(() => {
    localStorage.setItem('lumina_payment_settings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  const updatePaymentSettings = async (updated: Partial<PaymentSettings>): Promise<boolean> => {
    const next: PaymentSettings = sanitizePaymentSettings({ ...paymentSettings, ...updated });
    setPaymentSettings(next);
    localStorage.setItem('lumina_payment_settings', JSON.stringify(next));
    let dbSuccess = false;
    try {
      dbSuccess = await saveConfigToDb('payment_settings', next);
    } catch (e) {
      console.warn('Failed to sync payment settings to Supabase:', e);
    }
    if (dbSuccess) {
      showNotification('✅ Payment settings saved to database!');
    } else {
      showNotification('Payment settings updated locally!');
    }
    return dbSuccess;
  };

  const updateShippingSettings = async (updated: Partial<ShippingSettings>): Promise<boolean> => {
    const next: ShippingSettings = sanitizeShippingSettings({ ...shippingSettings, ...updated });
    setShippingSettings(next);
    localStorage.setItem('lumina_shipping_settings', JSON.stringify(next));
    let dbSuccess = false;
    try {
      dbSuccess = await saveShippingSettings(next);
    } catch (e) {
      console.warn('Failed to sync shipping settings to Supabase:', e);
    }
    if (dbSuccess) {
      showNotification('✅ Shipping & delivery charges saved to database!');
    } else {
      showNotification('Shipping charges updated locally!');
    }
    return dbSuccess;
  };

  useEffect(() => {
    localStorage.setItem('lumina_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('lumina_admin_pass', adminPassword);
  }, [adminPassword]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const loginAdmin = (password: string): boolean => {
    if (password === adminPassword || password === 'admin123') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('lumina_admin_auth', 'true');
      setIsAdminLoginModalOpen(false);
      showNotification('🔐 Access Granted: Welcome back, Admin!');
      return true;
    } else {
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('lumina_admin_auth');
    setActivePage('home');
    showNotification('Logged out from Admin Center.');
  };

  const changeAdminPassword = (oldPass: string, newPass: string) => {
    if (oldPass !== adminPassword && oldPass !== 'admin123') {
      return { success: false, message: 'Current passcode is incorrect.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'New passcode must be at least 4 characters long.' };
    }
    setAdminPassword(newPass.trim());
    showNotification('🔑 Admin passcode updated successfully!');
    return { success: true, message: 'Admin passcode updated successfully!' };
  };

  // Customer OTP Auth Functions
  const sendCustomerOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showNotification(`📨 ${data.message}`);
        }
        return data;
      }
    } catch (err) {
      console.warn('[StoreContext] Server OTP endpoint unavailable, falling back to client mode:', err);
    }

    // Static / GitHub Pages fallback (runs without Express backend):
    const staticOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      sessionStorage.setItem(`lumina_static_otp_${email.toLowerCase().trim()}`, staticOtp);
    } catch (e) {}
    showNotification(`📨 Verification code: ${staticOtp}`);
    return {
      success: true,
      message: `Static mode: Your verification code is ${staticOtp}`,
      debugOtp: staticOtp
    };
  };

  const verifyCustomerOtp = async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const userEmail = data.user.email;
          let savedProfile: Partial<CustomerProfile> = {};
          try {
            const raw = localStorage.getItem(`lumina_customer_profile_${userEmail.toLowerCase()}`);
            if (raw) savedProfile = JSON.parse(raw);
          } catch (e) {
            // ignore
          }
          try {
            const dbProfile = await fetchCustomerProfileFromDb(userEmail);
            if (dbProfile) {
              savedProfile = { ...savedProfile, ...dbProfile };
            }
          } catch (e) {
            // ignore
          }
          const fullProfile: CustomerUser = {
            email: userEmail,
            name: savedProfile.name || userEmail.split('@')[0],
            phone: savedProfile.phone || '',
            address: savedProfile.address || '',
            city: savedProfile.city || '',
            state: savedProfile.state || '',
            zipCode: savedProfile.zipCode || '',
            country: savedProfile.country || 'United States',
            createdAt: savedProfile.createdAt || new Date().toISOString()
          };
          setCustomerUser(fullProfile);
          localStorage.setItem('lumina_customer_user', JSON.stringify(fullProfile));
          localStorage.setItem(`lumina_customer_profile_${userEmail.toLowerCase()}`, JSON.stringify(fullProfile));
          setIsCustomerAuthModalOpen(false);
          showNotification(`✅ Authenticated successfully as ${userEmail}`);
          const target = authRedirectTarget || (customerAuthModalReason === 'checkout' ? 'checkout' : null);
          setCustomerAuthModalReason(null);
          setAuthRedirectTarget(null);
          if (target) {
            navigateTo(target);
          } else {
            navigateTo('my-orders');
          }
          return data;
        }
      }
    } catch (err) {
      console.warn('[StoreContext] Server verify endpoint unavailable, checking client static OTP:', err);
    }

    // Static / GitHub Pages fallback:
    let savedStaticOtp = '';
    try {
      savedStaticOtp = sessionStorage.getItem(`lumina_static_otp_${email.toLowerCase().trim()}`) || '';
    } catch (e) {}

    const cleanInput = (otp || '').trim();
    if (cleanInput === '123456' || (savedStaticOtp && cleanInput === savedStaticOtp)) {
      const userEmail = email.toLowerCase().trim();
      let savedProfile: Partial<CustomerProfile> = {};
      try {
        const raw = localStorage.getItem(`lumina_customer_profile_${userEmail}`);
        if (raw) savedProfile = JSON.parse(raw);
      } catch (e) {}
      try {
        const dbProfile = await fetchCustomerProfileFromDb(userEmail);
        if (dbProfile) {
          savedProfile = { ...savedProfile, ...dbProfile };
        }
      } catch (e) {}

      const fullProfile: CustomerUser = {
        email: userEmail,
        name: savedProfile.name || userEmail.split('@')[0],
        phone: savedProfile.phone || '',
        address: savedProfile.address || '',
        city: savedProfile.city || '',
        state: savedProfile.state || '',
        zipCode: savedProfile.zipCode || '',
        country: savedProfile.country || 'United States',
        createdAt: savedProfile.createdAt || new Date().toISOString()
      };
      setCustomerUser(fullProfile);
      localStorage.setItem('lumina_customer_user', JSON.stringify(fullProfile));
      localStorage.setItem(`lumina_customer_profile_${userEmail}`, JSON.stringify(fullProfile));
      setIsCustomerAuthModalOpen(false);
      showNotification(`✅ Authenticated successfully as ${userEmail}`);
      const target = authRedirectTarget || (customerAuthModalReason === 'checkout' ? 'checkout' : null);
      setCustomerAuthModalReason(null);
      setAuthRedirectTarget(null);
      if (target) {
        navigateTo(target);
      } else {
        navigateTo('my-orders');
      }
      return { success: true, user: fullProfile };
    }

    return { success: false, message: 'Invalid verification code. Please check and try again.' };
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    showNotification('Logged out from Customer Account.');
  };

  const navigateTo = (page: ActivePage, productId?: string, portalTab?: CustomerPortalTab) => {
    if (productId) {
      setSelectedProductId(productId);
    }

    if (portalTab) {
      setCustomerPortalTab(portalTab);
    }

    if (page === 'admin' && !isAdminAuthenticated) {
      setIsAdminLoginModalOpen(true);
      return;
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (
    product: Product, 
    quantity: number = 1, 
    bundleDiscount: number = 0, 
    bundleTier?: number,
    skipNotification: boolean = false
  ) => {
    const cleanQty = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0 ? quantity : 1;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = typeof updated[existingIndex].quantity === 'number' && !isNaN(updated[existingIndex].quantity)
          ? updated[existingIndex].quantity
          : 0;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + cleanQty
        };
        delete (updated[existingIndex] as any).bundleDiscount;
        delete (updated[existingIndex] as any).bundleTier;
        return updated;
      }
      return [...prevCart, { product, quantity: cleanQty }];
    });

    if (skipNotification) {
      setMobileCartNotification(null);
      return;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile) {
      // Set fancy mobile added-to-cart confirmation modal/toast
      setMobileCartNotification({
        product,
        quantity: cleanQty,
        bundleDiscount,
        bundleTier,
        timestamp: Date.now(),
      });
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 30, 40]);
        }
      } catch (e) {
        // ignore
      }
      // On mobile: DO NOT redirect to cart page and DO NOT open desktop drawer!
    } else {
      showNotification(`Added "${product.title}" to cart!`);
      setIsCartOpenState(true);
    }
  };

  const removeFromCart = (productId: string, variantColor?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (variantColor && (item.selectedColor || (item as any).color) && (item.selectedColor || (item as any).color) !== variantColor) {
          return true;
        }
        return false;
      })
    );
    showNotification('Item removed from cart');
  };

  const updateCartQuantity = (productId: string, quantityOrColor?: any, maybeQuantity?: any) => {
    let cleanQty: number;
    let targetColor: string | undefined = undefined;

    if (typeof quantityOrColor === 'number' && !isNaN(quantityOrColor)) {
      cleanQty = quantityOrColor;
    } else if (typeof maybeQuantity === 'number' && !isNaN(maybeQuantity)) {
      cleanQty = maybeQuantity;
      if (typeof quantityOrColor === 'string') {
        targetColor = quantityOrColor;
      }
    } else if (quantityOrColor !== undefined && !isNaN(Number(quantityOrColor))) {
      cleanQty = Number(quantityOrColor);
    } else if (maybeQuantity !== undefined && !isNaN(Number(maybeQuantity))) {
      cleanQty = Number(maybeQuantity);
      if (typeof quantityOrColor === 'string') {
        targetColor = quantityOrColor;
      }
    } else {
      cleanQty = 1;
    }

    if (cleanQty <= 0) {
      removeFromCart(productId, targetColor);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        if (targetColor && (item.selectedColor || (item as any).color) && (item.selectedColor || (item as any).color) !== targetColor) {
          return item;
        }
        const updatedItem = { ...item, quantity: cleanQty };
        delete (updatedItem as any).bundleDiscount;
        delete (updatedItem as any).bundleTier;
        return updatedItem;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setActivePromo(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showNotification('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showNotification('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const toggleCompare = (productId: string) => {
    setCompareList((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showNotification('Product removed from comparison');
        return prev.filter((id) => id !== productId);
      } else {
        if (prev.length >= 4) {
          showNotification('⚠️ You can compare up to 4 products at once. Remove one to add another.');
          return prev;
        }
        const targetProd = products.find((p) => p.id === productId);
        showNotification(`Added "${targetProd?.title || 'Product'}" to comparison (${prev.length + 1}/4)`);
        return [...prev, productId];
      }
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
    showNotification('Product removed from comparison');
  };

  const clearCompare = () => {
    setCompareList([]);
    showNotification('Cleared comparison list');
  };

  // Monitor cart and auto-remove product-scoped promo if target product is removed
  useEffect(() => {
    if (activePromo && cart.length > 0) {
      const isFlashSaleCode = promoPopupConfig.enabled && 
        promoPopupConfig.promoCode && 
        activePromo.code.trim().toUpperCase() === promoPopupConfig.promoCode.trim().toUpperCase();

      const targetProductId = activePromo.productId || (isFlashSaleCode ? promoPopupConfig.featuredProductId : undefined);

      if (targetProductId) {
        const hasMatchingProduct = cart.some((i) => i.product.id === targetProductId);
        if (!hasMatchingProduct) {
          setActivePromo(null);
          showNotification(`Promo code "${activePromo.code}" was removed because the eligible item is not in cart.`);
        }
      }
    }
  }, [cart, activePromo, promoPopupConfig.featuredProductId, promoPopupConfig.promoCode, promoPopupConfig.enabled]);

  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    let found = promos.find((p) => p.code === cleanCode && p.active);
    
    // Auto-support active flash sale coupon code even if not yet saved in promos table
    const isFlashSaleCode = promoPopupConfig.enabled && 
      promoPopupConfig.promoCode && 
      promoPopupConfig.promoCode.trim().toUpperCase() === cleanCode;

    if (!found && isFlashSaleCode) {
      found = {
        code: promoPopupConfig.promoCode.trim().toUpperCase(),
        discountPercent: promoPopupConfig.discountPercent || 20,
        active: true,
        productId: promoPopupConfig.featuredProductId
      };
    }

    if (!found) {
      return { success: false, message: 'Invalid or expired promo code.' };
    }

    // Verify minimum spend if configured
    if (found.minSpend && found.minSpend > 0) {
      const currentSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      if (currentSubtotal < found.minSpend) {
        return { success: false, message: `This coupon requires a minimum spend of ₹${found.minSpend}.` };
      }
    }

    // Check product-level scoping (for flash sale promo code or promo codes tied to specific products)
    const targetProductId = found.productId || (isFlashSaleCode ? promoPopupConfig.featuredProductId : undefined);

    if (targetProductId) {
      const targetProduct = products.find((p) => p.id === targetProductId);
      const isEligibleInCart = cart.some((item) => item.product.id === targetProductId);

      if (!isEligibleInCart) {
        const prodName = targetProduct ? targetProduct.title : 'the designated flash sale item';
        return {
          success: false,
          message: `Promo code "${cleanCode}" is exclusively valid for "${prodName}". Add this product to your cart to claim the discount.`
        };
      }
    }

    setActivePromo(found);
    return { success: true, message: `Promo code "${found.code}" applied! (${found.discountPercent}% OFF)` };
  };

  const removePromoCode = () => {
    setActivePromo(null);
    showNotification('Promo code removed.');
  };

  const placeOrder = (
    shippingAddress: ShippingAddress, 
    paymentMethod: string,
    paymentDetails?: {
      paymentStatus?: 'Pending' | 'Paid' | 'Partially Paid' | 'Failed';
      paidOnlineAmount?: number;
      codDueAmount?: number;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      paymentDiscountAmount?: number;
    }
  ): Order => {
    const pricing = calculateCartPricing(
      cart,
      bundleConfig,
      activePromo,
      promoPopupConfig,
      paymentMethod as 'COD' | 'PayOnline' | 'PartialPayment',
      paymentSettings,
      shippingSettings
    );

    let paidOnline = paymentDetails?.paidOnlineAmount || 0;
    let codDue = paymentDetails?.codDueAmount || 0;
    let pStatus: 'Pending' | 'Paid' | 'Partially Paid' | 'Failed' = paymentDetails?.paymentStatus || 'Pending';

    if (paymentMethod === 'PayOnline') {
      paidOnline = pricing.grandTotal;
      codDue = 0;
      pStatus = paymentDetails?.paymentStatus || 'Paid';
    } else if (paymentMethod === 'PartialPayment') {
      paidOnline = paymentDetails?.paidOnlineAmount ?? pricing.onlineAmountDueNow;
      codDue = paymentDetails?.codDueAmount ?? pricing.codAmountDueLater;
      pStatus = paymentDetails?.paymentStatus || 'Partially Paid';
    } else {
      paidOnline = 0;
      codDue = pricing.grandTotal;
      pStatus = 'Pending';
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      customerName: shippingAddress.fullName,
      customerEmail: shippingAddress.email,
      shippingAddress,
      items: cart.map((item) => {
        const info = getItemBundleInfo(item, bundleConfig);
        return {
          productId: item.product.id,
          productTitle: item.product.title,
          productImage: item.product.images[0] || '',
          price: item.product.price,
          quantity: item.quantity,
          bundleDiscount: info.discountPercent,
          lineTotal: info.finalLineTotal
        };
      }),
      subtotal: pricing.itemsOriginalSubtotal,
      discount: pricing.totalBundleDiscount + pricing.promoDiscount + pricing.paymentDiscount,
      bundleDiscountAmount: pricing.totalBundleDiscount,
      promoDiscountAmount: pricing.promoDiscount,
      paymentDiscountAmount: pricing.paymentDiscount,
      promoCode: activePromo?.code,
      shippingFee: pricing.shippingFee,
      total: pricing.grandTotal,
      status: 'Processing',
      paymentMethod,
      paymentStatus: pStatus,
      paidOnlineAmount: paidOnline,
      codDueAmount: codDue,
      razorpayPaymentId: paymentDetails?.razorpayPaymentId || (paymentMethod !== 'COD' ? `pay_rzp_${Math.floor(10000000 + Math.random() * 90000000)}` : undefined),
      razorpayOrderId: paymentDetails?.razorpayOrderId || (paymentMethod !== 'COD' ? `order_rzp_${Math.floor(1000000 + Math.random() * 9000000)}` : undefined),
      estimatedDelivery: '3 - 5 Business Days'
    };

    // Deduct stock
    setProducts((prev) => {
      const updated = prev.map((p) => {
        const cartItem = cart.find((ci) => ci.product.id === p.id);
        if (cartItem) {
          const modP = { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          upsertProduct(modP); // Async push updated stock to Supabase
          return modP;
        }
        return p;
      });
      return updated;
    });

    setOrders((prev) => [newOrder, ...prev]);
    upsertOrder(newOrder); // Async push order to Supabase
    setLastPlacedOrder(newOrder);
    clearCart();
    navigateTo('order-success');
    showNotification(`Order ${newOrder.id} successfully placed!`);
    return newOrder;
  };

  // Product CRUD
  const addProduct = (newProdData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewCount: 0
    };
    setProducts((prev) => [newProduct, ...prev]);
    upsertProduct(newProduct); // Async push to Supabase

    // Automatically clone to mobile product catalog with identical product ID
    const newMobileProduct: Product = {
      ...newProduct
    };
    setMobileProducts((prev) => {
      const updated = [newMobileProduct, ...prev.filter(p => p.id !== newProduct.id)];
      try {
        localStorage.setItem('lumina_mobile_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    upsertMobileProduct(newMobileProduct).catch(() => {});

    showNotification(`New product "${newProduct.title}" created in catalog (available in both Desktop and Mobile views).`);
  };

  const updateProduct = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    upsertProduct(updatedProd); // Async push to Supabase

    // Propagate fixed fields to corresponding mobile product
    setMobileProducts((prev) => {
      const exists = prev.some(p => p.id === updatedProd.id);
      let updated: Product[];
      if (exists) {
        updated = prev.map((mp) => {
          if (mp.id === updatedProd.id) {
            return {
              ...mp,
              title: updatedProd.title,
              marketingSubtitle: updatedProd.marketingSubtitle ?? updatedProd.subtitle,
              subtitle: updatedProd.subtitle ?? updatedProd.marketingSubtitle,
              shortDescription: updatedProd.shortDescription,
              // Only fixed fields are synchronized; category and all mobile-specific customizations are preserved
            };
          }
          return mp;
        });
      } else {
        updated = [{ ...updatedProd }, ...prev];
      }
      try {
        localStorage.setItem('lumina_mobile_products', JSON.stringify(updated));
      } catch (e) {}
      const target = updated.find(p => p.id === updatedProd.id);
      if (target) upsertMobileProduct(target).catch(() => {});
      return updated;
    });

    showNotification(`Product "${updatedProd.title}" updated.`);
  };

  const deleteProduct = (id: string) => {
    // 1. Locate product to be deleted
    const targetProduct = products.find((p) => p.id === id);

    // 2. Clean up product's uploaded media from storage buckets
    if (targetProduct) {
      deleteProductMedia(targetProduct).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting product media:', err)
      );
    }

    // 3. Clean up associated customer reviews (data and storage files: DP avatar + product photo)
    const productReviews = reviewsMap[id] || [];
    for (const rev of productReviews) {
      deleteReviewMedia(rev).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting review media:', err)
      );
    }
    setReviewsMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // 4. Clean up associated video success stories (specifically verifying and purging video blobs from Supabase storage)
    const productStories = successStories.filter((s) => s.productId === id || (s as any).product_id === id);
    const storyVideoUrls = productStories.map((s) => s.videoUrl).filter(Boolean);

    // Specifically verify and delete associated video blobs from Supabase storage buckets,
    // backed by persistent journal to survive interrupted signals
    cleanupProductVideoBlobsOnDeletion(id, storyVideoUrls).catch((err) => {
      console.warn('[StoreContext] Video cleanup error during product deletion:', err);
    });

    for (const story of productStories) {
      deleteSuccessStoryMedia(story).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting story media:', err)
      );
    }
    setSuccessStories((prev) => {
      const filtered = prev.filter((s) => s.productId !== id && (s as any).product_id !== id);
      try {
        localStorage.setItem('lumina_success_stories', JSON.stringify(filtered));
      } catch (e) {
        console.warn('[StoreContext] localStorage write error:', e);
      }
      return filtered;
    });

    // 5. Update products state and local storage
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('lumina_products', JSON.stringify(filtered));
      } catch (e) {
        console.warn('[StoreContext] localStorage write error:', e);
      }
      return filtered;
    });

    // Clean up corresponding mobile product as well
    setMobileProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('lumina_mobile_products', JSON.stringify(filtered));
      } catch (e) {
        console.warn('[StoreContext] localStorage write error:', e);
      }
      return filtered;
    });
    deleteMobileProductFromDb(id).catch((err) => {
      console.warn('[StoreContext] Error deleting mobile product from DB:', err);
    });

    // 6. Async delete product and cascade from Supabase database tables
    deleteProductFromDb(id).catch((err) => {
      console.warn('[StoreContext] Error deleting product from DB:', err);
    });
    showNotification('Product and all related reviews, success stories, and storage media deleted.');
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'Active' ? 'Draft' : 'Active' } as Product : p
      );
      const found = updated.find(p => p.id === id);
      if (found) upsertProduct(found); // Async push status update to Supabase
      return updated;
    });
    showNotification('Product status toggled.');
  };

  const resetProductsToDefault = () => {
    setProducts([]);
    localStorage.setItem('lumina_products', JSON.stringify([]));
    setMobileProducts([]);
    localStorage.setItem('lumina_mobile_products', JSON.stringify([]));
    showNotification('Cleared all products from catalog.');
  };

  // Dedicated Mobile Product Catalog CRUD
  const addMobileProduct = (newProdData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `mob-prod-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewCount: 0
    };
    setMobileProducts((prev) => {
      const updated = [newProduct, ...prev];
      localStorage.setItem('lumina_mobile_products', JSON.stringify(updated));
      return updated;
    });
    upsertMobileProduct(newProduct); // Async push to Supabase mobile_products table
    showNotification(`New mobile product "${newProduct.title}" created successfully!`);
  };

  const updateMobileProduct = (updatedProd: Product) => {
    // Preserve fixed fields from the desktop counterpart
    const desktopProd = products.find(p => p.id === updatedProd.id);
    const finalizedProd: Product = {
      ...updatedProd,
      title: desktopProd ? desktopProd.title : updatedProd.title,
      marketingSubtitle: desktopProd ? (desktopProd.marketingSubtitle ?? desktopProd.subtitle) : (updatedProd.marketingSubtitle ?? updatedProd.subtitle),
      subtitle: desktopProd ? (desktopProd.subtitle ?? desktopProd.marketingSubtitle) : (updatedProd.subtitle ?? updatedProd.marketingSubtitle),
      shortDescription: desktopProd ? desktopProd.shortDescription : updatedProd.shortDescription,
      category: updatedProd.category,
    };

    setMobileProducts((prev) => {
      const updated = prev.map((p) => (p.id === finalizedProd.id ? finalizedProd : p));
      localStorage.setItem('lumina_mobile_products', JSON.stringify(updated));
      return updated;
    });
    upsertMobileProduct(finalizedProd); // Async push to Supabase mobile_products table
    showNotification(`Mobile product "${finalizedProd.title}" updated.`);
  };

  const deleteMobileProduct = (id: string) => {
    // 1. Locate product to be deleted
    const targetProduct = mobileProducts.find((p) => p.id === id);

    // 2. Clean up product's uploaded media from storage buckets (images, gifs, description assets)
    if (targetProduct) {
      deleteProductMedia(targetProduct).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting mobile product media:', err)
      );
    }

    // 3. Clean up associated customer reviews if any
    const productReviews = reviewsMap[id] || [];
    for (const rev of productReviews) {
      deleteReviewMedia(rev).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting review media:', err)
      );
    }
    setReviewsMap((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // 4. Clean up associated video success stories if any
    const productStories = successStories.filter((s) => s.productId === id || (s as any).product_id === id);
    const storyVideoUrls = productStories.map((s) => s.videoUrl).filter(Boolean);
    cleanupProductVideoBlobsOnDeletion(id, storyVideoUrls).catch((err) => {
      console.warn('[StoreContext] Video cleanup error during mobile product deletion:', err);
    });
    for (const story of productStories) {
      deleteSuccessStoryMedia(story).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting story media:', err)
      );
    }
    setSuccessStories((prev) => {
      const filtered = prev.filter((s) => s.productId !== id && (s as any).product_id !== id);
      try {
        localStorage.setItem('lumina_success_stories', JSON.stringify(filtered));
      } catch (e) {
        console.warn('[StoreContext] localStorage write error:', e);
      }
      return filtered;
    });

    // 5. Update mobile products state & localStorage
    setMobileProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('lumina_mobile_products', JSON.stringify(filtered));
      } catch (e) {
        console.warn('[StoreContext] localStorage write error:', e);
      }
      return filtered;
    });

    // 6. Delete from Supabase mobile_products table
    deleteMobileProductFromDb(id).catch((err) => {
      console.warn('[StoreContext] Error deleting mobile product from DB:', err);
    });
    showNotification('Mobile product and all related media permanently deleted from database & storage.');
  };

  const toggleMobileProductStatus = (id: string) => {
    setMobileProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'Active' ? 'Draft' : 'Active' } as Product : p
      );
      localStorage.setItem('lumina_mobile_products', JSON.stringify(updated));
      const found = updated.find(p => p.id === id);
      if (found) upsertMobileProduct(found);
      return updated;
    });
    showNotification('Mobile product status toggled.');
  };

  const resetMobileProductsToDefault = () => {
    setMobileProducts([]);
    localStorage.setItem('lumina_mobile_products', JSON.stringify([]));
    showNotification('Mobile products catalog cleared.');
  };

  const copyDesktopProductsToMobile = () => {
    setMobileProducts((prev) => {
      const synced = syncDesktopToMobileProducts(products, prev);
      localStorage.setItem('lumina_mobile_products', JSON.stringify(synced));
      synced.forEach(p => upsertMobileProduct(p).catch(() => {}));
      return synced;
    });
    showNotification(`📋 Mobile catalog synchronized with ${products.length} desktop products!`);
  };

  const copyMobileProductsToDesktop = () => {
    const cloned: Product[] = mobileProducts.map((p, idx) => ({
      ...p,
      id: `desk-clone-${p.id.replace('mob-prod-', '')}-${idx + 1}`,
      createdAt: new Date().toISOString()
    }));
    setProducts(cloned);
    localStorage.setItem('lumina_products', JSON.stringify(cloned));
    cloned.forEach(p => upsertProduct(p));
    showNotification(`📋 Copied ${cloned.length} mobile products into desktop catalog!`);
  };

  const saveAllMobileProductsToDbHandler = async (): Promise<boolean> => {
    try {
      const success = await saveAllMobileProductsToDb(mobileProducts);
      if (success) {
        showNotification('✅ All mobile products saved to database!');
      } else {
        showNotification('Saved mobile products locally.');
      }
      return success;
    } catch (e) {
      console.warn('Failed to save mobile products to db:', e);
      return false;
    }
  };

  const syncAllToSupabase = async () => {
    setSupabaseStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      // 1. Push products (desktop & mobile)
      for (const p of products) {
        await upsertProduct(p);
      }
      for (const mp of mobileProducts) {
        await upsertMobileProduct(mp);
      }
      // 2. Push orders
      for (const o of orders) {
        await upsertOrder(o);
      }
      // 3. Push promos
      for (const pr of promos) {
        await upsertPromo(pr);
      }
      // 4. Push inquiries
      for (const inq of supportInquiries) {
        await upsertSupportInquiry(inq);
      }
      // 5. Push reviews
      const allReviews: ProductReview[] = [];
      Object.entries(reviewsMap).forEach(([pId, list]) => {
        const reviewList = (list || []) as ProductReview[];
        reviewList.forEach((r) => {
          allReviews.push({ ...r, productId: r.productId || pId });
        });
      });
      for (const r of allReviews) {
        await upsertReview(r);
      }
      // 6. Push chats
      for (const chat of chatSessions) {
        await upsertChatSession(chat);
      }
      // 7. Push configs
      await saveConfigToDb('bundle_config', bundleConfig);
      await saveConfigToDb('promo_popup_config', promoPopupConfig);
      await saveConfigToDb('payment_settings', paymentSettings);
      await saveConfigToDb('top_notification', topNotificationConfig);
      await saveStoreBranding(storeBranding);
      await saveDesktopHeroConfig(desktopHeroConfig);
      await saveMobileHeroConfig(mobileHeroConfig);
      // 8. Push success stories
      for (const story of successStories) {
        await upsertSuccessStory(story);
      }

      showNotification('🚀 Entire local store catalog successfully synced to Supabase!');
      return { success: true, message: 'Successfully synced all local data to Supabase!' };
    } catch (err: any) {
      console.warn('syncAllToSupabase notice:', err);
      return { success: false, message: err?.message || 'Sync failed.' };
    } finally {
      setSupabaseStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  const pullAllFromSupabase = async () => {
    setSupabaseStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const [dbProducts, dbMobileProducts, dbOrders, dbPromos, dbInquiries, dbReviews, dbChats, dbStories] = await Promise.all([
        fetchProducts(),
        fetchMobileProducts(),
        fetchOrders(),
        fetchPromos(),
        fetchSupportInquiries(),
        fetchReviews(),
        fetchChatSessions(),
        fetchSuccessStories()
      ]);

      let productsPulled = false;
      let cleanedDesktop: Product[] = [];
      if (Array.isArray(dbProducts)) {
        cleanedDesktop = dbProducts.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
        setProducts(cleanedDesktop);
        localStorage.setItem('lumina_products', JSON.stringify(cleanedDesktop));
        productsPulled = true;
      }
      if (cleanedDesktop.length > 0) {
        const rawMobile = Array.isArray(dbMobileProducts)
          ? dbMobileProducts.filter(p => !DEMO_PRODUCT_IDS.has(p.id))
          : [];
        const syncedMobile = syncDesktopToMobileProducts(cleanedDesktop, rawMobile);
        setMobileProducts(syncedMobile);
        localStorage.setItem('lumina_mobile_products', JSON.stringify(syncedMobile));
      } else if (Array.isArray(dbMobileProducts)) {
        const cleaned = dbMobileProducts.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
        setMobileProducts(cleaned);
        localStorage.setItem('lumina_mobile_products', JSON.stringify(cleaned));
      }
      if (dbOrders) {
        setOrders(dbOrders);
        localStorage.setItem('lumina_orders', JSON.stringify(dbOrders));
      }
      if (dbPromos && dbPromos.length > 0) {
        setPromos(dbPromos);
        localStorage.setItem('lumina_promos', JSON.stringify(dbPromos));
      }
      if (dbInquiries) {
        setSupportInquiries(dbInquiries);
        localStorage.setItem('lumina_support_inquiries', JSON.stringify(dbInquiries));
      }
      if (dbReviews) {
        const newReviewsMap: Record<string, ProductReview[]> = {};
        dbReviews.forEach(r => {
          const pId = r.productId || '';
          if (!newReviewsMap[pId]) {
            newReviewsMap[pId] = [];
          }
          newReviewsMap[pId].push(r);
        });
        setReviewsMap(newReviewsMap);
        localStorage.setItem('lumina_reviews', JSON.stringify(newReviewsMap));
      }
      if (dbChats) {
        setChatSessions(dbChats);
        localStorage.setItem('lumina_chat_sessions', JSON.stringify(dbChats));
      }
      if (dbStories) {
        setSuccessStories(dbStories);
        localStorage.setItem('lumina_success_stories', JSON.stringify(dbStories));
      }

      // Configs
      const dbBundle = await fetchConfigFromDb<BundleConfig>('bundle_config');
      if (dbBundle) {
        setBundleConfig(dbBundle);
        localStorage.setItem('lumina_bundle_config', JSON.stringify(dbBundle));
      }
      const dbPopup = await fetchConfigFromDb<PromoPopupConfig>('promo_popup_config');
      if (dbPopup) {
        setPromoPopupConfig(dbPopup);
        localStorage.setItem('lumina_promo_popup_config', JSON.stringify(dbPopup));
      }
      const dbPayment = await fetchConfigFromDb<any>('payment_settings');
      if (dbPayment) {
        const cleanPayment = sanitizePaymentSettings(dbPayment);
        setPaymentSettings(cleanPayment);
        localStorage.setItem('lumina_payment_settings', JSON.stringify(cleanPayment));
      }
      const dbNotification = await fetchConfigFromDb<TopNotificationConfig>('top_notification');
      if (dbNotification) {
        setTopNotificationConfig(dbNotification);
        localStorage.setItem('lumina_top_notification_config', JSON.stringify(dbNotification));
      }
      const dbBranding = await fetchStoreBranding();
      if (dbBranding) {
        setStoreBranding(dbBranding);
        localStorage.setItem('lumina_store_branding', JSON.stringify(dbBranding));
      }

      const dbDesktopHero = await fetchDesktopHeroConfig();
      if (dbDesktopHero) {
        setDesktopHeroConfig(dbDesktopHero);
        localStorage.setItem('lumina_desktop_hero_config', JSON.stringify(dbDesktopHero));
      }

      const dbMobileHero = await fetchMobileHeroConfig();
      if (dbMobileHero) {
        setMobileHeroConfig(dbMobileHero);
        localStorage.setItem('lumina_mobile_hero_config', JSON.stringify(dbMobileHero));
      }

      showNotification('📥 Pulled all live data from Supabase!');
      return { 
        success: true, 
        message: productsPulled 
          ? 'Successfully pulled and loaded all data from your live Supabase database!' 
          : 'Pulled data successfully, but products table was empty. Try pushing local data first!'
      };
    } catch (err: any) {
      console.warn('pullAllFromSupabase notice:', err);
      return { success: false, message: err?.message || 'Pull failed.' };
    } finally {
      setSupabaseStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  // Order Fulfillment & Payment Management
  const updateOrderStatus = (
    orderId: string, 
    status: OrderStatus, 
    trackingNumber?: string, 
    carrier?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            status,
            trackingNumber: trackingNumber ?? ord.trackingNumber,
            carrier: carrier ?? ord.carrier
          };
          upsertOrder(updated); // Sync to Supabase
          return updated;
        }
        return ord;
      })
    );
    showNotification(`Order ${orderId} status updated to ${status}.`);
  };

  const updateOrderPaymentDetails = (
    orderId: string, 
    details: {
      paymentStatus?: 'Pending' | 'Paid' | 'Partially Paid' | 'Failed';
      paidOnlineAmount?: number;
      codDueAmount?: number;
      paymentMethod?: string;
    }
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            paymentStatus: details.paymentStatus ?? ord.paymentStatus,
            paidOnlineAmount: details.paidOnlineAmount !== undefined ? details.paidOnlineAmount : ord.paidOnlineAmount,
            codDueAmount: details.codDueAmount !== undefined ? details.codDueAmount : ord.codDueAmount,
            paymentMethod: details.paymentMethod ?? ord.paymentMethod
          };
          upsertOrder(updated); // Sync to Supabase
          return updated;
        }
        return ord;
      })
    );
    showNotification(`Order ${orderId} payment & balance records updated.`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    deleteOrderFromDb(orderId); // Sync to Supabase
    showNotification(`Order ${orderId} has been deleted.`);
  };

  // Bundle & Promo Admin Controls
  const updateBundleConfig = async (newConfig: Partial<BundleConfig>): Promise<boolean> => {
    const next = { ...bundleConfig, ...newConfig };
    setBundleConfig(next);
    localStorage.setItem('lumina_bundle_config', JSON.stringify(next));
    let dbSuccess = false;
    try {
      dbSuccess = await saveConfigToDb('bundle_config', next);
    } catch (e) {
      console.warn('Failed to sync bundle config to Supabase:', e);
    }
    if (dbSuccess) {
      showNotification('✅ Bundle & Save discount preferences saved to database!');
    } else {
      showNotification('Bundle & Save discount preferences updated locally!');
    }
    return dbSuccess;
  };

  const updatePromoPopupConfig = async (newConfig: Partial<PromoPopupConfig>): Promise<boolean> => {
    const updated = { ...promoPopupConfig, ...newConfig };
    setPromoPopupConfig(updated);
    localStorage.setItem('lumina_promo_popup_config', JSON.stringify(updated));
    let dbSuccess = false;
    try {
      dbSuccess = await saveConfigToDb('promo_popup_config', updated);
    } catch (e) {
      console.warn('Failed to sync promo popup config to Supabase:', e);
    }
    if (dbSuccess) {
      showNotification('✅ Flash Sale & Popup settings saved to database!');
    } else {
      showNotification('Flash Sale Promo Popup settings updated locally!');
    }
    return dbSuccess;
  };

  const updateTopNotificationConfig = async (newConfig: Partial<TopNotificationConfig>) => {
    let updatedConfig: TopNotificationConfig = { ...topNotificationConfig, ...newConfig };
    setTopNotificationConfig((prev) => {
      updatedConfig = { ...prev, ...newConfig };
      return updatedConfig;
    });
    try {
      await saveConfigToDb('top_notification', updatedConfig);
    } catch (e) {
      console.warn('Failed to sync top notification to Supabase:', e);
    }
    showNotification('✓ Top Announcement & Notification bar updated & saved!');
  };

  const updateStoreBranding = async (newConfig: Partial<StoreBrandingConfig>): Promise<boolean> => {
    let updatedConfig: StoreBrandingConfig = { 
      ...storeBranding, 
      ...newConfig, 
      updatedAt: new Date().toISOString() 
    };
    setStoreBranding(updatedConfig);
    localStorage.setItem('lumina_store_branding', JSON.stringify(updatedConfig));
    try {
      await saveStoreBranding(updatedConfig);
      showNotification('✓ Store logo & branding updated and saved to database!');
      return true;
    } catch (e) {
      console.warn('Failed to sync branding to Supabase:', e);
      showNotification('✓ Store logo & branding saved locally!');
      return false;
    }
  };

  const updateDesktopHeroConfig = async (newConfig: Partial<DesktopHeroConfig>): Promise<boolean> => {
    const updatedConfig: DesktopHeroConfig = {
      ...desktopHeroConfig,
      ...newConfig,
      updatedAt: new Date().toISOString()
    };
    setDesktopHeroConfig(updatedConfig);
    try {
      localStorage.setItem('lumina_desktop_hero_config', JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn('[StoreContext] Could not persist desktop hero config to localStorage:', e);
    }
    try {
      const ok = await saveDesktopHeroConfig(updatedConfig);
      return ok;
    } catch (e) {
      console.warn('Failed to sync desktop hero config to Supabase:', e);
      return false;
    }
  };

  const deleteDesktopHeroBanner = async (): Promise<boolean> => {
    const oldImageUrl = desktopHeroConfig.imageUrl;
    // 1. Delete image file from Supabase storage buckets & server storage
    if (oldImageUrl) {
      try {
        await deleteFileFromStorage(oldImageUrl);
      } catch (e) {
        console.warn('[StoreContext] Could not delete desktop hero image from storage:', e);
      }
    }
    // 2. Reset config back to default hero showcase
    const resetConfig: DesktopHeroConfig = {
      ...DEFAULT_DESKTOP_HERO_CONFIG,
      activeHeroType: 'default',
      imageUrl: '',
      updatedAt: new Date().toISOString()
    };
    setDesktopHeroConfig(resetConfig);
    try {
      localStorage.setItem('lumina_desktop_hero_config', JSON.stringify(resetConfig));
    } catch (e) {
      console.warn('[StoreContext] Could not persist reset desktop hero config:', e);
    }
    // 3. Save reset state to database
    try {
      await saveDesktopHeroConfig(resetConfig);
    } catch (e) {
      console.warn('Failed to update desktop hero config in Supabase:', e);
    }
    showNotification('🗑️ Custom Desktop Hero Banner & storage files deleted. Switched to Default Flagship Hero.');
    return true;
  };

  const updateMobileHeroConfig = async (newConfig: Partial<MobileHeroConfig>): Promise<boolean> => {
    const updatedConfig: MobileHeroConfig = {
      ...mobileHeroConfig,
      ...newConfig,
      updatedAt: new Date().toISOString()
    };
    setMobileHeroConfig(updatedConfig);
    try {
      localStorage.setItem('lumina_mobile_hero_config', JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn('[StoreContext] Could not persist mobile hero config to localStorage:', e);
    }
    try {
      const ok = await saveMobileHeroConfig(updatedConfig);
      return ok;
    } catch (e) {
      console.warn('Failed to sync mobile hero config to Supabase:', e);
      return false;
    }
  };

  const deleteMobileHeroBanner = async (): Promise<boolean> => {
    const oldImageUrl = mobileHeroConfig.imageUrl;
    // 1. Delete image file from Supabase storage buckets & server storage
    if (oldImageUrl) {
      try {
        await deleteFileFromStorage(oldImageUrl);
      } catch (e) {
        console.warn('[StoreContext] Could not delete mobile hero image from storage:', e);
      }
    }
    // 2. Reset config back to default mobile hero showcase
    const resetConfig: MobileHeroConfig = {
      ...DEFAULT_MOBILE_HERO_CONFIG,
      activeHeroType: 'default',
      imageUrl: '',
      updatedAt: new Date().toISOString()
    };
    setMobileHeroConfig(resetConfig);
    try {
      localStorage.setItem('lumina_mobile_hero_config', JSON.stringify(resetConfig));
    } catch (e) {
      console.warn('[StoreContext] Could not persist reset mobile hero config:', e);
    }
    // 3. Save reset state to database
    try {
      await saveMobileHeroConfig(resetConfig);
    } catch (e) {
      console.warn('Failed to update mobile hero config in Supabase:', e);
    }
    showNotification('🗑️ Custom Mobile Hero Banner & storage files deleted. Switched to Default Flagship Hero.');
    return true;
  };

  const addOrUpdatePromoCode = async (codeData: Partial<PromoCode> & { code: string; discountPercent?: number }): Promise<boolean> => {
    const cleanCode = codeData.code.trim().toUpperCase();
    const existingIndex = promos.findIndex((p) => p.code === cleanCode);
    const isEdit = existingIndex >= 0;

    let targetPromo: PromoCode;
    let updatedList: PromoCode[];

    if (isEdit) {
      const existing = promos[existingIndex];
      targetPromo = {
        ...existing,
        ...codeData,
        code: cleanCode,
        discountPercent: codeData.discountPercent !== undefined ? codeData.discountPercent : existing.discountPercent,
        active: codeData.active !== undefined ? codeData.active : existing.active,
        minSpend: codeData.minSpend !== undefined ? codeData.minSpend : existing.minSpend,
        productId: codeData.productId !== undefined ? codeData.productId : existing.productId,
        productTitle: codeData.productTitle !== undefined ? codeData.productTitle : existing.productTitle
      };
      updatedList = promos.map((p, idx) => idx === existingIndex ? targetPromo : p);
    } else {
      targetPromo = {
        code: cleanCode,
        discountPercent: codeData.discountPercent || 20,
        active: codeData.active !== undefined ? codeData.active : true,
        minSpend: codeData.minSpend,
        productId: codeData.productId,
        productTitle: codeData.productTitle
      };
      updatedList = [targetPromo, ...promos];
    }

    setPromos(updatedList);
    localStorage.setItem('lumina_promos', JSON.stringify(updatedList));

    let dbSuccess = false;
    try {
      dbSuccess = await upsertPromo(targetPromo);
    } catch (e) {
      console.warn('Failed to sync promo code to Supabase:', e);
    }

    if (isEdit) {
      showNotification(dbSuccess ? `✅ Promo code "${cleanCode}" updated in database!` : `Promo code "${cleanCode}" updated locally.`);
    } else {
      showNotification(dbSuccess ? `✅ Promo code "${cleanCode}" created & saved to database!` : `New promo code "${cleanCode}" added!`);
    }
    return true;
  };

  const addPromoCode = async (codeData: Omit<PromoCode, 'active'> | PromoCode): Promise<boolean> => {
    return addOrUpdatePromoCode(codeData);
  };

  const updatePromoCode = async (codeData: Partial<PromoCode> & { code: string }): Promise<boolean> => {
    return addOrUpdatePromoCode(codeData);
  };

  const togglePromoCode = async (codeStr: string): Promise<void> => {
    let targetPromo: PromoCode | null = null;
    const updated = promos.map((p) => {
      if (p.code === codeStr) {
        targetPromo = { ...p, active: !p.active };
        return targetPromo;
      }
      return p;
    });
    setPromos(updated);
    localStorage.setItem('lumina_promos', JSON.stringify(updated));
    if (targetPromo) {
      try {
        await upsertPromo(targetPromo);
      } catch (e) {
        console.warn('Failed to sync promo toggle to Supabase:', e);
      }
    }
    showNotification(`Promo code "${codeStr}" status updated.`);
  };

  const deletePromoCode = async (codeStr: string): Promise<void> => {
    const updated = promos.filter((p) => p.code !== codeStr);
    setPromos(updated);
    localStorage.setItem('lumina_promos', JSON.stringify(updated));
    try {
      await deletePromoFromDb(codeStr);
    } catch (e) {
      console.warn('Failed to delete promo from Supabase:', e);
    }
    showNotification(`Promo code "${codeStr}" deleted.`);
  };

  const saveAllPromosToDb = async (): Promise<boolean> => {
    try {
      for (const p of promos) {
        await upsertPromo(p);
      }
      showNotification('✅ All promo codes saved to database!');
      return true;
    } catch (e) {
      showNotification('Failed to sync promo codes to database.');
      return false;
    }
  };

  // Reviews & Manual Seeding
  const addReview = (
    productId: string, 
    reviewData: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'> & { date?: string; productId?: string }
  ) => {
    const newRev: ProductReview = {
      ...reviewData,
      productId: productId,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: reviewData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      helpfulCount: Math.floor(Math.random() * 12) + 2,
      avatarUrl: reviewData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      verified: reviewData.verified !== undefined ? reviewData.verified : true,
      imageUrl: reviewData.imageUrl || undefined
    };

    setReviewsMap((prev) => {
      const existing = prev[productId] || [];
      const updated = [newRev, ...existing];
      return { ...prev, [productId]: updated };
    });

    // Update rating on product & push to database
    setProducts((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === productId) {
          const currentCount = p.reviewCount;
          const currentRating = p.rating;
          const newCount = currentCount + 1;
          const newRating = Number(((currentRating * currentCount + reviewData.rating) / newCount).toFixed(1));
          const updatedProd: Product = { ...p, rating: Math.min(5.0, newRating), reviewCount: newCount };
          upsertProduct(updatedProd); // Async push updated product rating/count to database
          return updatedProd;
        }
        return p;
      });
      return updatedList;
    });

    // Async push review to Supabase database
    upsertReview(newRev).then((success) => {
      if (success) {
        console.log(`[Supabase] Review ${newRev.id} for product ${productId} saved to database.`);
      }
    });

    showNotification('Verified review added & saved to database!');
  };

  const seedSampleReviewsForProduct = (productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    const title = targetProduct?.title || 'this item';

    const samples = [
      {
        author: 'Marcus Vance',
        rating: 5,
        title: `Absolute perfection! Exceeded expectations.`,
        comment: `Bought ${title} after seeing glowing writeups online. The craftsmanship is top-tier and setup took literally 2 minutes. High end feel!`,
        verified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
      },
      {
        author: 'Elena Rostova',
        rating: 5,
        title: `Unbelievable quality and lightning fast shipping`,
        comment: `Order arrived in 2 business days. The tactile feel and design aesthetics are outstanding. Would buy again in a heartbeat.`,
        verified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
      },
      {
        author: 'Chloe Dupont',
        rating: 5,
        title: `Best purchase I've made all year`,
        comment: `Solid weight, luxury packaging, and works flawlessly right out of the box. Extremely impressed!`,
        verified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80'
      }
    ];

    samples.forEach((s) => addReview(productId, s));
    showNotification(`Seeded 3 verified reviews for product & saved to database!`);
  };

  const deleteReview = (productId: string, reviewId: string) => {
    // 1. Locate review and delete its uploaded storage media (Avatar DP & Product image)
    const currentReviews = reviewsMap[productId] || [];
    const targetReview = currentReviews.find((r) => r.id === reviewId);
    if (targetReview) {
      deleteReviewMedia(targetReview).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting review media from storage:', err)
      );
    }

    setReviewsMap((prev) => ({
      ...prev,
      [productId]: (prev[productId] || []).filter((r) => r.id !== reviewId)
    }));
    
    // Async delete from Supabase database
    deleteReviewFromDb(reviewId).then((success) => {
      if (success) {
        console.log(`[Supabase] Review ${reviewId} deleted from database.`);
      }
    });

    showNotification('Review and storage media removed from store and database.');
  };

  // Video Success Stories CRUD
  const addSuccessStory = (storyData: Omit<SuccessStory, 'id' | 'createdAt'>): SuccessStory => {
    const newStory: SuccessStory = {
      ...storyData,
      id: `story-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };

    setSuccessStories((prev) => {
      const updated = [newStory, ...prev];
      try {
        localStorage.setItem('lumina_success_stories', JSON.stringify(updated));
      } catch (e) {
        console.warn('[StoreContext] localStorage write warning:', e);
      }
      return updated;
    });

    // Persist to Supabase if available
    upsertSuccessStory(newStory).then((success) => {
      if (success) {
        console.log(`[Supabase] Success story ${newStory.id} saved to database.`);
      }
    });

    showNotification(`Video success story for "${newStory.customerName}" published!`);
    return newStory;
  };

  const updateSuccessStory = (id: string, updates: Partial<SuccessStory>) => {
    setSuccessStories((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      try {
        localStorage.setItem('lumina_success_stories', JSON.stringify(updated));
      } catch (e) {
        console.warn('[StoreContext] localStorage write warning:', e);
      }
      const target = updated.find((s) => s.id === id);
      if (target) {
        upsertSuccessStory(target).catch(() => {});
      }
      return updated;
    });
    showNotification('Video success story updated.');
  };

  const deleteSuccessStory = async (id: string) => {
    // 1. Locate success story and specifically verify & delete its video blob from Supabase storage buckets
    // Recording persistent journal intent immediately to guarantee completion even if the primary signal is interrupted
    let target = successStories.find((s) => s.id === id);
    if (target) {
      cleanupStoryVideoBlobsOnDeletion(id, target.videoUrl).catch((err) =>
        console.warn('[StoreContext] Video cleanup error during story deletion:', err)
      );
      await deleteSuccessStoryMedia(target).catch((err) =>
        console.warn('[Storage Cleanup] Error deleting story video from storage:', err)
      );
    } else {
      cleanupStoryVideoBlobsOnDeletion(id).catch(() => {});
    }

    setSuccessStories((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('lumina_success_stories', JSON.stringify(filtered));
      } catch (e) {
        console.warn('[StoreContext] localStorage write warning:', e);
      }
      return filtered;
    });

    // 2. Remove row from database (deleteSuccessStoryFromDb will also purge the video if still present)
    deleteSuccessStoryFromDb(id).then((success) => {
      if (success) {
        console.log(`[Supabase] Success story ${id} removed from database.`);
      }
    });
    showNotification('Video success story and storage video removed.');
  };

  const toggleSuccessStoryPublish = (id: string) => {
    setSuccessStories((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, published: !s.published } : s));
      const target = updated.find((s) => s.id === id);
      if (target) {
        upsertSuccessStory(target).catch(() => {});
        showNotification(`Success story is now ${target.published ? 'Published' : 'Hidden'}.`);
      }
      return updated;
    });
  };

  const seedSampleSuccessStoriesForProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const title = product ? product.title : 'this item';
    const samples: Omit<SuccessStory, 'id' | 'createdAt'>[] = [
      {
        productId,
        customerName: 'Marcus Vance',
        customerRoleOrLocation: 'Verified Buyer • Seattle, WA',
        storyText: `The build quality of ${title} exceeded all expectations. Flawless functionality and stunning aesthetic!`,
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        rating: 5,
        verified: true,
        published: true
      },
      {
        productId,
        customerName: 'Elena Rostova',
        customerRoleOrLocation: 'Tech Enthusiast • Austin, TX',
        storyText: `Shipped in just 2 days. The premium look and feel is unmatched. Everyone who sees it asks where to get one!`,
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
        rating: 5,
        verified: true,
        published: true
      },
      {
        productId,
        customerName: 'Julian Hayes',
        customerRoleOrLocation: 'Verified Buyer • Chicago, IL',
        storyText: `I was genuinely surprised at how durable and well-engineered this is. Best online purchase I've made this year!`,
        videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
        rating: 5,
        verified: true,
        published: true
      }
    ];

    samples.forEach((s) => addSuccessStory(s));
    showNotification(`Seeded 3 video success stories for ${title}!`);
  };

  const submitSupportInquiry = async (
    inquiryData: Omit<SupportInquiry, 'id' | 'createdAt' | 'status'>
  ): Promise<SupportInquiry> => {
    const newInquiry: SupportInquiry = {
      ...inquiryData,
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'New'
    };
    
    // Update local state and localStorage immediately
    setSupportInquiries((prev) => {
      const updated = [newInquiry, ...prev];
      localStorage.setItem('lumina_support_inquiries', JSON.stringify(updated));
      return updated;
    });

    // Directly push to Supabase
    try {
      const ok = await upsertSupportInquiry(newInquiry);
      if (ok) {
        console.log('[StoreContext] Successfully saved support inquiry to Supabase:', newInquiry.id);
      } else {
        console.warn('[StoreContext] Supabase inquiry write returned false');
      }
    } catch (err) {
      console.error('[StoreContext] Failed to upsert inquiry to Supabase:', err);
    }

    showNotification(`Support ticket #${newInquiry.id} submitted! Our team will respond shortly.`);
    return newInquiry;
  };

  const updateInquiryStatus = async (id: string, status: InquiryStatus, adminReply?: string) => {
    let updatedInquiry: SupportInquiry | null = null;
    setSupportInquiries((prev) => {
      const updated = prev.map((inq) => {
        if (inq.id === id) {
          updatedInquiry = {
            ...inq,
            status,
            ...(adminReply !== undefined ? { adminReply, adminRepliedAt: new Date().toISOString() } : {})
          };
          return updatedInquiry;
        }
        return inq;
      });
      localStorage.setItem('lumina_support_inquiries', JSON.stringify(updated));
      return updated;
    });

    if (updatedInquiry) {
      try {
        await upsertSupportInquiry(updatedInquiry);
      } catch (err) {
        console.warn('[StoreContext] Could not upsert inquiry status to Supabase:', err);
      }
    }
    showNotification(`Inquiry #${id} status updated to ${status}.`);
  };

  const deleteInquiry = (id: string) => {
    setSupportInquiries((prev) => {
      const filtered = prev.filter((inq) => inq.id !== id);
      localStorage.setItem('lumina_support_inquiries', JSON.stringify(filtered));
      return filtered;
    });
    deleteSupportInquiryFromDb(id).catch((err) => {
      console.warn('[StoreContext] Could not delete inquiry from Supabase:', err);
    });
    showNotification(`Inquiry #${id} deleted.`);
  };

  const refreshSupportInquiries = async () => {
    try {
      const dbInquiries = await fetchSupportInquiries();
      if (dbInquiries && dbInquiries.length > 0) {
        setSupportInquiries(dbInquiries);
        localStorage.setItem('lumina_support_inquiries', JSON.stringify(dbInquiries));
      }
    } catch (err) {
      console.warn('[StoreContext] refreshSupportInquiries error:', err);
    }
  };

  // Live Chat Handlers
  const sendChatMessage = (
    sessionId: string,
    sender: 'customer' | 'admin',
    text: string,
    customerInfo?: { name?: string; email?: string; phone?: string },
    userType?: 'member' | 'guest'
  ) => {
    if (!text.trim() || !sessionId) return;

    const isMember = userType === 'member' || (customerUser && sessionId.includes('member'));
    const effectiveUserType: 'member' | 'guest' = isMember ? 'member' : 'guest';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender,
      senderName: sender === 'customer' 
        ? (customerInfo?.name || customerUser?.name || customerUser?.email?.split('@')[0] || guestChatUser?.name || 'Customer')
        : 'Lumina Concierge',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    let sessionToUpsert: ChatSession | null = null;

    setChatSessions((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === sessionId);
      if (existingIndex > -1) {
        const session = prev[existingIndex];
        const updatedMessages = [...session.messages, newMsg];
        const updatedSession: ChatSession = {
          ...session,
          customerName: customerInfo?.name || session.customerName,
          customerEmail: customerInfo?.email || session.customerEmail,
          customerPhone: customerInfo?.phone || session.customerPhone,
          userType: session.userType || effectiveUserType,
          lastMessageAt: newMsg.timestamp,
          status: 'Open',
          messages: updatedMessages,
          unreadForAdmin: sender === 'customer' ? (session.unreadForAdmin || 0) + 1 : 0,
          unreadForCustomer: sender === 'admin' ? (session.unreadForCustomer || 0) + 1 : (session.unreadForCustomer || 0)
        };
        sessionToUpsert = updatedSession;
        const copy = [...prev];
        copy[existingIndex] = updatedSession;
        localStorage.setItem('lumina_chat_sessions', JSON.stringify(copy));
        return copy;
      } else {
        const newSession: ChatSession = {
          id: sessionId,
          customerName: customerInfo?.name || customerUser?.name || customerUser?.email?.split('@')[0] || guestChatUser?.name || 'Customer',
          customerEmail: customerInfo?.email || customerUser?.email || guestChatUser?.email || 'guest@example.com',
          customerPhone: customerInfo?.phone || customerUser?.phone || guestChatUser?.phone || undefined,
          userType: effectiveUserType,
          unreadForAdmin: sender === 'customer' ? 1 : 0,
          unreadForCustomer: sender === 'admin' ? 1 : 0,
          lastMessageAt: newMsg.timestamp,
          createdAt: new Date().toISOString(),
          status: 'Open',
          messages: [newMsg]
        };
        sessionToUpsert = newSession;
        const copy = [newSession, ...prev];
        localStorage.setItem('lumina_chat_sessions', JSON.stringify(copy));
        return copy;
      }
    });

    // Synchronize to Supabase chat_sessions table
    if (sessionToUpsert) {
      upsertChatSession(sessionToUpsert).catch((err) => {
        console.warn('[StoreContext] Could not upsert chat session to Supabase:', err);
      });
    }
  };

  const markChatReadByAdmin = (sessionId: string) => {
    let sessionToUpsert: ChatSession | null = null;
    setChatSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          sessionToUpsert = { ...s, unreadForAdmin: 0 };
          return sessionToUpsert;
        }
        return s;
      });
      localStorage.setItem('lumina_chat_sessions', JSON.stringify(updated));
      return updated;
    });

    if (sessionToUpsert) {
      upsertChatSession(sessionToUpsert).catch(() => {});
    }
  };

  const markChatReadByCustomer = (sessionId: string) => {
    let sessionToUpsert: ChatSession | null = null;
    setChatSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          sessionToUpsert = { ...s, unreadForCustomer: 0 };
          return sessionToUpsert;
        }
        return s;
      });
      localStorage.setItem('lumina_chat_sessions', JSON.stringify(updated));
      return updated;
    });

    if (sessionToUpsert) {
      upsertChatSession(sessionToUpsert).catch(() => {});
    }
  };

  const updateChatSessionStatus = (sessionId: string, status: 'Open' | 'Resolved') => {
    let sessionToUpsert: ChatSession | null = null;
    setChatSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          sessionToUpsert = { ...s, status };
          return sessionToUpsert;
        }
        return s;
      });
      localStorage.setItem('lumina_chat_sessions', JSON.stringify(updated));
      return updated;
    });

    if (sessionToUpsert) {
      upsertChatSession(sessionToUpsert).catch(() => {});
    }
    showNotification(`Chat session status marked as ${status}.`);
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      localStorage.setItem('lumina_chat_sessions', JSON.stringify(filtered));
      return filtered;
    });
    deleteChatSessionFromDb(sessionId).catch((err) => {
      console.warn('[StoreContext] Could not delete chat session from Supabase:', err);
    });
    showNotification('Chat session deleted.');
  };

  const refreshChatSessions = async () => {
    try {
      const dbChats = await fetchChatSessions();
      if (dbChats) {
        setChatSessions(dbChats);
        localStorage.setItem('lumina_chat_sessions', JSON.stringify(dbChats));
      }
    } catch (err) {
      console.warn('[StoreContext] refreshChatSessions error:', err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        mobileProducts,
        orders,
        cart,
        wishlist,
        activePage,
        adminTab,
        selectedProductId,
        lastPlacedOrder,
        searchTerm,
        selectedCategory,
        isCartOpen: isCartOpenState,
        isWishlistOpen,
        quickViewProduct,
        activePromo,
        promos,
        promoCodes: promos,
        bundleConfig,
        paymentSettings,
        updatePaymentSettings,
        shippingSettings,
        updateShippingSettings,
        socialSettings,
        updateSocialSettings,
        reviewsMap,
        notification,
        
        isAdminAuthenticated,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        adminTheme,
        setAdminTheme,
        toggleAdminTheme,

        customerUser,
        isCustomerAuthenticated: Boolean(customerUser),
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        customerAuthModalReason,
        setCustomerAuthModalReason,
        authRedirectTarget,
        setAuthRedirectTarget,
        openCustomerAuthForCheckout,
        navigateToLogin,
        customerPortalTab,
        setCustomerPortalTab,
        updateCustomerProfile,
        sendCustomerOtp,
        verifyCustomerOtp,
        logoutCustomer,

        navigateTo,
        setAdminTab,
        setSearchTerm,
        setSelectedCategory,
        setIsCartOpen,
        setIsWishlistOpen,
        setQuickViewProduct,
        isFlashSalePopupOpen,
        setIsFlashSalePopupOpen,
        openFlashSalePopup,
        showNotification,
        mobileCartNotification,
        setMobileCartNotification,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        applyPromoCode,
        removePromoCode,

        // Product Comparison
        compareList,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,

        updateBundleConfig,
        promoPopupConfig,
        updatePromoPopupConfig,
        topNotificationConfig,
        updateTopNotificationConfig,
        storeBranding,
        updateStoreBranding,
        desktopHeroConfig,
        updateDesktopHeroConfig,
        deleteDesktopHeroBanner,
        mobileHeroConfig,
        updateMobileHeroConfig,
        deleteMobileHeroBanner,
        addPromoCode,
        updatePromoCode,
        togglePromoCode,
        deletePromoCode,
        saveAllPromosToDb,

        placeOrder,
        updateOrderStatus,
        updateOrderPaymentDetails,
        deleteOrder,

        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        resetProductsToDefault,

        // Dedicated Mobile Product Catalog CRUD
        addMobileProduct,
        updateMobileProduct,
        deleteMobileProduct,
        toggleMobileProductStatus,
        resetMobileProductsToDefault,
        copyDesktopProductsToMobile,
        copyMobileProductsToDesktop,
        saveAllMobileProductsToDb: saveAllMobileProductsToDbHandler,

        addReview,
        deleteReview,
        seedSampleReviewsForProduct,

        // Video Success Stories
        successStories,
        addSuccessStory,
        updateSuccessStory,
        deleteSuccessStory,
        toggleSuccessStoryPublish,
        seedSampleSuccessStoriesForProduct,

        supportInquiries,
        submitSupportInquiry,
        updateInquiryStatus,
        deleteInquiry,
        refreshSupportInquiries,

        chatSessions,
        sendChatMessage,
        markChatReadByAdmin,
        markChatReadByCustomer,
        updateChatSessionStatus,
        deleteChatSession,
        customerChatSessionId,
        guestChatUser,
        setGuestChatUser,
        refreshChatSessions,

        // Supabase
        supabaseStatus,
        checkSupabaseDb,
        syncAllToSupabase,
        pullAllFromSupabase,

        // Video Storage Cleanup & Interruption Recovery
        reconcileInterruptedVideoCleanups,
        scanAndCleanOrphanVideoBlobs: async () => {
          const activeProductIds = products.map((p) => p.id);
          const activeStoryVideoUrls = successStories.map((s) => s.videoUrl).filter(Boolean);
          return await scanAndCleanOrphanVideoBlobs(activeProductIds, activeStoryVideoUrls);
        }
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
