import { supabase } from './supabase';

export interface ProductMediaUploadResult {
  url: string;
  source: 'supabase_bucket' | 'server_storage' | 'base64';
  filename: string;
  bucket?: string;
  size?: number;
}

/**
 * SQL snippet to create and grant public permissions to Supabase Storage buckets for product media & descriptions
 */
export const SUPABASE_PRODUCT_STORAGE_BUCKET_SQL = `-- =============================================================================
-- COMPLETE SUPABASE SQL SETUP FOR REVIEWS & STORAGE BUCKETS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =============================================================================

-- 1. Ensure the 'products' storage bucket exists & is marked public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  52428800, -- 50 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800;

-- Optional alias buckets if needed
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('product-media', 'product-media', true, 52428800),
  ('images', 'images', true, 52428800),
  ('videos', 'videos', true, 104857600)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for Storage Objects (Public Read, Insert, Update, Delete)
-- Drop old policies to avoid duplicate conflicts
DROP POLICY IF EXISTS "Public Product Media Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Product Media Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Product Media Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Product Media Delete" ON storage.objects;

CREATE POLICY "Public Product Media Select" ON storage.objects
  FOR SELECT USING (bucket_id IN ('products', 'product-media', 'images', 'videos'));

CREATE POLICY "Public Product Media Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('products', 'product-media', 'images', 'videos'));

CREATE POLICY "Public Product Media Update" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('products', 'product-media', 'images', 'videos'));

CREATE POLICY "Public Product Media Delete" ON storage.objects
  FOR DELETE USING (bucket_id IN ('products', 'product-media', 'images', 'videos'));

-- 3. REVIEWS TABLE (Ensuring all columns exist for customer DP and review product image)
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

-- Ensure both camelCase and snake_case columns exist for seamless resilience
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "product_id" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "author" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "rating" NUMERIC DEFAULT 5.0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "comment" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "image_url" TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "helpfulCount" INT DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "helpful_count" INT DEFAULT 0;

-- Row Level Security & Full Access Policy for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Access" ON reviews;
CREATE POLICY "Public Read/Write Access" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Grant full table permissions to anon & authenticated
GRANT ALL ON reviews TO anon;
GRANT ALL ON reviews TO authenticated;
`;

/**
 * Uploads an image or animated GIF directly into the Supabase database storage bucket.
 * 
 * Order of resolution:
 * 1. Supabase Storage Bucket ('products' -> 'product-media' -> 'images')
 * 2. Express Server Hosted Storage (/api/images/upload)
 * 3. Base64 fallback (safe offline resilience)
 */
export type ProductMediaFolder =
  | 'descriptions'
  | 'gallery'
  | 'gifs'
  | 'reviews'
  | 'avatars'
  | 'reviews/Avatar'
  | 'reviews/product_image'
  | string;

export async function uploadProductMediaFile(
  fileOrBlob: File | Blob,
  originalFilename?: string,
  folder: ProductMediaFolder = 'descriptions'
): Promise<ProductMediaUploadResult> {
  let fileName = originalFilename || (fileOrBlob as any).name || 'media_asset.png';
  const cleanBase = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'asset';
  
  let ext = '';
  if (fileName.includes('.')) {
    ext = `.${fileName.split('.').pop()}`;
  } else {
    const type = fileOrBlob.type;
    if (type === 'image/gif') ext = '.gif';
    else if (type === 'image/jpeg') ext = '.jpg';
    else if (type === 'image/webp') ext = '.webp';
    else if (type === 'image/svg+xml') ext = '.svg';
    else ext = '.png';
  }

  // Strict folder structure requested:
  // Customer review DP: reviews/Avatar
  // Product image of review: reviews/product_image
  let targetFolder = folder;
  if (folder === 'avatars' || folder === 'reviews/Avatar' || folder === 'Avatar') {
    targetFolder = 'reviews/Avatar';
  } else if (folder === 'reviews' || folder === 'reviews/product_image' || folder === 'reviews/product image' || folder === 'product_image') {
    targetFolder = 'reviews/product_image';
  }

  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storageFilePath = `${targetFolder}/${cleanBase}_${uniqueId}${ext}`;

  // -------------------------------------------------------------
  // STRATEGY 1: Primary - Direct Supabase Database Storage Buckets
  // -------------------------------------------------------------
  const candidateBuckets = ['products', 'product-media', 'images', 'videos'];

  for (const bucket of candidateBuckets) {
    try {
      const { data: uploadData, error: sbError } = await supabase.storage
        .from(bucket)
        .upload(storageFilePath, fileOrBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: fileOrBlob.type || (ext === '.gif' ? 'image/gif' : 'image/png')
        });

      if (!sbError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(storageFilePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          console.log(`[Supabase Storage] Successfully uploaded to bucket '${bucket}':`, publicUrlData.publicUrl);
          return {
            url: publicUrlData.publicUrl,
            source: 'supabase_bucket',
            bucket,
            filename: storageFilePath,
            size: fileOrBlob.size
          };
        }
      } else if (sbError) {
        // If bucket does not exist or unauthorized, try the next bucket in candidate list
        console.warn(`[Supabase Storage] Bucket '${bucket}' attempt:`, sbError.message);
      }
    } catch (err) {
      console.warn(`[Supabase Storage] Error querying bucket '${bucket}':`, err);
    }
  }

  // -------------------------------------------------------------
  // STRATEGY 2: Secondary - Express Server Media Storage
  // -------------------------------------------------------------
  try {
    const formData = new FormData();
    formData.append('image', fileOrBlob, `${cleanBase}_${uniqueId}${ext}`);

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data && data.success && data.url) {
        console.log('[Server Storage] Uploaded to server media directory:', data.url);
        return {
          url: data.url,
          source: 'server_storage',
          filename: data.filename || `${cleanBase}_${uniqueId}${ext}`,
          size: fileOrBlob.size
        };
      }
    }
  } catch (serverErr) {
    console.warn('[Server Storage] Multipart upload fallback warning:', serverErr);
  }

  // -------------------------------------------------------------
  // STRATEGY 3: Base64 to Server File Storage Endpoint
  // -------------------------------------------------------------
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });

    const b64Res = await fetch('/api/images/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        filename: `${cleanBase}_${uniqueId}${ext}`,
        mimeType: fileOrBlob.type
      })
    });

    if (b64Res.ok && b64Res.headers.get('content-type')?.includes('application/json')) {
      const b64Data = await b64Res.json();
      if (b64Data && b64Data.success && b64Data.url) {
        return {
          url: b64Data.url,
          source: 'server_storage',
          filename: b64Data.filename || `${cleanBase}_${uniqueId}${ext}`,
          size: fileOrBlob.size
        };
      }
    }

    // -------------------------------------------------------------
    // STRATEGY 4: Safe In-Memory Fallback
    // -------------------------------------------------------------
    return {
      url: base64 || '',
      source: 'base64',
      filename: fileName,
      size: fileOrBlob.size
    };
  } catch (fallbackErr) {
    console.warn('[ProductMediaStorage] Graceful upload fallback notice:', fallbackErr);
    return {
      url: '',
      source: 'base64',
      filename: fileName,
      size: fileOrBlob.size
    };
  }
}
