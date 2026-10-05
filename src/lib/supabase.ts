import { createClient } from '@supabase/supabase-js';
import { Product, Order, PromoCode, SupportInquiry, ChatSession, BundleConfig, PromoPopupConfig, PaymentSettings, ShippingSettings, ProductReview, SuccessStory, StoreBrandingConfig, CustomerProfile, SocialSettings, DesktopHeroConfig, MobileHeroConfig } from '../types';

// Use environment variables if set, otherwise fallback to the user's provided credentials.
const SUPABASE_URL = (((import.meta as any).env?.VITE_SUPABASE_URL) || 'https://hphfyrciaufkdkfqpdfm.supabase.co').trim();
const SUPABASE_ANON_KEY = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable__CCD2fDominO0tnNU4RUkQ_jwLSEyMC').trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_PROJECT_ID = (() => {
  try {
    const url = new URL(SUPABASE_URL);
    return url.hostname.split('.')[0] || 'hphfyrciaufkdkfqpdfm';
  } catch {
    return 'hphfyrciaufkdkfqpdfm';
  }
})();

// Track whether the remote Supabase endpoint is reachable
let isSupabaseHostReachable: boolean | null = null;

export const isSupabaseConnected = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export const getSupabaseHostStatus = () => isSupabaseHostReachable;

export function isNetworkOrOfflineError(error: any): boolean {
  if (!error) return false;
  const msg = String(error?.message || error?.details || error || '').toLowerCase();
  const name = String(error?.name || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('connection refused') ||
    msg.includes('could not resolve host') ||
    msg.includes('econnrefused') ||
    msg.includes('timeout') ||
    msg.includes('abort') ||
    name.includes('typeerror') ||
    error?.code === 'PGRST111' ||
    error?.status === 0
  );
}

// SQL script for setup - displayed in the Admin panel so the user can easily copy/paste it in Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- ==========================================
-- 1. PRODUCTS TABLE (Create + Ensure all columns exist)
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "sku" TEXT,
  "price" NUMERIC NOT NULL,
  "compareAtPrice" NUMERIC,
  "costPrice" NUMERIC,
  "category" TEXT NOT NULL,
  "images" JSONB DEFAULT '[]'::jsonb,
  "gifUrls" JSONB DEFAULT '[]'::jsonb,
  "description" TEXT,
  "shortDescription" TEXT,
  "features" JSONB DEFAULT '[]'::jsonb,
  "specifications" JSONB DEFAULT '[]'::jsonb,
  "stock" INT DEFAULT 0,
  "isWinningProduct" BOOLEAN DEFAULT false,
  "isBestSeller" BOOLEAN DEFAULT false,
  "isTrending" BOOLEAN DEFAULT false,
  "status" TEXT DEFAULT 'Active',
  "rating" NUMERIC DEFAULT 5.0,
  "reviewCount" INT DEFAULT 0,
  "badge" TEXT,
  "codAllowed" BOOLEAN DEFAULT true,
  "shippingWarranty" TEXT,
  "showFeatures" BOOLEAN DEFAULT true,
  "showSpecs" BOOLEAN DEFAULT true,
  "showShippingWarranty" BOOLEAN DEFAULT true,
  "createdAt" TEXT
);

-- Safely add any new columns if the table already existed earlier
ALTER TABLE products ADD COLUMN IF NOT EXISTS "subtitle" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "compareAtPrice" NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "costPrice" NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "gifUrls" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "features" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "specifications" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "isWinningProduct" BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "isBestSeller" BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "isTrending" BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "badge" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "codAllowed" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "shippingWarranty" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showFeatures" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showSpecs" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showShippingWarranty" BOOLEAN DEFAULT true;
ALTER TABLE products DROP COLUMN IF EXISTS "videoUrl";

-- Enable RLS and setup open access policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON products;
CREATE POLICY "Public Read/Write Access" ON products FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 1B. MOBILE PRODUCTS TABLE (Dedicated Mobile Catalog)
-- ==========================================
CREATE TABLE IF NOT EXISTS mobile_products (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "sku" TEXT,
  "price" NUMERIC NOT NULL,
  "compareAtPrice" NUMERIC,
  "costPrice" NUMERIC,
  "category" TEXT NOT NULL,
  "images" JSONB DEFAULT '[]'::jsonb,
  "gifUrls" JSONB DEFAULT '[]'::jsonb,
  "description" TEXT,
  "shortDescription" TEXT,
  "features" JSONB DEFAULT '[]'::jsonb,
  "specifications" JSONB DEFAULT '[]'::jsonb,
  "stock" INT DEFAULT 0,
  "isWinningProduct" BOOLEAN DEFAULT false,
  "isBestSeller" BOOLEAN DEFAULT false,
  "isTrending" BOOLEAN DEFAULT false,
  "status" TEXT DEFAULT 'Active',
  "rating" NUMERIC DEFAULT 5.0,
  "reviewCount" INT DEFAULT 0,
  "badge" TEXT,
  "codAllowed" BOOLEAN DEFAULT true,
  "shippingWarranty" TEXT,
  "showFeatures" BOOLEAN DEFAULT true,
  "showSpecs" BOOLEAN DEFAULT true,
  "showShippingWarranty" BOOLEAN DEFAULT true,
  "createdAt" TEXT
);

-- Safely ensure all columns exist in mobile_products
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "subtitle" TEXT;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "compareAtPrice" NUMERIC;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "costPrice" NUMERIC;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "gifUrls" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "features" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "specifications" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "isWinningProduct" BOOLEAN DEFAULT false;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "isBestSeller" BOOLEAN DEFAULT false;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "isTrending" BOOLEAN DEFAULT false;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "badge" TEXT;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "codAllowed" BOOLEAN DEFAULT true;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "shippingWarranty" TEXT;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "showFeatures" BOOLEAN DEFAULT true;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "showSpecs" BOOLEAN DEFAULT true;
ALTER TABLE mobile_products ADD COLUMN IF NOT EXISTS "showShippingWarranty" BOOLEAN DEFAULT true;

-- Enable RLS and setup open access policies for mobile_products
ALTER TABLE mobile_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON mobile_products;
CREATE POLICY "Public Read/Write Access" ON mobile_products FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON mobile_products TO anon;
GRANT ALL ON mobile_products TO authenticated;

-- ==========================================
-- 2. ORDERS TABLE (Create + Ensure all columns exist)
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  "id" TEXT PRIMARY KEY,
  "createdAt" TEXT,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "shippingAddress" JSONB DEFAULT '{}'::jsonb,
  "items" JSONB DEFAULT '[]'::jsonb,
  "subtotal" NUMERIC DEFAULT 0,
  "discount" NUMERIC DEFAULT 0,
  "shippingFee" NUMERIC DEFAULT 0,
  "total" NUMERIC DEFAULT 0,
  "status" TEXT DEFAULT 'Processing',
  "paymentMethod" TEXT,
  "paymentStatus" TEXT,
  "paidOnlineAmount" NUMERIC,
  "codDueAmount" NUMERIC,
  "razorpayPaymentId" TEXT,
  "razorpayOrderId" TEXT,
  "paymentDiscountAmount" NUMERIC,
  "trackingNumber" TEXT,
  "carrier" TEXT,
  "estimatedDelivery" TEXT
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paidOnlineAmount" NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "codDueAmount" NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentDiscountAmount" NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "carrier" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "estimatedDelivery" TEXT;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON orders;
CREATE POLICY "Public Read/Write Access" ON orders FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 3. PROMOS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS promos (
  "code" TEXT PRIMARY KEY,
  "discountPercent" INT NOT NULL,
  "active" BOOLEAN DEFAULT true,
  "minSpend" NUMERIC,
  "productId" TEXT,
  "productTitle" TEXT
);

ALTER TABLE promos ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS "productTitle" TEXT;

ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON promos;
CREATE POLICY "Public Read/Write Access" ON promos FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 4. SUPPORT INQUIRIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS support_inquiries (
  "id" TEXT PRIMARY KEY,
  "createdAt" TEXT,
  "name" TEXT,
  "email" TEXT,
  "category" TEXT,
  "subject" TEXT,
  "orderNumber" TEXT,
  "message" TEXT,
  "status" TEXT DEFAULT 'New',
  "adminReply" TEXT,
  "adminRepliedAt" TEXT
);

ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "subject" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'New';
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "adminReply" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "adminRepliedAt" TEXT;

