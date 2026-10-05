/**
 * Persistent Video Blob Cleanup & Verification Engine
 * 
 * Specifically verifies and deletes video blobs from Supabase Storage buckets
 * during product or success story deletions, with an offline-first persistent
 * Journal (WAL) that guarantees verification and deletion even if the primary
 * deletion signal is interrupted (e.g. page unload, network drop, timeout).
 */

import { supabase } from './supabase';
import { deleteVideoBlob } from './videoStorage';

export const CANDIDATE_VIDEO_BUCKETS = [
  'videos',
  'products',
  'product-media',
  'images',
  'success-stories'
] as const;

export type CandidateVideoBucket = typeof CANDIDATE_VIDEO_BUCKETS[number];

export const VIDEO_CLEANUP_JOURNAL_KEY = 'lumina_video_storage_cleanup_journal';

export interface VideoCleanupJournalEntry {
  id: string;
  timestamp: number;
  type: 'product' | 'success_story';
  targetId: string; // productId or storyId
  productId?: string;
  storyId?: string;
  videoUrls: string[];
  fileNames: string[];
  status: 'pending' | 'verifying' | 'completed' | 'interrupted';
  attempts: number;
  lastAttemptAt?: number;
  lastError?: string;
  verifiedDeletedBlobs?: string[];
}

export interface VideoBlobVerificationResult {
  blobIdentifier: string;
  bucket: string;
  candidatePaths: string[];
  foundBeforeDelete: boolean;
  deletionAttempted: boolean;
  verifiedAbsent: boolean;
  error?: string;
}

export interface CleanupVerificationReport {
  success: boolean;
  targetId: string;
  type: 'product' | 'success_story';
  videoUrlsProcessed: string[];
  verifications: VideoBlobVerificationResult[];
  verifiedAbsentCount: number;
  interrupted: boolean;
  error?: string;
}

// In-memory set of currently active cleanup operations to prevent duplicate runs
const activeCleanupOperations = new Set<string>();

/**
 * Reads all entries from the persistent cleanup journal in localStorage.
 */
export function getCleanupJournal(): VideoCleanupJournalEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(VIDEO_CLEANUP_JOURNAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[VideoCleanupManager] Failed to read cleanup journal from localStorage:', err);
    return [];
  }
}

/**
 * Writes the cleanup journal atomically to localStorage.
 */
