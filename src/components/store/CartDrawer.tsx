import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { getItemBundleInfo, calculateCartPricing } from '../../lib/pricingUtils';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    navigateTo,
    applyPromoCode,
    activePromo,
    bundleConfig,
    promoPopupConfig,
    shippingSettings,
    customerUser,
    isCustomerAuthenticated,
    openCustomerAuthForCheckout
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // On mobile screens, CartDrawer does not open or redirect; mobile feedback is handled directly
  useEffect(() => {
    if (isCartOpen && typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCartOpen(false);
    }
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const pricing = calculateCartPricing(
    cart,
    bundleConfig,
    activePromo,
    promoPopupConfig,
    'COD',
    {
      codEnabled: true,
      payOnlineEnabled: false,
      payOnlineDiscountPercent: 0,
      payOnlineDiscountLabel: '',
      partialPaymentEnabled: false,
      partialPaymentUpfrontPercent: 20,
      partialPaymentDiscountPercent: 0,
      razorpayKeyId: '',
      razorpayKeySecret: '',
      razorpayTestMode: true
    },
    shippingSettings
  );

  const freeShippingThreshold = shippingSettings?.freeShippingThreshold ?? 999;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - pricing.subtotalAfterBundle);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyPromoCode(couponInput);
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="hidden md:block fixed inset-0 z-[70] overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in" 
      />

      <div className="fixed inset-y-0 right-0 flex justify-end">
        <div className="w-[75vw] sm:w-[420px] max-w-[85vw] sm:max-w-md bg-white shadow-2xl flex flex-col h-full h-[100dvh] max-h-screen overflow-hidden border-l border-slate-200">
          
          {/* Header */}
          <div className="px-3.5 py-3 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <h3 className="text-xs sm:text-base font-bold font-serif truncate">Shopping Cart ({cart.length})</h3>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center shrink-0"
              aria-label="Close Cart Drawer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-amber-50 px-3.5 sm:px-5 py-2 sm:py-2.5 border-b border-amber-200 text-[11px] sm:text-xs shrink-0">
            {amountToFreeShipping === 0 ? (
              <p className="font-bold text-emerald-700 flex items-center gap-1 leading-tight text-[11px] sm:text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>FREE Worldwide Express Shipping!</span>
              </p>
            ) : (
              <div>
                <p className="text-amber-900 font-semibold mb-1 flex items-center gap-1 leading-tight text-[10.5px] sm:text-xs">
                  <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Add <strong>₹{amountToFreeShipping.toFixed(2)}</strong> for FREE Shipping</span>
                </p>
                <div className="w-full bg-amber-200 h-1.5 sm:h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (pricing.subtotalAfterBundle / freeShippingThreshold) * 100)}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-3">
            {cart.length > 0 ? (
              cart.map((item) => {
                const itemBundle = getItemBundleInfo(item, bundleConfig);
                const hasBundleDiscount = itemBundle.discountPercent > 0;

                return (
                  <div key={item.product.id} className="flex gap-2.5 sm:gap-4 p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 relative">
                    <img 
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} 
                      alt={item.product.title} 
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg sm:rounded-xl border border-slate-200 shrink-0" 
                    />
                    <div className="flex-1 min-w-0 pr-5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.title}</h4>
                      
                      {/* Pricing with Bundle Badge */}
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-amber-600 font-bold">
                          ₹{(hasBundleDiscount ? itemBundle.discountedUnitPrice : item.product.price).toFixed(2)}
                        </span>
                        {hasBundleDiscount && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                            <Layers className="w-2.5 h-2.5" />
                            <span>{itemBundle.discountPercent}% OFF</span>
                          </span>
                        )}
                      </div>

                      {hasBundleDiscount && (
                        <p className="text-[9px] text-emerald-600 font-semibold truncate">
                          {itemBundle.badge || `Bundle (${itemBundle.discountPercent}% OFF)`}
                        </p>
                      )}
                      
                      {/* Quantity Adjustment */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex items-center border border-slate-200 rounded-md bg-white text-xs">
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-1.5 font-bold text-slate-900 text-[11px]">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="ml-auto text-right">
                          <span className="text-xs font-bold text-slate-900">
                            ₹{itemBundle.finalLineTotal.toFixed(2)}
                          </span>
                          {hasBundleDiscount && (
                            <span className="block text-[9px] text-slate-400 line-through">
                              ₹{itemBundle.originalLineTotal.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Your cart is currently empty</p>
                <p className="text-xs text-slate-400">Discover our top trending winning gadgets!</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('catalog');
                  }}
                  className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  Start Shopping Now
                </button>
              </div>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-3 sm:p-5 border-t border-slate-200 bg-white space-y-2.5 sm:space-y-4 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] uppercase focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <Tag className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                </div>
                <button 
                  type="submit"
                  className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </form>

              {couponMessage && (
                <p className={`text-[10px] font-semibold ${couponMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponMessage.text}
                </p>
              )}

              {/* Subtotal Summary */}
              <div className="space-y-1 text-[11px] sm:text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{pricing.itemsOriginalSubtotal.toFixed(2)}</span>
                </div>

                {pricing.totalBundleDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>Bundle Savings</span>
                    </span>
                    <span>-₹{pricing.totalBundleDiscount.toFixed(2)}</span>
                  </div>
                )}

                {activePromo && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({activePromo.code})</span>
                    <span>-₹{pricing.promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700">Delivery Charges</span>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">
                        Express Delivery
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {shippingSettings?.estimatedDeliveryDays || '2–4 Business Days'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {pricing.shippingFee === 0 ? (
                      <span className="bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        {shippingSettings?.freeDeliveryLabel || 'FREE'}
                      </span>
                    ) : (
                      `₹${pricing.shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-amber-600">₹{pricing.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (!cart.length) return;
                  if (!isCustomerAuthenticated || !customerUser) {
                    openCustomerAuthForCheckout();
                    return;
                  }
                  navigateTo('checkout');
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>CHECKOUT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-[9px] text-center text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">256-Bit SSL Encrypted & Guarantee</span>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
