// Global Video Storage & Delivery System
// Supports Supabase Storage CDN, Express Server Streaming (/api/videos/:filename),
// base64 database embedding, and IndexedDB local client buffer.

import { supabase } from './supabase';

const DB_NAME = 'lumina_media_db';
const STORE_NAME = 'videos';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;
const memoryBlobUrlCache = new Map<string, string>();

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveVideoBlob(id: string, blobOrFile: Blob): Promise<string> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blobOrFile, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Create and cache an object URL for instant playback
    const objectUrl = URL.createObjectURL(blobOrFile);
    memoryBlobUrlCache.set(id, objectUrl);
    return `indexeddb:${id}`;
  } catch (err) {
    console.warn('[VideoStorage] Error saving to IndexedDB:', err);
    // Fallback: create object URL and cache in memory
    const objectUrl = URL.createObjectURL(blobOrFile);
    memoryBlobUrlCache.set(id, objectUrl);
    return objectUrl;
  }
}

export async function getVideoBlob(id: string): Promise<Blob | null> {
  try {
    const cleanId = id.replace('indexeddb:', '');
    const db = await getDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[VideoStorage] Error reading from IndexedDB:', err);
    return null;
  }
}

export async function deleteVideoBlob(id: string): Promise<boolean> {
  try {
    const cleanId = id.replace('indexeddb:', '');
    if (memoryBlobUrlCache.has(cleanId)) {
      const oldUrl = memoryBlobUrlCache.get(cleanId);
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      memoryBlobUrlCache.delete(cleanId);
    }
    const db = await getDB();
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(cleanId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return false;
  }
}

/**
 * Convert Blob or File to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read blob as base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface VideoUploadResult {
  url: string;
  source: 'supabase' | 'server' | 'base64';
  filename?: string;
  bucket?: string;
}

/**
 * Uploads a video file to the server using XMLHttpRequest for real-time progress events
 */
function uploadViaServerXHR(
  fileOrBlob: File | Blob,
  fileName: string,
  onProgress?: (progress: number, status: string) => void
): Promise<VideoUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('video', fileOrBlob, fileName);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && e.total > 0) {
        // Map upload byte transfer smoothly between 20% and 92%
        const rawPct = Math.round((e.loaded / e.total) * 100);
        const mappedPct = Math.min(92, Math.max(20, Math.round(20 + (rawPct * 0.72))));
        const mbLoaded = (e.loaded / (1024 * 1024)).toFixed(1);
        const mbTotal = (e.total / (1024 * 1024)).toFixed(1);
        onProgress?.(mappedPct, `Uploading video: ${mbLoaded}MB / ${mbTotal}MB (${rawPct}%)...`);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.url) {
            onProgress?.(100, 'Video uploaded to media server successfully!');
            resolve({
              url: res.url,
              source: 'server',
              filename: res.filename
            });
            return;
          }
        } catch {
          // parse error
        }
      }
      reject(new Error(`Media server responded with status ${xhr.status}`));
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during video upload')));
    xhr.addEventListener('abort', () => reject(new Error('Video upload was aborted')));
    xhr.timeout = 60000; // 60s timeout for large videos
    xhr.ontimeout = () => reject(new Error('Video upload timed out'));

    xhr.open('POST', '/api/videos/upload');
    xhr.send(formData);
  });
}

/**
 * Uploads a video file to globally accessible storage:
 * 1. Tries Supabase Storage bucket ('videos', 'products', 'product-media', 'images', 'success-stories')
 * 2. Streams to Express Server endpoint (/api/videos/upload) which also uploads to Supabase Storage
 * 3. Falls back to base64 upload or Data URL
 */
