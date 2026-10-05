import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Search, 
  Printer, 
  ExternalLink, 
  RotateCcw, 
  HelpCircle, 
  X, 
  FileText, 
  MapPin, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  LogOut,
  Sparkles,
  User,
  MessageSquare,
  Send,
  Check,
  AlertCircle,
  Calendar,
  Phone,
  RefreshCw,
  Copy,
  Database,
  Code,
  Download
} from 'lucide-react';
import { Order, OrderStatus, SupportInquiry, CustomerPortalTab } from '../../types';
import { CUSTOMER_PROFILES_TABLE_SQL } from '../../lib/supabase';

export const CustomerOrdersPage: React.FC = () => {
  const { 
    orders, 
    customerUser, 
    isCustomerAuthenticated, 
    setIsCustomerAuthModalOpen, 
    navigateToLogin,
    logoutCustomer, 
    navigateTo, 
    addToCart,
    products,
    showNotification,
    customerPortalTab,
    setCustomerPortalTab,
    updateCustomerProfile,
    supportInquiries,
    submitSupportInquiry
  } = useStore();

  // Orders filters
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  
  // Order Help Modal
  const [supportOrder, setSupportOrder] = useState<Order | null>(null);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportCategory, setSupportCategory] = useState<SupportInquiry['category']>('Order Tracking');

  // New Inquiry Modal / Form inside Inquiries Tab
  const [isNewInquiryModalOpen, setIsNewInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState(customerUser?.name || '');
  const [inquiryEmail, setInquiryEmail] = useState(customerUser?.email || '');
  const [inquiryCategory, setInquiryCategory] = useState<SupportInquiry['category']>('General Question');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryOrderNumber, setInquiryOrderNumber] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<'ALL' | 'AWAITING' | 'RESOLVED'>('ALL');

  // Returns tab inline form
  const [returnOrderNumber, setReturnOrderNumber] = useState('');
  const [returnReason, setReturnReason] = useState('Unsatisfied with performance');
  const [returnNotes, setReturnNotes] = useState('');
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState(customerUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(customerUser?.phone || '');
  const [profileAddress, setProfileAddress] = useState(customerUser?.address || '');
  const [profileCity, setProfileCity] = useState(customerUser?.city || '');
  const [profileState, setProfileState] = useState(customerUser?.state || '');
  const [profileZip, setProfileZip] = useState(customerUser?.zipCode || '');
  const [profileCountry, setProfileCountry] = useState(customerUser?.country || 'United States');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  useEffect(() => {
    if (customerUser) {
      setProfileName(customerUser.name || '');
      setProfilePhone(customerUser.phone || '');
      setProfileAddress(customerUser.address || '');
      setProfileCity(customerUser.city || '');
      setProfileState(customerUser.state || '');
      setProfileZip(customerUser.zipCode || '');
      setProfileCountry(customerUser.country || 'United States');
    }
  }, [customerUser]);

  // Tracking tab state
  const [trackingQuery, setTrackingQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);

  // Get orders associated with customer email or all orders if demo mode
  const customerEmail = customerUser?.email?.toLowerCase();
  
  // Filter user orders
  let userOrders = isCustomerAuthenticated && customerEmail
    ? orders.filter(o => o.customerEmail.toLowerCase() === customerEmail || o.shippingAddress?.email?.toLowerCase() === customerEmail)
    : [];

  const isUsingSampleFallback = isCustomerAuthenticated && userOrders.length === 0;
  if (isUsingSampleFallback) {
    userOrders = orders;
  }

  // Filter orders by tab
  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = !searchTerm.trim() || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.productTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'ACTIVE') {
      return ['Pending', 'Processing', 'Shipped'].includes(order.status);
    }
    if (activeFilter === 'DELIVERED') {
      return order.status === 'Delivered';
    }
    return true;
  });

  // User inquiries (matched by email)
  const userInquiries = customerEmail
    ? supportInquiries.filter(inq => inq.email.toLowerCase() === customerEmail)
    : supportInquiries;

  const filteredInquiries = userInquiries.filter(inq => {
    if (inquiryFilter === 'AWAITING') {
      return !inq.adminReply && inq.status !== 'Resolved';
    }
    if (inquiryFilter === 'RESOLVED') {
      return Boolean(inq.adminReply) || inq.status === 'Resolved';
    }
    return true;
  });

  // Returns inquiries
  const userReturnInquiries = userInquiries.filter(inq => 
    inq.category === 'Returns & Refunds' || inq.subject.toLowerCase().includes('return')
  );

  // Summary statistics
  const totalOrdersCount = userOrders.length;
  const activeShipmentsCount = userOrders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length;
  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
  const totalInquiriesCount = userInquiries.length;
  const answeredInquiriesCount = userInquiries.filter(i => Boolean(i.adminReply) || i.status === 'Resolved').length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            <span>In Transit</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Processing</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">
            <X className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  const handleReorder = (order: Order) => {
    let readdedCount = 0;
    order.items.forEach(item => {
      const existingProduct = products.find(p => p.id === item.productId);
      if (existingProduct) {
        addToCart(existingProduct, item.quantity);
        readdedCount += item.quantity;
      }
    });
    if (readdedCount > 0) {
      showNotification(`Readded ${readdedCount} items to your cart!`);
    } else {
      showNotification('Items readded to cart.');
    }
  };

  const handleSendOrderSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    
    submitSupportInquiry({
      name: customerUser?.name || customerUser?.email?.split('@')[0] || 'Lumina Customer',
      email: customerUser?.email || supportOrder?.shippingAddress?.email || 'customer@example.com',
      category: supportCategory,
      subject: supportSubject.trim() || `Inquiry regarding Order #${supportOrder?.id}`,
      orderNumber: supportOrder?.id,
      message: supportMessage.trim()
    });

    setSupportOrder(null);
    setSupportSubject('');
    setSupportMessage('');
    setCustomerPortalTab('inquiries');
  };

  const handleCreateNewInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) return;

    submitSupportInquiry({
      name: inquiryName.trim() || customerUser?.name || 'Customer',
      email: inquiryEmail.trim() || customerUser?.email || 'customer@example.com',
      category: inquiryCategory,
      subject: inquirySubject.trim(),
      orderNumber: inquiryOrderNumber.trim() || undefined,
      message: inquiryMessage.trim()
    });

    setIsNewInquiryModalOpen(false);
    setInquirySubject('');
    setInquiryOrderNumber('');
    setInquiryMessage('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSavedSuccess(false);
    try {
      await updateCustomerProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
        address: profileAddress.trim(),
        city: profileCity.trim(),
        state: profileState.trim(),
        zipCode: profileZip.trim(),
        country: profileCountry.trim()
      });
      setProfileSavedSuccess(true);
      setTimeout(() => {
        setProfileSavedSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to update customer profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderNumber.trim() || !returnReason.trim()) return;

    submitSupportInquiry({
      name: customerUser?.name || 'Customer',
      email: customerUser?.email || 'customer@example.com',
      category: 'Returns & Refunds',
      subject: `Return Request for Order #${returnOrderNumber.trim()}`,
      orderNumber: returnOrderNumber.trim(),
      message: `Return Reason: ${returnReason}\n\nCustomer Notes: ${returnNotes.trim() || 'No additional notes provided.'}`
    });

    setIsReturnFormOpen(false);
    setReturnOrderNumber('');
    setReturnNotes('');
    setCustomerPortalTab('returns');
  };

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;
    const match = orders.find(o => 
      o.id.toLowerCase() === trackingQuery.trim().toLowerCase() ||
      o.trackingNumber?.toLowerCase() === trackingQuery.trim().toLowerCase()
    );
    if (match) {
      setSearchedOrder(match);
    } else {
      showNotification(`No package found matching "${trackingQuery}". Please check your order ID.`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Account Header Banner (Hidden on mobile, preserved on desktop) */}
        <div className="hidden md:block bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Customer Profile & Support Hub</span>
                </span>
                {isCustomerAuthenticated && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>OTP Verified</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-serif text-white flex items-center gap-3">
                {isCustomerAuthenticated && customerUser ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                      {(customerUser.name?.[0] || customerUser.email[0] || 'U').toUpperCase()}
                    </div>
                    <span>{customerUser.name || 'My Customer Account'}</span>
                  </>
                ) : (
                  <span>Customer Account & Support Hub</span>
                )}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm max-w-lg">
                {isCustomerAuthenticated && customerUser ? (
                  <span>Signed in as <strong className="text-amber-400 font-mono">{customerUser.email}</strong>. Manage your orders, personal details, return tickets, and view official replies from store admins.</span>
                ) : (
                  <span>Sign in using your email to access your personal profile, past purchases, support inquiries, and live responses from administrators.</span>
                )}
              </p>
            </div>

            {/* Quick Stats or Sign In Callout */}
            {isCustomerAuthenticated ? (
              <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 p-4 rounded-2xl">
                <div className="text-center px-3 border-r border-slate-700">
                  <p className="text-lg font-black text-amber-400">{totalOrdersCount}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Orders</p>
                </div>
                <div className="text-center px-3 border-r border-slate-700">
                  <p className="text-lg font-black text-sky-400">{activeShipmentsCount}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">In Transit</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-lg font-black text-emerald-400">{answeredInquiriesCount}/{totalInquiriesCount}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Replies</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigateToLogin('my-orders', 'account')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <Mail className="w-4 h-4 text-slate-950" />
                <span>Sign In with Email & OTP</span>
              </button>
            )}
          </div>
        </div>

        {/* NOT AUTHENTICATED CALLOUT */}
        {!isCustomerAuthenticated && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <User className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-serif">Sign in to access your complete profile</h2>
              <p className="text-xs text-slate-500">
                Receive a 6-digit OTP verification code in your email to view order history, support ticket tracking, administrator replies, and personal address details.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigateToLogin('my-orders', 'account')}
                className="w-full sm:w-auto bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Login with Email OTP</span>
              </button>
              <button
                onClick={() => navigateTo('contact')}
                className="w-full sm:w-auto bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs px-6 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Store Support</span>
              </button>
            </div>
          </div>
        )}

        {/* MAIN CUSTOMER PORTAL TABS */}
        {isCustomerAuthenticated && (
          <div className="space-y-6">
            
            {/* TAB CONTENT: 1. ORDERS */}
            {customerPortalTab === 'orders' && (
              <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setActiveFilter('ALL')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Orders ({userOrders.length})
                    </button>
                    <button
                      onClick={() => setActiveFilter('ACTIVE')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        activeFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      In Transit / Active ({userOrders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length})
                    </button>
                    <button
                      onClick={() => setActiveFilter('DELIVERED')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        activeFilter === 'DELIVERED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Delivered ({userOrders.filter(o => o.status === 'Delivered').length})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search order ID or product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-base font-bold text-slate-900 font-serif">No matching orders found</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {searchTerm ? `No orders found matching "${searchTerm}".` : 'You have not placed any orders yet.'}
                    </p>
                    <button
                      onClick={() => navigateTo('catalog')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Explore Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const stepNum = getStepProgress(order.status);

                      return (
                        <div 
                          key={order.id} 
                          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                        >
                          <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-slate-900 font-mono">{order.id}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-xs text-slate-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Amount</p>
                                <p className="text-base font-black text-slate-900">₹{order.total.toFixed(2)}</p>
                              </div>

                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                                title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Stepper */}
                          <div className="p-5 sm:p-6 border-b border-slate-100 bg-white">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                              <span>Shipment Progress:</span>
                              <span className="text-slate-700 font-semibold lowercase">
                                Estimated: {order.estimatedDelivery || '3-5 Business Days'}
                              </span>
                            </p>

                            <div className="grid grid-cols-4 gap-2 relative">
                              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-0" />

                              <div className="relative z-10 text-center space-y-1">
                                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                                  stepNum >= 1 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  1
                                </div>
                                <p className="text-[11px] font-bold text-slate-900">Placed</p>
                              </div>

                              <div className="relative z-10 text-center space-y-1">
                                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                                  stepNum >= 2 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  2
                                </div>
                                <p className="text-[11px] font-bold text-slate-900">Processing</p>
                              </div>

                              <div className="relative z-10 text-center space-y-1">
                                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                                  stepNum >= 3 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  3
                                </div>
                                <p className="text-[11px] font-bold text-slate-900">In Transit</p>
                              </div>

                              <div className="relative z-10 text-center space-y-1">
                                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                                  stepNum >= 4 ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  4
                                </div>
                                <p className="text-[11px] font-bold text-slate-900">Delivered</p>
                              </div>
                            </div>
                          </div>

                          {/* Items List & Complete Details (As shown in Receipt) */}
                          <div className="p-5 sm:p-6 space-y-4">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                                Items Purchased ({order.items.length})
                              </p>
                              <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                                {order.items.map((item, idx) => {
                                  const originalLineTotal = item.price * item.quantity;
                                  const finalLine = item.lineTotal ?? originalLineTotal;
                                  return (
                                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <img 
                                          src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} 
                                          alt={item.productTitle} 
                                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                                        />
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-900 truncate">{item.productTitle}</p>
                                          <div className="flex items-center gap-2 text-slate-500 text-[11px] flex-wrap mt-0.5">
                                            <span>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</span>
                                            {item.bundleDiscount && item.bundleDiscount > 0 ? (
                                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                                Save {item.bundleDiscount}% (Bundle Tier)
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        {finalLine < originalLineTotal && (
                                          <span className="text-[10px] text-slate-400 line-through font-mono block">
                                            ₹{originalLineTotal.toFixed(2)}
                                          </span>
                                        )}
                                        <p className="text-xs font-black text-slate-900 font-mono">₹{finalLine.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Complete Receipt Financial Breakdown (Shown by Default on Order Page) */}
                            {(() => {
                              const subtotal = order.subtotal ?? (order.total + (order.discount || 0) - (order.shippingFee || 0));
                              const bundleDiscount = typeof order.bundleDiscountAmount === 'number'
                                ? order.bundleDiscountAmount
                                : (order.items || []).reduce((sum, item) => {
                                    if (item.bundleDiscount && item.bundleDiscount > 0) {
                                      const orig = item.price * item.quantity;
                                      const line = item.lineTotal ?? orig;
                                      return sum + Math.max(0, orig - line);
                                    }
                                    return sum;
                                  }, 0);

                              const promoDiscount = typeof order.promoDiscountAmount === 'number'
                                ? order.promoDiscountAmount
                                : (order.promoCode && order.discount > 0 && bundleDiscount === 0 ? order.discount : 0);

                              const paymentDiscount = typeof order.paymentDiscountAmount === 'number'
                                ? order.paymentDiscountAmount
                                : 0;

                              const hasGranular = bundleDiscount > 0 || promoDiscount > 0 || paymentDiscount > 0;
                              const leftoverGeneric = !hasGranular && (order.discount || 0) > 0 ? order.discount : 0;

                              return (
                                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                                  <div className="flex justify-between text-slate-600">
                                    <span>Subtotal (Actual Price)</span>
                                    <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
                                  </div>

                                  {bundleDiscount > 0 && (
                                    <div className="flex justify-between text-amber-700 font-semibold">
                                      <span>Bundle Volume Discount</span>
                                      <span className="font-mono">-₹{bundleDiscount.toFixed(2)}</span>
                                    </div>
                                  )}

                                  {promoDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-semibold">
                                      <span>Coupon Code Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                                      <span className="font-mono">-₹{promoDiscount.toFixed(2)}</span>
                                    </div>
                                  )}

                                  {paymentDiscount > 0 && (
                                    <div className="flex justify-between text-blue-700 font-semibold">
                                      <span>
                                        {order.paymentMethod === 'PayOnline'
                                          ? 'Prepaid Online Discount'
                                          : order.paymentMethod === 'PartialPayment'
                                          ? 'Partial Split Pay Discount'
                                          : 'Payment Mode Discount'}
                                      </span>
                                      <span className="font-mono">-₹{paymentDiscount.toFixed(2)}</span>
                                    </div>
                                  )}

                                  {leftoverGeneric > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-semibold">
                                      <span>Discount Applied</span>
                                      <span className="font-mono">-₹{leftoverGeneric.toFixed(2)}</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center text-slate-700">
                                    <span>Shipping & Delivery Charges</span>
                                    <span>
                                      {order.shippingFee === 0 || !order.shippingFee ? (
                                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                          FREE Delivery (₹0.00)
                                        </span>
                                      ) : (
                                        <span className="font-mono font-bold text-slate-900">
                                          ₹{order.shippingFee.toFixed(2)}
                                        </span>
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-baseline font-black text-slate-900 pt-2 border-t border-slate-200 text-sm">
                                    <span>Grand Total</span>
                                    <span className="text-amber-600 font-mono text-base">₹{order.total.toFixed(2)}</span>
                                  </div>

                                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                    <span className="text-slate-500">
                                      Payment Method: <strong className="text-slate-800">{order.paymentMethod || 'Online'}</strong>
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      order.paymentStatus === 'Paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : order.paymentStatus === 'Partially Paid'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {order.paymentStatus || 'Paid'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Details Drawer (Shipping Address & Tracking) */}
                            {isExpanded && (
                              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 border border-slate-200/60">
                                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Shipping Address:</span>
                                  </p>
                                  <p className="text-slate-700 font-semibold">{order.shippingAddress.fullName}</p>
                                  <p className="text-slate-600">{order.shippingAddress.address}</p>
                                  <p className="text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
                                  <p className="text-slate-500 text-[11px]">Phone: {order.shippingAddress.phone}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 border border-slate-200/60">
                                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Shipping & Tracking:</span>
                                  </p>
                                  {order.trackingNumber ? (
                                    <p className="text-slate-600 font-mono">
                                      {order.carrier || 'Express Carrier'}: <strong className="text-amber-700">{order.trackingNumber}</strong>
                                    </p>
                                  ) : (
                                    <p className="text-slate-500 text-[11px]">Tracking number will update once dispatched.</p>
                                  )}
                                  <p className="text-slate-600">Estimated Delivery: <strong className="text-slate-800">{order.estimatedDelivery || '3-5 Business Days'}</strong></p>
                                </div>
                              </div>
                            )}

                            {/* Buttons */}
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSearchedOrder(order);
                                    setCustomerPortalTab('tracking');
                                  }}
                                  className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Track Package</span>
                                </button>

                                <button
                                  onClick={() => handleReorder(order)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Reorder</span>
                                </button>

                                <button
                                  onClick={() => setSelectedReceiptOrder(order)}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/80 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  title="Download / Print Official Receipt"
                                >
                                  <Download className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Download Receipt</span>
                                </button>
                              </div>

                              <button
                                onClick={() => {
                                  setSupportOrder(order);
                                  setSupportSubject(`Inquiry for Order #${order.id}`);
                                }}
                                className="text-slate-600 hover:text-amber-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                <span>Report Issue / Support</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. SUPPORT INQUIRIES & ADMIN REPLIES */}
            {customerPortalTab === 'inquiries' && (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-500" />
                      <span>Support Queries & Admin Replies</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Whenever you submit a query or return ticket, our store administrator reviews and replies to it. View your tickets and live replies below.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsNewInquiryModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit New Ticket</span>
                  </button>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setInquiryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      inquiryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Queries ({userInquiries.length})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('RESOLVED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      inquiryFilter === 'RESOLVED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Replied & Resolved ({answeredInquiriesCount})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('AWAITING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      inquiryFilter === 'AWAITING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Awaiting Admin ({userInquiries.length - answeredInquiriesCount})
                  </button>
                </div>

                {/* Inquiries List */}
                {filteredInquiries.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">No support tickets found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      You haven't submitted any inquiries under this filter yet. Need help with an order, shipment, or return? Send a ticket directly to the store admin!
                    </p>
                    <button
                      onClick={() => setIsNewInquiryModalOpen(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Submit a Question Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredInquiries.map((inq) => {
                      const hasReply = Boolean(inq.adminReply);
                      const formattedDate = new Date(inq.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      });

                      return (
                        <div 
                          key={inq.id}
                          className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                        >
                          {/* Ticket Header */}
                          <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                #{inq.id}
                              </span>

                              <span className="bg-slate-200/70 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                {inq.category}
                              </span>

                              {inq.orderNumber && (
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                                  Order #{inq.orderNumber}
                                </span>
                              )}

                              {hasReply || inq.status === 'Resolved' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Replied & Resolved</span>
                                </span>
                              ) : inq.status === 'In Progress' ? (
                                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                                  <span>In Progress</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Under Review</span>
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-slate-400 font-medium">
                              {formattedDate}
                            </span>
                          </div>

                          {/* Ticket Content */}
                          <div className="p-6 space-y-4">
                            {/* User's Original Message */}
                            <div className="space-y-1.5">
                              <h4 className="text-sm font-bold text-slate-900 font-serif">
                                Subject: {inq.subject}
                              </h4>
                              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {inq.message}
                              </div>
                            </div>

                            {/* ADMIN OFFICIAL RESPONSE CARD */}
                            {hasReply ? (
                              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-300 rounded-2xl space-y-2.5 shadow-2xs">
                                <div className="flex items-center justify-between gap-2 border-b border-emerald-200/70 pb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-emerald-950">Official Lumina Support Response</p>
                                      <p className="text-[10px] text-emerald-700 font-medium">From Store Administrator / Support Desk</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    Verified Response
                                  </span>
                                </div>

                                <div className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap font-medium pt-1">
                                  {inq.adminReply}
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                <div>
                                  <p className="font-bold">Awaiting Administrator Response</p>
                                  <p className="text-[11px] text-amber-800">
                                    Our concierge support team has received your ticket and is preparing a response. The official reply will appear directly in this box.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. PERSONAL INFORMATION */}
            {customerPortalTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Profile Overview Card */}
                <div className="md:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                      {(customerUser?.name?.[0] || customerUser?.email[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {customerUser?.name || 'Lumina Customer'}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                        {customerUser?.email}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-2">
                        <Check className="w-3 h-3" />
                        <span>OTP Verified Member</span>
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <p className="font-black text-slate-900 text-sm">{userOrders.length}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Orders</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <p className="font-black text-emerald-600 text-sm">₹{totalSpent.toFixed(0)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Spent</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-3 text-xs">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security & OTP Login</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      Your account uses passwordless one-time passcodes (OTP) delivered securely to your verified email address. No vulnerable passwords required.
                    </p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-black text-slate-900 font-serif flex items-center gap-2">
                      <User className="w-5 h-5 text-amber-500" />
                      <span>Personal Information & Shipping Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Update your default contact name, phone, and delivery address for faster checkouts and personalized support.
                    </p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Verified Email</label>
                        <input
                          type="email"
                          value={customerUser?.email || ''}
                          disabled
                          className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone Number</label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="e.g. +1 (555) 234-5678"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
                        <input
                          type="text"
                          value={profileCountry}
                          onChange={(e) => setProfileCountry(e.target.value)}
                          placeholder="e.g. United States"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-4">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span>Default Delivery Address</span>
                      </p>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                        <input
                          type="text"
                          value={profileAddress}
                          onChange={(e) => setProfileAddress(e.target.value)}
                          placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                          <input
                            type="text"
                            value={profileCity}
                            onChange={(e) => setProfileCity(e.target.value)}
                            placeholder="e.g. Austin"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">State / Province</label>
                          <input
                            type="text"
                            value={profileState}
                            onChange={(e) => setProfileState(e.target.value)}
                            placeholder="e.g. TX"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">ZIP / Postal Code</label>
                          <input
                            type="text"
                            value={profileZip}
                            onChange={(e) => setProfileZip(e.target.value)}
                            placeholder="e.g. 78701"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {profileSavedSuccess && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">Your personal information and shipping details have been updated and saved to the database!</span>
                      </div>
                    )}

                    <div className="pt-3 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className={`font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
                          profileSavedSuccess
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isSavingProfile ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Saving Changes to Database...</span>
                          </>
                        ) : profileSavedSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Profile Saved to Database!</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Profile Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. RETURNS & REFUNDS */}
            {customerPortalTab === 'returns' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-emerald-600" />
                      <span>Returns, Exchanges & Refund Portal</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      We offer a 30-day money-back guarantee. Submit a return request or track ongoing return authorization instructions from admin.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsReturnFormOpen(prev => !prev)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isReturnFormOpen ? 'Close Return Form' : 'Request Return / Exchange'}</span>
                  </button>
                </div>

                {/* Inline Return Form */}
                {isReturnFormOpen && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-sm space-y-4 animate-in fade-in duration-150">
                    <h3 className="font-black text-slate-900 text-sm font-serif">Start a New Return Request</h3>
                    <form onSubmit={handleReturnSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Order Reference # *</label>
                          <input
                            type="text"
                            placeholder="e.g. LUM-98214"
                            value={returnOrderNumber}
                            onChange={(e) => setReturnOrderNumber(e.target.value)}
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Return *</label>
                          <select
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Unsatisfied with performance">Unsatisfied with performance</option>
                            <option value="Defective or Damaged in transit">Defective or Damaged in transit</option>
                            <option value="Received incorrect item or quantity">Received incorrect item or quantity</option>
                            <option value="Ordered by mistake / No longer needed">Ordered by mistake / No longer needed</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Additional Notes / Exchange Preference</label>
                        <textarea
                          rows={3}
                          value={returnNotes}
                          onChange={(e) => setReturnNotes(e.target.value)}
                          placeholder="State whether you prefer a full refund back to original payment or a free replacement..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReturnFormOpen(false)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Return Ticket</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Returns History List */}
                {userReturnInquiries.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">No active return requests</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      You haven't initiated any returns or refunds. If you received an item you're unsatisfied with, you can request a return anytime within 30 days of delivery.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReturnInquiries.map((ret) => (
                      <div key={ret.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              #{ret.id}
                            </span>
                            {ret.orderNumber && (
                              <span className="bg-purple-50 text-purple-700 text-xs font-mono font-bold px-2 py-0.5 rounded">
                                Order #{ret.orderNumber}
                              </span>
                            )}
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {ret.status === 'Resolved' ? 'Return Authorized / Resolved' : 'Return Under Review'}
                            </span>
                          </div>

                          <span className="text-xs text-slate-400">
                            {new Date(ret.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-xl">
                          {ret.message}
                        </div>

                        {/* Admin reply instructions */}
                        {ret.adminReply ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1.5 text-xs text-emerald-950">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Official Admin Instructions for this Return:</span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap pl-5 text-slate-900">
                              {ret.adminReply}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Return request logged. Administrator will provide return label / refund confirmation here shortly.</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 5. LIVE TRACKING */}
            {customerPortalTab === 'tracking' && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                      <Truck className="w-5 h-5 text-amber-500" />
                      <span>Live Order & Package Tracker</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enter any Order ID (e.g. LUM-10492) or carrier tracking number to view real-time shipping checkpoints.
                    </p>
                  </div>

                  <form onSubmit={handleTrackingSearch} className="flex gap-2 max-w-lg">
                    <input
                      type="text"
                      placeholder="Enter Order ID (e.g. LUM-10492)"
                      value={trackingQuery}
                      onChange={(e) => setTrackingQuery(e.target.value)}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Track
                    </button>
                  </form>

                  {/* Quick Select Recent Orders */}
                  {userOrders.length > 0 && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-slate-400 font-bold text-[11px]">Quick Select:</span>
                      {userOrders.slice(0, 4).map(o => (
                        <button
                          key={o.id}
                          onClick={() => setSearchedOrder(o)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          {o.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tracked Order Result */}
                {searchedOrder && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-slate-900 font-mono">{searchedOrder.id}</span>
                          {getStatusBadge(searchedOrder.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Carrier: <strong className="text-slate-800">{searchedOrder.carrier || 'Global Express'}</strong> • Tracking: <strong className="text-amber-700 font-mono">{searchedOrder.trackingNumber || 'Pending Dispatch'}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedReceiptOrder(searchedOrder)}
                        className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Carrier Checkpoints</h4>
                      <div className="space-y-3 pl-2 border-l-2 border-amber-500 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">Package Dispatched from Fulfillment Facility</p>
                          <p className="text-[11px] text-slate-500">In Transit with Carrier • Estimated: {searchedOrder.estimatedDelivery || '3-5 Days'}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">Destination Address Verified</p>
                          <p className="text-[11px] text-slate-500">{searchedOrder.shippingAddress.address}, {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* NEW SUPPORT INQUIRY MODAL */}
      {isNewInquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsNewInquiryModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <span>Submit Support Ticket to Admin</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your inquiry will appear in the Admin Portal. When replied, the official answer will show here in your account.
              </p>
            </div>

            <form onSubmit={handleCreateNewInquiry} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                <select
                  value={inquiryCategory}
                  onChange={(e) => setInquiryCategory(e.target.value as SupportInquiry['category'])}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="General Question">General Question</option>
                  <option value="Order Tracking">Order Tracking</option>
                  <option value="Returns & Refunds">Returns & Refunds</option>
                  <option value="Shipping Issue">Shipping Issue</option>
                  <option value="Product Inquiry">Product Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Question about order delivery timeline"
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Order # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. LUM-10492"
                  value={inquiryOrderNumber}
                  onChange={(e) => setInquiryOrderNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message *</label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewInquiryModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER SUPPORT MODAL */}
      {supportOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setSupportOrder(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 font-serif flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>Support for Order #{supportOrder.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your question will be linked directly to this order and submitted to the store admin.
              </p>
            </div>

            <form onSubmit={handleSendOrderSupportMessage} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Topic</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value as SupportInquiry['category'])}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Order Tracking">Shipment / Tracking Status</option>
                  <option value="Returns & Refunds">Return / Refund Request</option>
                  <option value="Shipping Issue">Damaged or Missing Item</option>
                  <option value="Product Inquiry">Product Assistance</option>
                  <option value="General Question">General Question</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or issue with this order..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSupportOrder(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Ticket to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT / INVOICE MODAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
            {/* Close Button cleanly positioned on top right */}
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header with Title and Download/Print Action spaced away from Close Button */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 pr-12 gap-3">
              <div>
                <p className="text-base font-black text-slate-900 font-serif">Purchase Receipt & Invoice</p>
                <p className="text-xs text-slate-500 font-mono">Order ID: {selectedReceiptOrder.id}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                title="Download or Print Receipt as PDF"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <Printer className="w-3.5 h-3.5 text-amber-600" />
                <span>Download / Print</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                <p className="font-bold text-slate-800">Shipped To:</p>
                <p className="text-slate-600">{selectedReceiptOrder.shippingAddress.fullName}</p>
                <p className="text-slate-600">{selectedReceiptOrder.shippingAddress.address}, {selectedReceiptOrder.shippingAddress.city}, {selectedReceiptOrder.shippingAddress.state} {selectedReceiptOrder.shippingAddress.zipCode}</p>
                <p className="text-slate-500 text-[11px]">Email: {selectedReceiptOrder.shippingAddress.email}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Items Purchased</p>
                <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                  {selectedReceiptOrder.items.map((it, i) => {
                    const originalLineTotal = it.price * it.quantity;
                    const finalLine = it.lineTotal ?? originalLineTotal;
                    return (
                      <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{it.productTitle}</p>
                          <div className="flex items-center gap-2 text-slate-500 text-[11px] flex-wrap">
                            <span>Qty: {it.quantity} × ₹{it.price.toFixed(2)}</span>
                            {it.bundleDiscount && it.bundleDiscount > 0 ? (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Save {it.bundleDiscount}% (Bundle Tier)
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {finalLine < originalLineTotal && (
                            <span className="text-[10px] text-slate-400 line-through font-mono block">
                              ₹{originalLineTotal.toFixed(2)}
                            </span>
                          )}
                          <p className="font-black text-slate-900 font-mono">₹{finalLine.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2 pt-2 text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between">
                  <span>Subtotal (Actual Price)</span>
                  <span className="font-mono font-semibold">
                    ₹{(selectedReceiptOrder.subtotal ?? (selectedReceiptOrder.total + (selectedReceiptOrder.discount || 0) - (selectedReceiptOrder.shippingFee || 0))).toFixed(2)}
                  </span>
                </div>

                {/* Granular Itemized Discounts */}
                {(() => {
                  const bundleDiscount = typeof selectedReceiptOrder.bundleDiscountAmount === 'number'
                    ? selectedReceiptOrder.bundleDiscountAmount
                    : (selectedReceiptOrder.items || []).reduce((sum, item) => {
                        if (item.bundleDiscount && item.bundleDiscount > 0) {
                          const orig = item.price * item.quantity;
                          const line = item.lineTotal ?? orig;
                          return sum + Math.max(0, orig - line);
                        }
                        return sum;
                      }, 0);

                  const promoDiscount = typeof selectedReceiptOrder.promoDiscountAmount === 'number'
                    ? selectedReceiptOrder.promoDiscountAmount
                    : (selectedReceiptOrder.promoCode && selectedReceiptOrder.discount > 0 && bundleDiscount === 0 ? selectedReceiptOrder.discount : 0);

                  const paymentDiscount = typeof selectedReceiptOrder.paymentDiscountAmount === 'number'
                    ? selectedReceiptOrder.paymentDiscountAmount
                    : 0;

                  const hasGranular = bundleDiscount > 0 || promoDiscount > 0 || paymentDiscount > 0;
                  const leftoverGeneric = !hasGranular && (selectedReceiptOrder.discount || 0) > 0 ? selectedReceiptOrder.discount : 0;

                  return (
                    <>
                      {bundleDiscount > 0 && (
                        <div className="flex justify-between text-amber-700 font-semibold">
                          <span>Bundle Volume Discount</span>
                          <span className="font-mono">-₹{bundleDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>
                            Coupon Code Discount {selectedReceiptOrder.promoCode ? `(${selectedReceiptOrder.promoCode})` : ''}
                          </span>
                          <span className="font-mono">-₹{promoDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      {paymentDiscount > 0 && (
                        <div className="flex justify-between text-blue-700 font-semibold">
                          <span>
                            {selectedReceiptOrder.paymentMethod === 'PayOnline'
                              ? 'Prepaid Online Discount'
                              : selectedReceiptOrder.paymentMethod === 'PartialPayment'
                              ? 'Partial Split Pay Discount'
                              : 'Payment Mode Discount'}
                          </span>
                          <span className="font-mono">-₹{paymentDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      {leftoverGeneric > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Discount Applied</span>
                          <span className="font-mono">-₹{leftoverGeneric.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Delivery Charges (Free vs Paid) */}
                <div className="flex justify-between items-center text-slate-700">
                  <span>Shipping & Delivery Charges</span>
                  <span>
                    {selectedReceiptOrder.shippingFee === 0 || !selectedReceiptOrder.shippingFee ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        FREE Delivery (₹0.00)
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-slate-900">
                        ₹{selectedReceiptOrder.shippingFee.toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-amber-600 font-mono text-base">₹{selectedReceiptOrder.total.toFixed(2)}</span>
                </div>

                {/* Payment Mode Status */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Payment Method: <strong className="text-slate-800">{selectedReceiptOrder.paymentMethod || 'Online'}</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedReceiptOrder.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedReceiptOrder.paymentStatus === 'Partially Paid'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedReceiptOrder.paymentStatus || 'Paid'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
