import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Tag, 
  Sparkles, 
  Layers, 
  Lock, 
  RefreshCw, 
  X,
  CreditCard,
  Package
} from 'lucide-react';
import { getItemBundleInfo, calculateCartPricing } from '../../lib/pricingUtils';
import { Product } from '../../types';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    navigateTo,
    applyPromoCode,
    removePromoCode,
    activePromo,
    bundleConfig,
    promoPopupConfig,
    paymentSettings,
    shippingSettings,
    products,
    addToCart,
    customerUser,
    isCustomerAuthenticated,
    openCustomerAuthForCheckout
  } = useStore();

  const handleProceedToCheckout = () => {
    if (!cart.length) return;
    if (!isCustomerAuthenticated || !customerUser) {
      openCustomerAuthForCheckout();
      return;
    }
    navigateTo('checkout');
  };

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pricing = calculateCartPricing(
    cart,
    bundleConfig,
    activePromo,
    promoPopupConfig,
    'COD',
    paymentSettings || {
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
  const freeShippingProgress = freeShippingThreshold > 0 
    ? Math.min(100, (pricing.subtotalAfterBundle / freeShippingThreshold) * 100)
    : 100;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyPromoCode(couponInput.trim());
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removePromoCode();
    setCouponMessage(null);
  };

  // Recommended products not already in cart
  const cartProductIds = new Set(cart.map(item => item.product.id));
  const recommendedProducts: Product[] = products
    .filter(p => p.status === 'Active' && !cartProductIds.has(p.id))
    .slice(0, 4);

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 md:pb-16 pt-3 md:pt-6">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
          <button
            type="button"
            onClick={() => navigateTo('catalog')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5 px-2.5 -ml-2.5 rounded-lg hover:bg-slate-200/60"
            aria-label="Continue Shopping"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span>Continue Shopping</span>
          </button>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Page Title & Count */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <ShoppingBag className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-serif tracking-tight leading-none">
                Shopping Cart
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {cart.length > 0 ? (
                  <span>You have <strong className="text-slate-900">{totalItemCount}</strong> {totalItemCount === 1 ? 'item' : 'items'} in your cart</span>
                ) : (
                  <span>Review your selected items and checkout</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Free Shipping Progress Banner */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200/90 shadow-xs p-3.5 sm:p-4 mb-4 md:mb-6">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
              {amountToFreeShipping === 0 ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Congratulations! You unlocked <strong>FREE Worldwide Express Shipping</strong>!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-700 font-medium text-xs sm:text-sm">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Add <strong className="text-amber-600 font-bold">₹{amountToFreeShipping.toFixed(2)}</strong> more to unlock <strong>FREE Express Shipping</strong>!
                  </span>
                </div>
              )}
              <span className="text-[11px] font-black text-amber-600 shrink-0">
                {amountToFreeShipping === 0 ? '100%' : `${Math.round(freeShippingProgress)}%`}
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  amountToFreeShipping === 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 sm:p-14 text-center max-w-2xl mx-auto my-6">
            <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-inner">
              <ShoppingBag className="w-9 h-9 stroke-[1.8]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif mb-2">
              Your cart is currently empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              Explore our curated catalogue of top-tier gadgets, smart home devices, and lifestyle innovations.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('catalog')}
              className="inline-flex items-center gap-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-98"
            >
              <span>Explore Winning Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Showcase 3 popular items right under empty cart */}
            {recommendedProducts.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-100 text-left">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Trending Right Now</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedProducts.slice(0, 3).map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-300 transition-colors cursor-pointer"
                      onClick={() => navigateTo('product-detail', product.id)}
                    >
                      <img 
                        src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'} 
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{product.title}</p>
                        <p className="text-[11px] font-black text-amber-600 mt-0.5">₹{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Main Cart Content (Cart items on left/full, Summary on right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="w-full lg:col-span-7 xl:col-span-8 space-y-3.5">
              
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Selected Items ({cart.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Dispatched from Global Fulfillment Hub
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.map((item) => {
                    const itemBundle = getItemBundleInfo(item, bundleConfig);
                    const hasBundleDiscount = itemBundle.discountPercent > 0;

                    return (
                      <div 
                        key={item.product.id} 
                        className="p-3.5 sm:p-5 flex gap-3 sm:gap-4 transition-colors hover:bg-slate-50/50"
                      >
                        {/* Thumbnail */}
                        <div 
                          className="relative cursor-pointer shrink-0"
                          onClick={() => navigateTo('product-detail', item.product.id)}
                        >
                          <img 
                            src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80'} 
                            alt={item.product.title} 
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs" 
                          />
                          {hasBundleDiscount && (
                            <span className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                              <Layers className="w-2.5 h-2.5" />
                              <span>{itemBundle.discountPercent}% OFF</span>
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  {item.product.category}
                                </span>
                                <h3 
                                  onClick={() => navigateTo('product-detail', item.product.id)}
                                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 cursor-pointer leading-tight"
                                >
                                  {item.product.title}
                                </h3>
                              </div>

                              <button 
                                type="button"
                                onClick={() => removeFromCart(item.product.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Remove product"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Bundle discount text */}
                            {hasBundleDiscount && (
                              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                <span>{itemBundle.badge || `Volume Discount: Save ${itemBundle.discountPercent}%`}</span>
                              </div>
                            )}

                            {/* Price per unit */}
                            <div className="flex items-baseline gap-1.5 mt-1.5">
                              <span className="text-xs sm:text-sm font-black text-slate-900">
                                ₹{(hasBundleDiscount ? itemBundle.discountedUnitPrice : item.product.price).toFixed(2)}
                              </span>
                              {(hasBundleDiscount || item.product.compareAtPrice) && (
                                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-normal">
                                  ₹{(item.product.compareAtPrice || item.product.price).toFixed(2)}
                                </span>
                              )}
                              <span className="text-[10px] text-emerald-600 font-medium">
                                In Stock
                              </span>
                            </div>
                          </div>

                          {/* Stepper & Line Total */}
                          <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-100">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5 shadow-2xs">
                              <button 
                                type="button"
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg transition-colors cursor-pointer active:scale-95"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center font-bold text-slate-900 text-xs sm:text-sm">
                                {item.quantity}
                              </span>
                              <button 
                                type="button"
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg transition-colors cursor-pointer active:scale-95"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Line Total */}
                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-black text-slate-900">
                                ₹{itemBundle.finalLineTotal.toFixed(2)}
                              </span>
                              {hasBundleDiscount && (
                                <span className="block text-[10px] text-emerald-600 font-semibold">
                                  Saved ₹{(itemBundle.originalLineTotal - itemBundle.finalLineTotal).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Direct Checkout Action (Hidden per user request) */}
              <div className="hidden bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Total</span>
                    <span className="text-xl font-black text-slate-900">₹{pricing.grandTotal.toFixed(2)}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    {pricing.shippingFee === 0 ? 'FREE Shipping' : 'Shipping at checkout'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>256-Bit SSL Encrypted & Cash on Delivery Available</span>
                </p>
              </div>

              {/* Guarantees Strip */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 grid grid-cols-3 gap-2 text-center text-slate-700">
                <div className="flex flex-col items-center justify-center gap-1 p-1">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  <span className="text-[10px] sm:text-xs font-bold leading-tight">Express Shipping</span>
                  <span className="text-[9px] text-slate-400 hidden sm:inline">Tracked Delivery</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-1 border-x border-slate-100">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  <span className="text-[10px] sm:text-xs font-bold leading-tight">30-Day Returns</span>
                  <span className="text-[9px] text-slate-400 hidden sm:inline">Hassle-Free Policy</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-1">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                  <span className="text-[10px] sm:text-xs font-bold leading-tight">Cash On Delivery</span>
                  <span className="text-[9px] text-slate-400 hidden sm:inline">Pay Upon Arrival</span>
                </div>
              </div>

              {/* Recommended Items (You May Also Like) */}
              {recommendedProducts.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Customers Also Bought</span>
                    </h3>
                    <span className="text-[11px] text-amber-600 font-semibold cursor-pointer hover:underline" onClick={() => navigateTo('catalog')}>
                      View Catalogue
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {recommendedProducts.map((p) => (
                      <div 
                        key={p.id}
                        className="group p-2.5 rounded-xl border border-slate-100 hover:border-amber-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div 
                            className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2 cursor-pointer"
                            onClick={() => navigateTo('product-detail', p.id)}
                          >
                            <img 
                              src={p.images[0]} 
                              alt={p.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h4 
                            onClick={() => navigateTo('product-detail', p.id)}
                            className="text-[11px] font-bold text-slate-900 truncate cursor-pointer hover:text-amber-600"
                          >
                            {p.title}
                          </h4>
                          <p className="text-[11px] font-black text-amber-600 mt-0.5">₹{p.price.toFixed(2)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(p, 1)}
                          className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Order Summary & Checkout (Desktop only, hidden on mobile) */}
            <div className="hidden md:block lg:col-span-5 xl:col-span-4 space-y-3.5 sticky top-24">
              
              {/* Promo Code Card */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Have a Promo Code or Coupon?</span>
                </h3>

                {activePromo ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-emerald-800 tracking-wider uppercase">
                          {activePromo.code}
                        </p>
                        <p className="text-[10px] text-emerald-600">
                          {activePromo.discountPercent}% discount applied
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:outline-none focus:border-amber-500 focus:bg-white font-semibold transition-all"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button 
                      type="submit"
                      className="bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p className={`text-[11px] font-semibold mt-2 ${couponMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Order Summary Card */}
              <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 pb-3 border-b border-slate-100 font-serif">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-slate-900">₹{pricing.itemsOriginalSubtotal.toFixed(2)}</span>
                  </div>

                  {pricing.totalBundleDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Bundle Savings</span>
                      </span>
                      <span>-₹{pricing.totalBundleDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {activePromo && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount ({activePromo.code})</span>
                      <span>-₹{pricing.promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
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

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm sm:text-base font-black text-slate-900">Estimated Total</span>
                      <p className="text-[10px] text-slate-400">Includes all applicable duties & taxes</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg sm:text-2xl font-black text-amber-600">
                        ₹{pricing.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>PROCEED TO SECURE CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>256-Bit Bank-Grade SSL Encrypted Checkout</span>
                  </p>
                  <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Cash on Delivery (COD) & Online Payment Accepted</span>
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Sticky Bottom Bar for Mobile Devices (when cart has items) */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 md:hidden shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Due</span>
              <span className="text-base font-black text-slate-900">₹{pricing.grandTotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer"
            >
              <span>CHECKOUT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
