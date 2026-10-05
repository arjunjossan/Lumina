export type Category = 'All' | 'Tech & Audio' | 'Home Innovation' | 'Personal Care' | 'Smart Gadgets' | 'Lifestyle';

export interface ProductReview {
  id: string;
  productId?: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  avatarUrl?: string;
  imageUrl?: string;
  helpfulCount: number;
}

export interface SuccessStory {
  id: string;
  productId: string;
  customerName: string;
  customerRoleOrLocation?: string;
  storyText: string;
  videoUrl: string;
  rating?: number;
  verified?: boolean;
  orderNumber?: string;
  published: boolean;
  createdAt: string;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  marketingSubtitle?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  category: Category;
  images: string[];
  gifUrls?: string[];
  description: string;
  shortDescription: string;
  features: string[];
  specifications: ProductSpec[];
  shippingWarranty?: string;
  showFeatures?: boolean;
  showSpecs?: boolean;
  showShippingWarranty?: boolean;
  stock: number;
  isWinningProduct?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  status: 'Active' | 'Draft';
  rating: number;
  reviewCount: number;
  badge?: string;
  codAllowed?: boolean;
  createdAt: string;
}

export interface PaymentSettings {
  codEnabled: boolean;
  codNoticeMessage?: string;

  payOnlineEnabled: boolean;
  payOnlineDiscountPercent: number;
  payOnlineDiscountLabel: string;

  partialPaymentEnabled: boolean;
  partialPaymentUpfrontPercent: number;
  partialPaymentDiscountPercent: number;

  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayTestMode: boolean;
}

export interface ShippingSettings {
  enabled: boolean;
  standardFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays?: string;
  freeDeliveryLabel?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  bundleDiscount?: number;
  bundleTier?: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  bundleDiscount?: number;
  lineTotal?: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  bundleDiscountAmount?: number;
  promoDiscountAmount?: number;
  paymentDiscountAmount?: number;
  promoCode?: string;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Partially Paid' | 'Failed';
  paidOnlineAmount?: number;
  codDueAmount?: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface SocialSettings {
  facebook?: string;
  facebookEnabled?: boolean;
  instagram?: string;
  instagramEnabled?: boolean;
  twitter?: string;
  twitterEnabled?: boolean;
  tiktok?: string;
  tiktokEnabled?: boolean;
  youtube?: string;
  youtubeEnabled?: boolean;
  pinterest?: string;
  pinterestEnabled?: boolean;
  whatsapp?: string;
  whatsappEnabled?: boolean;
  linkedin?: string;
  linkedinEnabled?: boolean;
  communityTitle?: string;
  communityCount?: string;
}

export interface ProductBundleOverride {
  enabled?: boolean; // If false, bundle is disabled for this product; if true, bundle is enabled
  customRules?: boolean; // If true, use custom tier discounts/quantities/badges
  tier2Quantity?: number;
  tier2DiscountPercent?: number;
  tier2Badge?: string;
  tier3Quantity?: number;
  tier3DiscountPercent?: number;
  tier3Badge?: string;
}

export interface BundleConfig {
  enabled: boolean;
  tier2Quantity: number;
  tier2DiscountPercent: number;
  tier2Badge: string;
  tier3Quantity: number;
  tier3DiscountPercent: number;
  tier3Badge: string;

  productOverrides?: Record<string, ProductBundleOverride>;
}

export interface PromoPopupConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  badgeText: string;
  promoCode: string;
  discountPercent?: number;
  discountValueText: string;
  buttonText: string;
  imageUrl?: string;
  delaySeconds: number;
  featuredProductId: string;
  featuredProductIds?: string[];
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  active: boolean;
  minSpend?: number;
  productId?: string;
  productTitle?: string;
}

export type InquiryStatus = 'New' | 'In Progress' | 'Resolved';

export interface CustomerProfile {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt?: string;
}

export type CustomerUser = CustomerProfile;

export type CustomerPortalTab = 'orders' | 'tracking' | 'inquiries' | 'profile' | 'returns';

export interface SupportInquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  category: 'General Question' | 'Order Tracking' | 'Returns & Refunds' | 'Shipping Issue' | 'Product Inquiry';
  subject: string;
  orderNumber?: string;
  message: string;
  status: InquiryStatus;
  adminReply?: string;
  adminRepliedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  userType?: 'member' | 'guest';
  unreadForAdmin: number;
  unreadForCustomer: number;
  lastMessageAt: string;
  createdAt?: string;
  status: 'Open' | 'Resolved';
  messages: ChatMessage[];
}

