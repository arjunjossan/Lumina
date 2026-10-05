import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Flame, 
  Tag, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Clock,
  Sparkles,
  Percent,
  Gift
} from 'lucide-react';

export const FlashSalePopupModal: React.FC = () => {
  const { 
    promoPopupConfig, 
    products, 
    applyPromoCode, 
    navigateTo, 
    showNotification,
    isFlashSalePopupOpen,
    setIsFlashSalePopupOpen
  } = useStore();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 48, seconds: 35 });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto show on first load if enabled
  useEffect(() => {
    if (!promoPopupConfig.enabled) return;

    // Check if already shown this session
    const shownThisSession = sessionStorage.getItem('lumina_flash_popup_shown');
    if (shownThisSession) return;

    const timer = setTimeout(() => {
      setIsFlashSalePopupOpen(true);
      sessionStorage.setItem('lumina_flash_popup_shown', 'true');
    }, (promoPopupConfig.delaySeconds || 2) * 1000);

    return () => clearTimeout(timer);
  }, [promoPopupConfig.enabled, promoPopupConfig.delaySeconds, setIsFlashSalePopupOpen]);

  if (!isFlashSalePopupOpen) return null;

  // Single featured product selection
  const targetProductId = promoPopupConfig.featuredProductId || 
    (promoPopupConfig.featuredProductIds && promoPopupConfig.featuredProductIds.length > 0 ? promoPopupConfig.featuredProductIds[0] : null);

  const targetProduct = targetProductId ? products.find((p) => p.id === targetProductId) : null;

  const discountPercent = promoPopupConfig.discountPercent || 20;
  const promoCode = (promoPopupConfig.promoCode || 'FLASH20').trim().toUpperCase();

  const originalPrice = targetProduct ? targetProduct.price : 99.99;
  const discountedPrice = targetProduct ? Math.round((originalPrice * (1 - discountPercent / 100)) * 100) / 100 : 79.99;
  const savings = (originalPrice - discountedPrice).toFixed(2);

  const handleClaim = () => {
    if (promoCode) {
      const res = applyPromoCode(promoCode);
      showNotification(res.message);
    }
    setIsFlashSalePopupOpen(false);
    if (targetProduct) {
      navigateTo('product-detail', targetProduct.id);
    } else {
      navigateTo('catalog');
    }
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    showNotification(`Promo code ${promoCode} copied & saved!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl sm:rounded-3xl max-w-[340px] xs:max-w-[360px] sm:max-w-lg w-full border border-amber-500/40 overflow-hidden shadow-2xl shadow-amber-500/10 relative text-slate-100 flex flex-col max-h-[90vh] sm:max-h-[92vh]">
        
        {/* Gift Ribbon Corner Accent (Mobile & Desktop) */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-30">
          <div className="absolute transform rotate-45 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-[8px] sm:text-[9px] py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-md uppercase tracking-wider flex items-center justify-center gap-0.5">
            <Gift className="w-2.5 h-2.5 inline" />
            <span>VIP Gift</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsFlashSalePopupOpen(false)}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-40 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/80 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/80 transition-colors shadow-lg cursor-pointer active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Modal Header Image / Gift Banner */}
        <div className="relative h-28 xs:h-32 sm:h-52 bg-slate-950 overflow-hidden shrink-0">
          {promoPopupConfig.imageUrl?.trim() ? (
            <img src={promoPopupConfig.imageUrl.trim()} alt="" className="w-full h-full object-cover brightness-90" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-600/30 via-slate-900 to-slate-950 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse border border-amber-500/30">
                  <Gift className="w-6 h-6 sm:w-10 sm:h-10 text-amber-400" />
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
          
          {/* Top Floating Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex items-center gap-1.5 z-20">
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[8.5px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg border border-amber-300/40">
              <Gift className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-slate-950 shrink-0" />
              <span className="truncate max-w-[150px] xs:max-w-none">{promoPopupConfig.badgeText || 'SPECIAL GIFT REWARD'}</span>
            </span>
          </div>

          {/* Countdown Clock Banner */}
          <div className="absolute bottom-2 left-2.5 right-2.5 sm:bottom-3 sm:left-4 sm:right-4 flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-amber-500/30 shadow-md">
            <span className="text-[9.5px] sm:text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-amber-400 shrink-0" />
              <span>Expires In:</span>
            </span>
            <div className="font-mono text-[10px] sm:text-xs font-black text-white flex items-center gap-0.5 sm:gap-1">
              <span className="bg-slate-900 px-1 sm:px-1.5 py-0.5 rounded border border-slate-800">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-slate-900 px-1 sm:px-1.5 py-0.5 rounded border border-slate-800">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-amber-500 text-slate-950 px-1 sm:px-1.5 py-0.5 rounded font-black">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-3.5 xs:p-4 sm:p-6 space-y-2.5 sm:space-y-4 overflow-y-auto">
          {/* Title & Subtitle */}
          <div className="space-y-0.5 sm:space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 text-[10px] font-bold uppercase tracking-wider sm:hidden">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Exclusive Present For You</span>
            </div>
            <h3 className="text-sm xs:text-base sm:text-xl font-black text-white font-serif tracking-tight leading-snug">
              {promoPopupConfig.title || 'FLASH SALE & EXCLUSIVE DROP'}
            </h3>
            <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 leading-normal">
              {promoPopupConfig.subtitle || `Claim your instant ${discountPercent}% OFF gift on our featured collection before offer ends.`}
            </p>
          </div>

          {/* Single Featured Product Showcase */}
          {targetProduct && (
            <div 
              onClick={handleClaim}
              className="bg-slate-950/90 border border-amber-500/30 hover:border-amber-400/60 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3.5 cursor-pointer transition-all shadow-inner group"
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-800 relative group-hover:scale-105 transition-transform">
                <img src={targetProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} alt={targetProduct.title} className="w-full h-full object-cover" />
                <span className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 bg-amber-500 text-slate-950 font-black text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded shadow">
                  -{discountPercent}%
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                    Gift Deal
                  </span>
                  <span className="text-[8.5px] sm:text-[10px] text-emerald-400 font-bold">In Stock</span>
                </div>
                <h4 className="text-[11px] sm:text-sm font-bold text-white leading-snug break-words group-hover:text-amber-400 transition-colors">
                  {targetProduct.title}
                </h4>
                
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                  <span className="text-xs sm:text-base font-black text-amber-400 font-mono">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 line-through font-mono">
                    ₹{originalPrice.toFixed(2)}
                  </span>
                  <span className="text-[8.5px] sm:text-[10px] font-bold text-emerald-400 ml-auto">
                    Save ₹{savings}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Promo Code Box (Gift Voucher Style) */}
          <div className="bg-slate-950 border border-amber-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[8.5px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gift Voucher</span>
                <span className="font-mono text-xs sm:text-sm font-black text-amber-400 tracking-wider truncate block">{promoCode}</span>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl transition-all inline-flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 sm:space-y-2 pt-0.5">
            <button
              onClick={handleClaim}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-[11px] sm:text-sm py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider group cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
              <span>{promoPopupConfig.buttonText || `Claim ${discountPercent}% OFF Gift`}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsFlashSalePopupOpen(false)}
              className="w-full bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-[10px] sm:text-xs font-semibold py-1 sm:py-2 rounded-lg transition-colors cursor-pointer"
            >
              No thanks, I'll pay full price
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="bg-slate-950/85 px-3 py-1.5 sm:px-6 sm:py-2.5 border-t border-slate-800/80 text-[8.5px] sm:text-[10px] text-slate-400 flex items-center justify-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Instant Savings Applied</span>
          </span>
          <span>•</span>
          <span className="text-amber-400/90 font-medium truncate">Auto-applied at checkout</span>
        </div>
      </div>
    </div>
  );
};

