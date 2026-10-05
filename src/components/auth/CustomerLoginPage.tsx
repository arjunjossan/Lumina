import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { calculateCartPricing } from '../../lib/pricingUtils';
import { 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  Lock,
  Send,
  ShoppingBag,
  ArrowLeft,
  Truck,
  CreditCard,
  UserCheck,
  Zap,
  Package
} from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const { 
    customerUser,
    isCustomerAuthenticated,
    sendCustomerOtp, 
    verifyCustomerOtp,
    authRedirectTarget,
    customerAuthModalReason,
    navigateTo,
    cart,
    bundleConfig,
    activePromo,
    promoPopupConfig,
    paymentSettings,
    logoutCustomer
  } = useStore();

  const pricing = calculateCartPricing(
    cart,
    bundleConfig,
    activePromo,
    promoPopupConfig,
    'COD',
    paymentSettings || {
      codEnabled: true,
      payOnlineEnabled: false,
      partialCodEnabled: false,
      upfrontCodPercent: 10,
      codDiscountPercent: 0,
      payOnlineDiscountPercent: 0
    }
  );

  const isCheckoutAuth = authRedirectTarget === 'checkout' || customerAuthModalReason === 'checkout';

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ configured: boolean; maskedKey: string | null } | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch server Resend API key status
    fetch('/api/auth/resend-status')
      .then(res => res.json())
      .then(data => setResendStatus(data))
      .catch(() => setResendStatus(null));
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // If already authenticated and landed on login page
  useEffect(() => {
    if (isCustomerAuthenticated && customerUser) {
      const timer = setTimeout(() => {
        if (isCheckoutAuth) {
          navigateTo('checkout');
        } else {
          navigateTo('my-orders');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCustomerAuthenticated, customerUser, isCheckoutAuth, navigateTo]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await sendCustomerOtp(email.trim().toLowerCase());
    setLoading(false);

    if (result.success) {
      setStep('otp');
      setCountdown(45);
      if (result.debugOtp) {
        setDebugOtp(result.debugOtp);
        setInfoMsg(result.message || 'Verification code generated for testing.');
      } else {
        setDebugOtp(null);
        setInfoMsg(`📨 6-digit verification code sent to ${email}. Check your inbox!`);
      }
    } else {
      setErrorMsg(result.message || 'Failed to send OTP code. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!otp || otp.trim().length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    const result = await verifyCustomerOtp(email.trim().toLowerCase(), otp.trim());
    setLoading(false);

    if (result.success) {
      setInfoMsg('Authentication verified! Redirecting...');
      // verifyCustomerOtp will handle the navigateTo redirect automatically
    } else {
      setErrorMsg(result.message || 'Invalid or expired verification code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    const result = await sendCustomerOtp(email.trim().toLowerCase());
    setLoading(false);
    if (result.success) {
      setCountdown(45);
      if (result.debugOtp) {
        setDebugOtp(result.debugOtp);
        setInfoMsg(result.message || 'New verification code generated.');
      } else {
        setDebugOtp(null);
        setInfoMsg(`📨 A fresh code was sent to ${email}!`);
      }
    } else {
      setErrorMsg(result.message || 'Failed to resend code. Please try again.');
    }
  };

  // View when already authenticated
  if (isCustomerAuthenticated && customerUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif text-slate-900">Already Signed In</h2>
            <p className="text-xs text-slate-500">
              You are currently logged in as <span className="font-bold text-slate-800">{customerUser.email}</span>
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => navigateTo(isCheckoutAuth ? 'checkout' : 'my-orders')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{isCheckoutAuth ? 'Proceed to Shipping Details' : 'Go to My Orders'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => logoutCustomer()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-slate-50/60 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo(isCheckoutAuth ? 'cart' : 'home')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-950 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{isCheckoutAuth ? 'Back to Cart' : 'Back to Home'}</span>
          </button>

          {isCheckoutAuth && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{cart.length} item{cart.length !== 1 ? 's' : ''} in cart (₹{(pricing?.grandTotal || 0).toFixed(2)})</span>
            </div>
          )}
        </div>

        {/* Checkout Step Progress Bar (when arriving from Checkout flow) */}
        {isCheckoutAuth && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
              <div className="flex flex-col items-center gap-1 text-amber-600">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] sm:text-xs flex items-center justify-center shadow-xs">
                  1
                </div>
                <span className="text-[9px] sm:text-xs font-bold leading-tight">Sign In</span>
                <span className="text-[8px] sm:text-[9px] text-amber-600 font-semibold hidden sm:inline">(Current)</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] sm:text-xs flex items-center justify-center border border-slate-200">
                  <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-[9px] sm:text-xs font-medium leading-tight">Shipping</span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 hidden sm:inline">Step 2</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] sm:text-xs flex items-center justify-center border border-slate-200">
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-[9px] sm:text-xs font-medium leading-tight">Summary</span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 hidden sm:inline">Step 3</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] sm:text-xs flex items-center justify-center border border-slate-200">
                  <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-[9px] sm:text-xs font-medium leading-tight">Payment</span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 hidden sm:inline">Step 4</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Sign-In Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Left Column: Form & OTP Input */}
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
              
              {/* Header Badge & Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold">
                  {isCheckoutAuth ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Checkout Step 1: Sign in with Email</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Passwordless Customer Login</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
                  {step === 'email' 
                    ? (isCheckoutAuth ? 'Sign in before shipping details' : 'Sign in to your account')
                    : 'Verify your email code'}
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {step === 'email' 
                    ? (isCheckoutAuth 
                        ? 'Enter your email address to receive a secure 6-digit one-time code. After verification, you will proceed directly to your shipping details.'
                        : 'Enter your email to sign in or create an account instantly. No passwords needed!')
                    : `We sent a 6-digit verification code to ${email}. Enter it below to continue.`}
                </p>
              </div>

              {/* Resend Service Status Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">Resend Email Service:</span>
                </div>
                {resendStatus?.configured ? (
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Active Delivery</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    Ready Mode
                  </span>
                )}
              </div>

              {/* Debug OTP Banner (instant helper for development/testing without real inbox) */}
              {debugOtp && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Testing Verification Code</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp(debugOtp)}
                      className="text-[11px] font-black bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                  <div className="text-xl font-mono font-black text-slate-900 tracking-widest text-center py-2 bg-white rounded-xl border border-amber-200">
                    {debugOtp}
                  </div>
                  <p className="text-[10px] text-amber-800 text-center">
                    💡 Click "Auto-fill Code" above or enter the code to proceed instantly.
                  </p>
                </div>
              )}

              {/* Alerts */}
              {infoMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{infoMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: EMAIL ENTRY FORM */}
              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="customer-login-email" className="text-xs font-bold text-slate-700 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="customer-login-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="you@example.com"
                        required
                        autoFocus
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-xs"
                      />
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      We'll send a 6-digit login code. No password needed.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 rounded-2xl shadow-md text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Send 6-Digit Login Code</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: OTP VERIFICATION FORM */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="customer-login-otp" className="text-xs font-bold text-slate-700">
                        Enter 6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          setErrorMsg('');
                          setOtp('');
                        }}
                        className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="customer-login-otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ''));
                          setErrorMsg('');
                        }}
                        placeholder="123456"
                        required
                        autoFocus
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl sm:text-2xl font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-center shadow-xs"
                      />
                      <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 rounded-2xl shadow-md text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-slate-950" />
                        <span>
                          {isCheckoutAuth 
                            ? 'Verify & Proceed to Shipping Details' 
                            : 'Verify & Log In'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>

                  {/* Resend Code controls */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-400">Didn't receive the email?</span>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading || countdown > 0}
                      className="font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Trust Footer */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit SSL Encrypted</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant OTP Delivery</span>
                </span>
              </div>

            </div>

            {/* Right Column: Benefits or Cart Summary */}
            <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between space-y-6">
              
              {isCheckoutAuth ? (
                /* Checkout Cart Summary View */
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black">
                      Order Summary
                    </span>
                    <h3 className="text-lg font-bold font-serif text-white">
                      Your Shopping Cart
                    </h3>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {cart.map((item, idx) => {
                      const itemKey = item.product?.id ? `cart-${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${idx}` : `cart-item-${idx}`;
                      const productImg = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';
                      const productPrice = typeof item.product?.price === 'number' ? item.product.price : 0;

                      return (
                        <div 
                          key={itemKey} 
                          className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5"
                        >
                          <img
                            src={productImg}
                            alt={item.product?.title || 'Product item'}
                            className="w-11 h-11 object-cover rounded-lg bg-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.product?.title || 'Product'}</p>
                            <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{productPrice.toFixed(2)}</p>
                          </div>
                          <span className="text-xs font-bold text-amber-400">
                            ₹{(productPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>₹{(pricing?.itemsOriginalSubtotal || 0).toFixed(2)}</span>
                    </div>
                    {(((pricing?.totalBundleDiscount || 0) + (pricing?.promoDiscount || 0)) > 0) && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Discount Savings</span>
                        <span>-₹{((pricing?.totalBundleDiscount || 0) + (pricing?.promoDiscount || 0)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>Shipping</span>
                      <span className="font-bold text-white">
                        {pricing?.shippingFee === 0 ? 'FREE' : `₹${(pricing?.shippingFee || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span className="text-amber-400">₹{(pricing?.grandTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed">
                    ✨ After signing in, your delivery address will be saved for fast 1-click reorders!
                  </div>
                </div>
              ) : (
                /* Customer Account Benefits View */
                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black">
                      Member Perks
                    </span>
                    <h3 className="text-lg font-bold font-serif text-white">
                      Why Sign In?
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Real-Time Order Tracking</h4>
                        <p className="text-[11px] text-slate-400">Track shipments with live GPS timelines & delivery updates.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Faster Express Checkout</h4>
                        <p className="text-[11px] text-slate-400">Save addresses and payment preferences for speedy shopping.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Exclusive VIP Discounts</h4>
                        <p className="text-[11px] text-slate-400">Unlock automatic coupon perks and flash sale early access.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Guarantee */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Satisfaction & 30-Day Hassle-Free Returns</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