export type ActivePage = 
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'order-tracking'
  | 'wishlist'
  | 'my-orders'
  | 'shipping-policy'
  | 'returns-policy'
  | 'faq'
  | 'contact'
  | 'admin'
  | 'login';

export interface TopNotificationConfig {
  enabled: boolean;
  leftBadgeText: string;
  leftBadgeIcon: 'sparkles' | 'flame' | 'tag' | 'gift' | 'bell' | 'none';
  centerMessage: string;
  centerHighlightText?: string;
  centerLinkAction?: 'none' | 'catalog' | 'deals' | 'flash_popup' | 'custom_url';
  centerLinkUrl?: string;
  rightTag1Text?: string;
  rightTag1Icon?: 'truck' | 'shield' | 'check' | 'clock' | 'star' | 'none';
  rightTag2Text?: string;
  rightTag2Icon?: 'shield' | 'truck' | 'check' | 'clock' | 'star' | 'none';
  themePreset: 'dark' | 'amber' | 'emerald' | 'indigo' | 'crimson' | 'custom';
  customBgColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
  isAnimatedPulse?: boolean;
}

export interface StoreBrandingConfig {
  id?: string;
  storeName: string;
  storeNameFont: 'serif' | 'sans' | 'mono';
  storeNameSize: number;
  storeNameColor: string;
  storeNameWeight: 'normal' | 'semibold' | 'bold' | 'black';
  
  subtitle: string;
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleFontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  subtitleLetterSpacing: 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  subtitleStyle: 'normal' | 'italic';
  subtitleTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';

  logoType: 'custom_image' | 'icon';
  logoImageUrl: string;
  logoIcon: 'sparkles' | 'flame' | 'star' | 'package' | 'store' | 'zap' | 'crown';
  logoGradient: string;
  logoHeight: number;
  logoRounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

  updatedAt?: string;
}

export type DesktopHeroActionType = 
  | 'product_page'
  | 'add_to_cart'
  | 'catalog'
  | 'deals'
  | 'cart'
  | 'custom_url';

export type DesktopHeroGlowColor = 'amber' | 'cyan' | 'emerald' | 'rose' | 'purple' | 'white';

export interface DesktopHeroButtonConfig {
  id: 'button_1' | 'button_2';
  name: string;
  enabled: boolean;
  actionType: DesktopHeroActionType;
  productId?: string;
  customUrl?: string;
  x: number; // percentage from left edge (0 - 100)
  y: number; // percentage from top edge (0 - 100)
  width: number; // percentage width (0 - 100)
  height: number; // percentage height (0 - 100)
  borderRadius: number; // border radius in px
  glowColor: DesktopHeroGlowColor;
}

export interface DesktopHeroConfig {
  activeHeroType: 'default' | 'custom';
  imageUrl: string;
  imageStoragePath?: string;
  imageAltText?: string;
  viewFitting: 'fit_screen' | 'cover' | 'contain' | 'original';
  maxHeightVh: number; // e.g. 82vh for 1-view open without scrolling
  button1: DesktopHeroButtonConfig;
  button2: DesktopHeroButtonConfig;
  updatedAt?: string;
}

export type MobileHeroActionType = DesktopHeroActionType;
export type MobileHeroGlowColor = DesktopHeroGlowColor;
export type MobileHeroButtonConfig = DesktopHeroButtonConfig;

export interface MobileHeroConfig {
  activeHeroType: 'default' | 'custom';
  imageUrl: string;
  imageStoragePath?: string;
  imageAltText?: string;
  viewFitting: 'fit_screen' | 'cover' | 'contain' | 'original';
  maxHeightVh?: number; // e.g. 75vh for mobile viewport fitting
  button1: DesktopHeroButtonConfig;
  button2: DesktopHeroButtonConfig;
  updatedAt?: string;
}

export type MobileProduct = Product;

export type AdminTab = 
  | 'overview' 
  | 'products' 
  | 'mobile_products'
  | 'desktop_hero'
  | 'mobile_hero'
  | 'orders' 
  | 'shipping'
  | 'payments' 
  | 'bundles' 
  | 'coupons' 
  | 'reviews' 
  | 'inquiries' 
  | 'live_chat' 
  | 'top_notification' 
  | 'promo_popup' 
  | 'logo' 
  | 'social'
  | 'settings';