ALTER TABLE support_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON support_inquiries;
CREATE POLICY "Public Read/Write Access" ON support_inquiries FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 5. STORE CONFIGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS store_configs (
  "key" TEXT PRIMARY KEY,
  "value" JSONB NOT NULL,
  "updatedAt" TEXT
);

ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON store_configs;
CREATE POLICY "Public Read/Write Access" ON store_configs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 6. REVIEWS TABLE (Create + Ensure all columns exist)
-- ==========================================
CREATE TABLE IF NOT EXISTS reviews (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "rating" NUMERIC DEFAULT 5.0,
  "date" TEXT,
  "title" TEXT,
  "comment" TEXT,
  "verified" BOOLEAN DEFAULT true,
  "avatarUrl" TEXT,
  "imageUrl" TEXT,
  "helpfulCount" INT DEFAULT 0
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "author" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "rating" NUMERIC DEFAULT 5.0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "comment" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "helpfulCount" INT DEFAULT 0;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON reviews;
CREATE POLICY "Public Read/Write Access" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 7. CHAT SESSIONS TABLE (Live Chat with Guests & Members)
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  "id" TEXT PRIMARY KEY,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerPhone" TEXT,
  "userType" TEXT DEFAULT 'guest',
  "unreadForAdmin" INT DEFAULT 0,
  "unreadForCustomer" INT DEFAULT 0,
  "lastMessageAt" TEXT,
  "status" TEXT DEFAULT 'Open',
  "messages" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TEXT
);

ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "userType" TEXT DEFAULT 'guest';
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "unreadForAdmin" INT DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "unreadForCustomer" INT DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "lastMessageAt" TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Open';
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "messages" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "createdAt" TEXT;

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON chat_sessions;
CREATE POLICY "Public Read/Write Access" ON chat_sessions FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 8. SUCCESS STORIES TABLE (Product Customer Video Stories)
-- ==========================================
CREATE TABLE IF NOT EXISTS success_stories (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerRoleOrLocation" TEXT,
  "storyText" TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "rating" NUMERIC DEFAULT 5.0,
  "verified" BOOLEAN DEFAULT true,
  "orderNumber" TEXT,
  "published" BOOLEAN DEFAULT true,
  "createdAt" TEXT
);

ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customerRoleOrLocation" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "storyText" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "rating" NUMERIC DEFAULT 5.0;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT true;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "published" BOOLEAN DEFAULT true;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "createdAt" TEXT;

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON success_stories;
CREATE POLICY "Public Read/Write Access" ON success_stories FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 9. STORE BRANDING / LOGO TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS store_branding (
  "id" TEXT PRIMARY KEY DEFAULT 'current',
  "storeName" TEXT NOT NULL DEFAULT 'LUMINA',
  "storeNameFont" TEXT DEFAULT 'serif',
  "storeNameSize" INT DEFAULT 24,
  "storeNameColor" TEXT DEFAULT '#0f172a',
  "storeNameWeight" TEXT DEFAULT 'black',
  "subtitle" TEXT DEFAULT 'WINNING PRODUCTS',
  "subtitleFontSize" INT DEFAULT 10,
  "subtitleColor" TEXT DEFAULT '#d97706',
  "subtitleFontWeight" TEXT DEFAULT 'extrabold',
  "subtitleLetterSpacing" TEXT DEFAULT 'widest',
  "subtitleStyle" TEXT DEFAULT 'normal',
  "subtitleTransform" TEXT DEFAULT 'uppercase',
  "logoType" TEXT DEFAULT 'icon',
  "logoImageUrl" TEXT,
  "logoIcon" TEXT DEFAULT 'sparkles',
  "logoGradient" TEXT DEFAULT 'from-amber-500 via-orange-500 to-red-500',
  "logoHeight" INT DEFAULT 40,
  "logoRounded" TEXT DEFAULT 'xl',
  "updatedAt" TEXT
);

ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeName" TEXT DEFAULT 'LUMINA';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameFont" TEXT DEFAULT 'serif';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameSize" INT DEFAULT 24;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameColor" TEXT DEFAULT '#0f172a';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameWeight" TEXT DEFAULT 'black';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitle" TEXT DEFAULT 'WINNING PRODUCTS';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleFontSize" INT DEFAULT 10;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleColor" TEXT DEFAULT '#d97706';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleFontWeight" TEXT DEFAULT 'extrabold';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleLetterSpacing" TEXT DEFAULT 'widest';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleStyle" TEXT DEFAULT 'normal';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleTransform" TEXT DEFAULT 'uppercase';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoType" TEXT DEFAULT 'icon';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoImageUrl" TEXT;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoIcon" TEXT DEFAULT 'sparkles';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoGradient" TEXT DEFAULT 'from-amber-500 via-orange-500 to-red-500';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoHeight" INT DEFAULT 40;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoRounded" TEXT DEFAULT 'xl';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;

ALTER TABLE store_branding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON store_branding;
CREATE POLICY "Public Read/Write Access" ON store_branding FOR ALL USING (true) WITH CHECK (true);

INSERT INTO store_branding ("id", "storeName", "subtitle", "updatedAt")
VALUES ('current', 'LUMINA', 'WINNING PRODUCTS', NOW()::text)
ON CONFLICT ("id") DO NOTHING;

-- ==========================================
-- 10. CUSTOMER PROFILE TABLE (Verified Members & Saved Details)
-- ==========================================
CREATE TABLE IF NOT EXISTS customer_profile (
  "email" TEXT PRIMARY KEY,
  "name" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zipCode" TEXT,
  "country" TEXT,
  "createdAt" TEXT,
  "updatedAt" TEXT
);

ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "zip_code" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "created_at" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "updated_at" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_profile_email ON customer_profile ("email");

ALTER TABLE customer_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON customer_profile;
CREATE POLICY "Public Read/Write Access" ON customer_profile FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON customer_profile TO anon;
GRANT ALL ON customer_profile TO authenticated;

-- Drop obsolete redundant customer_profiles (plural) table to keep only customer_profile
DROP TABLE IF EXISTS customer_profiles CASCADE;

-- Clean up any old customer profile records from store_configs table
DELETE FROM store_configs WHERE "key" ILIKE '%customer_profile%' OR "key" ILIKE '%customerProfile%' OR "key" ILIKE '%customer_user%';
`;

export const CUSTOMER_PROFILES_TABLE_SQL = `-- ==========================================
-- SINGLE CUSTOMER PROFILE TABLE SETUP & CLEANUP (Supabase SQL Editor)
-- Run this in https://supabase.com/dashboard/project/_/sql
-- ==========================================

-- 1. Create dedicated single customer_profile table
CREATE TABLE IF NOT EXISTS customer_profile (
  "email" TEXT PRIMARY KEY,
  "name" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zipCode" TEXT,
  "country" TEXT,
  "createdAt" TEXT,
  "updatedAt" TEXT
);

-- Ensure all standard columns exist (both camelCase and snake_case compatibility)
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "zip_code" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "created_at" TEXT;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS "updated_at" TEXT;

-- Unique index for conflict resolution
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_profile_email ON customer_profile ("email");

-- Row level security & full read/write access policy
ALTER TABLE customer_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON customer_profile;
CREATE POLICY "Public Read/Write Access" ON customer_profile FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon & authenticated roles
GRANT ALL ON customer_profile TO anon;
GRANT ALL ON customer_profile TO authenticated;

-- 2. Drop the redundant plural 'customer_profiles' table (keep only customer_profile)
DROP TABLE IF EXISTS customer_profiles CASCADE;

-- 3. Clean and delete any customer profile rows remaining in store_configs
DELETE FROM store_configs WHERE "key" ILIKE '%customer_profile%' OR "key" ILIKE '%customerProfile%' OR "key" ILIKE '%customer_user%';

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
`;

export const PRODUCT_SHIPPING_AND_VISIBILITY_SQL = `-- ==========================================
-- PRODUCTS TABLE SCHEMA UPDATE: SHIPPING & SECTION VISIBILITY
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==========================================

-- 1. Add shipping & warranty column
ALTER TABLE products ADD COLUMN IF NOT EXISTS "shippingWarranty" TEXT;

-- 2. Add storefront section display toggles (defaults to true)
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showFeatures" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showSpecs" BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "showShippingWarranty" BOOLEAN DEFAULT true;

-- 3. Drop obsolete demonstration video column from products table
ALTER TABLE products DROP COLUMN IF EXISTS "videoUrl";

-- 4. Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';
`;

export const DROP_PRODUCT_VIDEO_URL_SQL = `-- ==========================================
-- DROP UNUSED DEMONSTRATION VIDEO URL COLUMN FROM PRODUCTS TABLE
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==========================================

-- Drop the unused videoUrl column from the products table
ALTER TABLE products DROP COLUMN IF EXISTS "videoUrl";

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
`;

export const STORE_BRANDING_TABLE_SQL = `-- ==========================================
-- STORE BRANDING CONSOLIDATION SCRIPT
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==========================================

-- 1. Create or update the dedicated store_branding table
CREATE TABLE IF NOT EXISTS store_branding (
  "id" TEXT PRIMARY KEY DEFAULT 'current',
  "storeName" TEXT NOT NULL DEFAULT 'LUMINA',
  "storeNameFont" TEXT DEFAULT 'serif',
  "storeNameSize" INT DEFAULT 24,
  "storeNameColor" TEXT DEFAULT '#0f172a',
  "storeNameWeight" TEXT DEFAULT 'black',
  "subtitle" TEXT DEFAULT 'WINNING PRODUCTS',
  "subtitleFontSize" INT DEFAULT 10,
  "subtitleColor" TEXT DEFAULT '#d97706',
  "subtitleFontWeight" TEXT DEFAULT 'extrabold',
  "subtitleLetterSpacing" TEXT DEFAULT 'widest',
  "subtitleStyle" TEXT DEFAULT 'normal',
  "subtitleTransform" TEXT DEFAULT 'uppercase',
  "logoType" TEXT DEFAULT 'icon',
  "logoImageUrl" TEXT,
  "logoIcon" TEXT DEFAULT 'sparkles',
  "logoGradient" TEXT DEFAULT 'from-amber-500 via-orange-500 to-red-500',
  "logoHeight" INT DEFAULT 40,
  "logoRounded" TEXT DEFAULT 'xl',
  "updatedAt" TEXT
);

-- Ensure all columns exist in store_branding
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeName" TEXT DEFAULT 'LUMINA';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameFont" TEXT DEFAULT 'serif';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameSize" INT DEFAULT 24;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameColor" TEXT DEFAULT '#0f172a';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "storeNameWeight" TEXT DEFAULT 'black';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitle" TEXT DEFAULT 'WINNING PRODUCTS';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleFontSize" INT DEFAULT 10;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleColor" TEXT DEFAULT '#d97706';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleFontWeight" TEXT DEFAULT 'extrabold';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleLetterSpacing" TEXT DEFAULT 'widest';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleStyle" TEXT DEFAULT 'normal';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "subtitleTransform" TEXT DEFAULT 'uppercase';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoType" TEXT DEFAULT 'icon';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoImageUrl" TEXT;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoIcon" TEXT DEFAULT 'sparkles';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoGradient" TEXT DEFAULT 'from-amber-500 via-orange-500 to-red-500';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoHeight" INT DEFAULT 40;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "logoRounded" TEXT DEFAULT 'xl';
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;

-- Enable Row Level Security and Open Access Policy
ALTER TABLE store_branding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON store_branding;
CREATE POLICY "Public Read/Write Access" ON store_branding FOR ALL USING (true) WITH CHECK (true);

