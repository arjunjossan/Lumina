import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Video, 
  Play, 
  Film, 
  Upload, 
  Trash2, 
  Check, 
  Star, 
  Plus, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  Database,
  User,
  Quote,
  Clock,
  ExternalLink,
  AlertCircle,
  X,
  Loader2,
  Server,
  Globe
} from 'lucide-react';
import { saveVideoBlob, resolveVideoUrl, uploadVideoFile } from '../../lib/videoStorage';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';

const SAMPLE_VIDEO_PRESETS = [
  {
    name: 'Nature Bloom (MP4)',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    name: 'Friday Showcase (MP4)',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4'
  },
  {
    name: 'Bunny Demo (MP4)',
    url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
  },
  {
    name: 'Ocean Jellyfish (MP4)',
    url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4'
  }
];

const AdminStoryVideoPlayer: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const [hasError, setHasError] = useState(false);
  const fallbackUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    if (!videoUrl || videoUrl.includes('commondatastorage.googleapis.com')) {
      return fallbackUrl;
    }
    if (videoUrl.startsWith('http') || videoUrl.startsWith('blob:') || videoUrl.startsWith('data:') || videoUrl.startsWith('/api/videos/')) {
      return videoUrl;
    }
    return '';
  });

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    if (!videoUrl || videoUrl.includes('commondatastorage.googleapis.com')) {
      setResolvedSrc(fallbackUrl);
      return;
    }
    if (videoUrl.startsWith('/api/videos/')) {
      setResolvedSrc(videoUrl);
      return;
    }
    resolveVideoUrl(videoUrl).then((url) => {
      if (isMounted) setResolvedSrc(url || fallbackUrl);
    }).catch(() => {
      if (isMounted) setResolvedSrc(fallbackUrl);
    });
    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  if (hasError || !resolvedSrc) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
        <Film className="w-8 h-8 text-amber-500/40" />
      </div>
    );
  }

  return (
    <video
      key={resolvedSrc}
      src={resolvedSrc}
      autoPlay
      loop
      muted
      playsInline
      onError={(e) => {
        e.preventDefault();
        setHasError(true);
      }}
      className="w-full h-full object-cover"
    />
  );
};

