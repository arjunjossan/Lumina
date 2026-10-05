import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { DesktopHeroButtonConfig, DesktopHeroActionType, DesktopHeroGlowColor } from '../../types';
import { uploadProductMediaFile } from '../../lib/productMediaStorage';
import { 
  Smartphone, 
  Upload, 
  Trash2, 
  Move, 
  Sparkles, 
  ShoppingBag, 
  Sliders, 
  Eye, 
  Save, 
  Info,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Star,
  Volume2,
  ExternalLink,
  Layers
} from 'lucide-react';

export const AdminMobileHero: React.FC = () => {
  const { 
    mobileHeroConfig, 
    updateMobileHeroConfig, 
    deleteMobileHeroBanner, 
    products, 
    mobileProducts,
    showNotification,
    navigateTo,
    addToCart,
    setIsCartOpen
  } = useStore();

  // Flagship product for Default Showcase preview
  const flagshipProduct = products.find(p => p.isWinningProduct) || products[0];

  // Local countdown state for default showcase preview
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Local working state
  const [activeHeroType, setActiveHeroType] = useState<'default' | 'custom'>(mobileHeroConfig.activeHeroType);
  const [imageUrl, setImageUrl] = useState(mobileHeroConfig.imageUrl);
  const [imageAltText, setImageAltText] = useState(mobileHeroConfig.imageAltText || '');
  const [viewFitting] = useState<'fit_screen' | 'cover' | 'contain'>(mobileHeroConfig.viewFitting || 'fit_screen');
  const [maxHeightVh, setMaxHeightVh] = useState<number>(mobileHeroConfig.maxHeightVh || 75);
  const [button1, setButton1] = useState<DesktopHeroButtonConfig>(mobileHeroConfig.button1);
  const [button2, setButton2] = useState<DesktopHeroButtonConfig>(mobileHeroConfig.button2);

  // UI States
  const [selectedButtonId, setSelectedButtonId] = useState<'button1' | 'button2'>('button1');
  const [previewMode, setPreviewMode] = useState<'editor' | 'storefront'>('editor');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Dragging state for mobile visual editor
  const [isDragging, setIsDragging] = useState(false);
  const [dragButtonKey, setDragButtonKey] = useState<'button1' | 'button2' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync from context when context updates
  useEffect(() => {
    setActiveHeroType(mobileHeroConfig.activeHeroType);
    setImageUrl(mobileHeroConfig.imageUrl);
    setImageAltText(mobileHeroConfig.imageAltText || '');
    setMaxHeightVh(mobileHeroConfig.maxHeightVh || 75);
    setButton1(mobileHeroConfig.button1);
    setButton2(mobileHeroConfig.button2);
  }, [mobileHeroConfig]);

  // Handle Save
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        activeHeroType,
        imageUrl,
        imageAltText,
        viewFitting,
        maxHeightVh,
        button1,
        button2
      };
      const ok = await updateMobileHeroConfig(payload);
      if (ok) {
        showNotification('✅ Mobile Hero preferences & button hotspots saved to database!');
      } else {
        showNotification('Mobile Hero preferences saved locally.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Hero Type
  const handleToggleActiveHero = async (newType: 'default' | 'custom') => {
    setActiveHeroType(newType);
    await updateMobileHeroConfig({ activeHeroType: newType });
    showNotification(
      newType === 'custom' 
        ? '📱 Switched active mobile hero to Custom Graphic Banner.'
        : '📱 Switched active mobile hero to Default Flagship Showcase.'
    );
  };

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB. Please choose an optimized web image (WebP, JPG, or PNG).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(30);
    try {
      const uploadResult = await uploadProductMediaFile(
        file,
        file.name,
        'hero'
      );
      const uploadedUrl = uploadResult.url;
      if (uploadedUrl) {
        setUploadProgress(100);
        setImageUrl(uploadedUrl);
        setActiveHeroType('custom');
        await updateMobileHeroConfig({ 
          imageUrl: uploadedUrl, 
          activeHeroType: 'custom',
          imageAltText: imageAltText || file.name.replace(/\.[^/.]+$/, '')
        });
        showNotification('🚀 Mobile Graphic Banner uploaded and saved to Supabase storage!');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Image upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Banner Image Deletion
  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false);
    await deleteMobileHeroBanner();
    setImageUrl('');
    setActiveHeroType('default');
  };

  // Visual Hotspot Drag Handlers
  const handleMouseDownOnButton = (btnKey: 'button1' | 'button2', e: React.MouseEvent) => {
    if (previewMode !== 'editor') return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedButtonId(btnKey);
    setDragButtonKey(btnKey);
    setIsDragging(true);

    if (previewContainerRef.current) {
      const rect = previewContainerRef.current.getBoundingClientRect();
      const currentBtn = btnKey === 'button1' ? button1 : button2;
      const btnPixelX = (currentBtn.x / 100) * rect.width;
      const btnPixelY = (currentBtn.y / 100) * rect.height;
      const clickOffsetX = (e.clientX - rect.left) - btnPixelX;
      const clickOffsetY = (e.clientY - rect.top) - btnPixelY;
      setDragOffset({ x: clickOffsetX, y: clickOffsetY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragButtonKey || !previewContainerRef.current) return;

    const rect = previewContainerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left - dragOffset.x;
    const rawY = e.clientY - rect.top - dragOffset.y;

    const currentBtn = dragButtonKey === 'button1' ? button1 : button2;
    const btnW = currentBtn.width;
    const btnH = currentBtn.height;

    // Percentages clamped between 0 and 100 - size
    const pctX = Math.max(0, Math.min(100 - btnW, (rawX / rect.width) * 100));
    const pctY = Math.max(0, Math.min(100 - btnH, (rawY / rect.height) * 100));

    if (dragButtonKey === 'button1') {
      setButton1(prev => ({ ...prev, x: Math.round(pctX * 10) / 10, y: Math.round(pctY * 10) / 10 }));
    } else {
      setButton2(prev => ({ ...prev, x: Math.round(pctX * 10) / 10, y: Math.round(pctY * 10) / 10 }));
    }
  }, [isDragging, dragButtonKey, dragOffset, button1, button2]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragButtonKey(null);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Glow classes helper - crisp border outline with no blurring shadows to keep button area 100% transparent
  const getGlowClasses = (glowColor: string, isHovered: boolean = false) => {
    switch (glowColor) {
      case 'cyan':
        return `border-cyan-400 ${isHovered ? 'ring-2 ring-cyan-300' : ''}`;
      case 'emerald':
        return `border-emerald-400 ${isHovered ? 'ring-2 ring-emerald-300' : ''}`;
      case 'rose':
        return `border-rose-400 ${isHovered ? 'ring-2 ring-rose-300' : ''}`;
      case 'purple':
        return `border-purple-400 ${isHovered ? 'ring-2 ring-purple-300' : ''}`;
      case 'white':
        return `border-white ${isHovered ? 'ring-2 ring-white/80' : ''}`;
      case 'amber':
      default:
        return `border-amber-400 ${isHovered ? 'ring-2 ring-amber-300' : ''}`;
    }
  };

  const selectedBtnConfig = selectedButtonId === 'button1' ? button1 : button2;
  const setSelectedBtnConfig = (updater: (prev: DesktopHeroButtonConfig) => DesktopHeroButtonConfig) => {
    if (selectedButtonId === 'button1') {
      setButton1(updater);
    } else {
      setButton2(updater);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Mobile Hero Section Studio</h2>
        </div>

        {/* Action Controls: Mode Tabs + Save Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher Tabs */}
          <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => handleToggleActiveHero('default')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHeroType === 'default'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Default Flagship Showcase</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!imageUrl) {
                  showNotification('Please upload a banner image for the custom hero.');
                }
                handleToggleActiveHero('custom');
              }}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHeroType === 'custom'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Custom Graphic Banner</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md hover:shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* SECTION CONTENT BASED ON ACTIVE HERO TYPE */}
      {activeHeroType === 'default' ? (
        /* ================= DEFAULT SHOWCASE PREVIEW SECTION ================= */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Preview: Default Mobile Flagship Showcase
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                This high-converting mobile layout renders automatically on smartphones using your winning product data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live & Serving Shoppers
              </span>
            </div>
          </div>

          {/* Smartphone Simulator Preview */}
          <div className="flex justify-center py-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="w-[360px] bg-[#FAFAF9] text-slate-800 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden p-4 space-y-4">
              
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 mx-auto rounded-b-xl mb-1 -mt-4 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-700 rounded-full" />
              </div>

              {/* Top Badge & Rating */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-800 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>#1 VIRAL PICK</span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-700">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5 (1.8k+)</span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 leading-tight font-serif">
                  {flagshipProduct ? flagshipProduct.title : 'Flagship Wireless Pro'}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {flagshipProduct?.subtitle || flagshipProduct?.shortDescription || 'Experience studio acoustics with active noise cancelling.'}
                </p>
              </div>

              {/* Product Visual */}
              <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[4/3] border border-slate-200">
                <img
                  src={flagshipProduct?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded-lg text-[9px] font-extrabold text-slate-800 shadow-xs">
                  Verified Proof
                </div>
                {flagshipProduct?.compareAtPrice && (
                  <div className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    SAVE ₹{(flagshipProduct.compareAtPrice - flagshipProduct.price).toFixed(0)}
                  </div>
                )}
              </div>

              {/* Pricing & Countdown */}
              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase block">Flash Deal</span>
                  <span className="text-base font-black text-slate-900">
                    ₹{flagshipProduct?.price?.toFixed(2) || '2,499.00'}
                  </span>
                </div>
                <div className="bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg text-right text-[10px] font-bold text-amber-950 font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black py-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </div>
                <div className="bg-white border border-slate-300 text-slate-800 font-extrabold py-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-1">
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CUSTOM GRAPHIC BANNER STUDIO ================= */
        <div className="space-y-6">
          {/* Top Graphic Upload Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Mobile Graphic Banner Asset
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload a high-resolution marketing image designed for smartphone screens (Recommended: 1080×1350, 1080×1920, or 1080×1080).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? `Uploading (${uploadProgress}%)...` : imageUrl ? 'Replace Banner Image' : 'Upload Mobile Banner'}</span>
                </button>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Banner</span>
                  </button>
                )}
              </div>
            </div>

            {/* Direct URL input & Alt tag */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Image URL (Direct Cloud Link or CDN)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://.../mobile-hero-banner.webp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Image Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="e.g., Exclusive Mobile Summer Flash Sale"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* VISUAL DRAG & DROP EDITOR + HOTSPOT CONFIGURATION */}
          {imageUrl ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Visual Mobile Stage Simulator (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Visual Hotspot Stage (Mobile Frame)</span>
                  </div>

                  {/* Mode switcher: Editor vs Storefront preview */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('editor')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewMode === 'editor'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Move className="w-3 h-3" />
                        Editor
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('storefront')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewMode === 'storefront'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3" />
                        Live Test
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  {previewMode === 'editor' 
                    ? '💡 Drag the highlighted button boxes below to position your interactive touch hotspots directly on the graphic.' 
                    : '💡 Live touch mode: Tap hotspots to test your configured link or cart trigger.'}
                </p>

                {/* Smartphone Container Simulator */}
                <div className="flex justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden">
                  <div className="w-[340px] max-w-full bg-slate-950 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden relative">
                    
                    {/* Simulator Notch */}
                    <div className="w-20 h-3.5 bg-slate-800 mx-auto rounded-b-xl flex items-center justify-center z-30 relative">
                      <div className="w-8 h-1 bg-slate-700 rounded-full" />
                    </div>

                    {/* Stage Container */}
                    <div 
                      ref={previewContainerRef}
                      className="relative w-full overflow-hidden select-none bg-slate-950"
                      style={{ minHeight: '380px' }}
                    >
                      <img
                        src={imageUrl}
                        alt="Mobile Banner Preview"
                        className="w-full h-auto block pointer-events-none"
                        draggable={false}
                      />

                      {/* Hotspot 1 Box */}
                      {button1.enabled && (
                        <div
                          onMouseDown={(e) => handleMouseDownOnButton('button1', e)}
                          onClick={(e) => {
                            if (previewMode === 'storefront') {
                              e.preventDefault();
                              if (button1.actionType === 'product_page' && button1.productId) {
                                navigateTo('product-detail', button1.productId);
                              } else if (button1.actionType === 'add_to_cart') {
                                const allProds = [...(mobileProducts || []), ...(products || [])];
                                const p = allProds.find(prod => prod.id === button1.productId);
                                if (p) {
                                  addToCart(p, 1);
                                  setIsCartOpen(true);
                                }
                              } else {
                                showNotification(`Hotspot 1 Triggered: ${button1.actionType}`);
                              }
                            }
                          }}
                          className={`absolute ${
                            previewMode === 'editor' ? 'cursor-move' : 'cursor-pointer'
                          } transition-all z-20 ${
                            previewMode === 'editor'
                              ? selectedButtonId === 'button1' 
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' 
                                : ''
                              : ''
                          } ${previewMode === 'editor' ? getGlowClasses(button1.glowColor, selectedButtonId === 'button1') : ''}`}
                          style={{
                            left: `${button1.x}%`,
                            top: `${button1.y}%`,
                            width: `${button1.width}%`,
                            height: `${button1.height}%`,
                            borderRadius: `${button1.borderRadius}px`,
                            backgroundColor: 'transparent',
                            borderWidth: previewMode === 'editor' ? '2px' : '0px',
                            borderStyle: previewMode === 'editor' ? 'dashed' : 'none',
                            backdropFilter: 'none',
                            boxShadow: 'none'
                          }}
                        >
                          {previewMode === 'editor' && (
                            <span className="absolute -top-3.5 left-0 text-[9px] font-black text-white bg-slate-950/90 px-1.5 py-0.2 rounded-md shadow border border-amber-500/40 pointer-events-none whitespace-nowrap z-30">
                              1: {button1.name || 'Hotspot 1'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Hotspot 2 Box */}
                      {button2.enabled && (
                        <div
                          onMouseDown={(e) => handleMouseDownOnButton('button2', e)}
                          onClick={(e) => {
                            if (previewMode === 'storefront') {
                              e.preventDefault();
                              if (button2.actionType === 'product_page' && button2.productId) {
                                navigateTo('product-detail', button2.productId);
                              } else if (button2.actionType === 'add_to_cart') {
                                const allProds = [...(mobileProducts || []), ...(products || [])];
                                const p = allProds.find(prod => prod.id === button2.productId);
                                if (p) {
                                  addToCart(p, 1);
                                  setIsCartOpen(true);
                                }
                              } else {
                                showNotification(`Hotspot 2 Triggered: ${button2.actionType}`);
                              }
                            }
                          }}
                          className={`absolute ${
                            previewMode === 'editor' ? 'cursor-move' : 'cursor-pointer'
                          } transition-all z-20 ${
                            previewMode === 'editor'
                              ? selectedButtonId === 'button2' 
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' 
                                : ''
                              : ''
                          } ${previewMode === 'editor' ? getGlowClasses(button2.glowColor, selectedButtonId === 'button2') : ''}`}
                          style={{
                            left: `${button2.x}%`,
                            top: `${button2.y}%`,
                            width: `${button2.width}%`,
                            height: `${button2.height}%`,
                            borderRadius: `${button2.borderRadius}px`,
                            backgroundColor: 'transparent',
                            borderWidth: previewMode === 'editor' ? '2px' : '0px',
                            borderStyle: previewMode === 'editor' ? 'dashed' : 'none',
                            backdropFilter: 'none',
                            boxShadow: 'none'
                          }}
                        >
                          {previewMode === 'editor' && (
                            <span className="absolute -top-3.5 left-0 text-[9px] font-black text-white bg-slate-950/90 px-1.5 py-0.2 rounded-md shadow border border-amber-500/40 pointer-events-none whitespace-nowrap z-30">
                              2: {button2.name || 'Hotspot 2'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hotspot Controls & Behavior Settings (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Hotspot Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedButtonId('button1')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      selectedButtonId === 'button1'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Hotspot 1</span>
                    {button1.enabled ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedButtonId('button2')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      selectedButtonId === 'button2'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Hotspot 2</span>
                    {button2.enabled ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </button>
                </div>

                {/* Hotspot Fine-Tuning Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Configure {selectedButtonId === 'button1' ? 'Hotspot 1' : 'Hotspot 2'}
                    </span>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBtnConfig.enabled}
                        onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                      <span className="ml-2 text-xs font-semibold text-slate-300">
                        {selectedBtnConfig.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  {selectedBtnConfig.enabled && (
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Hotspot Label (Admin Ref)
                        </label>
                        <input
                          type="text"
                          value={selectedBtnConfig.name || ''}
                          onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Shop Winning Headphones"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Action Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Action Trigger
                        </label>
                        <select
                          value={selectedBtnConfig.actionType}
                          onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, actionType: e.target.value as DesktopHeroActionType }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                        >
                          <option value="product_page">Open Product Detail Page</option>
                          <option value="add_to_cart">Instant Add Product to Cart</option>
                          <option value="catalog">Scroll to Product Catalog</option>
                          <option value="deals">Open Flash Sale Deals Modal</option>
                          <option value="cart">Open Cart Drawer</option>
                          <option value="custom_url">External / Custom URL</option>
                        </select>
                      </div>

                      {/* Target Product Selector if product action */}
                      {(selectedBtnConfig.actionType === 'product_page' || selectedBtnConfig.actionType === 'add_to_cart') && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                            Target Catalog Product
                          </label>
                          <select
                            value={selectedBtnConfig.productId || ''}
                            onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, productId: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                          >
                            <option value="">-- Choose Target Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.isWinningProduct ? '⭐ ' : ''}{p.title} (₹{p.price})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Custom URL if custom_url */}
                      {selectedBtnConfig.actionType === 'custom_url' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                            Custom Link (URL or #hash)
                          </label>
                          <input
                            type="text"
                            value={selectedBtnConfig.customUrl || ''}
                            onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, customUrl: e.target.value }))}
                            placeholder="https://... or #catalog-grid"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                          />
                        </div>
                      )}

                      {/* Glowing Ring Color */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Glow Border Color Theme
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'amber', label: 'Gold Amber', bg: 'bg-amber-500' },
                            { id: 'cyan', label: 'Neon Cyan', bg: 'bg-cyan-500' },
                            { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
                            { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-500' },
                            { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
                            { id: 'white', label: 'Clean White', bg: 'bg-white' }
                          ].map(color => (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => setSelectedBtnConfig(prev => ({ ...prev, glowColor: color.id as DesktopHeroGlowColor }))}
                              className={`flex items-center gap-1.5 p-2 rounded-xl border text-[11px] font-bold transition-all ${
                                selectedBtnConfig.glowColor === color.id
                                  ? 'border-white bg-slate-800 text-white shadow-xs'
                                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${color.bg}`} />
                              <span className="truncate">{color.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Position & Sizing Sliders */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                            <span>Left X ({selectedBtnConfig.x}%)</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            step="0.5"
                            value={selectedBtnConfig.x}
                            onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                            <span>Top Y ({selectedBtnConfig.y}%)</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            step="0.5"
                            value={selectedBtnConfig.y}
                            onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                            <span>Width ({selectedBtnConfig.width}%)</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="95"
                            step="0.5"
                            value={selectedBtnConfig.width}
                            onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                            <span>Height ({selectedBtnConfig.height}%)</span>
                          </div>
                          <input
                            type="range"
                            min="4"
                            max="50"
                            step="0.5"
                            value={selectedBtnConfig.height}
                            onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Border radius */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                          <span>Corner Rounding ({selectedBtnConfig.borderRadius}px)</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="1"
                          value={selectedBtnConfig.borderRadius}
                          onChange={(e) => setSelectedBtnConfig(prev => ({ ...prev, borderRadius: parseInt(e.target.value, 10) }))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Empty State Banner */
            <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-black text-white">No Mobile Graphic Banner Uploaded Yet</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload a graphic banner designed specifically for mobile shoppers (e.g. 1080x1350 or 1080x1920) to enable interactive hotspot configuration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Mobile Banner Image</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Custom Mobile Banner?</h3>
                <p className="text-xs text-slate-400">This will remove the uploaded graphic from Supabase storage.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your mobile store will immediately revert to the Default Flagship Showcase. You can upload a new mobile banner at any time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