-- 2. Migrate existing JSON branding data from store_configs into store_branding if available
DO $$
DECLARE
  cfg JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_configs') THEN
    SELECT "value" INTO cfg FROM store_configs WHERE "key" = 'branding' LIMIT 1;
    IF cfg IS NOT NULL THEN
      INSERT INTO store_branding (
        "id", "storeName", "storeNameFont", "storeNameSize", "storeNameColor", "storeNameWeight",
        "subtitle", "subtitleFontSize", "subtitleColor", "subtitleFontWeight", "subtitleLetterSpacing",
        "subtitleStyle", "subtitleTransform", "logoType", "logoImageUrl", "logoIcon", "logoGradient",
        "logoHeight", "logoRounded", "updatedAt"
      )
      VALUES (
        'current',
        COALESCE(cfg->>'storeName', cfg->>'store_name', 'LUMINA'),
        COALESCE(cfg->>'storeNameFont', cfg->>'store_name_font', 'serif'),
        COALESCE((cfg->>'storeNameSize')::int, (cfg->>'store_name_size')::int, 24),
        COALESCE(cfg->>'storeNameColor', cfg->>'store_name_color', '#0f172a'),
        COALESCE(cfg->>'storeNameWeight', cfg->>'store_name_weight', 'black'),
        COALESCE(cfg->>'subtitle', 'WINNING PRODUCTS'),
        COALESCE((cfg->>'subtitleFontSize')::int, (cfg->>'subtitle_font_size')::int, 10),
        COALESCE(cfg->>'subtitleColor', cfg->>'subtitle_color', '#d97706'),
        COALESCE(cfg->>'subtitleFontWeight', cfg->>'subtitle_font_weight', 'extrabold'),
        COALESCE(cfg->>'subtitleLetterSpacing', cfg->>'subtitle_letter_spacing', 'widest'),
        COALESCE(cfg->>'subtitleStyle', cfg->>'subtitle_style', 'normal'),
        COALESCE(cfg->>'subtitleTransform', cfg->>'subtitle_transform', 'uppercase'),
        COALESCE(cfg->>'logoType', cfg->>'logo_type', 'icon'),
        COALESCE(cfg->>'logoImageUrl', cfg->>'logo_image_url', ''),
        COALESCE(cfg->>'logoIcon', cfg->>'logo_icon', 'sparkles'),
        COALESCE(cfg->>'logoGradient', cfg->>'logo_gradient', 'from-amber-500 via-orange-500 to-red-500'),
        COALESCE((cfg->>'logoHeight')::int, (cfg->>'logo_height')::int, 40),
        COALESCE(cfg->>'logoRounded', cfg->>'logo_rounded', 'xl'),
        NOW()::text
      )
      ON CONFLICT ("id") DO UPDATE SET
        "storeName" = EXCLUDED."storeName",
        "storeNameFont" = EXCLUDED."storeNameFont",
        "storeNameSize" = EXCLUDED."storeNameSize",
        "storeNameColor" = EXCLUDED."storeNameColor",
        "storeNameWeight" = EXCLUDED."storeNameWeight",
        "subtitle" = EXCLUDED."subtitle",
        "subtitleFontSize" = EXCLUDED."subtitleFontSize",
        "subtitleColor" = EXCLUDED."subtitleColor",
        "subtitleFontWeight" = EXCLUDED."subtitleFontWeight",
        "subtitleLetterSpacing" = EXCLUDED."subtitleLetterSpacing",
        "subtitleStyle" = EXCLUDED."subtitleStyle",
        "subtitleTransform" = EXCLUDED."subtitleTransform",
        "logoType" = EXCLUDED."logoType",
        "logoImageUrl" = EXCLUDED."logoImageUrl",
        "logoIcon" = EXCLUDED."logoIcon",
        "logoGradient" = EXCLUDED."logoGradient",
        "logoHeight" = EXCLUDED."logoHeight",
        "logoRounded" = EXCLUDED."logoRounded",
        "updatedAt" = EXCLUDED."updatedAt";
    END IF;

    -- Clean up the duplicate 'branding' row from store_configs so it doesn't duplicate store_branding
    DELETE FROM store_configs WHERE "key" = 'branding';
  END IF;
END $$;

-- 3. Ensure default branding record exists in store_branding
INSERT INTO store_branding ("id", "storeName", "subtitle", "updatedAt")
VALUES ('current', 'LUMINA', 'WINNING PRODUCTS', NOW()::text)
ON CONFLICT ("id") DO NOTHING;
`;

export const SHIPPING_SETTINGS_SQL = `-- ==========================================
-- SHIPPING & DELIVERY CHARGES SQL SCRIPT (Supabase SQL Editor)
-- Run this in https://supabase.com/dashboard/project/_/sql
-- ==========================================

-- 1. Ensure the store_configs table exists
CREATE TABLE IF NOT EXISTS store_configs (
  "key" TEXT PRIMARY KEY,
  "value" JSONB NOT NULL,
  "updatedAt" TEXT
);

-- 2. Setup Row Level Security and Open Access Policy
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON store_configs;
CREATE POLICY "Public Read/Write Access" ON store_configs FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to public anon and authenticated roles
GRANT ALL ON store_configs TO anon;
GRANT ALL ON store_configs TO authenticated;

-- 3. Seed / Update default shipping settings
-- Sets standard delivery charge to ₹49 and free shipping threshold to ₹999
INSERT INTO store_configs ("key", "value", "updatedAt")
VALUES (
  'shipping_settings',
  '{
    "enabled": true,
    "standardFee": 49,
    "freeShippingThreshold": 999,
    "estimatedDeliveryDays": "2–4 Business Days",
    "freeDeliveryLabel": "Free Express Delivery"
  }'::jsonb,
  NOW()::text
)
ON CONFLICT ("key") DO UPDATE SET
  "value" = EXCLUDED."value",
  "updatedAt" = EXCLUDED."updatedAt";

-- Verify configuration
SELECT "key", "value", "updatedAt" FROM store_configs WHERE "key" = 'shipping_settings';
`;

export const SUCCESS_STORIES_TABLE_SQL = `-- =============================================================================
-- 1. CREATE SUCCESS STORIES TABLE (Run in Supabase SQL Editor)
-- =============================================================================
CREATE TABLE IF NOT EXISTS success_stories (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerRoleOrLocation" TEXT,
  "storyText" TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "rating" NUMERIC DEFAULT 5.0,
  "verified" BOOLEAN DEFAULT true,
  "orderNumber" TEXT,
  "published" BOOLEAN DEFAULT true,
  "createdAt" TEXT
);

-- Ensure both camelCase and snake_case columns exist for maximum compatibility
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "product_id" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customer_name" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customerRoleOrLocation" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customer_role_or_location" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "storyText" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "story_text" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "video_url" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "rating" NUMERIC DEFAULT 5.0;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT true;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "order_number" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "published" BOOLEAN DEFAULT true;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "created_at" TEXT;

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON success_stories;
CREATE POLICY "Public Read/Write Access" ON success_stories FOR ALL USING (true) WITH CHECK (true);

-- 2. CREATE PUBLIC STORAGE BUCKETS FOR PRODUCTS, MEDIA & VIDEOS
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('products', 'products', true, 52428800),
  ('product-media', 'product-media', true, 52428800),
  ('images', 'images', true, 52428800),
  ('videos', 'videos', true, 104857600),
  ('success-stories', 'success-stories', true, 104857600)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Storage Objects Select" ON storage.objects;
