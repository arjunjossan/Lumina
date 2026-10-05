import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { DesktopCustomHero } from './DesktopCustomHero';
import { MobileCustomHero } from './MobileCustomHero';
import { 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Flame, 
  Clock, 
  TrendingUp, 
  Volume2, 
  Truck, 
  CheckCircle2 
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { products, mobileProducts, navigateTo, addToCart, desktopHeroConfig, mobileHeroConfig } = useStore();

  // Find flagship product or first winning product for desktop
  const flagshipProduct = products.find(p => p.isWinningProduct) || products[0];

  // Find flagship product for mobile catalog
  const mobileFlagshipProduct = (mobileProducts && (mobileProducts.find(p => p.isWinningProduct) || mobileProducts[0])) || flagshipProduct;

  // Mobile image gallery selector
  const [selectedMobileImgIndex, setSelectedMobileImgIndex] = useState(0);

  // Countdown Timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isCustomDesktopHeroActive = desktopHeroConfig?.activeHeroType === 'custom' && Boolean(desktopHeroConfig?.imageUrl?.trim());
  const isCustomMobileHeroActive = mobileHeroConfig?.activeHeroType === 'custom' && Boolean(mobileHeroConfig?.imageUrl?.trim());

  if (!flagshipProduct && !isCustomDesktopHeroActive && !isCustomMobileHeroActive) return null;

  const validMobileImages = mobileFlagshipProduct?.images ? mobileFlagshipProduct.images.filter(img => Boolean(img && img.trim())) : [];
  const currentMobileImg = validMobileImages[selectedMobileImgIndex] || mobileFlagshipProduct?.images?.[0] || '';

  return (
    <>
      {/* ================= DESKTOP HERO BANNER ================= */}
      {isCustomDesktopHeroActive ? (
        <DesktopCustomHero />
      ) : flagshipProduct ? (
        <section className="hidden md:block relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-8 sm:py-10 lg:py-14 border-b border-slate-800">
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
                    onClick={() => addToCart(flagshipProduct, 1)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black py-3 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>CLAIM SPECIAL DEAL — BUY NOW</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
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
                  {flagshipProduct.images.filter(img => Boolean(img && img.trim())).map((img, index) => (
                    <button
                      key={index}
                      onClick={() => navigateTo('product-detail', flagshipProduct.id)}
                      className="rounded-lg overflow-hidden border border-slate-800 hover:border-amber-500 transition-colors aspect-square bg-slate-900"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>
      ) : null}

      {/* ================= MOBILE HERO BANNER (Redesigned Light Theme matching Mobile Footer) ================= */}
      {isCustomMobileHeroActive ? (
        <MobileCustomHero />
      ) : mobileFlagshipProduct ? (
        <section className="md:hidden relative bg-[#FAFAF9] text-slate-800 pt-5 pb-8 px-4 border-b border-slate-200/90 overflow-hidden">
        {/* Soft Warm Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-72 bg-gradient-to-b from-amber-200/40 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto relative z-10 space-y-4">
          
          {/* Top Bar: Winning Badge & Rating Snippet */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-bounce" />
              <span>#1 VIRAL WINNING PICK</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 shadow-2xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </div>
              <span>4.9 / 5</span>
              <span className="text-slate-400">• 1,840+ Buyers</span>
            </div>
          </div>

          {/* Product Headline & Subtitle */}
          <div className="space-y-1.5 text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug font-serif">
              {mobileFlagshipProduct.title}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {mobileFlagshipProduct.subtitle || mobileFlagshipProduct.marketingSubtitle || mobileFlagshipProduct.shortDescription}
            </p>
          </div>

          {/* Fancy Mobile Product Showcase Card with Interactive Gallery */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm relative overflow-hidden space-y-2.5">
            <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[4/3] group">
              <img
                src={currentMobileImg}
                alt={mobileFlagshipProduct.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Floating Verified Buyers Pill */}
              <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 py-1 px-2.5 rounded-xl shadow-xs flex items-center gap-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <img className="inline-block h-5 w-5 rounded-full ring-1.5 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="buyer" />
                  <img className="inline-block h-5 w-5 rounded-full ring-1.5 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="buyer" />
                  <img className="inline-block h-5 w-5 rounded-full ring-1.5 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="buyer" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-800">Verified Proof</span>
              </div>

              {/* Floating Savings Tag */}
              {mobileFlagshipProduct.compareAtPrice && (
                <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                  SAVE ₹{(mobileFlagshipProduct.compareAtPrice - mobileFlagshipProduct.price).toFixed(0)}
                </div>
              )}

              {/* Floating Acoustic / Feature Demo Tag */}
              <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>3D Demo Ready</span>
              </div>
            </div>

            {/* Interactive Image Selector Thumbnails */}
            {validMobileImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {validMobileImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedMobileImgIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border transition-all ${
                      selectedMobileImgIndex === idx
                        ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-xs'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Flash Deal & Live Countdown Box */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">
                Flash Sale Deal Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">₹{mobileFlagshipProduct.price.toFixed(2)}</span>
                {mobileFlagshipProduct.compareAtPrice && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    ₹{mobileFlagshipProduct.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> Ends In:
              </span>
              <div className="flex items-center gap-1 mt-1 font-mono font-bold text-amber-600 text-xs">
                <span className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-md shadow-2xs">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>:
                <span className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-md shadow-2xs">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>:
                <span className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-md shadow-2xs">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid (2x2 Clean Badges) */}
          <div className="grid grid-cols-2 gap-2">
            {mobileFlagshipProduct.features.slice(0, 4).map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-2 text-left shadow-2xs"
              >
                <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 line-clamp-1">
                  {feat}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => addToCart(mobileFlagshipProduct, 1)}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white text-xs font-black py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group tracking-wide uppercase"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>CLAIM SPECIAL DEAL — BUY NOW</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('product-detail', mobileFlagshipProduct.id)}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <span>View Full Specifications & Details</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-slate-500 font-semibold flex-wrap">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              30-Day Money Back
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              Free Express Dispatch
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              2,400+ Units Sold
            </span>
          </div>

        </div>
      </section>
      ) : null}
    </>
  );
};