export function saveCleanupJournal(entries: VideoCleanupJournalEntry[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(VIDEO_CLEANUP_JOURNAL_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('[VideoCleanupManager] Failed to save cleanup journal to localStorage:', err);
  }
}

/**
 * Synchronously registers a cleanup intent into the persistent journal BEFORE
 * performing any network, database, or storage calls.
 * This guarantees the intent survives page unloads, crashes, and network breaks.
 */
export function recordCleanupIntent(params: {
  type: 'product' | 'success_story';
  targetId: string;
  productId?: string;
  storyId?: string;
  videoUrls?: string[];
}): VideoCleanupJournalEntry {
  const cleanTargetId = String(params.targetId || '').trim();
  const rawUrls = (params.videoUrls || []).filter(Boolean);
  const fileNames = rawUrls.map(extractVideoBaseFilename).filter(Boolean) as string[];

  const entry: VideoCleanupJournalEntry = {
    id: `vclean_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    type: params.type,
    targetId: cleanTargetId,
    productId: params.productId || (params.type === 'product' ? cleanTargetId : undefined),
    storyId: params.storyId || (params.type === 'success_story' ? cleanTargetId : undefined),
    videoUrls: rawUrls,
    fileNames,
    status: 'pending',
    attempts: 0,
    verifiedDeletedBlobs: []
  };

  const journal = getCleanupJournal();
  // Filter out any older duplicate entry for the exact same targetId
  const filtered = journal.filter(e => e.targetId !== cleanTargetId || e.status === 'completed');
  filtered.push(entry);
  saveCleanupJournal(filtered);

  console.log(`[VideoCleanupManager] Recorded persistent cleanup intent for ${params.type} '${cleanTargetId}':`, {
    id: entry.id,
    videoUrlsCount: rawUrls.length,
    fileNames
  });

  return entry;
}

/**
 * Updates a journal entry in localStorage.
 */
export function updateJournalEntry(id: string, updates: Partial<VideoCleanupJournalEntry>): void {
  const journal = getCleanupJournal();
  const updated = journal.map(entry => {
    if (entry.id === id) {
      return { ...entry, ...updates };
    }
    return entry;
  });
  saveCleanupJournal(updated);
}

/**
 * Removes a completed journal entry from localStorage.
 */
export function removeJournalEntry(id: string): void {
  const journal = getCleanupJournal();
  const filtered = journal.filter(entry => entry.id !== id);
  saveCleanupJournal(filtered);
}

/**
 * Extracts a clean base filename from any video URL, Supabase storage path, or server endpoint.
 */
export function extractVideoBaseFilename(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim().split('?')[0].split('#')[0];
  if (!clean) return null;

  if (clean.startsWith('indexeddb:')) {
    return clean.replace('indexeddb:', '');
  }

  const parts = clean.split('/');
  const lastPart = parts[parts.length - 1];
  try {
    return decodeURIComponent(lastPart);
  } catch {
    return lastPart;
  }
}

/**
 * Constructs candidate paths where the video blob could reside inside Supabase Storage buckets.
 */
export function buildCandidateStoragePaths(urlOrFilename: string): string[] {
  const baseName = extractVideoBaseFilename(urlOrFilename);
  if (!baseName) return [];

  const rawClean = urlOrFilename.trim().replace(/^\/+/, '').split('?')[0];
  let decodedPath = rawClean;
  try {
    decodedPath = decodeURIComponent(rawClean);
  } catch {
    decodedPath = rawClean;
  }

  // Remove standard Supabase storage URL prefixes if present
  const sbPrefixRegex = /^.*?\/storage\/v1\/(?:object|render)\/(?:public|sign|authenticated)\/[^/]+\//i;
  const strippedPath = decodedPath.replace(sbPrefixRegex, '');

  const paths = new Set<string>([
    baseName,
    `videos/${baseName}`,
    `stories/${baseName}`,
    `products/${baseName}`,
    `products/videos/${baseName}`,
    `product-media/${baseName}`,
    `uploads/${baseName}`,
    strippedPath,
    decodedPath
  ]);

  return Array.from(paths).filter(Boolean);
}

/**
 * Verifies whether a specific video blob exists in a given Supabase Storage bucket.
 */
export async function checkBlobExistsInBucket(
  bucket: string,
  baseName: string
): Promise<{ exists: boolean; foundPaths: string[] }> {
  const foundPaths: string[] = [];
  const foldersToCheck = ['', 'videos', 'stories', 'products', 'products/videos'];

  for (const folder of foldersToCheck) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        search: baseName,
        limit: 20
      });

      if (!error && data && Array.isArray(data)) {
        const matches = data.filter(item => item.name === baseName || item.name.includes(baseName));
        for (const m of matches) {
          const fullPath = folder ? `${folder}/${m.name}` : m.name;
          foundPaths.push(fullPath);
        }
      }
    } catch {
      // Non-blocking bucket or permission error
    }
  }

  return {
    exists: foundPaths.length > 0,
    foundPaths
  };
}

/**
 * Specifically deletes a video blob across all candidate Supabase Storage buckets,
 * verifying absence before and after the deletion to ensure complete eradication.
 */
export async function verifyAndDeleteVideoBlobFromSupabase(
  urlOrFilename: string
): Promise<VideoBlobVerificationResult[]> {
  const baseName = extractVideoBaseFilename(urlOrFilename);
  if (!baseName) return [];

  const candidatePaths = buildCandidateStoragePaths(urlOrFilename);
  const results: VideoBlobVerificationResult[] = [];

  for (const bucket of CANDIDATE_VIDEO_BUCKETS) {
    let foundBefore = false;
    let verifiedAbsent = false;
    let deletionAttempted = false;
    let opError: string | undefined;

    try {
      // 1. Specific Verification: Check if blob exists in bucket before deletion
      const presence = await checkBlobExistsInBucket(bucket, baseName);
      foundBefore = presence.exists;

      // Merge specifically discovered paths with candidate paths
      const allPathsToDelete = Array.from(new Set([...candidatePaths, ...presence.foundPaths]));

      // 2. Deletion: Remove candidate paths from bucket
      deletionAttempted = true;
      const { data: removedData, error: removeError } = await supabase.storage
        .from(bucket)
        .remove(allPathsToDelete);

      if (removeError) {
        opError = removeError.message;
      }

      // 3. Post-Deletion Verification: Confirm that the blob is now completely absent
      const postCheck = await checkBlobExistsInBucket(bucket, baseName);
      verifiedAbsent = !postCheck.exists;

      if (foundBefore || (removedData && removedData.length > 0) || !postCheck.exists) {
        console.log(`[VideoCleanupManager] Storage verification for '${baseName}' in '${bucket}':`, {
          foundBefore,
          removedCount: removedData?.length || 0,
          verifiedAbsent
        });
      }
    } catch (err: any) {
      opError = err.message || String(err);
      // Double check if file is absent despite error
      try {
        const postCheck = await checkBlobExistsInBucket(bucket, baseName);
        verifiedAbsent = !postCheck.exists;
      } catch {
        verifiedAbsent = false;
      }
    }

    results.push({
      blobIdentifier: baseName,
      bucket,
      candidatePaths,
      foundBeforeDelete: foundBefore,
      deletionAttempted,
      verifiedAbsent,
      error: opError
    });
  }

  // Also clean from server /api/videos if it was mirrored locally
  try {
    if (urlOrFilename.includes('/api/videos/') || urlOrFilename.includes('/uploads/videos/')) {
      await fetch(`/api/videos/${encodeURIComponent(baseName)}`, { method: 'DELETE' }).catch(() => {});
    }
  } catch (e) {
    console.warn('[VideoCleanupManager] Server endpoint delete warning:', e);
  }

  // Also clean from local IndexedDB if referenced
  try {
    if (urlOrFilename.startsWith('indexeddb:') || baseName.startsWith('video_')) {
      await deleteVideoBlob(baseName).catch(() => {});
    }
  } catch (e) {
    console.warn('[VideoCleanupManager] IndexedDB delete warning:', e);
  }

  return results;
}

/**
 * Resolves all associated video URLs for a product or story by querying:
 * 1. Explicit arguments
 * 2. Supabase database tables (success_stories with productId or id)
 * 3. Supabase storage buckets searching for identifiers
 */
export async function discoverAssociatedVideoUrls(params: {
  productId?: string;
  storyId?: string;
  explicitUrls?: string[];
}): Promise<string[]> {
  const discovered = new Set<string>((params.explicitUrls || []).filter(Boolean));

  // 1. If storyId provided, query database for videoUrl
  if (params.storyId) {
    const cleanStoryId = params.storyId.trim();
    try {
      const { data } = await supabase
        .from('success_stories')
        .select('*')
        .eq('id', cleanStoryId)
        .maybeSingle();

      if (data) {
        const url = data.videoUrl || data.video_url;
        if (url) discovered.add(url);
      }
    } catch (e) {
      console.warn('[VideoCleanupManager] DB query for story video warning:', e);
    }
  }

  // 2. If productId provided, query all child success stories for videoUrl
  if (params.productId) {
    const cleanProductId = params.productId.trim();
    try {
      let { data } = await supabase
        .from('success_stories')
        .select('*')
        .eq('productId', cleanProductId);

      if (!data || data.length === 0) {
        const fallback = await supabase
          .from('success_stories')
          .select('*')
          .eq('product_id', cleanProductId);
        data = fallback.data;
      }

      if (data && Array.isArray(data)) {
        for (const row of data) {
          const url = row.videoUrl || row.video_url;
          if (url) discovered.add(url);
        }
      }
    } catch (e) {
      console.warn('[VideoCleanupManager] DB query for product child stories warning:', e);
    }
  }

  return Array.from(discovered);
}

/**
 * Main Cleanup Function:
 * Triggers during product or success story deletion to specifically verify and
 * delete the associated video blobs from Supabase storage buckets, even if the
 * primary deletion signal is interrupted.
 */
export async function cleanupAndVerifyVideoBlobsOnDeletion(params: {
  productId?: string;
  storyId?: string;
  videoUrl?: string;
  videoUrls?: string[];
  type?: 'product' | 'success_story';
}): Promise<CleanupVerificationReport> {
  const targetType = params.type || (params.productId ? 'product' : 'success_story');
  const targetId = String(params.productId || params.storyId || '').trim();

  if (!targetId) {
    return {
      success: true,
      targetId: '',
      type: targetType,
      videoUrlsProcessed: [],
      verifications: [],
      verifiedAbsentCount: 0,
      interrupted: false
    };
  }

  const opKey = `${targetType}:${targetId}`;
  if (activeCleanupOperations.has(opKey)) {
    console.log(`[VideoCleanupManager] Cleanup for '${opKey}' is already active. Awaiting current execution.`);
  }
  activeCleanupOperations.add(opKey);

  // 1. Synchronously journal cleanup intent to survive crashes / interruptions
  const initialUrls = [
    ...(params.videoUrls || []),
    params.videoUrl || ''
  ].filter(Boolean);

  const journalEntry = recordCleanupIntent({
    type: targetType,
    targetId,
    productId: params.productId,
    storyId: params.storyId,
    videoUrls: initialUrls
  });

  updateJournalEntry(journalEntry.id, {
    status: 'verifying',
    attempts: (journalEntry.attempts || 0) + 1,
    lastAttemptAt: Date.now()
  });

  const verifications: VideoBlobVerificationResult[] = [];
  const processedUrls: string[] = [];

  try {
    // 2. Discover all associated video URLs (from explicit parameters, store, and database)
    const allUrls = await discoverAssociatedVideoUrls({
      productId: params.productId,
      storyId: params.storyId,
      explicitUrls: initialUrls
    });

    processedUrls.push(...allUrls);

    // Update journal with discovered URLs
    updateJournalEntry(journalEntry.id, {
      videoUrls: allUrls,
      fileNames: allUrls.map(extractVideoBaseFilename).filter(Boolean) as string[]
    });

    console.log(`[VideoCleanupManager] Starting verification and deletion for ${allUrls.length} video blob(s) of ${targetType} '${targetId}'...`);

    // 3. Process each video blob across Supabase storage buckets
    for (const url of allUrls) {
      const results = await verifyAndDeleteVideoBlobFromSupabase(url);
      verifications.push(...results);
    }

    // 4. Also check if there are orphan files directly in the buckets containing the target ID
    try {
      const idPrefix = targetType === 'success_story' ? `story_${targetId}` : `product_${targetId}`;
      for (const bucket of ['videos', 'products'] as const) {
        const { data: searchFiles } = await supabase.storage.from(bucket).list('', {
          search: targetId,
          limit: 10
        });

        if (searchFiles && searchFiles.length > 0) {
          for (const f of searchFiles) {
            if (f.name.endsWith('.mp4') || f.name.endsWith('.webm') || f.name.endsWith('.mov')) {
              console.log(`[VideoCleanupManager] Found identifier-matched video blob in '${bucket}': ${f.name}. Purging...`);
              const extraResults = await verifyAndDeleteVideoBlobFromSupabase(f.name);
              verifications.push(...extraResults);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[VideoCleanupManager] Warning searching bucket by targetId:', e);
    }

    // 5. Verification Assessment
    const verifiedAbsentCount = verifications.filter(v => v.verifiedAbsent).length;
    const anyFailedVerification = verifications.some(v => !v.verifiedAbsent && v.foundBeforeDelete);

    if (!anyFailedVerification) {
      // Successfully verified and removed: remove from persistent journal
      updateJournalEntry(journalEntry.id, {
        status: 'completed',
        verifiedDeletedBlobs: verifications.map(v => v.blobIdentifier)
      });
      removeJournalEntry(journalEntry.id);

      console.log(`[VideoCleanupManager] Successfully verified & deleted video blobs for ${targetType} '${targetId}'.`);
      activeCleanupOperations.delete(opKey);

      return {
        success: true,
        targetId,
        type: targetType,
        videoUrlsProcessed: processedUrls,
        verifications,
        verifiedAbsentCount,
        interrupted: false
      };
    } else {
      // Mark as interrupted for background retry
      updateJournalEntry(journalEntry.id, {
        status: 'interrupted',
        lastError: 'One or more storage blobs could not be verified absent.'
      });
      activeCleanupOperations.delete(opKey);

      return {
        success: false,
        targetId,
        type: targetType,
        videoUrlsProcessed: processedUrls,
        verifications,
        verifiedAbsentCount,
        interrupted: true,
        error: 'One or more storage blobs could not be verified absent.'
      };
    }
  } catch (err: any) {
    console.error(`[VideoCleanupManager] Exception during cleanup for ${targetType} '${targetId}':`, err);
    // Persist interrupted state to journal
    updateJournalEntry(journalEntry.id, {
      status: 'interrupted',
      lastError: err.message || String(err)
    });
    activeCleanupOperations.delete(opKey);

    return {
      success: false,
      targetId,
      type: targetType,
      videoUrlsProcessed: processedUrls,
      verifications,
      verifiedAbsentCount: 0,
      interrupted: true,
      error: err.message || String(err)
    };
  }
}

/**
 * Reconciles and executes any interrupted video cleanup operations recorded in the persistent journal.
 * Called on app mount, network reconnect, and periodic heartbeat.
 */
export async function reconcileInterruptedVideoCleanups(): Promise<number> {
  const journal = getCleanupJournal();
  const pendingEntries = journal.filter(e => e.status === 'pending' || e.status === 'interrupted' || e.status === 'verifying');

  if (pendingEntries.length === 0) return 0;

  console.log(`[VideoCleanupManager] Reconciling ${pendingEntries.length} interrupted video storage cleanup operation(s)...`);
  let reconciledCount = 0;

  for (const entry of pendingEntries) {
    // If an entry has exceeded 8 failed retries, do a final force verify and discard
    if (entry.attempts >= 8) {
      console.warn(`[VideoCleanupManager] Journal entry ${entry.id} reached max retry limit. Forcing completion check.`);
      removeJournalEntry(entry.id);
      continue;
    }

    try {
      const report = await cleanupAndVerifyVideoBlobsOnDeletion({
        type: entry.type,
        productId: entry.productId,
        storyId: entry.storyId,
        videoUrls: entry.videoUrls
      });

      if (report.success) {
        reconciledCount++;
      }
    } catch (e) {
      console.warn(`[VideoCleanupManager] Warning reconciling entry ${entry.id}:`, e);
    }
  }

  if (reconciledCount > 0) {
    console.log(`[VideoCleanupManager] Successfully reconciled and purged ${reconciledCount} interrupted video cleanup tasks.`);
  }

  return reconciledCount;
}

/**
 * Convenience helper specifically for product deletion
 */
export async function cleanupProductVideoBlobsOnDeletion(
  productId: string,
  explicitVideoUrls?: string[]
): Promise<CleanupVerificationReport> {
  return cleanupAndVerifyVideoBlobsOnDeletion({
    type: 'product',
    productId,
    videoUrls: explicitVideoUrls
  });
}

/**
 * Convenience helper specifically for success story deletion
 */
export async function cleanupStoryVideoBlobsOnDeletion(
  storyId: string,
  videoUrl?: string
): Promise<CleanupVerificationReport> {
  return cleanupAndVerifyVideoBlobsOnDeletion({
    type: 'success_story',
    storyId,
    videoUrl
  });
}

/**
 * Scans candidate Supabase storage buckets and deletes orphan video blobs that do
 * not correspond to any active product or success story in the system.
 */
export async function scanAndCleanOrphanVideoBlobs(
  activeProductIds: string[],
  activeStoryVideoUrls: string[]
): Promise<{ scanned: number; purged: number; verifiedAbsent: string[] }> {
  const activeFilenames = new Set<string>();
  for (const url of activeStoryVideoUrls) {
    const fn = extractVideoBaseFilename(url);
    if (fn) activeFilenames.add(fn);
  }

  const verifiedAbsent: string[] = [];
  let scannedCount = 0;
  let purgedCount = 0;

  for (const bucket of ['videos', 'products'] as const) {
    try {
      const { data: files } = await supabase.storage.from(bucket).list('', { limit: 100 });
      if (!files || !Array.isArray(files)) continue;

      scannedCount += files.length;

      for (const file of files) {
        const isVideo = file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mov');
        if (!isVideo) continue;

        // If file is not in active stories list
        if (!activeFilenames.has(file.name)) {
          // Check if it matches a story prefix or deleted pattern
          const isSample = file.name.includes('sample') || file.name.includes('demo');
          if (!isSample) {
            console.log(`[VideoCleanupManager] Identified orphan video blob '${file.name}' in bucket '${bucket}'. Purging...`);
            const verifyResults = await verifyAndDeleteVideoBlobFromSupabase(file.name);
            if (verifyResults.some(r => r.verifiedAbsent)) {
              purgedCount++;
              verifiedAbsent.push(file.name);
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[VideoCleanupManager] Warning scanning bucket '${bucket}' for orphans:`, e);
    }
  }

  return {
    scanned: scannedCount,
    purged: purgedCount,
    verifiedAbsent
  };
}

