import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { DesktopHeroButtonConfig, DesktopHeroActionType, DesktopHeroGlowColor } from '../../types';
import { uploadProductMediaFile } from '../../lib/productMediaStorage';
import { 
  Monitor, 
  Upload, 
  Trash2, 
  Move, 
  Sparkles, 
  ShoppingBag, 
  Maximize2, 
  Sliders, 
  Eye, 
  Save, 
  Info,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Star,
  Volume2,
  ExternalLink
} from 'lucide-react';

export const AdminDesktopHero: React.FC = () => {
  const { 
    desktopHeroConfig, 
    updateDesktopHeroConfig, 
    deleteDesktopHeroBanner, 
    products, 
    showNotification,
    navigateTo,
    addToCart,
    setIsCartOpen
  } = useStore();

  // Flagship product for Default Showcase preview
  const flagshipProduct = products.find(p => p.isWinningProduct) || products[0];

  // Local countdown state for default showcase preview
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Local working state for fine-tuning before/during saves
  const [activeHeroType, setActiveHeroType] = useState<'default' | 'custom'>(desktopHeroConfig.activeHeroType);
  const [imageUrl, setImageUrl] = useState(desktopHeroConfig.imageUrl);
  const [imageAltText, setImageAltText] = useState(desktopHeroConfig.imageAltText || '');
  const [viewFitting] = useState<'fit_screen' | 'cover' | 'contain'>(desktopHeroConfig.viewFitting || 'fit_screen');
  const [maxHeightVh, setMaxHeightVh] = useState<number>(desktopHeroConfig.maxHeightVh || 82);
  const [button1, setButton1] = useState<DesktopHeroButtonConfig>(desktopHeroConfig.button1);
  const [button2, setButton2] = useState<DesktopHeroButtonConfig>(desktopHeroConfig.button2);

  // UI States
  const [selectedButtonId, setSelectedButtonId] = useState<'button1' | 'button2'>('button1');
  const [previewMode, setPreviewMode] = useState<'editor' | 'storefront'>('editor');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragButtonKey, setDragButtonKey] = useState<'button1' | 'button2' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync from context when context updates from db
  useEffect(() => {
    setActiveHeroType(desktopHeroConfig.activeHeroType);
    setImageUrl(desktopHeroConfig.imageUrl);
    setImageAltText(desktopHeroConfig.imageAltText || '');
    setMaxHeightVh(desktopHeroConfig.maxHeightVh || 82);
    setButton1(desktopHeroConfig.button1);
    setButton2(desktopHeroConfig.button2);
  }, [desktopHeroConfig]);

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
      const ok = await updateDesktopHeroConfig(payload);
      if (ok) {
        showNotification('✅ Desktop Hero preferences and button positions saved to database!');
      } else {
        showNotification('Desktop Hero preferences saved locally.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Hero Type
  const handleToggleActiveHero = async (newType: 'default' | 'custom') => {
    setActiveHeroType(newType);
    await updateDesktopHeroConfig({ activeHeroType: newType });
    showNotification(
      newType === 'custom' 
        ? '✓ Custom Graphic Hero Banner is now selected & LIVE on desktop homepage!' 
        : '✓ Default Flagship Product Showcase is now selected & LIVE on desktop homepage!'
    );
  };

  // Upload image to Supabase storage bucket
  const handleImageFileSelected = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(40);
    try {
      const result = await uploadProductMediaFile(file, file.name, 'hero');
      setUploadProgress(100);

      if (result && result.url) {
        setImageUrl(result.url);
        // Automatically set active to custom if user uploads an image
        setActiveHeroType('custom');
        await updateDesktopHeroConfig({
          imageUrl: result.url,
          activeHeroType: 'custom',
          imageAltText: imageAltText || file.name.replace(/\.[^/.]+$/, '')
        });
        showNotification('✅ Banner image uploaded to storage bucket and saved to database!');
      } else {
        showNotification('Image upload failed. Please check network or try again.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      showNotification('Error uploading image file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Permanent image delete and reset
  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsSaving(true);
    try {
      await deleteDesktopHeroBanner();
      setImageUrl('');
      setActiveHeroType('default');
    } finally {
      setIsSaving(false);
    }
  };

  // Mouse Drag Events for Interactive Button Positioning
  const handleMouseDownOnButton = (btnKey: 'button1' | 'button2', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedButtonId(btnKey);
    setDragButtonKey(btnKey);
    setIsDragging(true);

    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const btn = btnKey === 'button1' ? button1 : button2;

    const currentPxX = (btn.x / 100) * rect.width;
    const currentPxY = (btn.y / 100) * rect.height;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setDragOffset({
      x: clickX - currentPxX,
      y: clickY - currentPxY
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragButtonKey || !previewContainerRef.current) return;

    const rect = previewContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - dragOffset.x;
    const mouseY = e.clientY - rect.top - dragOffset.y;

    const currentBtn = dragButtonKey === 'button1' ? button1 : button2;

    let newXPercent = (mouseX / rect.width) * 100;
    let newYPercent = (mouseY / rect.height) * 100;

    newXPercent = Math.max(0, Math.min(100 - currentBtn.width, Math.round(newXPercent * 10) / 10));
    newYPercent = Math.max(0, Math.min(100 - currentBtn.height, Math.round(newYPercent * 10) / 10));

    if (dragButtonKey === 'button1') {
      setButton1(prev => ({ ...prev, x: newXPercent, y: newYPercent }));
    } else {
      setButton2(prev => ({ ...prev, x: newXPercent, y: newYPercent }));
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
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Test button click action
  const handleTestClick = (btn: DesktopHeroButtonConfig) => {
    if (!btn.enabled) {
      showNotification('This button is currently disabled.');
      return;
    }

    switch (btn.actionType) {
      case 'product_page': {
        const prod = products.find(p => p.id === btn.productId);
        if (prod) {
          showNotification(`🚀 Test Action: Navigating to Product "${prod.title}"`);
          navigateTo('product-detail', prod.id);
        } else {
          showNotification('No product selected for this button.');
        }
        break;
      }
      case 'add_to_cart': {
        const prod = products.find(p => p.id === btn.productId);
        if (prod) {
          addToCart(prod, 1);
          setIsCartOpen(true);
          showNotification(`🛒 Test Action: Added "${prod.title}" to cart & opened drawer!`);
        } else {
          showNotification('No product selected for add-to-cart.');
        }
        break;
      }
      case 'custom_url': {
        showNotification(`🔗 Test Action: Link target ${btn.customUrl || '/'}`);
        break;
      }
      default: {
        showNotification('Action clicked.');
      }
    }
  };

  // Helper for active selected button config
  const activeBtn = selectedButtonId === 'button1' ? button1 : button2;
  const updateActiveBtn = (updates: Partial<DesktopHeroButtonConfig>) => {
    if (selectedButtonId === 'button1') {
      setButton1(prev => ({ ...prev, ...updates }));
    } else {
      setButton2(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP HEADER & LIVE HOMEPAGE TOGGLE CONTROL */}
      {/* ========================================================= */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Monitor className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white font-serif">Desktop Hero Section Manager</h2>
        </div>

        {/* Action Controls & Live Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hero Type Toggle Switch */}
          <div className="inline-flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleActiveHero('default')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHeroType === 'default'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Default Showcase</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!imageUrl) {
                  showNotification('Please upload a banner image for the custom hero.');
                }
                handleToggleActiveHero('custom');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHeroType === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Custom Graphic Banner</span>
            </button>
          </div>

          {/* Save All Changes Button (if custom mode) */}
          {activeHeroType === 'custom' && (
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONDITIONAL CONTENT: DEFAULT SHOWCASE vs CUSTOM GRAPHIC BANNER */}
      {/* ========================================================= */}

      {activeHeroType === 'default' ? (
        /* ========================================================= */
        /* DEFAULT SHOWCASE PREVIEW AS SEEN BY CLIENTS ON DESKTOP */
        /* ========================================================= */
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Eye className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-white">Default Showcase Live Preview:</strong> This is the exact layout shown on the desktop storefront when Default Showcase is selected. It features your flagship viral product with full customer-facing purchase triggers.
              </span>
            </div>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold px-3 py-1 rounded-xl whitespace-nowrap">
              Active Storefront View
            </span>
          </div>

          {/* Live Render of Default Showcase */}
          {flagshipProduct ? (
            <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-8 sm:py-10 lg:py-14 border-b border-slate-800">
                {/* Glow Backdrop */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    
                    {/* Left Text Column */}
                    <div className="lg:col-span-7 space-y-4 lg:space-y-5 text-left">
                      {/* Winning Badge */}
                      <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase shadow-inner">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                        <span>#1 VIRAL WINNING PRODUCT OF THE MONTH</span>
                      </div>

                      {/* Headline */}
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight font-serif text-white">
                        {flagshipProduct.title}
                      </h1>

                      {/* Subtitle */}
                      <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-2xl">
                        {flagshipProduct.subtitle || flagshipProduct.shortDescription}
                      </p>

                      {/* Feature Highlights Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {flagshipProduct.features.slice(0, 4).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-medium">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price & Limited Time Deal */}
                      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                            Flash Sale Discount Price
                          </span>
                          <div className="flex items-baseline gap-2.5">
                            <span className="text-2xl sm:text-3xl font-black text-white">₹{flagshipProduct.price.toFixed(2)}</span>
                            {flagshipProduct.compareAtPrice && (
                              <span className="text-sm text-slate-500 line-through">₹{flagshipProduct.compareAtPrice.toFixed(2)}</span>
                            )}
                            <span className="bg-rose-500/20 text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded border border-rose-500/30">
                              SAVE ₹{(flagshipProduct.compareAtPrice! - flagshipProduct.price).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Countdown */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> Flash Offer Ends In:
                          </span>
                          <div className="flex items-center gap-1 mt-1 font-mono font-bold text-amber-300 text-xs sm:text-sm">
                            <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{String(timeLeft.hours).padStart(2, '0')}h</span>:
                            <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{String(timeLeft.minutes).padStart(2, '0')}m</span>:
                            <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                          </div>
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(flagshipProduct, 1);
                            setIsCartOpen(true);
                          }}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black py-3 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group active:scale-98"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>CLAIM SPECIAL DEAL — BUY NOW</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigateTo('product-detail', flagshipProduct.id)}
                          className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span>View Full Specifications</span>
                        </button>
                      </div>

                      {/* Trust Footer */}
                      <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          30-Day Money Back Guarantee
                        </span>
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                          Over 2,400+ Units Sold
                        </span>
                      </div>
                    </div>

                    {/* Right Product Showcase Gallery / Feature Preview */}
                    <div className="lg:col-span-5 relative">
                      <div className="relative mx-auto max-w-sm lg:max-w-md">
                        {/* Main Display Box */}
                        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl bg-slate-900 group">
                          <img
                            src={flagshipProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                            alt={flagshipProduct.title}
                            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
                          />

                          {/* Floating Social Proof Tag */}
                          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl text-xs flex items-center gap-2.5 text-white shadow-xl">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="buyer" />
                              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="buyer" />
                              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="buyer" />
                            </div>
                            <div>
                              <p className="font-bold text-amber-400 text-[11px]">1,840 Verified Buyers</p>
                              <div className="flex items-center text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                                ))}
                                <span className="text-[9px] text-slate-300 ml-1">(4.9/5 Rating)</span>
                              </div>
                            </div>
                          </div>

                          {/* Floating Sound / Video Demo Button */}
                          <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>3D Acoustic Demo Ready</span>
                          </div>
                        </div>
                      </div>

                      {/* Thumbnail Selector */}
                      <div className="grid grid-cols-3 gap-2 mt-2.5">
                        {flagshipProduct.images.filter(img => Boolean(img && img.trim())).slice(0, 3).map((img, index) => (
                          <div
                            key={index}
                            className="rounded-lg overflow-hidden border border-slate-800 aspect-square bg-slate-900"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
              No products found in catalog to display for the Default Showcase.
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* CUSTOM GRAPHIC BANNER WORKSPACE & CONFIGURATION */
        /* ========================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: INTERACTIVE VISUAL PREVIEW & DRAG-AND-DROP CANVAS (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
              
              {/* Canvas Header & Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Visual Drag & Drop Canvas</h3>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                    {previewMode === 'editor' ? 'Interactive Dragging Active' : 'Storefront Simulation'}
                  </span>
                </div>

                {/* Toggle Editor vs Storefront simulation */}
                <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('editor')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      previewMode === 'editor' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Editor & Drag Handles</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('storefront')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      previewMode === 'storefront' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Storefront View</span>
                  </button>
                </div>
              </div>

              {/* Instruction Banner */}
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60 flex items-start gap-2.5 text-xs text-slate-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">How positioning works: </span>
                  Click and drag either button directly on the image preview below to place it exactly where your graphic requires.
                </div>
              </div>

              {/* Main Interactive Canvas Area */}
              {imageUrl ? (
                <div className="relative w-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-slate-800 select-none flex items-center justify-center p-2">
                  
                  {/* Visual Canvas Container tightly wrapping the image */}
                  <div 
                    ref={previewContainerRef}
                    className="relative inline-block max-w-full overflow-hidden shadow-2xl rounded-xl"
                    style={{
                      maxHeight: '520px'
                    }}
                  >
                    {/* Banner Image */}
                    <img
                      src={imageUrl}
                      alt={imageAltText || 'Custom Desktop Hero'}
                      className="max-w-full block mx-auto object-contain"
                      style={{
                        maxHeight: '520px'
                      }}
                    />

                    {/* ========================================================= */}
                    {/* BUTTON 1 CANVAS HOTSPOT */}
                    {/* ========================================================= */}
                    {button1.enabled && (
                      <div
                        onMouseDown={(e) => previewMode === 'editor' && handleMouseDownOnButton('button1', e)}
                        onClick={(e) => {
                          if (previewMode === 'editor') {
                            setSelectedButtonId('button1');
                          } else {
                            handleTestClick(button1);
                          }
                        }}
                        className={`absolute transition-shadow duration-200 cursor-move border ${
                          previewMode === 'editor'
                            ? selectedButtonId === 'button1'
                              ? 'ring-2 ring-amber-400 border-amber-300 bg-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                              : 'border-white/60 bg-white/10 hover:border-amber-400 hover:bg-white/20'
                            : `animate-pulse cursor-pointer ${
                                button1.glowColor === 'cyan' ? 'shadow-[0_0_24px_rgba(6,182,212,0.9)] border-cyan-400' :
                                button1.glowColor === 'emerald' ? 'shadow-[0_0_24px_rgba(16,185,129,0.9)] border-emerald-400' :
                                button1.glowColor === 'rose' ? 'shadow-[0_0_24px_rgba(244,63,94,0.9)] border-rose-400' :
                                button1.glowColor === 'purple' ? 'shadow-[0_0_24px_rgba(168,85,247,0.9)] border-purple-400' :
                                button1.glowColor === 'white' ? 'shadow-[0_0_24px_rgba(255,255,255,0.9)] border-white' :
                                'shadow-[0_0_24px_rgba(245,158,11,0.9)] border-amber-400'
                              } bg-white/5`
                        }`}
                        style={{
                          left: `${button1.x}%`,
                          top: `${button1.y}%`,
                          width: `${button1.width}%`,
                          height: `${button1.height}%`,
                          borderRadius: `${button1.borderRadius || 12}px`
                        }}
                      >
                        {/* In Editor Mode: Show Button Label & Coordinates */}
                        {previewMode === 'editor' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center pointer-events-none">
                            <span className="text-[10px] font-black text-amber-300 bg-slate-950/90 px-1.5 py-0.5 rounded shadow truncate max-w-full">
                              {button1.name || 'Button 1'}
                            </span>
                            <span className="text-[8px] font-mono text-slate-300 bg-slate-950/75 px-1 rounded mt-0.5">
                              {button1.x.toFixed(1)}%, {button1.y.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          /* In Storefront Simulation: Pure glowing hotspot without text */
                          <div className="w-full h-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* BUTTON 2 CANVAS HOTSPOT */}
                    {/* ========================================================= */}
                    {button2.enabled && (
                      <div
                        onMouseDown={(e) => previewMode === 'editor' && handleMouseDownOnButton('button2', e)}
                        onClick={(e) => {
                          if (previewMode === 'editor') {
                            setSelectedButtonId('button2');
                          } else {
                            handleTestClick(button2);
                          }
                        }}
                        className={`absolute transition-shadow duration-200 cursor-move border ${
                          previewMode === 'editor'
                            ? selectedButtonId === 'button2'
                              ? 'ring-2 ring-sky-400 border-sky-300 bg-sky-500/25 shadow-[0_0_20px_rgba(56,189,248,0.6)]'
                              : 'border-white/60 bg-white/10 hover:border-sky-400 hover:bg-white/20'
                            : `animate-pulse cursor-pointer ${
                                button2.glowColor === 'cyan' ? 'shadow-[0_0_24px_rgba(6,182,212,0.9)] border-cyan-400' :
                                button2.glowColor === 'emerald' ? 'shadow-[0_0_24px_rgba(16,185,129,0.9)] border-emerald-400' :
                                button2.glowColor === 'rose' ? 'shadow-[0_0_24px_rgba(244,63,94,0.9)] border-rose-400' :
                                button2.glowColor === 'purple' ? 'shadow-[0_0_24px_rgba(168,85,247,0.9)] border-purple-400' :
                                button2.glowColor === 'white' ? 'shadow-[0_0_24px_rgba(255,255,255,0.9)] border-white' :
                                'shadow-[0_0_24px_rgba(245,158,11,0.9)] border-amber-400'
                              } bg-white/5`
                        }`}
                        style={{
                          left: `${button2.x}%`,
                          top: `${button2.y}%`,
                          width: `${button2.width}%`,
                          height: `${button2.height}%`,
                          borderRadius: `${button2.borderRadius || 12}px`
                        }}
                      >
                        {/* In Editor Mode: Show Button Label & Coordinates */}
                        {previewMode === 'editor' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center pointer-events-none">
                            <span className="text-[10px] font-black text-sky-300 bg-slate-950/90 px-1.5 py-0.5 rounded shadow truncate max-w-full">
                              {button2.name || 'Button 2'}
                            </span>
                            <span className="text-[8px] font-mono text-slate-300 bg-slate-950/75 px-1 rounded mt-0.5">
                              {button2.x.toFixed(1)}%, {button2.y.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          /* In Storefront Simulation: Pure glowing hotspot without text */
                          <div className="w-full h-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty state when no image uploaded */
                <div className="h-72 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-slate-900/40">
                  <Upload className="w-10 h-10 text-slate-500 mb-3 animate-bounce" />
                  <p className="text-sm font-bold text-white mb-1">No Desktop Hero Banner Image Uploaded</p>
                  <p className="text-xs text-slate-400 max-w-md mb-4">
                    Upload your high-resolution banner graphic using the form on the right. Once uploaded, you will be able to drag and drop both button hotspots directly on the visual preview.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition-all"
                  >
                    Upload Banner Image Now
                  </button>
                </div>
              )}

              {/* Canvas Quick Actions / Button Selectors */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Select Button to Edit:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedButtonId('button1')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedButtonId === 'button1'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Button 1 ({button1.name || 'Action 1'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedButtonId('button2')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedButtonId === 'button2'
                        ? 'bg-sky-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Button 2 ({button2.name || 'Action 2'})
                  </button>
                </div>

                {/* Test Button Action */}
                <button
                  type="button"
                  onClick={() => handleTestClick(activeBtn)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl"
                >
                  <span>Test Selected Button Click</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Screen Fitting & View Height Card (Maximum Viewport Height Slider) */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Screen View & Responsive Fitting</h3>
              </div>
              <p className="text-xs text-slate-400">
                Control the maximum height of the banner so desktop visitors view the entire graphic in one glance without scrolling down.
              </p>

              {/* Height Slider Horizontal Bar Line */}
              <div className="pt-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-300 mb-2">
                  <span className="font-semibold">Maximum Viewport Height:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">{maxHeightVh}vh of screen</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="95"
                  step="1"
                  value={maxHeightVh}
                  onChange={(e) => setMaxHeightVh(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                  <span>55vh (Compact)</span>
                  <span>75vh (Standard Laptop)</span>
                  <span>95vh (Full Height)</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: IMAGE UPLOAD & BUTTON CONFIGURATION CONTROLS (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. IMAGE UPLOAD & STORAGE BUCKET CARD */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Banner Image & Bucket Storage</h3>
                </div>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl"
                    title="Delete image file from storage bucket and reset hero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete & Reset</span>
                  </button>
                )}
              </div>

              {/* Upload Area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFileSelected(file);
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleImageFileSelected(file);
                }}
                className="border-2 border-dashed border-slate-800 hover:border-amber-500/60 transition-colors p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/40"
              >
                <Upload className="w-6 h-6 text-amber-400 mb-1.5" />
                <p className="text-xs font-bold text-white">
                  {isUploading ? `Uploading to Storage Bucket (${uploadProgress}%)...` : 'Click to Upload or Drag & Drop Image'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG, WEBP, or SVG up to 50MB. Stored in Supabase &apos;products&apos; bucket.
                </p>
                {isUploading && (
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>

              {/* Manual Image URL Input fallback */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Direct Image URL (Supabase Bucket or CDN)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://.../storage/v1/object/public/products/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Alt text input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Image Alt Text (Accessibility & SEO)
                </label>
                <input
                  type="text"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="e.g., Lumina Premium Audio Collection Launch"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. SELECTED BUTTON (HOTSPOT) ACTION & POSITIONING CONTROLS */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Configure {selectedButtonId === 'button1' ? 'Button 1' : 'Button 2'}
                  </h3>
                </div>
                
                {/* Enabled toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <span className="text-slate-400">Active</span>
                  <input
                    type="checkbox"
                    checked={activeBtn.enabled}
                    onChange={(e) => updateActiveBtn({ enabled: e.target.checked })}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Internal Label (for admin identification only) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Button Label (Admin Reference Only)
                </label>
                <input
                  type="text"
                  value={activeBtn.name}
                  onChange={(e) => updateActiveBtn({ name: e.target.value })}
                  placeholder="e.g. Shop Flagship Headphones"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Action Type Selector ("What should open on clicking") */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  On-Click Action (What Should Open Next?)
                </label>
                <select
                  value={activeBtn.actionType}
                  onChange={(e) => updateActiveBtn({ actionType: e.target.value as DesktopHeroActionType })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="product_page">🛍️ Open Product Detail Page</option>
                  <option value="add_to_cart">⚡ Direct Add to Cart & Open Cart Drawer</option>
                  <option value="custom_url">🔗 Custom Link / URL Target</option>
                </select>
              </div>

              {/* Target Product Selection (if product_page or add_to_cart) */}
              {(activeBtn.actionType === 'product_page' || activeBtn.actionType === 'add_to_cart') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Target Product
                  </label>
                  <select
                    value={activeBtn.productId || ''}
                    onChange={(e) => updateActiveBtn({ productId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Choose a Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} — ₹{p.price} ({p.sku}) {p.isWinningProduct ? '★ Winning' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom URL Input (if custom_url selected) */}
              {activeBtn.actionType === 'custom_url' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Target Link / URL
                  </label>
                  <input
                    type="text"
                    value={activeBtn.customUrl || ''}
                    onChange={(e) => updateActiveBtn({ customUrl: e.target.value })}
                    placeholder="e.g. /my-orders, #specials, or https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Glow Color Theme on Scroll & Hover */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Radiant Glow Aura (Glows On Scroll & Hover)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'amber', label: 'Amber Gold', bg: 'bg-amber-500', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.8)]' },
                    { key: 'cyan', label: 'Cyan Neon', bg: 'bg-cyan-400', glow: 'shadow-[0_0_12px_rgba(6,182,212,0.8)]' },
                    { key: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-400', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.8)]' },
                    { key: 'rose', label: 'Electric Rose', bg: 'bg-rose-500', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.8)]' },
                    { key: 'purple', label: 'Royal Violet', bg: 'bg-purple-500', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.8)]' },
                    { key: 'white', label: 'Silver White', bg: 'bg-white', glow: 'shadow-[0_0_12px_rgba(255,255,255,0.8)]' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateActiveBtn({ glowColor: item.key as DesktopHeroGlowColor })}
                      className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                        activeBtn.glowColor === item.key
                          ? 'border-amber-400 bg-slate-900 text-white ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${item.bg} ${item.glow}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Tuning Coordinate Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-800/60">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Precision Coordinate Sliders</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedButtonId === 'button1') {
                        updateActiveBtn({ x: 38, y: 78, width: 22, height: 8 });
                      } else {
                        updateActiveBtn({ x: 62, y: 78, width: 22, height: 8 });
                      }
                    }}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Reset Position
                  </button>
                </div>

                {/* X Position */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Horizontal (Left X):</span>
                    <span className="font-mono text-amber-400 font-bold">{activeBtn.x.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={100 - activeBtn.width}
                    step="0.5"
                    value={activeBtn.x}
                    onChange={(e) => updateActiveBtn({ x: Number(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-900 cursor-pointer"
                  />
                </div>

                {/* Y Position */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Vertical (Top Y):</span>
                    <span className="font-mono text-amber-400 font-bold">{activeBtn.y.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={100 - activeBtn.height}
                    step="0.5"
                    value={activeBtn.y}
                    onChange={(e) => updateActiveBtn({ y: Number(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-900 cursor-pointer"
                  />
                </div>

                {/* Width & Height */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Width:</span>
                      <span className="font-mono text-amber-400 font-bold">{activeBtn.width}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={activeBtn.width}
                      onChange={(e) => updateActiveBtn({ width: Number(e.target.value) })}
                      className="w-full accent-amber-500 bg-slate-900 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Height:</span>
                      <span className="font-mono text-amber-400 font-bold">{activeBtn.height}%</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="25"
                      step="0.5"
                      value={activeBtn.height}
                      onChange={(e) => updateActiveBtn({ height: Number(e.target.value) })}
                      className="w-full accent-amber-500 bg-slate-900 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Corner Roundness:</span>
                    <span className="font-mono text-amber-400 font-bold">{activeBtn.borderRadius || 12}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={activeBtn.borderRadius || 12}
                    onChange={(e) => updateActiveBtn({ borderRadius: Number(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONFIRM PERMANENT DELETE MODAL */}
      {/* ========================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Hero Banner & Storage File?</h3>
              <p className="text-xs text-slate-400">
                This will permanently delete the uploaded hero image from your Supabase Storage bucket and reset the desktop hero back to the Default Flagship Product Showcase.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 shadow-lg"
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
