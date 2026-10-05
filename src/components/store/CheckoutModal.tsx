import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { ShippingAddress } from '../../types';
import { RazorpayModal } from '../checkout/RazorpayModal';
import { 
  GooglePayIcon, 
  PhonePeIcon, 
  PaytmIcon, 
  UpiIcon, 
  VisaIcon, 
  MastercardIcon, 
  RuPayIcon, 
  HdfcBankIcon, 
  CredIcon, 
  RazorpayBadgeIcon,
  PaymentBadgesRow
} from './PaymentBrandIcons';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  CreditCard, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Mail,
  KeyRound,
  CheckCircle2,
  Tag,
  X,
  Percent,
  Banknote,
  Wallet,
  AlertTriangle,
  HelpCircle,
  QrCode,
  Zap,
  Gift,
  Clock,
  ArrowRight,
  BadgePercent,
  ChevronRight,
  Shield,
  Smartphone,
  Layers,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Edit3
} from 'lucide-react';
import { getItemBundleInfo, calculateCartPricing } from '../../lib/pricingUtils';

export const CheckoutModal: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity,
    removeFromCart,
    activePromo, 
    promos,
    applyPromoCode,
    removePromoCode,
    placeOrder, 
    navigateTo,
    customerUser,
    isCustomerAuthenticated,
    setIsCustomerAuthModalOpen,
    openCustomerAuthForCheckout,
    paymentSettings,
    shippingSettings,
    bundleConfig,
    promoPopupConfig
  } = useStore();

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [headerHeight, setHeaderHeight] = useState(64);
  const hasAutoPromptedAuthRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    const timer = setTimeout(updateHeaderHeight, 200);
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isMobile && (!isCustomerAuthenticated || !customerUser) && !hasAutoPromptedAuthRef.current) {
      hasAutoPromptedAuthRef.current = true;
      openCustomerAuthForCheckout();
    }
  }, [isMobile, isCustomerAuthenticated, customerUser, openCustomerAuthForCheckout]);

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [address, setAddress] = useState<ShippingAddress>(() => ({
    fullName: customerUser?.name || '',
    email: customerUser?.email || '',
    phone: customerUser?.phone || '',
    address: customerUser?.address || '',
    city: customerUser?.city || '',
    state: customerUser?.state || '',
    zipCode: customerUser?.zipCode || '',
    country: customerUser?.country || 'United States'
  }));

  useEffect(() => {
    if (customerUser) {
      setAddress((prev) => ({
        fullName: customerUser.name || prev.fullName,
        email: customerUser.email || prev.email,
        phone: customerUser.phone || prev.phone,
        address: customerUser.address || prev.address,
        city: customerUser.city || prev.city,
        state: customerUser.state || prev.state,
        zipCode: customerUser.zipCode || prev.zipCode,
        country: customerUser.country || prev.country || 'United States'
      }));
    }
  }, [customerUser]);

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PayOnline' | 'PartialPayment'>('PayOnline');
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  // Mobile Checkout Step: 1. Shipping Details -> 2. Order Summary -> 3. Payment Method -> 4. Final Locked Order Review
  const [mobileStep, setMobileStep] = useState<'shipping' | 'summary' | 'payment' | 'finalReview'>('shipping');
  const [shippingErrors, setShippingErrors] = useState<{ [key: string]: string }>({});

  const validateShippingForm = () => {
    const errors: { [key: string]: string } = {};
    if (!address.fullName?.trim()) errors.fullName = 'Full Name is required';
    if (!address.email?.trim() || !address.email.includes('@')) errors.email = 'Valid Email Address is required';
    if (!address.phone?.trim()) errors.phone = 'Phone Number is required for delivery updates';
    if (!address.address?.trim()) errors.address = 'Street Address is required';
    if (!address.city?.trim()) errors.city = 'City is required';
    if (!address.state?.trim()) errors.state = 'State is required';
    if (!address.zipCode?.trim()) errors.zipCode = 'ZIP Code is required';

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToSummary = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isCustomerAuthenticated || !customerUser) {
      openCustomerAuthForCheckout();
      return;
    }
    if (validateShippingForm()) {
      setShippingErrors({});
      setMobileStep('summary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProceedToPayment = () => {
    setMobileStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Popups state
  const [isCodOfferModalOpen, setIsCodOfferModalOpen] = useState(false);
  const [isPartialInfoModalOpen, setIsPartialInfoModalOpen] = useState(false);

  // Check if COD and payment modes are allowed for products in cart
  const nonCodCartItems = cart.filter((item) => item.product.codAllowed === false);
  const isCodAvailableForCart = paymentSettings.codEnabled && nonCodCartItems.length === 0;
  const isPayOnlineAvailableForCart = paymentSettings.payOnlineEnabled;
  const isPartialPaymentAvailableForCart = paymentSettings.partialPaymentEnabled;

  // Accurate Cart Pricing Engine Calculation
  const pricing = calculateCartPricing(
    cart,
    bundleConfig,
    activePromo,
    promoPopupConfig,
    paymentMethod,
    paymentSettings,
    shippingSettings
  );

  const subtotal = pricing.itemsOriginalSubtotal;
  const bundleDiscount = pricing.totalBundleDiscount;
  const promoDiscount = pricing.promoDiscount;
  const subtotalAfterPromo = Math.max(0, pricing.subtotalAfterBundle - pricing.promoDiscount);
  const paymentDiscount = pricing.paymentDiscount;
  const totalDiscount = bundleDiscount + promoDiscount + paymentDiscount;
  const shippingFee = pricing.shippingFee;
  const grandTotal = pricing.grandTotal;
  const upfrontPercent = pricing.upfrontPercent;
  const onlineAmountDueNow = pricing.onlineAmountDueNow;
  const codAmountDueLater = pricing.codAmountDueLater;

  // Independent calculations for each payment method option card display
  const payOnlineDiscountPercent = paymentSettings?.payOnlineDiscountPercent || 0;
  const payOnlineDiscountAmount = paymentSettings.payOnlineEnabled
    ? Math.round(((subtotalAfterPromo * payOnlineDiscountPercent) / 100) * 100) / 100
    : 0;
  const payOnlineOptionTotal = Math.max(0, Math.round((subtotalAfterPromo - payOnlineDiscountAmount + shippingFee) * 100) / 100);

  const partialPaymentDiscountPercent = paymentSettings?.partialPaymentDiscountPercent || 0;
  const partialPaymentDiscountAmount = paymentSettings.partialPaymentEnabled
    ? Math.round(((subtotalAfterPromo * partialPaymentDiscountPercent) / 100) * 100) / 100
    : 0;
  const partialPaymentOptionTotal = Math.max(0, Math.round((subtotalAfterPromo - partialPaymentDiscountAmount + shippingFee) * 100) / 100);
  const partialOptionDueNow = Math.round(((partialPaymentOptionTotal * upfrontPercent) / 100) * 100) / 100;
  const partialOptionDueLater = Math.round((partialPaymentOptionTotal - partialOptionDueNow) * 100) / 100;

  const codOptionTotal = Math.max(0, Math.round((subtotalAfterPromo + shippingFee) * 100) / 100);
  const onlineSavingsAmount = payOnlineDiscountAmount;

  const handleSelectPaymentMethod = (method: 'COD' | 'PayOnline' | 'PartialPayment') => {
    if (method === 'COD') {
      if (!isCodAvailableForCart) return;
      setPaymentMethod('COD');
      setIsCodOfferModalOpen(true);
    } else if (method === 'PartialPayment') {
      setPaymentMethod('PartialPayment');
      setIsPartialInfoModalOpen(true);
    } else {
      setPaymentMethod('PayOnline');
    }
  };

  const handleApplyCoupon = (e?: React.FormEvent, codeToApply?: string) => {
    if (e) e.preventDefault();
    const targetCode = codeToApply || couponInput;
    if (!targetCode.trim()) return;

    const res = applyPromoCode(targetCode);
    if (res.success) {
      setCouponMsg({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMsg({ type: 'error', text: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removePromoCode();
    setCouponMsg({ type: 'success', text: 'Coupon code removed.' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;

    if (!isCustomerAuthenticated || !customerUser) {
      openCustomerAuthForCheckout();
      return;
    }

    if (!validateShippingForm()) {
      if (isMobile) {
        setMobileStep('shipping');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (paymentMethod === 'COD') {
      if (!isCodAvailableForCart) {
        alert('Cash on delivery is not available for item(s) in your cart.');
        return;
      }
      placeOrder(address, 'COD', {
        paymentStatus: 'Pending',
        paidOnlineAmount: 0,
        codDueAmount: grandTotal,
        paymentDiscountAmount: 0
      });
      navigateTo('order-success');
    } else {
      // Launch Razorpay Modal Overlay
      setIsRazorpayOpen(true);
    }
  };

  const handleRazorpaySuccess = (txn: { razorpayPaymentId: string; razorpayOrderId: string }) => {
    setIsRazorpayOpen(false);
    placeOrder(
      address,
      paymentMethod,
      {
        paymentStatus: paymentMethod === 'PayOnline' ? 'Paid' : 'Partially Paid',
        paidOnlineAmount: onlineAmountDueNow,
        codDueAmount: codAmountDueLater,
        razorpayPaymentId: txn.razorpayPaymentId,
        razorpayOrderId: txn.razorpayOrderId,
        paymentDiscountAmount: paymentDiscount
      }
    );
    navigateTo('order-success');
  };

  if (!cart.length) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 font-serif">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Add winning items to your bag before proceeding to secure checkout.</p>
        <button
          onClick={() => navigateTo('home')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  // ==========================================
  // Render Helpers
  // ==========================================

  const renderMobileStepProgressBar = () => {
    const stepIndex = mobileStep === 'shipping' ? 0 : mobileStep === 'summary' ? 1 : mobileStep === 'payment' ? 2 : 3;
    const progressWidth = stepIndex === 0 ? '25%' : stepIndex === 1 ? '50%' : stepIndex === 2 ? '75%' : '100%';

    const steps = [
      { id: 'shipping', num: '1', label: 'Shipping' },
      { id: 'summary', num: '2', label: 'Summary' },
      { id: 'payment', num: '3', label: 'Payment' },
      { id: 'finalReview', num: '4', label: 'Confirm' }
    ] as const;

    return (
      <div 
        style={{ top: `${headerHeight}px` }}
        className="sticky z-30 -mx-4 px-3 py-2 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all mb-4"
      >
        <div className="relative">
          {/* Animated Connecting Track Line behind steps */}
          <div className="absolute top-3 left-6 right-6 h-1 bg-slate-100 rounded-full overflow-hidden z-0">
            {/* Animated Flowing Progress Bar towards the right */}
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: progressWidth }}
            >
              {/* Flowing animated light wave */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full animate-flow-right" />
            </div>
          </div>

          {/* Stepper Buttons Grid */}
          <div className="grid grid-cols-4 gap-1 text-center relative z-10">
            {steps.map((step, idx) => {
              const isCurrent = mobileStep === step.id;
              const isCompleted = idx < stepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (step.id === 'shipping') {
                      setMobileStep('shipping');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (validateShippingForm()) {
                      setShippingErrors({});
                      setMobileStep(step.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="flex flex-col items-center gap-1 transition-all cursor-pointer group py-0.5 active:scale-95"
                >
                  <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400/50 scale-105'
                      : isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className={`text-[10px] leading-none transition-colors whitespace-nowrap ${
                    isCurrent ? 'font-bold text-amber-700' : isCompleted ? 'font-semibold text-slate-800' : 'font-medium text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderShippingSection = () => {
    if (isMobile && (!isCustomerAuthenticated || !customerUser)) {
      return (
        <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-4 text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              1. Sign In Required Before Shipping Details
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please log in or verify your email with OTP to enter your shipping details and proceed to checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCustomerAuthForCheckout()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Mail className="w-4 h-4" />
            <span>Login with Email OTP to Enter Shipping Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigateTo('cart')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors block mx-auto"
          >
            ← Return to Cart
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-3">
          <Truck className="w-5 h-5 text-amber-500" />
          <span>1. Shipping Details</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              value={address.fullName}
              onChange={(e) => {
                setAddress({ ...address, fullName: e.target.value });
                if (shippingErrors.fullName) setShippingErrors(prev => ({ ...prev, fullName: '' }));
              }}
              required
              placeholder="e.g. John Doe"
              className={`w-full p-2.5 border rounded-xl focus:outline-none transition-colors ${
                shippingErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-amber-500'
              }`}
            />
            {shippingErrors.fullName && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">{shippingErrors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                value={address.email}
                onChange={(e) => {
                  setAddress({ ...address, email: e.target.value });
                  if (shippingErrors.email) setShippingErrors(prev => ({ ...prev, email: '' }));
                }}
                required
                placeholder="you@example.com"
                className={`w-full p-2.5 border rounded-xl focus:outline-none transition-colors ${
                  shippingErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-amber-500'
                }`}
              />
              {shippingErrors.email && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{shippingErrors.email}</p>
              )}
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number (For Tracking) *</label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => {
                  setAddress({ ...address, phone: e.target.value });
                  if (shippingErrors.phone) setShippingErrors(prev => ({ ...prev, phone: '' }));
                }}
                required
                placeholder="+1 (555) 000-0000"
                className={`w-full p-2.5 border rounded-xl focus:outline-none transition-colors ${
                  shippingErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-amber-500'
                }`}
              />
              {shippingErrors.phone && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{shippingErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Street Address *</label>
            <input
              type="text"
              value={address.address}
              onChange={(e) => {
                setAddress({ ...address, address: e.target.value });
                if (shippingErrors.address) setShippingErrors(prev => ({ ...prev, address: '' }));
              }}
              required
              placeholder="123 Main St, Apt / Suite / Unit"
              className={`w-full p-2.5 border rounded-xl focus:outline-none transition-colors ${
                shippingErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-amber-500'
              }`}
            />
            {shippingErrors.address && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">{shippingErrors.address}</p>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">City *</label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => {
                setAddress({ ...address, city: e.target.value });
                if (shippingErrors.city) setShippingErrors(prev => ({ ...prev, city: '' }));
              }}
              required
              placeholder="e.g. New York"
              className={`w-full p-2.5 border rounded-xl focus:outline-none transition-colors ${
                shippingErrors.city ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-amber-500'
              }`}
            />
            {shippingErrors.city && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">{shippingErrors.city}</p>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">State / Zip Code *</label>
            <div className="flex gap-2">
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => {
                    setAddress({ ...address, state: e.target.value });
                    if (shippingErrors.state) setShippingErrors(prev => ({ ...prev, state: '' }));
                  }}
                  required
                  className={`w-full p-2.5 border rounded-xl focus:outline-none transition-colors ${
                    shippingErrors.state ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {shippingErrors.state && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">{shippingErrors.state}</p>
                )}
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="Zip"
                  value={address.zipCode}
                  onChange={(e) => {
                    setAddress({ ...address, zipCode: e.target.value });
                    if (shippingErrors.zipCode) setShippingErrors(prev => ({ ...prev, zipCode: '' }));
                  }}
                  required
                  className={`w-full p-2.5 border rounded-xl focus:outline-none transition-colors ${
                    shippingErrors.zipCode ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {shippingErrors.zipCode && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">{shippingErrors.zipCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentSection = () => {
    // DESKTOP: Clean, modern, highly professional payment section with required details only
    if (!isMobile) {
      return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  2. Select Payment Method
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select how you would like to pay for your order
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-[11px] font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay 256-Bit SSL</span>
            </div>
          </div>

          {/* Clean Payment Options List */}
          <div className="space-y-3">
            {/* OPTION 1: PAY ONLINE (PREPAID) */}
            {isPayOnlineAvailableForCart && (
              <div
                onClick={() => handleSelectPaymentMethod('PayOnline')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  paymentMethod === 'PayOnline'
                    ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-1 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === 'PayOnline' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'PayOnline' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Pay Online (UPI / Cards / NetBanking)
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Save {paymentSettings.payOnlineDiscountPercent || 5}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Instant payment via Google Pay, PhonePe, Paytm, Cards & UPI
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {payOnlineDiscountAmount > 0 && (
                      <span className="text-xs text-slate-400 line-through font-mono block">
                        ₹{(subtotalAfterPromo + shippingFee).toFixed(2)}
                      </span>
                    )}
                    <span className="font-mono font-black text-slate-900 text-base">
                      ₹{payOnlineOptionTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION 2: PARTIAL PAYMENT (SPLIT PAY) */}
            {isPartialPaymentAvailableForCart && (
              <div
                onClick={() => handleSelectPaymentMethod('PartialPayment')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  paymentMethod === 'PartialPayment'
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === 'PartialPayment' ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'PartialPayment' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Partial Payment (Split Pay)
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          Save {paymentSettings.partialPaymentDiscountPercent || 3}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Pay {upfrontPercent}% deposit now to confirm, balance {100 - upfrontPercent}% on cash/UPI delivery
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-blue-700 text-sm block">
                      Pay ₹{partialOptionDueNow.toFixed(2)} Now
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      + ₹{partialOptionDueLater.toFixed(2)} on COD
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION 3: CASH ON DELIVERY (COD) */}
            {paymentSettings.codEnabled && (
              <div
                onClick={() => isCodAvailableForCart && handleSelectPaymentMethod('COD')}
                className={`p-4 rounded-2xl border-2 transition-all select-none ${
                  !isCodAvailableForCart
                    ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                    : paymentMethod === 'COD'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-400/30 cursor-pointer'
                    : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'COD' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Cash on Delivery (COD)
                        </span>
                        {!isCodAvailableForCart && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                            Restricted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Pay with cash or UPI QR scan at your doorstep upon package arrival
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-slate-900 text-base">
                      ₹{codOptionTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clean Security Summary Line */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Buyer Protection & Safe Delivery Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Razorpay Verified Merchant</span>
            </div>
          </div>

          {/* Restriction warning if COD is not allowed */}
          {!isCodAvailableForCart && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">COD Restricted on Item(s) in Cart: </span>
                <span className="text-[11px] text-rose-700">
                  {nonCodCartItems.map(i => i.product.title).join(', ')} do not support COD. Please use Pay Online or Partial Payment.
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // MOBILE: Mobile-specific layout
    return (
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Header: Single Row with Title + Razorpay Verified */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              Select Payment Method
            </h3>
          </div>
          <span className="text-[9px] sm:text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Razorpay Verified</span>
          </span>
        </div>

        {/* Clean, Fancy & Compact Mobile Payment Cards */}
        <div className="space-y-2.5">
          {/* OPTION 1: PAY ONLINE (Full Prepaid via Razorpay) */}
          {isPayOnlineAvailableForCart && (
            <div
              onClick={() => handleSelectPaymentMethod('PayOnline')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'PayOnline'
                  ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-400/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    paymentMethod === 'PayOnline' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-300 bg-white'
                  }`}>
                    {paymentMethod === 'PayOnline' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        Pay Online (Prepaid)
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-200">
                        Save {paymentSettings.payOnlineDiscountPercent || 5}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Instant UPI, GPay, PhonePe, Paytm & Cards
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {payOnlineDiscountAmount > 0 && (
                    <span className="text-[10px] text-slate-400 line-through font-mono block">
                      ₹{(subtotalAfterPromo + shippingFee).toFixed(2)}
                    </span>
                  )}
                  <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                    ₹{payOnlineOptionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 2: PARTIAL PAYMENT (Part Online via Razorpay + Part COD) */}
          {isPartialPaymentAvailableForCart && (
            <div
              onClick={() => handleSelectPaymentMethod('PartialPayment')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'PartialPayment'
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-400/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    paymentMethod === 'PartialPayment' ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {paymentMethod === 'PartialPayment' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        Partial Payment (Split)
                      </span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full border border-blue-200">
                        Save {paymentSettings.partialPaymentDiscountPercent || 3}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Pay {upfrontPercent}% deposit now, balance on cash delivery
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-blue-700 text-xs sm:text-sm block">
                    Pay ₹{partialOptionDueNow.toFixed(2)} Now
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium block">
                    + ₹{partialOptionDueLater.toFixed(2)} COD
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 3: CASH ON DELIVERY (COD) */}
          {paymentSettings.codEnabled && (
            <div
              onClick={() => isCodAvailableForCart && handleSelectPaymentMethod('COD')}
              className={`p-3.5 rounded-2xl border-2 transition-all ${
                !isCodAvailableForCart
                  ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                  : paymentMethod === 'COD'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400/20 cursor-pointer'
                  : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {paymentMethod === 'COD' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        Cash on Delivery (COD)
                      </span>
                      {!isCodAvailableForCart && (
                        <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                          Restricted
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Pay cash or UPI QR at your doorstep
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                    ₹{codOptionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clean Security Summary Line */}
        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 px-0.5">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>100% Buyer Protection Guarantee</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <Zap className="w-2.5 h-2.5 text-amber-500" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Warning if user clicked COD but item doesn't allow COD */}
        {!isCodAvailableForCart && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">COD Restricted on Item(s) in Cart</p>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                Items: {nonCodCartItems.map(i => i.product.title).join(', ')} do not support Cash on Delivery. Please select Pay Online or Partial Payment.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSubmitButton = () => (
    <button
      type="submit"
      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-sm font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
    >
      {isCustomerAuthenticated ? (
        <>
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>
            {paymentMethod === 'COD'
              ? `CONFIRM COD ORDER (₹${grandTotal.toFixed(2)})`
              : paymentMethod === 'PartialPayment'
              ? `PROCEED TO PAY ₹${onlineAmountDueNow.toFixed(2)} ONLINE VIA RAZORPAY`
              : `PROCEED TO PAY ₹${grandTotal.toFixed(2)} ONLINE VIA RAZORPAY`}
          </span>
        </>
      ) : (
        <>
          <Mail className="w-5 h-5 text-slate-950" />
          <span>LOGIN WITH EMAIL & OTP TO PLACE ORDER (₹{grandTotal.toFixed(2)})</span>
        </>
      )}
    </button>
  );

  // =========================================================================
  // STEP 4: FINAL LOCKED READ-ONLY ORDER REVIEW (MOBILE)
  // User cannot add/remove items or change coupons; pure view of locked summary
  // =========================================================================
  const renderFinalOrderReviewSection = () => (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight flex items-center gap-1.5">
              <span>Final Order Review & Confirmation</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.2 rounded-full">
                Locked
              </span>
            </h4>
            <p className="text-[11px] text-emerald-200">
              Prices, discounts & items are locked and guaranteed.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Delivery Details Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Deliver to: {address.fullName}</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-bold">Verified</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              {address.address}, {address.city}, {address.state} {address.zipCode}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {address.phone} • {address.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setMobileStep('shipping');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      {/* 2. Selected Payment Mode Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            paymentMethod === 'PayOnline' 
              ? 'bg-amber-50 border border-amber-200 text-amber-600'
              : paymentMethod === 'PartialPayment'
              ? 'bg-blue-50 border border-blue-200 text-blue-600'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
          }`}>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>
                {paymentMethod === 'PayOnline' 
                  ? 'Payment Mode: Pay Online (Prepaid)' 
                  : paymentMethod === 'PartialPayment' 
                  ? 'Payment Mode: Partial Split Pay' 
                  : 'Payment Mode: Cash on Delivery'}
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-bold">
                {paymentMethod === 'PayOnline' 
                  ? `${paymentSettings.payOnlineDiscountPercent || 5}% OFF` 
                  : paymentMethod === 'PartialPayment' 
                  ? `${paymentSettings.partialPaymentDiscountPercent || 3}% OFF` 
                  : 'COD'}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {paymentMethod === 'PayOnline' && `100% online via Razorpay (₹${grandTotal.toFixed(2)})`}
              {paymentMethod === 'PartialPayment' && `Pay ₹${onlineAmountDueNow.toFixed(2)} online + ₹${codAmountDueLater.toFixed(2)} on COD`}
              {paymentMethod === 'COD' && `Pay ₹${grandTotal.toFixed(2)} in cash/UPI to courier`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setMobileStep('payment');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Change</span>
        </button>
      </div>

      {/* 3. Locked Itemized Product List (Read-Only) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span>Ordered Items (Fixed)</span>
          </h4>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {cart.reduce((sum, item) => sum + (typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1), 0)} items locked
          </span>
        </div>

        <div className="space-y-3">
          {cart.map((item, index) => {
            const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1;
            const itemBundle = getItemBundleInfo(item, bundleConfig);
            const hasBundleDiscount = itemBundle.discountPercent > 0;
            const itemImage = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';
            const unitPrice = typeof item.product?.price === 'number' ? item.product.price : 0;
            const lineSubtotal = unitPrice * qty;
            const discountedLineTotal = itemBundle.discountedUnitPrice * qty;

            return (
              <div 
                key={item.product?.id ? `final-review-item-${item.product.id}-${item.color || index}` : `final-review-item-${index}`}
                className="flex gap-3 text-xs border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 pt-0.5"
              >
                <div className="relative shrink-0 pt-1.5 pr-1.5">
                  <img
                    referrerPolicy="no-referrer"
                    src={itemImage}
                    alt={item.product?.title || 'Product'}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <span className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs z-10">
                    {qty}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{item.product?.title || 'Product'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.color && (
                        <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.color}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        ₹{unitPrice.toFixed(2)} each
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    {/* Locked Quantity Pill (No +/- controls) */}
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      Qty: {qty}
                    </span>

                    <div className="text-right">
                      {hasBundleDiscount ? (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] text-slate-400 line-through font-mono">
                            ₹{lineSubtotal.toFixed(2)}
                          </span>
                          <span className="font-mono font-black text-amber-600">
                            ₹{discountedLineTotal.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-black text-slate-900">
                          ₹{lineSubtotal.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasBundleDiscount && (
                    <div className="mt-1">
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-semibold inline-flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        <span>Saved {itemBundle.discountPercent}% (₹{(lineSubtotal - discountedLineTotal).toFixed(2)})</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked Coupon Indicator */}
        <div className="pt-2 border-t border-slate-100">
          {activePromo ? (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Promo Code Applied: <strong>{activePromo.code}</strong> ({activePromo.discountPercent}% OFF)</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">-₹{promoDiscount.toFixed(2)}</span>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>No promo coupon applied</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">₹0.00</span>
            </div>
          )}
        </div>

        {/* Fixed Financial Breakdown */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-mono font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
          </div>

          {bundleDiscount > 0 && (
            <div className="flex justify-between text-amber-600 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Volume Bundle Savings</span>
              </span>
              <span className="font-mono font-bold">-₹{bundleDiscount.toFixed(2)}</span>
            </div>
          )}

          {promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Promo Code Discount ({activePromo?.code})</span>
              </span>
              <span className="font-mono font-bold">-₹{promoDiscount.toFixed(2)}</span>
            </div>
          )}

          {paymentDiscount > 0 && (
            <div className="flex justify-between text-amber-600 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>
                  {paymentMethod === 'PayOnline' 
                    ? `Pay Online ${paymentSettings.payOnlineDiscountPercent || 5}% Discount` 
                    : `Partial Pay ${paymentSettings.partialPaymentDiscountPercent || 3}% Discount`}
                </span>
              </span>
              <span className="font-mono font-bold">-₹{paymentDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-start text-slate-600">
            <div className="flex items-start gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-700">Delivery Charges</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded font-sans">
                    Express Delivery
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {shippingSettings?.estimatedDeliveryDays || '2–4 Business Days'}
                </span>
              </div>
            </div>
            {shippingFee === 0 ? (
              <span className="font-mono font-bold text-emerald-600 uppercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 shrink-0">
                {shippingSettings?.freeDeliveryLabel || 'FREE'}
              </span>
            ) : (
              <span className="font-mono font-bold text-slate-900 text-xs shrink-0">
                ₹{shippingFee.toFixed(2)}
              </span>
            )}
          </div>

          <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-bold text-slate-900">Total Order Amount</span>
              <span className="text-[10px] text-slate-400 block">All taxes and duties included</span>
            </div>
            <span className="font-mono font-black text-xl text-slate-900">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Split summary for Partial Payment */}
          {paymentMethod === 'PartialPayment' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs text-blue-900 mt-2">
              <div className="flex justify-between font-bold">
                <span>● Pay Online Today (Razorpay):</span>
                <span className="font-mono">₹{onlineAmountDueNow.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-800">
                <span>○ Pay to Courier on Delivery (COD):</span>
                <span className="font-mono font-semibold">₹{codAmountDueLater.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust & Guarantee Callout */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>30-Day Money Back Guarantee & 100% Buyer Protection</span>
        </div>
      </div>

      {/* Final Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>
            {paymentMethod === 'COD'
              ? `Confirm COD Order (₹${grandTotal.toFixed(2)})`
              : paymentMethod === 'PartialPayment'
              ? `Proceed to Pay ₹${onlineAmountDueNow.toFixed(2)} Online`
              : `Proceed to Pay ₹${grandTotal.toFixed(2)} Online`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileStep('payment');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Payment Methods</span>
        </button>
      </div>
    </div>
  );

  const renderOrderSummarySection = (isMobileView: boolean = false) => (
    <div className={`bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 ${
      !isMobileView ? 'sticky top-32 lg:top-[180px] z-20' : ''
    }`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-serif flex items-center gap-1.5 min-w-0">
          <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">Order Summary</span>
        </h3>
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className={`space-y-3 overflow-y-auto pr-1 pt-1 ${isMobileView ? 'max-h-96' : 'max-h-80'}`}>
        {cart.map((item, index) => {
          const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1;
          const itemBundle = getItemBundleInfo(item, bundleConfig);
          const hasBundleDiscount = itemBundle.discountPercent > 0;
          const itemImage = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';
          const unitPrice = typeof item.product?.price === 'number' ? item.product.price : 0;

          return (
            <div key={item.product?.id ? `checkout-item-${item.product.id}-${item.color || index}` : `checkout-item-${index}`} className="flex gap-3 text-xs border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 pt-0.5">
              <div className="relative shrink-0 pt-1.5 pr-1.5">
                <img
                  referrerPolicy="no-referrer"
                  src={itemImage}
                  alt={item.product?.title || 'Product'}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                />
                <span className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs z-10">
                  {qty}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.product?.title || 'Product'}</p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.color)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.color && (
                      <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.color}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      ₹{unitPrice.toFixed(2)} each
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.color, qty - 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-mono font-bold text-slate-800 text-[11px]">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.color, qty + 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    {hasBundleDiscount ? (
                      <div>
                        <span className="text-slate-400 line-through text-[10px] block font-mono">
                          ₹{(unitPrice * qty).toFixed(2)}
                        </span>
                        <span className="font-mono font-bold text-amber-600 text-xs">
                          ₹{(itemBundle.discountedUnitPrice * qty).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        ₹{(unitPrice * qty).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {hasBundleDiscount && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    <BadgePercent className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Buy {qty} Saved {itemBundle.discountPercent}% (₹{(itemBundle.discountAmount).toFixed(2)})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo Code Input & Badges */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        {activePromo ? (
          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <div>
                <span className="font-black font-mono">{activePromo.code}</span>
                <span className="text-[10px] text-emerald-700 block">
                  {activePromo.discountPercent}% OFF {activePromo.productTitle ? `on ${activePromo.productTitle}` : 'on cart'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100 transition-colors text-[10px] font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Promo or Coupon Code"
              className="flex-1 p-2 text-xs border border-slate-200 rounded-xl uppercase font-mono focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Apply
            </button>
          </form>
        )}

        {couponMsg && (
          <p className={`text-[11px] font-medium ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
            {couponMsg.text}
          </p>
        )}

        {/* Quick Click Available Promo Pills */}
        {!activePromo && promos.filter(p => p.isActive).length > 0 && (
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 font-semibold block mb-1">Available Coupons:</span>
            <div className="flex flex-wrap gap-1.5">
              {promos.filter(p => p.isActive).slice(0, 2).map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => handleApplyCoupon(undefined, p.code)}
                  className="text-[10px] font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Percent className="w-2.5 h-2.5" />
                  <span>{p.code} ({p.discountPercent}% OFF)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Breakdown */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
        </div>

        {bundleDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Volume Bundle Savings</span>
            </span>
            <span>-₹{bundleDiscount.toFixed(2)}</span>
          </div>
        )}

        {activePromo && promoDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>
              Coupon Discount ({activePromo.code} - {activePromo.discountPercent}%)
              {pricing.promoTargetProductTitle && (
                <span className="block text-[10px] text-emerald-700 font-normal">
                  Applied to: {pricing.promoTargetProductTitle}
                </span>
              )}
            </span>
            <span>-₹{promoDiscount.toFixed(2)}</span>
          </div>
        )}

        {paymentDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>
              {paymentMethod === 'PayOnline' 
                ? `Prepaid Online Discount (${paymentSettings.payOnlineDiscountPercent}%)` 
                : `Partial Pay Discount (${paymentSettings.partialPaymentDiscountPercent}%)`}
            </span>
            <span>-₹{paymentDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="flex items-start gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">Delivery Charges</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded font-sans">
                  Express Delivery
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {shippingSettings?.estimatedDeliveryDays || '2–4 Business Days'}
              </span>
            </div>
          </div>
          {shippingFee === 0 ? (
            <span className="font-mono font-bold text-emerald-600 uppercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 shrink-0">
              {shippingSettings?.freeDeliveryLabel || 'FREE'}
            </span>
          ) : (
            <span className="font-mono font-bold text-slate-900 text-xs shrink-0">
              ₹{shippingFee.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
          <span>Grand Total</span>
          <span className="text-amber-600">₹{grandTotal.toFixed(2)}</span>
        </div>

        {paymentMethod === 'PartialPayment' && (
          <div className="mt-2 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1 text-[11px]">
            <div className="flex justify-between font-bold text-blue-900">
              <span>Online Pay Today (Razorpay)</span>
              <span>₹{onlineAmountDueNow.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-amber-700">
              <span>Balance Due on COD Delivery</span>
              <span>₹{codAmountDueLater.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>30-Day Money-Back Guarantee</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Express Tracked Dispatch</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
      {/* Top Banner */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigateTo('cart')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold">256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Customer Account Status Indicator - Desktop Only */}
        {!isMobile && (
          <div className="hidden md:flex bg-slate-950 text-white p-4 rounded-3xl border border-slate-800 flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                {isCustomerAuthenticated ? <CheckCircle2 className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    {isCustomerAuthenticated ? 'Authenticated Customer' : 'Customer Account Verification'}
                  </span>
                  {isCustomerAuthenticated && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                      Active Session
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isCustomerAuthenticated 
                    ? `Signed in as ${customerUser?.email || address.email}. Orders will automatically sync to your dashboard.`
                    : 'Instant Email + OTP Login required to complete orders, track delivery & claim warranty.'}
                </p>
              </div>
            </div>

            {!isCustomerAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsCustomerAuthModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Login with Email OTP</span>
              </button>
            ) : (
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-mono">{customerUser?.id ? `ID: ${customerUser.id.slice(0, 8)}...` : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Mobile Multi-Step Stepper Header */}
        {isMobile && renderMobileStepProgressBar()}

        {isMobile ? (
          /* ========================================================================= */
          /* MOBILE 4-STEP CHECKOUT FLOW */
          /* Step 1: Shipping -> Step 2: Order Summary -> Step 3: Payment -> Step 4: Final Review */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* STEP 1: SHIPPING DETAILS */}
            {mobileStep === 'shipping' && (
              <div className="space-y-4">
                {renderShippingSection()}

                {isCustomerAuthenticated && customerUser && (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (validateShippingForm()) {
                          setShippingErrors({});
                          setMobileStep('summary');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Proceed to Order Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span>Step 1 of 4: Shipping Information</span>
                      <span className="font-bold text-amber-600">Next: Review Items</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ORDER SUMMARY & REVIEW */}
            {mobileStep === 'summary' && (
              <div className="space-y-4">
                {/* Shipping Destination Preview Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Shipping to: {address.fullName || 'Recipient'}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-bold">Verified</span>
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {address.address}, {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {address.phone} • {address.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileStep('shipping');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Complete Order Summary */}
                {renderOrderSummarySection(true)}

                {/* Step 2 Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!validateShippingForm()) {
                        setMobileStep('shipping');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        return;
                      }
                      setMobileStep('payment');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Proceed to Payment Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileStep('shipping');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Shipping Details</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {mobileStep === 'payment' && (
              <div className="space-y-4">
                {/* Shipping & Order Quick Summary Bar */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Total</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {paymentMethod === 'PartialPayment' 
                        ? `₹${onlineAmountDueNow.toFixed(2)} Now (Split COD: ₹${codAmountDueLater.toFixed(2)})`
                        : `₹${grandTotal.toFixed(2)}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileStep('summary');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Items</span>
                  </button>
                </div>

                {/* Payment Selection Options */}
                {renderPaymentSection()}

                {/* Step 3 Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!validateShippingForm()) {
                        setMobileStep('shipping');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        return;
                      }
                      setMobileStep('finalReview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Proceed to Order Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileStep('summary');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Order Summary</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL LOCKED ORDER REVIEW & PAYMENT EXECUTION */}
            {mobileStep === 'finalReview' && (
              <div className="space-y-4">
                {renderFinalOrderReviewSection()}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* DESKTOP VIEW: STANDARD 2-COLUMN LAYOUT (NO CHANGE FOR DESKTOP) */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Checkout Form */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderShippingSection()}
                {renderPaymentSection()}
                {renderSubmitButton()}
              </form>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5">
              {renderOrderSummarySection(false)}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP 1: COD DISCOUNT / SWITCH TO PREPAID POPUP */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCodOfferModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 border border-amber-200 shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsCodOfferModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
                  <Zap className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Exclusive Checkout Deal
                  </span>
                  <h3 className="text-base font-black text-slate-900 font-serif mt-0.5">
                    Save Extra {paymentSettings.payOnlineDiscountPercent || 5}% Online!
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Why pay full price on COD? Pay securely right now via Razorpay UPI (GPay, PhonePe, Paytm) or Cards to unlock VIP perks:
              </p>

              {/* Comparison Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Full COD Total:</span>
                  <span className="font-mono font-bold text-slate-900">₹{(subtotalAfterPromo + shippingFee).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pay Online Instant Discount:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">-₹{onlineSavingsAmount.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Prepaid Online Total:</span>
                  <span className="font-mono font-black text-amber-600 text-sm">
                    ₹{Math.max(0, subtotalAfterPromo - onlineSavingsAmount + shippingFee).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Perks Checklist */}
              <div className="space-y-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Instant Extra Savings:</strong> Save money right now on this order.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>VIP Express Dispatch:</strong> Dispatched in 12 hours with zero COD confirmation phone calls.</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><strong>100% Refund Guarantee:</strong> Razorpay secure buyer protection.</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('PayOnline');
                    setIsCodOfferModalOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>SWITCH TO ONLINE & SAVE ₹{onlineSavingsAmount.toFixed(2)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCodOfferModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl transition-colors text-center cursor-pointer"
                >
                  Continue with Standard Cash on Delivery
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* POPUP 2: PARTIAL PAYMENT COMPLETE BREAKDOWN POPUP */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPartialInfoModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 border border-blue-200 shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsPartialInfoModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Smart Partial Pay Scheme
                  </span>
                  <h3 className="text-base font-black text-slate-900 font-serif mt-0.5">
                    How Partial Payment Works
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Pay a small advance deposit now to confirm your parcel, and pay the remaining balance when the courier arrives at your home.
              </p>

              {/* Timeline Steps */}
              <div className="space-y-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-slate-900">
                      Pay ₹{onlineAmountDueNow.toFixed(2)} ({upfrontPercent}%) Online Now
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Via Razorpay (GPay, PhonePe, Paytm, Cards). Instantly locks stock & triggers packing.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 pt-2 border-t border-blue-100/80">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-slate-900">
                      Pay Remaining ₹{codAmountDueLater.toFixed(2)} on Doorstep Delivery
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay delivery partner in cash or scan delivery QR code upon parcel arrival.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-1.5 text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Zero Risk:</strong> Inspect package at delivery before paying final balance.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Anti-RTO Fast Lane:</strong> Partial orders skip manual verification calls.</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPartialInfoModalOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>CONFIRM PARTIAL PAYMENT (₹{onlineAmountDueNow.toFixed(2)} TODAY)</span>
                </button>

                {paymentSettings.payOnlineDiscountPercent > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('PayOnline');
                      setIsPartialInfoModalOpen(false);
                    }}
                    className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs py-2.5 rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Or Pay 100% Online to Save Extra ₹{onlineSavingsAmount.toFixed(2)}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Razorpay Gateway Modal Overlay */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        onSuccess={handleRazorpaySuccess}
        amount={onlineAmountDueNow}
        paymentType={paymentMethod === 'PartialPayment' ? 'PartialPay' : 'FullPay'}
        paymentSettings={paymentSettings}
        customerName={address.fullName}
        customerEmail={address.email}
        customerPhone={address.phone}
        codBalanceRemaining={paymentMethod === 'PartialPayment' ? codAmountDueLater : undefined}
      />
    </div>
  );
};
