import { supabase } from './supabase';
import { deleteVideoBlob } from './videoStorage';
import { Product, ProductReview, SuccessStory } from '../types';

/**
 * Parsed storage reference representation
 */
export interface ParsedStorageItem {
  type: 'supabase' | 'server_video' | 'server_image' | 'indexeddb';
  bucket?: string;
  path?: string;
  filename?: string;
  originalUrl: string;
}

/**
 * Parses any media URL to identify its underlying storage provider and target path.
 */
export function parseStorageUrl(url: string | null | undefined): ParsedStorageItem | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. IndexedDB reference
  if (trimmed.startsWith('indexeddb:')) {
    return {
      type: 'indexeddb',
      originalUrl: trimmed,
      filename: trimmed.replace('indexeddb:', '')
    };
  }

  // 2. Server video endpoint (/api/videos/:name or /uploads/videos/:name, full URL or relative)
  const serverVideoMatch = trimmed.match(/(?:\/api\/videos\/|\/uploads\/videos\/)([^?#\s]+)/i);
  if (serverVideoMatch && serverVideoMatch[1]) {
    return {
      type: 'server_video',
      filename: decodeURIComponent(serverVideoMatch[1]),
      originalUrl: trimmed
    };
  }

  // 3. Server image endpoint (/api/images/:name or /uploads/images/:name, full URL or relative)
  const serverImageMatch = trimmed.match(/(?:\/api\/images\/|\/uploads\/images\/)([^?#\s]+)/i);
  if (serverImageMatch && serverImageMatch[1]) {
    return {
      type: 'server_image',
      filename: decodeURIComponent(serverImageMatch[1]),
      originalUrl: trimmed
    };
  }

  // 4. Supabase Storage Object URL (/storage/v1/object/public/:bucket/:path or /sign/ or /authenticated/)
  const supabaseObjectRegex = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/?#\s]+)\/([^?#\s]+)/i;
  const sbMatch = trimmed.match(supabaseObjectRegex);
  if (sbMatch && sbMatch[1] && sbMatch[2]) {
    return {
      type: 'supabase',
      bucket: sbMatch[1],
      path: decodeURIComponent(sbMatch[2]).replace(/^\/+/, ''),
      originalUrl: trimmed
    };
  }

  // 5. Supabase image render endpoint (/storage/v1/render/image/public/:bucket/:path)
  const supabaseRenderRegex = /\/storage\/v1\/render\/image\/(?:public|sign)\/([^/?#\s]+)\/([^?#\s]+)/i;
  const renderMatch = trimmed.match(supabaseRenderRegex);
  if (renderMatch && renderMatch[1] && renderMatch[2]) {
    return {
      type: 'supabase',
      bucket: renderMatch[1],
      path: decodeURIComponent(renderMatch[2]).replace(/^\/+/, ''),
      originalUrl: trimmed
    };
  }

  // 6. Direct relative storage paths (e.g. 'reviews/Avatar/...', 'reviews/product_image/...', 'descriptions/...')
  if (
    trimmed.startsWith('reviews/') ||
    trimmed.startsWith('descriptions/') ||
    trimmed.startsWith('gallery/') ||
    trimmed.startsWith('gifs/')
  ) {
    return {
      type: 'supabase',
      bucket: 'products',
      path: trimmed.replace(/^\/+/, ''),
      originalUrl: trimmed
    };
  }

  if (trimmed.includes('story_') && (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.mov') || trimmed.endsWith('.m4v'))) {
    return {
      type: 'supabase',
      bucket: 'videos',
      path: trimmed.replace(/^\/+/, ''),
      originalUrl: trimmed
    };
  }

  return null;
}

/**
 * Permanently deletes a single file from its underlying storage mechanism
 * (Supabase Storage bucket via Storage API across all potential buckets, Express server storage, or IndexedDB)
 */
export async function deleteFileFromStorage(url: string | null | undefined): Promise<boolean> {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  const trimmed = url.trim();
  const item = parseStorageUrl(trimmed);

  // If URL is external third-party (e.g. YouTube, test-videos.co.uk, unsplash), no storage purge needed
  if (!item) {
    // Check if it looks like a video filename or path
    if (trimmed.includes('story_') || trimmed.endsWith('.mp4') || trimmed.endsWith('.webm')) {
      const filename = trimmed.split('/').pop()?.split('?')[0];
      if (filename) {
        await purgeFileFromAllSupabaseBuckets(filename).catch(() => {});
        return true;
      }
    }
    return false;
  }

  try {
    if (item.type === 'indexeddb') {
      await deleteVideoBlob(item.originalUrl);
      console.log(`[Storage Cleanup] Deleted IndexedDB video blob: ${item.filename}`);
      return true;
    }

    if (item.type === 'server_video' && item.filename) {
      await fetch(`/api/videos/${encodeURIComponent(item.filename)}`, { method: 'DELETE' }).catch(() => {});
      console.log(`[Storage Cleanup] Deleted server video file: ${item.filename}`);
      // Also purge in case it was simultaneously mirrored to Supabase
      await purgeFileFromAllSupabaseBuckets(item.filename).catch(() => {});
      return true;
    }

    if (item.type === 'server_image' && item.filename) {
      await fetch(`/api/images/${encodeURIComponent(item.filename)}`, { method: 'DELETE' }).catch(() => {});
      console.log(`[Storage Cleanup] Deleted server image file: ${item.filename}`);
      await purgeFileFromAllSupabaseBuckets(item.filename).catch(() => {});
      return true;
    }

    if (item.type === 'supabase' && item.path) {
      await purgeFileFromAllSupabaseBuckets(item.path, item.bucket);
      return true;
    }
  } catch (err) {
    console.warn('[Storage Cleanup] Exception deleting file:', err);
  }

  return false;
}

/**
 * Robustly purges a file path (and any derived subfolder variants) across all Supabase buckets:
 * 'videos', 'products', 'product-media', 'images', 'success-stories'
 */
export async function purgeFileFromAllSupabaseBuckets(
  filePath: string,
  preferredBucket?: string
): Promise<boolean> {
  const cleanPath = filePath.replace(/^\/+/, '').split('?')[0];
  const decodedPath = decodeURIComponent(cleanPath);
  const baseName = decodedPath.includes('/') ? decodedPath.split('/').pop()! : decodedPath;

  const candidatePaths = Array.from(new Set([
    decodedPath,
    baseName,
    `videos/${baseName}`,
    `stories/${baseName}`,
    `products/${baseName}`,
    `reviews/Avatar/${baseName}`,
    `reviews/product_image/${baseName}`,
    cleanPath
  ])).filter(Boolean);

  const candidateBuckets = Array.from(new Set([
    preferredBucket || 'videos',
    'videos',
    'products',
    'product-media',
    'images',
    'success-stories'
  ]));

  let anyDeleted = false;

  for (const bucket of candidateBuckets) {
    try {
      const { data, error } = await supabase.storage.from(bucket).remove(candidatePaths);
      if (error) {
        // Non-blocking bucket policy or existence warning
      } else if (data && data.length > 0) {
        console.log(`[Storage Cleanup] Successfully removed ${data.length} file(s) from Supabase bucket '${bucket}':`, candidatePaths);
        anyDeleted = true;
      }
    } catch {
      // Ignore non-existent bucket errors
    }
  }

  return anyDeleted;
}

/**
 * Deletes multiple files from storage in parallel batches, using our multi-bucket purge engine.
 */
export async function deleteFilesFromStorage(urls: (string | null | undefined)[]): Promise<void> {
  const cleanUrls = Array.from(new Set(urls.filter((u): u is string => Boolean(u && typeof u === 'string' && u.trim()))));
  if (cleanUrls.length === 0) return;

  const chunkSize = 4;
  for (let i = 0; i < cleanUrls.length; i += chunkSize) {
    const chunk = cleanUrls.slice(i, i + chunkSize);
    await Promise.allSettled(chunk.map((url) => deleteFileFromStorage(url)));
  }
}

/**
 * Extracts storage media URLs from rich HTML or Markdown text (e.g. from product description)
 */
export function extractMediaUrlsFromText(text: string | null | undefined): string[] {
  if (!text || typeof text !== 'string') return [];
  const urls: string[] = [];

  // Match markdown images: ![alt](url)
  const mdImgRegex = /!\[.*?\]\((https?:\/\/[^\s)]+|\/api\/[^\s)]+|\/uploads\/[^\s)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdImgRegex.exec(text)) !== null) {
    if (match[1]) urls.push(match[1]);
  }

  // Match HTML img tags: <img src="url"
  const htmlImgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+|\/api\/[^"']+|\/uploads\/[^"']+)["']/gi;
  while ((match = htmlImgRegex.exec(text)) !== null) {
    if (match[1]) urls.push(match[1]);
  }

  // Match direct Supabase storage URLs
  const sbUrlRegex = /(https:\/\/[^\s"'<>]+\/storage\/v1\/object\/(?:public|sign)\/[^\s"'<>]+)/gi;
  while ((match = sbUrlRegex.exec(text)) !== null) {
    if (match[1]) urls.push(match[1]);
  }

  return Array.from(new Set(urls));
}

/**
 * Deletes all storage assets associated with a single customer review
 * (Customer DP/avatar and review product image)
 */
export async function deleteReviewMedia(review: ProductReview | null | undefined): Promise<void> {
  if (!review) return;
  const urlsToDelete: string[] = [];
  if (review.avatarUrl) urlsToDelete.push(review.avatarUrl);
  if (review.imageUrl) urlsToDelete.push(review.imageUrl);

  await deleteFilesFromStorage(urlsToDelete);
}

/**
 * Deletes all storage assets associated with a single success story (video file),
 * specifically verifying and deleting the video blob from Supabase storage buckets
 * with persistent journal protection.
 */
export async function deleteSuccessStoryMedia(story: SuccessStory | null | undefined): Promise<void> {
  if (!story) return;
  const { cleanupAndVerifyVideoBlobsOnDeletion } = await import('./videoCleanupManager');
  await cleanupAndVerifyVideoBlobsOnDeletion({
    type: 'success_story',
    storyId: story.id,
    videoUrl: story.videoUrl,
    productId: story.productId
  }).catch((err) => {
    console.warn('[Storage Cleanup] Non-blocking warning in deleteSuccessStoryMedia:', err);
  });
}

// Re-export video cleanup manager for universal accessibility
export {
  cleanupAndVerifyVideoBlobsOnDeletion,
  cleanupProductVideoBlobsOnDeletion,
  cleanupStoryVideoBlobsOnDeletion,
  reconcileInterruptedVideoCleanups,
  scanAndCleanOrphanVideoBlobs,
  setupInterruptedCleanupListeners,
  getCleanupJournal
} from './videoCleanupManager';

/**
 * Deletes all storage media associated with a product:
 * - Product images gallery
 * - Live demonstration GIFs
 * - Any embedded storage assets in description or shortDescription
 */
export async function deleteProductMedia(product: Product | null | undefined): Promise<void> {
  if (!product) return;
  const urlsToDelete: string[] = [];

  if (Array.isArray(product.images)) {
    urlsToDelete.push(...product.images);
  }

  if (Array.isArray(product.gifUrls)) {
    urlsToDelete.push(...product.gifUrls);
  }

  if (product.description) {
    urlsToDelete.push(...extractMediaUrlsFromText(product.description));
  }

  if (product.shortDescription) {
    urlsToDelete.push(...extractMediaUrlsFromText(product.shortDescription));
  }

  await deleteFilesFromStorage(urlsToDelete);
}