CREATE POLICY "Public Storage Objects Select" ON storage.objects 
  FOR SELECT USING (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

DROP POLICY IF EXISTS "Public Storage Objects Insert" ON storage.objects;
CREATE POLICY "Public Storage Objects Insert" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

DROP POLICY IF EXISTS "Public Storage Objects Update" ON storage.objects;
CREATE POLICY "Public Storage Objects Update" ON storage.objects 
  FOR UPDATE USING (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

DROP POLICY IF EXISTS "Public Storage Objects Delete" ON storage.objects;
CREATE POLICY "Public Storage Objects Delete" ON storage.objects 
  FOR DELETE USING (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

NOTIFY pgrst, 'reload schema';`;

// ==========================================
// QUICK FIX SQL: Missing Columns Migration
// ==========================================
export const SUPABASE_SCHEMA_MIGRATION_FIX_SQL = `-- ==========================================
-- QUICK FIX: ADD MISSING COLUMNS TO EXISTING TABLES
-- Run this in your Supabase SQL Editor if you encounter PGRST204 schema cache errors:
-- https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new
-- ==========================================

-- 1. Support Inquiries columns
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "adminRepliedAt" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "adminReply" TEXT;
ALTER TABLE support_inquiries ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;

-- 2. Chat Sessions columns
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "userType" TEXT DEFAULT 'guest';
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "unreadForAdmin" INT DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS "unreadForCustomer" INT DEFAULT 0;

-- 3. Prompt PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
`;

// Helper to check if a specific table exists by executing a lightweight select query
export async function checkTableExists(tableName: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    if (error) {
      // 42P01 is Postgres code for 'relation does not exist' (meaning table doesn't exist)
      if (error.code === '42P01') {
        return false;
      }
      if (isNetworkOrOfflineError(error)) {
        isSupabaseHostReachable = false;
        return false;
      }
    }
    return true;
  } catch (err) {
    if (isNetworkOrOfflineError(err)) {
      isSupabaseHostReachable = false;
    }
    return false;
  }
}

// Check connection status & tables availability
export async function diagnoseSupabaseConnection(): Promise<{
  connected: boolean;
  missingTables: string[];
  allTablesOk: boolean;
  error?: string;
}> {
  if (!isSupabaseConnected()) {
    isSupabaseHostReachable = false;
    return { connected: false, missingTables: [], allTablesOk: false, error: 'Supabase credentials are not provided.' };
  }

  const tablesToCheck = ['products', 'mobile_products', 'orders', 'promos', 'support_inquiries', 'store_configs', 'reviews', 'chat_sessions', 'success_stories'];
  const missingTables: string[] = [];

  try {
    // Try a simple operation to check if network/API key works
    const { error } = await supabase.from('products').select('id').limit(1);
    
    // Check if query returned an error
    if (error) {
      // 42P01 means table does not exist, but database server responded!
      if (error.code === '42P01') {
        isSupabaseHostReachable = true;
        missingTables.push('products');
        for (const table of tablesToCheck.slice(1)) {
          const { error: tblError } = await supabase.from(table).select('*').limit(1);
          if (tblError && tblError.code === '42P01') {
            missingTables.push(table);
          }
        }
        // Check customer profile table
        const { error: p1Err } = await supabase.from('customer_profile').select('*').limit(1);
        const { error: p2Err } = await supabase.from('customer_profiles').select('*').limit(1);
        if (p1Err?.code === '42P01' && p2Err?.code === '42P01') {
          missingTables.push('customer_profile');
        }
        return {
          connected: true,
          missingTables,
          allTablesOk: false,
          error: undefined,
        };
      }

      // Any network error (Failed to fetch, DNS failure, PGRST111, offline) means NOT connected
      isSupabaseHostReachable = false;
      const isOffline = isNetworkOrOfflineError(error);
      return {
        connected: false,
        missingTables: [],
        allTablesOk: false,
        error: isOffline 
          ? 'Database endpoint is currently unreachable (network offline or invalid project URL).' 
          : (error.message || 'Connection failed'),
      };
    }

    // Query succeeded: database is connected and products table exists!
    isSupabaseHostReachable = true;
    for (const table of tablesToCheck.slice(1)) {
      const { error: tblError } = await supabase.from(table).select('*').limit(1);
      if (tblError && tblError.code === '42P01') {
        missingTables.push(table);
      }
    }
    // Check customer profile table (single customer_profile table)
    const { error: p1Err } = await supabase.from('customer_profile').select('*').limit(1);
    if (p1Err?.code === '42P01') {
      missingTables.push('customer_profile');
    }

    return {
      connected: true,
      missingTables,
      allTablesOk: missingTables.length === 0,
      error: undefined,
    };
  } catch (err: any) {
    isSupabaseHostReachable = false;
    return {
      connected: false,
      missingTables: [],
      allTablesOk: false,
      error: 'Database endpoint is currently unreachable (network offline or invalid project URL).',
    };
  }
}

// DATABASE ACCESS WRAPPERS
// These catch errors gracefully so the app does not break if tables are not set up yet or offline.

function handleDbError(operationName: string, tableName: string, error: any) {
  if (error?.code === '42P01') {
    console.warn(`[Supabase Info] Table '${tableName}' does not exist in your database yet. Run the SQL Schema Setup script from Admin Settings to enable live cloud sync.`);
    return;
  }
  if (error?.code === 'PGRST204') {
    console.warn(`[Supabase Schema Notice] ${operationName} (${tableName}): Schema column mismatch: ${error?.message}`);
    return;
  }
  if (isNetworkOrOfflineError(error)) {
    isSupabaseHostReachable = false;
    console.warn(`[Supabase Offline] ${operationName} (${tableName}): Database host is unreachable. Local state remains active.`);
    return;
  }
  console.warn(`[Supabase Notice] ${operationName} (${tableName}) error:`, error?.message || error);
}

function handleDbException(operationName: string, tableName: string, err: any) {
  const errMsg = String(err?.message || '');
  if (err?.code === '42P01' || (errMsg.includes('relation') && errMsg.includes('does not exist'))) {
    console.warn(`[Supabase Info] Table '${tableName}' does not exist in your database yet. Run the SQL Schema Setup script from Admin Settings to enable live cloud sync.`);
    return;
  }
  if (err?.code === 'PGRST204') {
    console.warn(`[Supabase Schema Notice] ${operationName} (${tableName}): Schema column mismatch: ${errMsg || err}`);
    return;
  }
  if (isNetworkOrOfflineError(err)) {
    isSupabaseHostReachable = false;
    console.warn(`[Supabase Offline] ${operationName} (${tableName}): Database host is unreachable. Local state remains active.`);
    return;
  }
  console.warn(`[Supabase Notice] ${operationName} (${tableName}) exception:`, errMsg || err);
}

// Module-level cache of missing columns per table (e.g. "support_inquiries:adminRepliedAt")
// to prevent repeated failed network requests and auto-strip unmigrated columns.
const knownMissingColumns = new Set<string>();

/**
 * Resilient upsert helper that automatically handles schema cache mismatches (PGRST204).
 * If a column is missing in the database table, it extracts the missing column name,
 * caches it, strips it from the payload, and retries the operation seamlessly.
 */
export async function resilientUpsert(
  tableName: string,
  record: Record<string, any>,
  maxRetries = 6
): Promise<{ data: any; error: any }> {
  let currentPayload = { ...record };

  // Pre-strip any columns already known to be missing in this table
  for (const key of Object.keys(currentPayload)) {
    if (knownMissingColumns.has(`${tableName}:${key}`)) {
      delete currentPayload[key];
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { data, error } = await supabase
      .from(tableName)
      .upsert(currentPayload);

    if (!error) {
      isSupabaseHostReachable = true;
      return { data, error: null };
    }

    // Check for missing column error in PostgREST schema cache (PGRST204)
    if (error.code === 'PGRST204' && error.message) {
      const match = error.message.match(/Could not find the '([^']+)' column/i);
      if (match && match[1]) {
        const missingCol = match[1];
        knownMissingColumns.add(`${tableName}:${missingCol}`);
        delete currentPayload[missingCol];
        console.warn(`[Supabase Schema Auto-Adapter] Column '${missingCol}' not found in '${tableName}'. Stripped from payload and retried successfully.`);
        continue;
      }
    }

    return { data, error };
  }

  return { data: null, error: { message: `Exceeded retries stripping missing columns for ${tableName}` } };
}

export async function fetchProducts(): Promise<Product[] | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      if (error.code !== '42P01') {
        console.warn('Supabase fetchProducts error:', error);
      }
      return null;
    }
    return (data || []).map((row: any) => ({
      ...row,
      shippingWarranty: row.shippingWarranty ?? row.shipping_warranty ?? undefined,
      showFeatures: row.showFeatures !== undefined ? Boolean(row.showFeatures) : (row.show_features !== undefined ? Boolean(row.show_features) : true),
      showSpecs: row.showSpecs !== undefined ? Boolean(row.showSpecs) : (row.show_specs !== undefined ? Boolean(row.show_specs) : true),
      showShippingWarranty: row.showShippingWarranty !== undefined ? Boolean(row.showShippingWarranty) : (row.show_shipping_warranty !== undefined ? Boolean(row.show_shipping_warranty) : true),
    })) as Product[];
  } catch (err) {
    handleDbException('fetchProducts', 'products', err);
    return null;
  }
}

export async function upsertProduct(product: Product): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await resilientUpsert('products', product);

    if (error) {
      handleDbError('upsertProduct', 'products', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('upsertProduct', 'products', err);
    return false;
  }
}

export async function deleteReviewsByProductIdFromDb(productId: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    // Delete from both camelCase and snake_case column representations
    await supabase.from('reviews').delete().eq('productId', productId);
    await supabase.from('reviews').delete().eq('product_id', productId);
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception deleting reviews by productId:', err);
    return false;
  }
}

export async function deleteSuccessStoriesByProductIdFromDb(productId: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    // Delete from both camelCase and snake_case column representations
    await supabase.from('success_stories').delete().eq('productId', productId);
    await supabase.from('success_stories').delete().eq('product_id', productId);
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception deleting success stories by productId:', err);
    return false;
  }
}

export async function deleteProductFromDb(id: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  const cleanId = String(id || '').trim();
  if (!cleanId) return false;

  try {
    // Dynamically import storage cleanup to prevent circular dependencies
    const { 
      cleanupProductVideoBlobsOnDeletion, 
      deleteFileFromStorage, 
      deleteProductMedia 
    } = await import('./storageCleanup');

    // 1. Storage purge & verification: verify and purge all video blobs associated with child success stories
    // with persistent journal protection against interrupted signals
    try {
      await cleanupProductVideoBlobsOnDeletion(cleanId);
    } catch (e) {
      console.warn('[deleteProductFromDb] Non-blocking warning during video blob verification cleanup:', e);
    }

    // 2. Storage purge: query and delete all customer review media (avatars and review photos)
    try {
      let { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('productId', cleanId);

      if (!reviewsData || reviewsData.length === 0) {
        const fallback = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', cleanId);
        if (fallback.data && fallback.data.length > 0) {
          reviewsData = fallback.data;
        }
      }

      if (reviewsData && reviewsData.length > 0) {
        console.log(`[Storage Cleanup] Purging media files for ${reviewsData.length} child reviews of product '${cleanId}'...`);
        for (const rev of reviewsData) {
          const avatar = rev.avatarUrl || rev.avatar_url;
          const img = rev.imageUrl || rev.image_url;
          if (avatar) await deleteFileFromStorage(avatar).catch(() => {});
          if (img) await deleteFileFromStorage(img).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[deleteProductFromDb] Non-blocking warning during review media purge:', e);
    }

    // 3. Storage purge: query and delete product's own images and GIFs
    try {
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (prodData) {
        await deleteProductMedia(prodData).catch(() => {});
      }
    } catch (e) {
      console.warn('[deleteProductFromDb] Non-blocking warning during product media purge:', e);
    }

    // 4. Cascading cleanup: delete child reviews from database
    await deleteReviewsByProductIdFromDb(cleanId);

    // 5. Cascading cleanup: delete child video success stories from database
    await deleteSuccessStoriesByProductIdFromDb(cleanId);

    // 6. Delete product listing from products table
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', cleanId);

    if (error) {
      console.error('[deleteProductFromDb] Supabase error deleting product:', error);
      handleDbError('deleteProduct', 'products', error);
      return false;
    }

    console.log(`[deleteProductFromDb] Successfully deleted product '${cleanId}' and all child relations.`);
    return true;
  } catch (err) {
    handleDbException('deleteProduct', 'products', err);
    return false;
  }
}

// ==========================================
// MOBILE PRODUCT CATALOG CRUD HELPERS
// ==========================================
export async function fetchMobileProducts(): Promise<Product[] | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const { data, error } = await supabase
      .from('mobile_products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      // If mobile_products table not created yet, try store_configs fallback
      if (error.code === '42P01') {
        const configFallback = await fetchConfigFromDb<Product[]>('mobile_products_catalog');
        if (configFallback && Array.isArray(configFallback)) {
          return configFallback;
        }
      } else {
        console.warn('Supabase fetchMobileProducts error:', error);
      }
      return null;
    }

    return (data || []).map((row: any) => ({
      ...row,
      shippingWarranty: row.shippingWarranty ?? row.shipping_warranty ?? undefined,
      showFeatures: row.showFeatures !== undefined ? Boolean(row.showFeatures) : (row.show_features !== undefined ? Boolean(row.show_features) : true),
      showSpecs: row.showSpecs !== undefined ? Boolean(row.showSpecs) : (row.show_specs !== undefined ? Boolean(row.show_specs) : true),
      showShippingWarranty: row.showShippingWarranty !== undefined ? Boolean(row.showShippingWarranty) : (row.show_shipping_warranty !== undefined ? Boolean(row.show_shipping_warranty) : true),
    })) as Product[];
  } catch (err) {
    handleDbException('fetchMobileProducts', 'mobile_products', err);
    return null;
  }
}

export async function upsertMobileProduct(product: Product): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await resilientUpsert('mobile_products', product);

    if (error) {
      // If table doesn't exist, also backup to store_configs
      handleDbError('upsertMobileProduct', 'mobile_products', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('upsertMobileProduct', 'mobile_products', err);
    return false;
  }
}

export async function deleteMobileProductFromDb(id: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  const cleanId = String(id || '').trim();
  if (!cleanId) return false;

  try {
    // 1. Storage purge: dynamically import storage cleanup
    const { deleteProductMedia } = await import('./storageCleanup');
    try {
      const { data: prodData } = await supabase
        .from('mobile_products')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (prodData) {
        await deleteProductMedia(prodData).catch(() => {});
      }
    } catch (e) {
      console.warn('[deleteMobileProductFromDb] Non-blocking warning during media purge:', e);
    }

    // 2. Cascade cleanup child reviews/stories if any
    await deleteReviewsByProductIdFromDb(cleanId);
    await deleteSuccessStoriesByProductIdFromDb(cleanId);

    // 3. Delete from mobile_products table
    const { error } = await supabase
      .from('mobile_products')
      .delete()
      .eq('id', cleanId);

    if (error) {
      handleDbError('deleteMobileProduct', 'mobile_products', error);
      return false;
    }

    console.log(`[deleteMobileProductFromDb] Successfully deleted mobile product '${cleanId}'.`);
    return true;
  } catch (err) {
    handleDbException('deleteMobileProduct', 'mobile_products', err);
    return false;
  }
}

export async function saveAllMobileProductsToDb(productsList: Product[]): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    for (const p of productsList) {
      await upsertMobileProduct(p);
    }
    // Also save copy to store_configs as backup
    await saveConfigToDb('mobile_products_catalog', productsList);
    return true;
  } catch (err) {
    console.warn('saveAllMobileProductsToDb notice:', err);
    return false;
  }
}

export const SUPABASE_MOBILE_PRODUCTS_TABLE_SQL = `-- =============================================================================
-- MOBILE PRODUCTS TABLE SQL SETUP SCRIPT
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.mobile_products (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "sku" TEXT,
  "price" NUMERIC NOT NULL,
  "compareAtPrice" NUMERIC,
  "costPrice" NUMERIC,
  "category" TEXT NOT NULL,
  "images" JSONB DEFAULT '[]'::jsonb,
  "gifUrls" JSONB DEFAULT '[]'::jsonb,
  "description" TEXT,
  "shortDescription" TEXT,
  "features" JSONB DEFAULT '[]'::jsonb,
  "specifications" JSONB DEFAULT '[]'::jsonb,
  "stock" INT DEFAULT 0,
  "isWinningProduct" BOOLEAN DEFAULT false,
  "isBestSeller" BOOLEAN DEFAULT false,
  "isTrending" BOOLEAN DEFAULT false,
  "status" TEXT DEFAULT 'Active',
  "rating" NUMERIC DEFAULT 5.0,
  "reviewCount" INT DEFAULT 0,
  "badge" TEXT,
  "codAllowed" BOOLEAN DEFAULT true,
  "shippingWarranty" TEXT,
  "showFeatures" BOOLEAN DEFAULT true,
  "showSpecs" BOOLEAN DEFAULT true,
  "showShippingWarranty" BOOLEAN DEFAULT true,
  "createdAt" TEXT
);

-- Ensure all columns exist
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "subtitle" TEXT;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "compareAtPrice" NUMERIC;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "costPrice" NUMERIC;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "gifUrls" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "features" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "specifications" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "isWinningProduct" BOOLEAN DEFAULT false;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "isBestSeller" BOOLEAN DEFAULT false;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "isTrending" BOOLEAN DEFAULT false;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "badge" TEXT;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "codAllowed" BOOLEAN DEFAULT true;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "shippingWarranty" TEXT;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "showFeatures" BOOLEAN DEFAULT true;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "showSpecs" BOOLEAN DEFAULT true;
ALTER TABLE public.mobile_products ADD COLUMN IF NOT EXISTS "showShippingWarranty" BOOLEAN DEFAULT true;

-- Enable Row Level Security (RLS) and public access
ALTER TABLE public.mobile_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Mobile Products" ON public.mobile_products;
CREATE POLICY "Public Read/Write Mobile Products" ON public.mobile_products FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.mobile_products TO anon;
GRANT ALL ON public.mobile_products TO authenticated;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
`;

export async function fetchOrders(): Promise<Order[] | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn('Supabase fetchOrders error:', error);
      return null;
    }
    return data as Order[];
  } catch (err) {
    console.warn('Supabase fetchOrders exception:', err);
    return null;
  }
}

export async function upsertOrder(order: Order): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await resilientUpsert('orders', order);

    if (error) {
      handleDbError('upsertOrder', 'orders', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('upsertOrder', 'orders', err);
    return false;
  }
}

export async function deleteOrderFromDb(orderId: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      handleDbError('deleteOrder', 'orders', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('deleteOrder', 'orders', err);
    return false;
  }
}

export async function fetchPromos(): Promise<PromoCode[] | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const { data, error } = await supabase
      .from('promos')
      .select('*');

    if (error) {
      console.warn('Supabase fetchPromos error:', error);
      return null;
    }
    return data as PromoCode[];
  } catch (err) {
    console.warn('Supabase fetchPromos exception:', err);
    return null;
  }
}

export async function upsertPromo(promo: PromoCode): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await resilientUpsert('promos', promo);

    if (error) {
      handleDbError('upsertPromo', 'promos', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('upsertPromo', 'promos', err);
    return false;
  }
}

export async function deletePromoFromDb(code: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await supabase
      .from('promos')
      .delete()
      .eq('code', code);

    if (error) {
      handleDbError('deletePromo', 'promos', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('deletePromo', 'promos', err);
    return false;
  }
}

export async function fetchSupportInquiries(): Promise<SupportInquiry[] | null> {
  try {
    let { data, error } = await supabase
      .from('support_inquiries')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error && error.code === 'PGRST204') {
      const fallback = await supabase.from('support_inquiries').select('*');
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      handleDbError('fetchSupportInquiries', 'support_inquiries', error);
      return null;
    }
    return data as SupportInquiry[];
  } catch (err) {
    handleDbException('fetchSupportInquiries', 'support_inquiries', err);
    return null;
  }
}

export async function upsertSupportInquiry(inquiry: SupportInquiry): Promise<boolean> {
  try {
    const payload: Record<string, any> = {
      id: inquiry.id,
      createdAt: inquiry.createdAt || new Date().toISOString(),
      name: inquiry.name || 'Customer',
      email: inquiry.email || '',
      category: inquiry.category || 'General Question',
      subject: inquiry.subject || 'Customer Inquiry',
      orderNumber: inquiry.orderNumber || null,
      message: inquiry.message || '',
      status: inquiry.status || 'New',
      adminReply: inquiry.adminReply || null
    };

    // Only include adminRepliedAt if present and not in known missing columns
    if (inquiry.adminRepliedAt && !knownMissingColumns.has('support_inquiries:adminRepliedAt')) {
      payload.adminRepliedAt = inquiry.adminRepliedAt;
    }

    const { error } = await resilientUpsert('support_inquiries', payload);

    if (error) {
      handleDbError('upsertSupportInquiry', 'support_inquiries', error);
      return false;
    }
    isSupabaseHostReachable = true;
    return true;
  } catch (err) {
    handleDbException('upsertSupportInquiry', 'support_inquiries', err);
    return false;
  }
}

export async function deleteSupportInquiryFromDb(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('support_inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      handleDbError('deleteSupportInquiryFromDb', 'support_inquiries', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('deleteSupportInquiryFromDb', 'support_inquiries', err);
    return false;
  }
}

export async function fetchReviews(): Promise<ProductReview[] | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*');

    if (error) {
      console.warn('Supabase fetchReviews error:', error);
      return null;
    }
    if (!data) return [];
    
    return (data as any[]).map((row) => ({
      id: String(row.id || ''),
      productId: String(row.productId || row.product_id || ''),
      author: String(row.author || 'Customer'),
      rating: Number(row.rating ?? 5),
      date: String(row.date || row.created_at || ''),
      title: String(row.title || ''),
      comment: String(row.comment || ''),
      verified: row.verified !== undefined ? Boolean(row.verified) : true,
      avatarUrl: row.avatarUrl || row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      imageUrl: row.imageUrl || row.image_url || undefined,
      helpfulCount: Number(row.helpfulCount ?? row.helpful_count ?? 0)
    }));
  } catch (err) {
    console.warn('Supabase fetchReviews exception:', err);
    return null;
  }
}

export async function upsertReview(review: ProductReview): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const payload: Record<string, any> = {
      id: review.id,
      productId: review.productId,
      product_id: review.productId,
      author: review.author,
      rating: review.rating,
      date: review.date,
      title: review.title,
      comment: review.comment,
      verified: review.verified,
      avatarUrl: review.avatarUrl,
      avatar_url: review.avatarUrl,
      imageUrl: review.imageUrl,
      image_url: review.imageUrl,
      helpfulCount: review.helpfulCount,
      helpful_count: review.helpfulCount
    };

    const { error } = await resilientUpsert('reviews', payload);

    if (error) {
      handleDbError('upsertReview', 'reviews', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('upsertReview', 'reviews', err);
    return false;
  }
}

export async function deleteReviewFromDb(id: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      handleDbError('deleteReview', 'reviews', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('deleteReview', 'reviews', err);
    return false;
  }
}

export async function fetchChatSessions(): Promise<ChatSession[] | null> {
  try {
    let { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('lastMessageAt', { ascending: false });

    if (error && error.code === 'PGRST204') {
      const fallback = await supabase.from('chat_sessions').select('*');
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      handleDbError('fetchChatSessions', 'chat_sessions', error);
      return null;
    }
    return data as ChatSession[];
  } catch (err) {
    handleDbException('fetchChatSessions', 'chat_sessions', err);
    return null;
  }
}

export async function upsertChatSession(session: ChatSession): Promise<boolean> {
  try {
    const payload: Record<string, any> = {
      id: session.id,
      customerName: session.customerName || 'Customer',
      customerEmail: session.customerEmail || 'guest@example.com',
      customerPhone: session.customerPhone || null,
      unreadForAdmin: typeof session.unreadForAdmin === 'number' ? session.unreadForAdmin : 0,
      unreadForCustomer: typeof session.unreadForCustomer === 'number' ? session.unreadForCustomer : 0,
      lastMessageAt: session.lastMessageAt || new Date().toISOString(),
      status: session.status || 'Open',
      messages: session.messages || []
    };

    // Only include userType if not in known missing columns
    if (session.userType && !knownMissingColumns.has('chat_sessions:userType')) {
      payload.userType = session.userType;
    }

    // Only include createdAt if explicitly present and not in known missing columns
    if (session.createdAt && !knownMissingColumns.has('chat_sessions:createdAt')) {
      payload.createdAt = session.createdAt;
    }

    const { error } = await resilientUpsert('chat_sessions', payload);

    if (error) {
      handleDbError('upsertChatSession', 'chat_sessions', error);
      return false;
    }
    isSupabaseHostReachable = true;
    return true;
  } catch (err) {
    handleDbException('upsertChatSession', 'chat_sessions', err);
    return false;
  }
}

export async function deleteChatSessionFromDb(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      handleDbError('deleteChatSessionFromDb', 'chat_sessions', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('deleteChatSessionFromDb', 'chat_sessions', err);
    return false;
  }
}

// ==========================================
// STORE_CONFIGS CLEANUP: Remove any customer profile records from store_configs
// ==========================================
export async function cleanCustomerProfilesFromStoreConfigs(): Promise<void> {
  if (isSupabaseHostReachable === false) return;
  try {
    // Delete all keys matching customer profile patterns from store_configs
    await supabase
      .from('store_configs')
      .delete()
      .or('key.ilike.%customer_profile%,key.ilike.%customerProfile%,key.ilike.%customer_user%');
  } catch {
    // Fallback individual deletes
    try {
      await supabase.from('store_configs').delete().ilike('key', '%customer_profile%');
      await supabase.from('store_configs').delete().ilike('key', '%customerProfile%');
      await supabase.from('store_configs').delete().ilike('key', '%customer_user%');
    } catch {
      // Non-blocking
    }
  }
}

export async function fetchCustomerProfileFromDb(email: string): Promise<CustomerProfile | null> {
  if (isSupabaseHostReachable === false || !email) return null;
  const cleanEmail = email.toLowerCase().trim();
  
  // Proactively clean up any stale customer records from store_configs
  cleanCustomerProfilesFromStoreConfigs().catch(() => {});

  // 1. Query exclusively the single dedicated 'customer_profile' table
  try {
    const { data, error } = await supabase
      .from('customer_profile')
      .select('*')
      .or(`email.eq.${cleanEmail},email.ilike.${cleanEmail}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      return {
        email: cleanEmail,
        name: row.name || row.full_name || row.fullName || row.customer_name || '',
        phone: row.phone || row.phone_number || row.phoneNumber || row.contact_phone || '',
        address: row.address || row.street || row.street_address || row.address1 || '',
        city: row.city || '',
        state: row.state || row.province || row.state_province || '',
        zipCode: row.zipCode || row.zip_code || row.zipcode || row.postal_code || row.zip || '',
        country: row.country || 'United States',
        createdAt: row.createdAt || row.created_at || new Date().toISOString()
      };
    }
  } catch (err) {
    handleDbException('fetchCustomerProfileFromDb', 'customer_profile', err);
  }

  return null;
}

