import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShimmerImage } from '../common/ShimmerImage';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Truck, 
  Clock, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { 
    orders, 
    customerUser, 
    isCustomerAuthenticated, 
    sendCustomerOtp, 
    verifyCustomerOtp, 
    setIsCustomerAuthModalOpen,
    setCustomerPortalTab,
    navigateTo 
  } = useStore();

  // Auth form state for unauthenticated users directly on this page
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Search & Tracking state for authenticated users
  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  // Find user's orders when authenticated
  const userOrders = customerUser 
    ? orders.filter(o => o.customerEmail.toLowerCase() === customerUser.email.toLowerCase())
    : [];

  useEffect(() => {
    if (isCustomerAuthenticated && userOrders.length > 0) {
      setSearchedOrder(userOrders[0]);
    }
  }, [isCustomerAuthenticated, customerUser?.email, orders]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');

    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await sendCustomerOtp(email.trim());
    setLoading(false);

    if (result.success) {
      setStep('otp');
      if (result.debugOtp) {
        setDebugOtp(result.debugOtp);
        setAuthInfo(result.message || 'OTP generated.');
      } else {
        setDebugOtp(null);
        setAuthInfo(`📨 Verification code sent to ${email}. Please check your inbox.`);
      }
    } else {
      setAuthError(result.message || 'Failed to send OTP code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');

    if (!otp || otp.trim().length < 6) {
      setAuthError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    const result = await verifyCustomerOtp(email.trim(), otp.trim());
    setLoading(false);

    if (result.success) {
      setStep('email');
      setOtp('');
      setDebugOtp(null);
    } else {
      setAuthError(result.message || 'Invalid or expired OTP code.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const found = orders.find(
      (o) => o.id.toLowerCase() === query.trim().toLowerCase() || o.customerEmail.toLowerCase() === query.trim().toLowerCase()
    );

    if (found) {
      setSearchedOrder(found);
      setNotFound(false);
    } else {
      setSearchedOrder(null);
      setNotFound(true);
    }
  };

  const getStatusStep = (status: string) => {
    if (status === 'Pending') return 1;
    if (status === 'Processing') return 2;
    if (status === 'Shipped') return 3;
    if (status === 'Delivered') return 4;
    return 1;
  };

  // If user is not authenticated, show ONLY the login screen (no dummy/tracking related content)
  if (!isCustomerAuthenticated) {
    return (
      <div className="bg-slate-50 min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-serif">Sign In to Track Order</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              For security and privacy, real-time live package tracking is exclusively available for verified account holders.
            </p>
          </div>

          {/* Inline Email / OTP Verification Form */}
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {authError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Account or Order Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Code...' : 'Send Login Code via Email'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {authInfo && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{authInfo}</span>
                </div>
              )}

              {debugOtp && (
                <div className="bg-slate-900 text-amber-400 text-xs p-3 rounded-xl font-mono text-center border border-amber-500/30">
                  <p className="text-[10px] text-slate-400 uppercase font-sans">Debug Passcode</p>
                  <p className="text-base font-black tracking-widest">{debugOtp}</p>
                </div>
              )}

              {authError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter 6-Digit Code</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base text-center font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? 'Verifying...' : 'Verify & Access Order Tracker'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-slate-500 hover:text-slate-900 text-xs font-semibold text-center"
              >
                Use a different email address
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted authentication via Resend</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view: show real user tracking information
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Search */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-bold text-xs uppercase px-3.5 py-1 rounded-full border border-amber-200">
            <Package className="w-4 h-4" />
            <span>Verified Customer: {customerUser?.email}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-serif">Track Your Package Shipment</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            View real-time live location, carrier tracking numbers, and delivery timeline for your purchases.
          </p>

          {/* Search input if looking up a specific order */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-10023)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-2xl hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-xs"
            >
              Lookup
            </button>
          </form>

          {notFound && (
            <p className="text-xs font-bold text-rose-600">
              No order matching "{query}" found.
            </p>
          )}
        </div>

        {/* User's list of orders selection if multiple */}
        {userOrders.length > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Your Orders:</span>
            {userOrders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setSearchedOrder(ord);
                  setNotFound(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  searchedOrder?.id === ord.id 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ord.id} ({ord.status})
              </button>
            ))}
          </div>
        )}

        {/* Search Result Display */}
        {searchedOrder ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-8">
            {/* Top Bar info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold">Package Order ID</p>
                <p className="text-xl font-black text-slate-900">{searchedOrder.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-400 font-semibold">Estimated Delivery</p>
                <p className="text-sm font-bold text-emerald-600">{searchedOrder.estimatedDelivery || '3-5 Business Days'}</p>
                {searchedOrder.trackingNumber ? (
                  <p className="text-xs text-slate-700 font-mono mt-0.5">
                    {searchedOrder.carrier || 'Carrier'}: <strong className="text-amber-600">{searchedOrder.trackingNumber}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-0.5">Tracking number will be assigned upon dispatch</p>
                )}
              </div>
            </div>

            {/* Visual Step Tracker */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Shipment Timeline Progress:</p>
              
              <div className="grid grid-cols-4 gap-2 relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-0" />

                {/* Step 1: Placed */}
                <div className="relative z-10 text-center space-y-2">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all ${
                    getStatusStep(searchedOrder.status) >= 1 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : 'bg-slate-200 text-slate-500'
                  }`}>
                    1
                  </div>
                  <p className="text-xs font-bold text-slate-900">Order Placed</p>
                  <p className="text-[10px] text-slate-400">Confirmed</p>
                </div>

                {/* Step 2: Processing */}
                <div className="relative z-10 text-center space-y-2">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all ${
                    getStatusStep(searchedOrder.status) >= 2 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : 'bg-slate-200 text-slate-500'
                  }`}>
                    2
                  </div>
                  <p className="text-xs font-bold text-slate-900">Processing</p>
                  <p className="text-[10px] text-slate-400">Quality Inspection</p>
                </div>

                {/* Step 3: Shipped */}
                <div className="relative z-10 text-center space-y-2">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all ${
                    getStatusStep(searchedOrder.status) >= 3 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : 'bg-slate-200 text-slate-500'
                  }`}>
                    3
                  </div>
                  <p className="text-xs font-bold text-slate-900">In Transit</p>
                  <p className="text-[10px] text-slate-400">Shipped with Tracking</p>
                </div>

                {/* Step 4: Delivered */}
                <div className="relative z-10 text-center space-y-2">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all ${
                    getStatusStep(searchedOrder.status) >= 4 ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'
                  }`}>
                    4
                  </div>
                  <p className="text-xs font-bold text-slate-900">Delivered</p>
                  <p className="text-[10px] text-slate-400">At Destination</p>
                </div>
              </div>
            </div>

            {/* Destination & Items list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Delivery Address</span>
                </p>
                <p className="text-slate-700 font-semibold">{searchedOrder.shippingAddress.fullName}</p>
                <p className="text-slate-500">{searchedOrder.shippingAddress.address}, {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.state} {searchedOrder.shippingAddress.zipCode}</p>
                <p className="text-slate-500">Contact: {searchedOrder.shippingAddress.phone}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Order Items ({searchedOrder.items.length})</span>
                </p>
                {searchedOrder.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-slate-700 py-1">
                    <span className="truncate max-w-[200px] font-medium">{it.productTitle} x{it.quantity}</span>
                    <div className="shrink-0">
                      {it.productImage ? (
                        <ShimmerImage
                          src={it.productImage}
                          alt={it.productTitle || 'Item'}
                          containerClassName="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* View Full Details Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setCustomerPortalTab('orders');
                  navigateTo('my-orders', undefined, 'orders');
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Order Details & Invoice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-sm space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Orders Found Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders with account <strong className="text-slate-700">{customerUser?.email}</strong> yet.
            </p>
            <button
              onClick={() => navigateTo('catalog')}
              className="mt-2 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow transition-colors"
            >
              <span>Explore Winning Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