export async function uploadVideoFile(
  fileOrBlob: File | Blob,
  fileName = 'customer_story.mp4',
  onProgress?: (progress: number, status: string) => void
): Promise<VideoUploadResult> {
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueName = `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${safeName}`;

  onProgress?.(10, 'Initializing video upload pipeline...');

  // 1. Try Direct Supabase Storage CDN
  const candidateBuckets = ['videos', 'products', 'product-media', 'images', 'success-stories'];
  for (const bucket of candidateBuckets) {
    try {
      onProgress?.(20, `Uploading directly to Supabase Storage bucket '${bucket}'...`);
      const storageFilePath = bucket === 'products' || bucket === 'product-media' || bucket === 'images' 
        ? `videos/${uniqueName}` 
        : uniqueName;

      // Wrap upload with a 35-second timeout
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(storageFilePath, fileOrBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: fileOrBlob.type || 'video/mp4'
        });

      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
        setTimeout(() => reject(new Error(`Supabase bucket '${bucket}' upload timeout`)), 35000)
      );

      const { data: uploadData, error: sbError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]) as any;

      if (!sbError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(storageFilePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          console.log(`[Supabase Storage] Video uploaded to bucket '${bucket}': ${publicUrlData.publicUrl}`);
          onProgress?.(100, `Uploaded successfully to Supabase Storage bucket '${bucket}'!`);
          return {
            url: publicUrlData.publicUrl,
            source: 'supabase',
            filename: storageFilePath,
            bucket
          };
        }
      } else if (sbError) {
        console.warn(`[Supabase Storage] Bucket '${bucket}' message:`, sbError.message);
      }
    } catch (e: any) {
      console.warn(`[Supabase Storage] Notice on bucket '${bucket}':`, e?.message);
    }
  }

  // 2. Upload to Server with live progress (Server will also push to Supabase Storage)
  try {
    onProgress?.(30, 'Streaming video to storage pipeline...');
    const result = await uploadViaServerXHR(fileOrBlob, safeName, onProgress);
    if (result.url) {
      return result;
    }
  } catch (err) {
    console.warn('[VideoStorage] Server streaming upload notice:', err);
  }

  // 3. Fallback to Server Base64 Upload
  try {
    onProgress?.(75, 'Transcoding video for server storage...');
    const base64 = await blobToBase64(fileOrBlob);

    const res = await fetch('/api/videos/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        filename: safeName,
        mimeType: fileOrBlob.type || 'video/mp4'
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.url) {
        onProgress?.(100, 'Video uploaded to media storage successfully!');
        return {
          url: json.url,
          source: json.source || 'server',
          filename: json.filename,
          bucket: json.bucket
        };
      }
    }

    // 4. Ultimate fallback: Return self-contained Data URL
    onProgress?.(100, 'Ready with self-contained video data!');
    return {
      url: base64 || '',
      source: 'base64'
    };
  } catch (base64Err) {
    console.warn('[VideoStorage] Upload fallback notice:', base64Err);
    return {
      url: '',
      source: 'base64'
    };
  }
}

/**
 * Migrates any legacy or server video URL (/api/videos/..., indexeddb:..., data:video/...)
 * directly into the Supabase Storage bucket.
 */
export async function migrateVideoUrlToSupabaseStorage(videoUrl: string): Promise<string | null> {
  if (!videoUrl) return null;
  if (videoUrl.includes('/storage/v1/object/public/')) {
    return videoUrl; // Already in Supabase Storage CDN!
  }

  try {
    let blob: Blob | null = null;
    if (videoUrl.startsWith('indexeddb:')) {
      const id = videoUrl.replace('indexeddb:', '');
      blob = await getVideoBlob(id);
    } else if (videoUrl.startsWith('data:video/')) {
      const res = await fetch(videoUrl);
      blob = await res.blob();
    } else {
      // e.g. /api/videos/...
      const res = await fetch(videoUrl);
      if (res.ok) {
        blob = await res.blob();
      }
    }

    if (!blob) {
      console.warn(`[VideoStorage] Could not fetch source blob for migration: ${videoUrl}`);
      return null;
    }

    const filename = videoUrl.split('/').pop()?.split('?')[0] || 'story_video.mp4';
    const result = await uploadVideoFile(blob, filename);
    if (result && result.url && result.url.includes('/storage/v1/object/public/')) {
      return result.url;
    }
    return result?.url || null;
  } catch (err) {
    console.warn(`[VideoStorage] Error migrating video to Supabase Storage:`, err);
    return null;
  }
}

/**
 * Migrates a legacy 'indexeddb:video_...' string from local browser IndexedDB
 * to a real public URL on the server or Supabase Storage.
 */
export async function migrateIndexedDbUrl(indexedDbUrl: string): Promise<string | null> {
  if (!indexedDbUrl || !indexedDbUrl.startsWith('indexeddb:')) {
    return indexedDbUrl;
  }

  const id = indexedDbUrl.replace('indexeddb:', '');
  const blob = await getVideoBlob(id);
  if (!blob) {
    console.warn(`[VideoStorage] Blob for ${indexedDbUrl} not found in current browser.`);
    return null;
  }

  try {
    const result = await uploadVideoFile(blob, `${id}.mp4`);
    return result.url;
  } catch (err) {
    console.error(`[VideoStorage] Failed to migrate ${indexedDbUrl}:`, err);
    return null;
  }
}

export async function resolveVideoUrl(url: string): Promise<string> {
  if (!url) return '';
  // Real URLs, relative server paths, data URLs, and object URLs
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  // Legacy IndexedDB pointer
  if (url.startsWith('indexeddb:')) {
    const id = url.replace('indexeddb:', '');
    if (memoryBlobUrlCache.has(id)) {
      return memoryBlobUrlCache.get(id)!;
    }
    const blob = await getVideoBlob(id);
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      memoryBlobUrlCache.set(id, objectUrl);
      return objectUrl;
    }
    // Fallback if accessed from another device where IndexedDB is empty
    return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  }

  return url;
}