export async function upsertCustomerProfileToDb(profile: CustomerProfile): Promise<boolean> {
  if (!profile || !profile.email) return false;
  const cleanEmail = profile.email.toLowerCase().trim();

  const normalizedProfile: CustomerProfile = {
    email: cleanEmail,
    name: profile.name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    zipCode: profile.zipCode || '',
    country: profile.country || 'United States',
    createdAt: profile.createdAt || new Date().toISOString()
  };

  // Candidate payload structures to match camelCase, snake_case, or lowercase schemas in 'customer_profile'
  const candidatePayloads = [
    // 1. camelCase columns (standard schema)
    {
      email: cleanEmail,
      name: normalizedProfile.name,
      phone: normalizedProfile.phone,
      address: normalizedProfile.address,
      city: normalizedProfile.city,
      state: normalizedProfile.state,
      zipCode: normalizedProfile.zipCode,
      country: normalizedProfile.country,
      createdAt: normalizedProfile.createdAt,
      updatedAt: new Date().toISOString()
    },
    // 2. snake_case columns (PostgreSQL raw schema)
    {
      email: cleanEmail,
      name: normalizedProfile.name,
      phone: normalizedProfile.phone,
      address: normalizedProfile.address,
      city: normalizedProfile.city,
      state: normalizedProfile.state,
      zip_code: normalizedProfile.zipCode,
      country: normalizedProfile.country,
      created_at: normalizedProfile.createdAt,
      updated_at: new Date().toISOString()
    },
    // 3. Compact lowercase columns
    {
      email: cleanEmail,
      name: normalizedProfile.name,
      phone: normalizedProfile.phone,
      address: normalizedProfile.address,
      city: normalizedProfile.city,
      state: normalizedProfile.state,
      zipcode: normalizedProfile.zipCode,
      country: normalizedProfile.country,
      created_at: normalizedProfile.createdAt,
      updated_at: new Date().toISOString()
    },
    // 4. Alternative column names (full_name, phone_number, street_address)
    {
      email: cleanEmail,
      full_name: normalizedProfile.name,
      phone_number: normalizedProfile.phone,
      street_address: normalizedProfile.address,
      city: normalizedProfile.city,
      state: normalizedProfile.state,
      zip_code: normalizedProfile.zipCode,
      country: normalizedProfile.country,
      created_at: normalizedProfile.createdAt,
      updated_at: new Date().toISOString()
    },
    // 5. Core standard fields
    {
      email: cleanEmail,
      name: normalizedProfile.name,
      phone: normalizedProfile.phone,
      address: normalizedProfile.address,
      city: normalizedProfile.city,
      state: normalizedProfile.state,
      country: normalizedProfile.country
    }
  ];

  let savedSuccessfully = false;
  const tableName = 'customer_profile'; // Exclusively the single customer_profile table

  // Check if a record exists in customer_profile
  let existingRow: any = null;

  try {
    const { data, error: selectErr } = await supabase
      .from(tableName)
      .select('*')
      .or(`email.eq.${cleanEmail},email.ilike.${cleanEmail}`)
      .limit(1);

    if (!selectErr && data && data.length > 0) {
      existingRow = data[0];
    }
  } catch (e) {
    // ignore select error
  }

  for (const basePayload of candidatePayloads) {
    if (savedSuccessfully) break;
    const payload = { ...basePayload };

    // If existing row has an id, include it
    if (existingRow && existingRow.id !== undefined) {
      (payload as any).id = existingRow.id;
    }

    // A. If row exists: perform UPDATE on customer_profile
    if (existingRow) {
      for (let retry = 0; retry < 4; retry++) {
        const { error: updateErr } = await supabase
          .from(tableName)
          .update(payload as any)
          .or(`email.eq.${cleanEmail},email.ilike.${cleanEmail}`);

        if (!updateErr) {
          savedSuccessfully = true;
          isSupabaseHostReachable = true;
          break;
        }

        // Auto-strip missing column if PGRST204 occurs
        if (updateErr.code === 'PGRST204' && updateErr.message) {
          const match = updateErr.message.match(/Could not find the '([^']+)' column/i);
          if (match && match[1] && match[1] in payload) {
            delete (payload as any)[match[1]];
            continue;
          }
        }
        break;
      }
    } else {
      // B. If no row exists: perform INSERT into customer_profile
      for (let retry = 0; retry < 4; retry++) {
        const { error: insertErr } = await supabase
          .from(tableName)
          .insert(payload as any);

        if (!insertErr) {
          savedSuccessfully = true;
          isSupabaseHostReachable = true;
          break;
        }

        // If duplicate key error (23505), switch to UPDATE
        if (insertErr.code === '23505') {
          const { error: fallbackUpdateErr } = await supabase
            .from(tableName)
            .update(payload as any)
            .or(`email.eq.${cleanEmail},email.ilike.${cleanEmail}`);

          if (!fallbackUpdateErr) {
            savedSuccessfully = true;
            isSupabaseHostReachable = true;
            break;
          }
        }

        // Auto-strip missing column if PGRST204 occurs
        if (insertErr.code === 'PGRST204' && insertErr.message) {
          const match = insertErr.message.match(/Could not find the '([^']+)' column/i);
          if (match && match[1] && match[1] in payload) {
            delete (payload as any)[match[1]];
            continue;
          }
        }
        break;
      }
    }

    // C. Fallback attempt: UPSERT directly
    if (!savedSuccessfully) {
      try {
        const { error: upsertErr } = await supabase
          .from(tableName)
          .upsert(payload as any, { onConflict: 'email' });
        if (!upsertErr) {
          savedSuccessfully = true;
          isSupabaseHostReachable = true;
          break;
        }
      } catch (e) {
        // ignore
      }

      try {
        const { error: plainUpsertErr } = await supabase
          .from(tableName)
          .upsert(payload as any);
        if (!plainUpsertErr) {
          savedSuccessfully = true;
          isSupabaseHostReachable = true;
          break;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Always clean any legacy customer profile rows from store_configs table
  cleanCustomerProfilesFromStoreConfigs().catch(() => {});

  return savedSuccessfully;
}

// Config table helpers to save custom structures (bundleConfig, promoPopupConfig, paymentSettings)
export async function saveConfigToDb(key: string, value: any): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;

  // STRICT RULE: Customer profile data is NEVER stored in store_configs
  if (key.toLowerCase().includes('customer_profile') || key.toLowerCase().includes('customerprofile') || key.toLowerCase().includes('customer_user')) {
    console.warn(`[Supabase] Customer profile data '${key}' is strictly managed in the 'customer_profile' table, not in store_configs.`);
    return false;
  }

  try {
    const { error } = await supabase
      .from('store_configs')
      .upsert({
        key,
        value,
        updatedAt: new Date().toISOString()
      });

    if (error) {
      handleDbError(`saveConfigToDb (${key})`, 'store_configs', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException(`saveConfigToDb (${key})`, 'store_configs', err);
    return false;
  }
}

export async function fetchConfigFromDb<T>(key: string): Promise<T | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const { data, error } = await supabase
      .from('store_configs')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      return null;
    }
    return data?.value as T;
  } catch (err) {
    return null;
  }
}

