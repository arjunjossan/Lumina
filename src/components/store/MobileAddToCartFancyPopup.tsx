import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { getItemBundleInfo } from '../../lib/pricingUtils';
import { 
  Check, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  X, 
  Truck,
  ShieldCheck
} from 'lucide-react';

export const MobileAddToCartFancyPopup: React.FC = () => {
  const { 
    mobileCartNotification, 
    setMobileCartNotification, 
    cart, 
    bundleConfig,
    navigateTo,
    activePage
  } = useStore();

  useEffect(() => {
    if (!mobileCartNotification) return;

    const timer = setTimeout(() => {
      setMobileCartNotification(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [mobileCartNotification?.timestamp, setMobileCartNotification]);

  const product = mobileCartNotification?.product;
  const quantity = mobileCartNotification?.quantity || 1;
  const bundleDiscount = mobileCartNotification?.bundleDiscount;

  // Calculate live total cart count and estimated subtotal
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemBundle = getItemBundleInfo(item, bundleConfig);
    return sum + itemBundle.finalLineTotal;
  }, 0);

  const effectiveUnitPrice = (product && bundleDiscount)
    ? product.price * (1 - bundleDiscount / 100)
    : (product?.price || 0);

  const primaryImage = product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';

  const isExcludedPage = activePage === 'cart' || activePage === 'checkout';

  return (
    <AnimatePresence>
      {mobileCartNotification && product && !isExcludedPage && (
        <motion.aside
          key={mobileCartNotification.timestamp}
          aria-label="Item added to shopping bag"
          initial={{ y: 60, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-20 left-3 right-3 z-50 md:hidden max-w-md mx-auto pointer-events-auto select-none"
        >
          <div className="relative bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] text-white p-3.5 sm:p-4 overflow-hidden">
            {/* Glowing Top Rainbow Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500" />

            {/* Header row: Status + Close Button */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/80 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Added to Cart!
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileCartNotification(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Dismiss confirmation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Info Row */}
            <div className="flex items-center gap-3 py-2.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 shadow-inner">
                <img
                  src={primaryImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-tl-md">
                  x{quantity}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1 leading-snug">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-amber-400">
                    ₹{(effectiveUnitPrice * quantity).toFixed(2)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-[10px] text-slate-400">
                      (₹{effectiveUnitPrice.toFixed(2)} each)
                    </span>
                  )}
                  {bundleDiscount ? (
                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80">
                      {bundleDiscount}% OFF
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Truck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Free Express Delivery eligible</span>
                </p>
              </div>
            </div>

            {/* Cart Status Quick Strip */}
            <div className="bg-slate-900/80 rounded-xl px-2.5 py-1.5 mb-2.5 border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">
                Bag Total: <strong className="text-white font-bold">{totalCartCount} item{totalCartCount !== 1 ? 's' : ''}</strong>
              </span>
              <span className="text-amber-400 font-black">
                ₹{cartSubtotal.toFixed(2)}
              </span>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileCartNotification(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-bold text-center active:scale-95 transition-all cursor-pointer"
              >
                Keep Shopping
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCartNotification(null);
                  navigateTo('cart');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto-Dismiss Shrinking Line (Smooth CSS/motion transition) */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-800">
              <motion.div 
                key={mobileCartNotification.timestamp}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4.5, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
              />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