export const AdminSuccessStories: React.FC = () => {
  const { 
    products, 
    successStories, 
    addSuccessStory, 
    updateSuccessStory, 
    deleteSuccessStory, 
    toggleSuccessStoryPublish, 
    showNotification 
  } = useStore();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [customerRoleOrLocation, setCustomerRoleOrLocation] = useState('');
  const [storyText, setStoryText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [published, setPublished] = useState<boolean>(true);

  // Video File Upload & Progress State
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadStorageSource, setUploadStorageSource] = useState<'supabase' | 'server' | 'base64' | null>(null);

  // Inline Delete Confirmation (replaces window.confirm which is blocked in iframes)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Replace Video for Existing Story State
  const [replacingStoryId, setReplacingStoryId] = useState<string | null>(null);
  const [isReplacingVideo, setIsReplacingVideo] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Replace Video for a specific story
  const handleTriggerReplaceVideo = (storyId: string) => {
    setReplacingStoryId(storyId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingStoryId) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|ogg|m4v)$/i)) {
      showNotification('Please choose a valid video file (.mp4, .webm, .mov, etc.)');
      return;
    }

    setIsReplacingVideo(true);
    showNotification(`Uploading new video directly to database storage...`);

    try {
      const result = await uploadVideoFile(file, file.name);
      updateSuccessStory(replacingStoryId, { videoUrl: result.url });
      showNotification(`✅ Video uploaded to database storage and saved to story!`);
    } catch (err: any) {
      showNotification(`Upload error: ${err.message || 'Failed to upload video'}`);
    } finally {
      setIsReplacingVideo(false);
      setReplacingStoryId(null);
    }
  };

  // Filters & Actions
  const [filterProductId, setFilterProductId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storySaveState, setStorySaveState] = useState<SaveButtonState>('idle');

  // Video File Upload Handler with real global storage (Supabase)
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check video format
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|ogg|m4v)$/i)) {
      showNotification('Please choose a valid video file (.mp4, .webm, .mov, etc.)');
      return;
    }

    // Support standard video uploads up to 100MB
    if (file.size > 100 * 1024 * 1024) {
      showNotification('Video file size exceeds 100MB. Please select a smaller clip or paste an external direct video URL.');
      return;
    }

    const fileSizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setUploadFileName(file.name);
    setUploadFileSize(fileSizeFormatted);
    setIsUploadingVideo(true);
    setUploadProgress(15);
    setUploadStatusText('Uploading video to database storage...');
    setPreviewError(false);

    // Instant local preview via Object URL while uploading
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);

    try {
      // Upload directly to Supabase Storage bucket
      const result = await uploadVideoFile(file, file.name, (pct, status) => {
        setUploadProgress(pct);
        setUploadStatusText(status);
      });

      // Also save to local buffer so local playback is immediate
      const storageKeyId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      saveVideoBlob(storageKeyId, file).catch(() => {});

      setUploadProgress(100);
      setUploadStorageSource(result.source);
      setUploadStatusText('Video saved into database storage bucket!');
      // SET THE REAL GLOBAL ACCESSIBLE URL FOR DATABASE PERSISTENCE
      setVideoUrl(result.url);
      setIsUploadingVideo(false);
      showNotification(`Video "${file.name}" saved to database storage!`);
    } catch (err) {
      console.warn('Upload error, falling back to local memory stream:', err);
      setUploadProgress(100);
      setUploadStatusText('Ready with active stream.');
      setVideoUrl(objectUrl);
      setIsUploadingVideo(false);
      showNotification(`Warning: Cloud upload failed, using local preview stream.`);
    }
  };

  const handleClearUploadedVideo = () => {
    setVideoPreview(null);
    setVideoUrl('');
    setUploadFileName('');
    setUploadFileSize('');
    setUploadProgress(0);
    setUploadStorageSource(null);
    setIsUploadingVideo(false);
    setPreviewError(false);
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }
  };

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingVideo) {
      showNotification('Please wait for the video upload to finish saving to storage.');
      return;
    }

    const finalVideo = videoUrl.trim() || videoPreview || '';

    if (!selectedProductId) {
      showNotification('Please select a product for this success story.');
      return;
    }
    if (!customerName.trim()) {
      showNotification('Please enter the customer name.');
      return;
    }
    if (!storyText.trim()) {
      showNotification('Please enter the testimonial or review text.');
      return;
    }
    if (!finalVideo) {
      showNotification('Please upload a video clip or provide a valid video URL.');
      return;
    }

    setStorySaveState('saving');
    addSuccessStory({
      productId: selectedProductId,
      customerName: customerName.trim(),
      customerRoleOrLocation: customerRoleOrLocation.trim() || 'Verified Buyer',
      storyText: storyText.trim(),
      videoUrl: finalVideo,
      rating,
      verified: isVerified,
      orderNumber: orderNumber.trim() || undefined,
      published
    });

    setStorySaveState('saved');
    showNotification(`✅ Video success story automatically saved into database storage!`);

    // Reset Form
    setTimeout(() => {
      setCustomerName('');
      setCustomerRoleOrLocation('');
      setStoryText('');
      setVideoUrl('');
      setVideoPreview(null);
      setOrderNumber('');
      setUploadFileName('');
      setUploadFileSize('');
      setUploadProgress(0);
      setUploadStorageSource(null);
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = '';
      }
      setStorySaveState('idle');
      setIsFormOpen(false);
    }, 1500);
  };

  const filteredStories = successStories.filter((s) => {
    const matchesProduct = filterProductId === 'all' || s.productId === filterProductId;
    const matchesSearch = !searchQuery || 
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.storyText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerRoleOrLocation && s.customerRoleOrLocation.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProduct && matchesSearch;
  });

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Hidden file input for replacing story videos */}
      <input
        type="file"
        ref={replaceFileInputRef}
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleReplaceVideoFile}
        className="hidden"
      />

      {/* FORM: PUBLISH NEW SUCCESS STORY */}
      <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 transition-all">
        <div className={`flex flex-wrap items-center justify-between gap-3 ${isFormOpen ? 'border-b border-slate-800 pb-4 mb-5' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <span>Add Customer Video Success Story</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {isFormOpen 
                  ? 'Upload a customer video clip and quote saved directly into database storage' 
                  : 'Add customer video reels showcased on product detail pages'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen((prev) => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isFormOpen
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md'
            }`}
          >
            {isFormOpen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Cancel / Close</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video Story</span>
              </>
            )}
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmitStory} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Select Product */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Target Product *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Customer Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Customer Role / Location Tag */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Location / Role Tag</label>
              <input
                type="text"
                placeholder="e.g. Verified Buyer • Seattle, WA"
                value={customerRoleOrLocation}
                onChange={(e) => setCustomerRoleOrLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Video Section: File Upload or Direct URL */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-400" />
                <span>Customer Video Media (Upload File or Direct Link) *</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={videoFileInputRef}
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video Clip</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2 space-y-3">
                <input
                  type="text"
                  placeholder="https://example.com/video.mp4 (or pick preset/upload file)"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoPreview(e.target.value);
                    setPreviewError(false);
                  }}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-amber-500"
                />

                {/* Upload Progress Bar (Live upload feedback) */}
                {isUploadingVideo && (
                  <div className="p-3 bg-slate-950/90 rounded-xl border border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[280px]">
                          Uploading: {uploadFileName} ({uploadFileSize})
                        </span>
                      </span>
                      <span className="font-mono font-bold text-amber-400 shrink-0">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {uploadStatusText}
                    </p>
                  </div>
                )}

                {/* Uploaded File Chip */}
                {!isUploadingVideo && uploadFileName && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate font-semibold">{uploadFileName} ({uploadFileSize})</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearUploadedVideo}
                      className="text-slate-400 hover:text-red-400 p-1 text-xs cursor-pointer ml-2 transition-colors"
                      title="Remove uploaded clip"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Or select high-speed sample reel preset:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_VIDEO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setVideoUrl(preset.url);
                          setVideoPreview(preset.url);
                          setPreviewError(false);
                          setUploadFileName('');
                          setUploadFileSize('');
                          setIsUploadingVideo(false);
                        }}
                        className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5 text-amber-400" />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Player Preview Box */}
              <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {isUploadingVideo ? (
                  <div className="text-center p-4 space-y-2">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-amber-300">Processing video clip...</p>
                    <p className="text-[10px] text-slate-400">{uploadProgress}% complete</p>
                  </div>
                ) : (videoPreview?.trim() || videoUrl?.trim()) && !previewError ? (
                  <video
                    key={videoPreview?.trim() || videoUrl?.trim()}
                    src={videoPreview?.trim() || videoUrl?.trim()}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={(e) => {
                      e.preventDefault();
                      setPreviewError(true);
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : previewError ? (
                  <div className="text-center p-3 text-red-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-70" />
                    <p className="text-[10px]">Video source could not be played. Please use a direct MP4 or WebM link.</p>
                  </div>
                ) : (
                  <div className="text-center p-3 text-slate-500">
                    <Video className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-[10px]">Video preview will appear here</p>
                  </div>
                )}
                {!isUploadingVideo && (videoPreview?.trim() || videoUrl?.trim()) && !previewError && (
                  <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Muted Preview
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Story Text / Testimonial */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Customer Story / Testimonial Text * (Displayed over the video card)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Hands down one of my best purchases this year. The build quality exceeded expectations and setup took less than a minute. Highly recommend!"
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              required
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 leading-relaxed text-xs"
            />
          </div>

          {/* Meta details: Rating, Verified, Order #, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center pt-1">
            {/* Rating */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="cursor-pointer transition-transform hover:scale-110 p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Order # */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Order # (Optional)</label>
              <input
                type="text"
                placeholder="e.g. LUM-9481"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Verified Buyer Checkbox */}
            <div className="flex items-center gap-2 pt-4 sm:pt-0">
              <input
                type="checkbox"
                id="isVerifiedBuyer"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isVerifiedBuyer" className="text-slate-300 font-semibold cursor-pointer select-none">
                Verified Buyer Badge
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-0">
              <AdminSaveButton
                type="submit"
                saveState={storySaveState}
                idleText="Publish Success Story"
                savingText="Publishing Story..."
                savedText="Story Published & Synced!"
                idleIcon={<CheckCircle2 className="w-4 h-4" />}
                className="w-full justify-center"
              />
            </div>
          </div>
        </form>
        )}
      </div>

      {/* SECTION 2: EXISTING SUCCESS STORIES LIST */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" />
              <span>Published Video Success Stories ({filteredStories.length})</span>
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Product */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
              >
                <option value="all">All Products ({successStories.length})</option>
                {products.map((p) => {
                  const count = successStories.filter((s) => s.productId === p.id).length;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none w-44"
              />
            </div>
          </div>
        </div>

        {/* Stories Grid: 3 cards per row */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStories.map((story) => {
              const product = products.find((p) => p.id === story.productId);
              return (
                <div
                  key={story.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group relative"
                >
                  {/* Top Bar with Product & Status */}
                  <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-300 truncate max-w-[160px]" title={product?.title}>
                      📦 {product?.title || 'Unknown Product'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSuccessStoryPublish(story.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 cursor-pointer ${
                          story.published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title={story.published ? 'Story is active on product page' : 'Story is hidden'}
                      >
                        {story.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{story.published ? 'Published' : 'Hidden'}</span>
                      </button>

                      {confirmDeleteId === story.id ? (
                        <div className="flex items-center gap-1 bg-red-950/90 border border-red-500/60 rounded-lg px-2 py-0.5 text-[9px] shadow-sm">
                          <span className="text-red-300 font-bold">Delete?</span>
                          <button
                            type="button"
                            onClick={() => {
                              deleteSuccessStory(story.id);
                              setConfirmDeleteId(null);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] transition-colors cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded text-[9px] transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(story.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Video Stage with Overlaid Customer Info (matches product page showcase) */}
                  <div className="relative aspect-4/5 sm:aspect-video bg-black overflow-hidden flex items-center justify-center">
                    <AdminStoryVideoPlayer videoUrl={story.videoUrl} />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                    {/* Customer Overlay on Top of Video */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 text-white pointer-events-none">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(story.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{story.customerName}</span>
                        {story.verified && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-semibold">
                            Verified
                          </span>
                        )}
                      </div>

                      {story.customerRoleOrLocation && (
                        <p className="text-[10px] text-slate-300">{story.customerRoleOrLocation}</p>
                      )}

                      <p className="text-[11px] text-slate-200 mt-1 line-clamp-2 leading-snug">
                        "{story.storyText}"
                      </p>
                    </div>

                    <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400">
                      Muted Loop
                    </span>
                  </div>

                  {/* Bottom details & Storage Indicator */}
                  <div className="p-3 text-[11px] text-slate-400 space-y-2 border-t border-slate-800/80 bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                      {story.orderNumber && (
                        <span className="font-mono text-[10px] text-slate-500">
                          Order #{story.orderNumber}
                        </span>
                      )}
                    </div>

                    {/* Storage Source & Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
                      <div className="flex items-center gap-1 truncate">
                        {story.videoUrl?.startsWith('indexeddb:') ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                            <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Local Only</span>
                          </span>
                        ) : story.videoUrl?.startsWith('/api/videos/') ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                            <Server className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Media Server URL</span>
                          </span>
                        ) : story.videoUrl?.includes('supabase.co') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            <Database className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>Supabase Bucket CDN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full font-medium truncate max-w-[130px]">
                            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">External CDN</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTriggerReplaceVideo(story.id)}
                          disabled={isReplacingVideo && replacingStoryId === story.id}
                          className="text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          title="Upload new video file for this customer review"
                        >
                          {isReplacingVideo && replacingStoryId === story.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          <span>{isReplacingVideo && replacingStoryId === story.id ? 'Uploading...' : 'Replace Video'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60 space-y-3">
            <Film className="w-8 h-8 mx-auto text-slate-600 mb-1" />
            <p className="text-sm font-bold text-white">No video success stories found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload customer video clips and save success stories directly into database storage.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Video Story</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