// ==========================================
// SOCIAL MEDIA SETTINGS HELPERS
// ==========================================
export async function fetchSocialSettings(): Promise<SocialSettings | null> {
  return await fetchConfigFromDb<SocialSettings>('social_settings');
}

export async function saveSocialSettings(settings: SocialSettings): Promise<boolean> {
  return await saveConfigToDb('social_settings', settings);
}

// ==========================================
// SHIPPING & DELIVERY SETTINGS HELPERS
// ==========================================
export async function fetchShippingSettings(): Promise<ShippingSettings | null> {
  return await fetchConfigFromDb<ShippingSettings>('shipping_settings');
}

export async function saveShippingSettings(settings: ShippingSettings): Promise<boolean> {
  return await saveConfigToDb('shipping_settings', settings);
}

// Success Stories table helpers
function mapSuccessStoryRow(row: any): SuccessStory {
  return {
    id: String(row.id || ''),
    productId: String(row.productId || row.product_id || ''),
    customerName: String(row.customerName || row.customer_name || 'Customer'),
    customerRoleOrLocation: String(row.customerRoleOrLocation || row.customer_role_or_location || 'Verified Buyer'),
    storyText: String(row.storyText || row.story_text || ''),
    videoUrl: String(row.videoUrl || row.video_url || ''),
    rating: Number(row.rating ?? 5),
    verified: row.verified !== undefined ? Boolean(row.verified) : true,
    orderNumber: row.orderNumber || row.order_number || undefined,
    published: row.published !== undefined ? Boolean(row.published) : true,
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString())
  };
}