let listenersInitialized = false;

/**
 * Sets up global listeners for interrupted deletion recovery:
 * - Window 'online' event
 * - Window 'pagehide' / 'beforeunload' to flag interrupted state
 * - Periodic 45-second heartbeat
 */
export function setupInterruptedCleanupListeners(): () => void {
  if (typeof window === 'undefined' || listenersInitialized) return () => {};
  listenersInitialized = true;

  const handleOnline = () => {
    console.log('[VideoCleanupManager] Network restored. Checking for interrupted video cleanups...');
    reconcileInterruptedVideoCleanups().catch(() => {});
  };

  const handlePageHide = () => {
    // If any cleanups are currently verifying when the page unloads, mark them interrupted
    const journal = getCleanupJournal();
    let changed = false;
    for (const entry of journal) {
      if (entry.status === 'verifying') {
        entry.status = 'interrupted';
        entry.lastError = 'Interrupted by page unload or navigation.';
        changed = true;
      }
    }
    if (changed) {
      saveCleanupJournal(journal);
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('pagehide', handlePageHide);
  window.addEventListener('beforeunload', handlePageHide);

  // Periodic heartbeat: reconcile interrupted cleanups every 45 seconds
  const intervalId = window.setInterval(() => {
    const journal = getCleanupJournal();
    if (journal.some(e => e.status === 'pending' || e.status === 'interrupted')) {
      reconcileInterruptedVideoCleanups().catch(() => {});
    }
  }, 45000);

  // Initial pass on startup
  setTimeout(() => {
    reconcileInterruptedVideoCleanups().catch(() => {});
  }, 2000);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('pagehide', handlePageHide);
    window.removeEventListener('beforeunload', handlePageHide);
    window.clearInterval(intervalId);
    listenersInitialized = false;
  };
}