export async function fetchSuccessStories(): Promise<SuccessStory[] | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    let { data, error } = await supabase
      .from('success_stories')
      .select('*')
      .order('createdAt', { ascending: false });

    // If 'createdAt' does not exist in schema cache, try snake_case 'created_at' or default select
    if (error && error.code === 'PGRST204') {
      const fallback = await supabase
        .from('success_stories')
        .select('*');
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      if (error.code !== '42P01') {
        console.warn('Supabase fetchSuccessStories error:', error);
      }
      return null;
    }

    if (!data) return [];
    return (data as any[]).map(mapSuccessStoryRow);
  } catch (err) {
    handleDbException('fetchSuccessStories', 'success_stories', err);
    return null;
  }
}

export async function upsertSuccessStory(story: SuccessStory): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const payload: Record<string, any> = {
      id: story.id,
      productId: story.productId,
      product_id: story.productId,
      customerName: story.customerName,
      customer_name: story.customerName,
      customerRoleOrLocation: story.customerRoleOrLocation,
      customer_role_or_location: story.customerRoleOrLocation,
      storyText: story.storyText,
      story_text: story.storyText,
      videoUrl: story.videoUrl,
      video_url: story.videoUrl,
      rating: story.rating,
      verified: story.verified,
      published: story.published,
      createdAt: story.createdAt,
      created_at: story.createdAt
    };
    if (story.orderNumber) {
      payload.orderNumber = story.orderNumber;
      payload.order_number = story.orderNumber;
    }

    const { error } = await resilientUpsert('success_stories', payload);

    if (error) {
      handleDbError('upsertSuccessStory', 'success_stories', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('upsertSuccessStory', 'success_stories', err);
    return false;
  }
}

export async function deleteSuccessStoryFromDb(id: string): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  const cleanId = String(id || '').trim();
  if (!cleanId) return false;

  try {
    // Dynamically import storage cleanup to prevent circular dependencies
    const { cleanupStoryVideoBlobsOnDeletion } = await import('./storageCleanup');

    // 1. Specifically verify and delete video blobs from Supabase storage buckets
    // with persistent journal protection against interrupted signals
    try {
      await cleanupStoryVideoBlobsOnDeletion(cleanId);
    } catch (e) {
      console.warn('[deleteSuccessStoryFromDb] Warning during video blob verification cleanup:', e);
    }

    // 2. Delete row from success_stories table
    const { error } = await supabase
      .from('success_stories')
      .delete()
      .eq('id', cleanId);

    if (error) {
      handleDbError('deleteSuccessStoryFromDb', 'success_stories', error);
      return false;
    }

    console.log(`[deleteSuccessStoryFromDb] Successfully deleted success story row: ${cleanId}`);
    return true;
  } catch (err) {
    handleDbException('deleteSuccessStoryFromDb', 'success_stories', err);
    return false;
  }
}

// ==========================================
// STORE BRANDING / LOGO HELPERS
// ==========================================
export async function fetchStoreBranding(): Promise<StoreBrandingConfig | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    // 1. Try fetching from dedicated store_branding table
    const { data, error } = await supabase
      .from('store_branding')
      .select('*')
      .eq('id', 'current')
      .single();

    if (!error && data) {
      return {
        id: data.id || 'current',
        storeName: data.storeName || (data as any).store_name || 'LUMINA',
        storeNameFont: data.storeNameFont || (data as any).store_name_font || 'serif',
        storeNameSize: Number(data.storeNameSize ?? (data as any).store_name_size) || 24,
        storeNameColor: data.storeNameColor || (data as any).store_name_color || '#0f172a',
        storeNameWeight: data.storeNameWeight || (data as any).store_name_weight || 'black',
        subtitle: data.subtitle || 'WINNING PRODUCTS',
        subtitleFontSize: Number(data.subtitleFontSize ?? (data as any).subtitle_font_size) || 10,
        subtitleColor: data.subtitleColor || (data as any).subtitle_color || '#d97706',
        subtitleFontWeight: data.subtitleFontWeight || (data as any).subtitle_font_weight || 'extrabold',
        subtitleLetterSpacing: data.subtitleLetterSpacing || (data as any).subtitle_letter_spacing || 'widest',
        subtitleStyle: data.subtitleStyle || (data as any).subtitle_style || 'normal',
        subtitleTransform: data.subtitleTransform || (data as any).subtitle_transform || 'uppercase',
        logoType: data.logoType || (data as any).logo_type || 'icon',
        logoImageUrl: data.logoImageUrl || (data as any).logo_image_url || '',
        logoIcon: data.logoIcon || (data as any).logo_icon || 'sparkles',
        logoGradient: data.logoGradient || (data as any).logo_gradient || 'from-amber-500 via-orange-500 to-red-500',
        logoHeight: Number(data.logoHeight ?? (data as any).logo_height) || 40,
        logoRounded: data.logoRounded || (data as any).logo_rounded || 'xl',
        updatedAt: data.updatedAt || (data as any).updated_at
      } as StoreBrandingConfig;
    }

    // 2. Fallback to store_configs key 'branding' only if store_branding is empty or unavailable
    const fromConfig = await fetchConfigFromDb<StoreBrandingConfig>('branding');
    if (fromConfig) {
      return fromConfig;
    }

    return null;
  } catch (err) {
    console.warn('Supabase fetchStoreBranding exception:', err);
    return null;
  }
}

export async function saveStoreBranding(branding: StoreBrandingConfig): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const payloadCamel = {
      id: 'current',
      storeName: branding.storeName || 'LUMINA',
      storeNameFont: branding.storeNameFont || 'serif',
      storeNameSize: branding.storeNameSize || 24,
      storeNameColor: branding.storeNameColor || '#0f172a',
      storeNameWeight: branding.storeNameWeight || 'black',
      subtitle: branding.subtitle || 'WINNING PRODUCTS',
      subtitleFontSize: branding.subtitleFontSize || 10,
      subtitleColor: branding.subtitleColor || '#d97706',
      subtitleFontWeight: branding.subtitleFontWeight || 'extrabold',
      subtitleLetterSpacing: branding.subtitleLetterSpacing || 'widest',
      subtitleStyle: branding.subtitleStyle || 'normal',
      subtitleTransform: branding.subtitleTransform || 'uppercase',
      logoType: branding.logoType || 'icon',
      logoImageUrl: branding.logoImageUrl || '',
      logoIcon: branding.logoIcon || 'sparkles',
      logoGradient: branding.logoGradient || 'from-amber-500 via-orange-500 to-red-500',
      logoHeight: branding.logoHeight || 40,
      logoRounded: branding.logoRounded || 'xl',
      updatedAt: new Date().toISOString()
    };

    // 1. Save to dedicated store_branding table (camelCase)
    let { error: brandingTableError } = await supabase
      .from('store_branding')
      .upsert(payloadCamel);

    // If there is a column case difference in Postgres (e.g. table was created with snake_case columns)
    if (brandingTableError && String(brandingTableError.message || '').toLowerCase().includes('column')) {
      const payloadSnake = {
        id: 'current',
        store_name: payloadCamel.storeName,
        store_name_font: payloadCamel.storeNameFont,
        store_name_size: payloadCamel.storeNameSize,
        store_name_color: payloadCamel.storeNameColor,
        store_name_weight: payloadCamel.storeNameWeight,
        subtitle: payloadCamel.subtitle,
        subtitle_font_size: payloadCamel.subtitleFontSize,
        subtitle_color: payloadCamel.subtitleColor,
        subtitle_font_weight: payloadCamel.subtitleFontWeight,
        subtitle_letter_spacing: payloadCamel.subtitleLetterSpacing,
        subtitle_style: payloadCamel.subtitleStyle,
        subtitle_transform: payloadCamel.subtitleTransform,
        logo_type: payloadCamel.logoType,
        logo_image_url: payloadCamel.logoImageUrl,
        logo_icon: payloadCamel.logoIcon,
        logo_gradient: payloadCamel.logoGradient,
        logo_height: payloadCamel.logoHeight,
        logo_rounded: payloadCamel.logoRounded,
        updated_at: payloadCamel.updatedAt
      };
      const snakeRes = await supabase.from('store_branding').upsert(payloadSnake);
      if (!snakeRes.error) {
        brandingTableError = null;
      }
    }

    if (!brandingTableError) {
      // Successfully saved to store_branding table!
      // Clean up any duplicate 'branding' row in store_configs to prevent data duplication
      try {
        await supabase.from('store_configs').delete().eq('key', 'branding');
      } catch {
        // Non-blocking cleanup
      }
      return true;
    }

    // 2. Only fallback to store_configs if store_branding table does not exist or completely failed
    handleDbError('saveStoreBranding (store_branding table)', 'store_branding', brandingTableError);
    await saveConfigToDb('branding', payloadCamel);

    return true;
  } catch (err) {
    handleDbException('saveStoreBranding', 'store_branding', err);
    return false;
  }
}

// ==========================================
// DESKTOP HERO SECTION HELPERS
// ==========================================
export async function fetchDesktopHeroConfig(): Promise<DesktopHeroConfig | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const config = await fetchConfigFromDb<DesktopHeroConfig>('desktop_hero_config');
    if (config) {
      return config;
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchDesktopHeroConfig exception:', err);
    return null;
  }
}

export async function saveDesktopHeroConfig(config: DesktopHeroConfig): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const payload = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    return await saveConfigToDb('desktop_hero_config', payload);
  } catch (err) {
    console.warn('Supabase saveDesktopHeroConfig exception:', err);
    return false;
  }
}

export async function deleteDesktopHeroConfigFromDb(): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await supabase
      .from('store_configs')
      .delete()
      .eq('key', 'desktop_hero_config');

    if (error) {
      handleDbError('deleteDesktopHeroConfigFromDb', 'store_configs', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('deleteDesktopHeroConfigFromDb', 'store_configs', err);
    return false;
  }
}

// ==========================================
// MOBILE HERO SECTION HELPERS
// ==========================================
export async function fetchMobileHeroConfig(): Promise<MobileHeroConfig | null> {
  if (isSupabaseHostReachable === false) return null;
  try {
    const config = await fetchConfigFromDb<MobileHeroConfig>('mobile_hero_config');
    if (config) {
      return config;
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchMobileHeroConfig exception:', err);
    return null;
  }
}

export async function saveMobileHeroConfig(config: MobileHeroConfig): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const payload = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    return await saveConfigToDb('mobile_hero_config', payload);
  } catch (err) {
    console.warn('Supabase saveMobileHeroConfig exception:', err);
    return false;
  }
}

export async function deleteMobileHeroConfigFromDb(): Promise<boolean> {
  if (isSupabaseHostReachable === false) return false;
  try {
    const { error } = await supabase
      .from('store_configs')
      .delete()
      .eq('key', 'mobile_hero_config');

    if (error) {
      handleDbError('deleteMobileHeroConfigFromDb', 'store_configs', error);
      return false;
    }
    return true;
  } catch (err) {
    handleDbException('deleteMobileHeroConfigFromDb', 'store_configs', err);
    return false;
  }
}

// =============================================================================
// MOBILE HERO SQL SCHEMA & STORE_CONFIGS SETUP (OPTIONAL MANUAL RUN IN SQL EDITOR)
// =============================================================================
export const SUPABASE_MOBILE_HERO_SQL = `-- =============================================================================
-- LUMINA STORE - MOBILE & DESKTOP HERO SETTINGS SQL SETUP
-- Run this in your Supabase SQL Editor if you want to verify or initialize tables:
-- https://supabase.com/dashboard/project/_/sql/new
-- =============================================================================

-- 1. Ensure the store_configs table exists for storing key-value JSON configurations
CREATE TABLE IF NOT EXISTS public.store_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) and allow public read/write access for store configs
ALTER TABLE public.store_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Store Configs" ON public.store_configs;
CREATE POLICY "Public Read Store Configs" ON public.store_configs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Store Configs" ON public.store_configs;
CREATE POLICY "Public Insert Store Configs" ON public.store_configs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Store Configs" ON public.store_configs;
CREATE POLICY "Public Update Store Configs" ON public.store_configs
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete Store Configs" ON public.store_configs;
CREATE POLICY "Public Delete Store Configs" ON public.store_configs
  FOR DELETE USING (true);

-- 3. Initial Seed for Mobile Hero Config (Default Showcase selected)
INSERT INTO public.store_configs (key, value)
VALUES (
  'mobile_hero_config',
  '{
    "activeHeroType": "default",
    "imageUrl": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1000&q=85",
    "imageAltText": "Featured Mobile Deals & Innovations",
    "viewFitting": "fit_screen",
    "maxHeightVh": 75,
    "button1": {
      "id": "button_1",
      "name": "Action Button 1 (Primary / Top)",
      "enabled": true,
      "actionType": "product_page",
      "productId": "prod-001",
      "x": 10,
      "y": 65,
      "width": 80,
      "height": 10,
      "borderRadius": 14,
      "glowColor": "amber"
    },
    "button2": {
      "id": "button_2",
      "name": "Action Button 2 (Secondary / Bottom)",
      "enabled": true,
      "actionType": "catalog",
      "productId": "prod-007",
      "x": 10,
      "y": 78,
      "width": 80,
      "height": 10,
      "borderRadius": 14,
      "glowColor": "cyan"
    }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
`;

// =============================================================================
// COMPLETE SUPABASE SQL SCRIPT FOR STORAGE BUCKETS & AUTOMATIC CASCADE DELETION
// Run this in your Supabase SQL Editor:
// https://supabase.com/dashboard/project/_/sql/new
// =============================================================================
export const SUPABASE_STORAGE_AND_CASCADE_CLEANUP_SQL = `-- =============================================================================
-- SUPABASE STORAGE BUCKETS & DATABASE CASCADE DELETION SETUP
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- 1. Ensure all storage buckets exist and are publicly accessible
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('products', 'products', true, 52428800),
  ('product-media', 'product-media', true, 52428800),
  ('images', 'images', true, 52428800),
  ('videos', 'videos', true, 104857600),
  ('success-stories', 'success-stories', true, 104857600)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Objects Policies: Allow SELECT, INSERT, UPDATE, DELETE for public/anon/authenticated
DROP POLICY IF EXISTS "Public Storage Objects Select" ON storage.objects;
CREATE POLICY "Public Storage Objects Select" ON storage.objects
  FOR SELECT USING (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

DROP POLICY IF EXISTS "Public Storage Objects Insert" ON storage.objects;
CREATE POLICY "Public Storage Objects Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

DROP POLICY IF EXISTS "Public Storage Objects Update" ON storage.objects;
CREATE POLICY "Public Storage Objects Update" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

DROP POLICY IF EXISTS "Public Storage Objects Delete" ON storage.objects;
CREATE POLICY "Public Storage Objects Delete" ON storage.objects
  FOR DELETE USING (bucket_id IN ('products', 'product-media', 'images', 'videos', 'success-stories'));

-- Also drop and recreate legacy product media policies to prevent conflict
DROP POLICY IF EXISTS "Public Product Media Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Product Media Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Product Media Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Product Media Delete" ON storage.objects;

-- 3. STORE CONFIGS TABLE (for Desktop Hero Banner, Branding, Shipping, Payment, etc.)
CREATE TABLE IF NOT EXISTS store_configs (
  "key" TEXT PRIMARY KEY,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE store_configs ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Store Configs Read/Write" ON store_configs;
CREATE POLICY "Allow All Store Configs Read/Write" ON store_configs FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON store_configs TO anon;
GRANT ALL ON store_configs TO authenticated;

-- 4. Ensure reviews and success_stories tables have both camelCase and snake_case columns
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "product_id" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "image_url" TEXT;

ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "product_id" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "video_url" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customer_name" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customerRoleOrLocation" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "customer_role_or_location" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "storyText" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "story_text" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "order_number" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS "created_at" TEXT;

-- 4. Automatic Cascade Deletion Trigger on Products Table (Error-Safe):
-- When a product is deleted from the products table, safely remove related child reviews and success stories
CREATE OR REPLACE FUNCTION cascade_delete_product_relations()
RETURNS TRIGGER AS $$
BEGIN
  -- Safely cascade delete child reviews (handles missing columns gracefully)
  BEGIN
    DELETE FROM reviews WHERE "productId" = OLD.id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      DELETE FROM reviews WHERE product_id = OLD.id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END;

  -- Safely cascade delete child success stories (handles missing columns gracefully)
  BEGIN
    DELETE FROM success_stories WHERE "productId" = OLD.id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      DELETE FROM success_stories WHERE product_id = OLD.id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cascade_delete_product ON products;
CREATE TRIGGER trigger_cascade_delete_product
BEFORE DELETE ON products
FOR EACH ROW
EXECUTE FUNCTION cascade_delete_product_relations();

-- 5. Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';
`;


