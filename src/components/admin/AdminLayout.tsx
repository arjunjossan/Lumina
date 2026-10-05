import React from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminTab } from '../../types';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  Store, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  LogOut,
  Lock,
  Headphones,
  MessageCircle,
  Sun,
  Moon,
  Bell,
  Image as ImageIcon,
  CreditCard,
  Truck,
  Layers,
  Tag,
  Share2,
  Monitor,
  Smartphone
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { 
    adminTab, 
    setAdminTab, 
    navigateTo, 
    products, 
    orders, 
    supportInquiries, 
    chatSessions, 
    logoutAdmin, 
    isAdminAuthenticated, 
    setIsAdminLoginModalOpen,
    adminTheme,
    toggleAdminTheme,
    storeBranding
  } = useStore();

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const lowStockCount = products.filter((p) => p.stock <= 10).length;
  const newInquiriesCount = supportInquiries.filter((i) => i.status === 'New').length;
  const unreadChatCount = chatSessions.reduce((sum, s) => sum + (s.unreadForAdmin || 0), 0);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Analytics & Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'products', label: 'Desktop Product Catalog (CRUD)', icon: <Package className="w-4 h-4" />, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'mobile_products', label: 'Mobile Product Catalog (CRUD)', icon: <Smartphone className="w-4 h-4 text-amber-400" /> },
    { id: 'desktop_hero', label: 'Desktop Hero Section', icon: <Monitor className="w-4 h-4 text-sky-400" /> },
    { id: 'mobile_hero', label: 'Mobile Hero Section', icon: <Smartphone className="w-4 h-4 text-purple-400" /> },
    { id: 'orders', label: 'Order Management', icon: <ShoppingBag className="w-4 h-4" />, badge: pendingOrders > 0 ? pendingOrders : undefined },
    { id: 'inquiries', label: 'Support Inquiries', icon: <Headphones className="w-4 h-4" />, badge: newInquiriesCount > 0 ? newInquiriesCount : undefined },
    { id: 'live_chat', label: 'Live Customer Chat', icon: <MessageCircle className="w-4 h-4 text-emerald-400" />, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
    { id: 'reviews', label: 'Customer Reviews', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'shipping', label: 'Shipping & Delivery Charges', icon: <Truck className="w-4 h-4 text-sky-400" /> },
    { id: 'payments', label: 'Mode of Payment & Checkout', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
    { id: 'bundles', label: 'Bundle & Volume Discounts', icon: <Layers className="w-4 h-4 text-amber-400" /> },
    { id: 'coupons', label: 'Promo & Coupon Generator', icon: <Tag className="w-4 h-4 text-purple-400" /> },
    { id: 'top_notification', label: 'Top Notification Bar', icon: <Bell className="w-4 h-4 text-amber-400" /> },
    { id: 'promo_popup', label: 'Flash Sale & Popup', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'logo', label: 'Logo', icon: <ImageIcon className="w-4 h-4 text-amber-400" /> },
    { id: 'social', label: 'Social Media Links', icon: <Share2 className="w-4 h-4 text-amber-400" /> },
    { id: 'settings', label: 'Store Settings & Passcode', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
      adminTheme === 'light' 
        ? 'admin-light bg-slate-50 text-slate-900' 
        : 'bg-slate-900 text-slate-100'
    }`}>
      {/* Fixed Top Admin Bar */}
      <header className="shrink-0 bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider font-serif uppercase">
              {storeBranding?.storeName || 'LUMINA'} ADMIN CONTROL CENTER
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                {storeBranding?.subtitle || 'Winning Products'} Management Portal
              </span>
              {isAdminAuthenticated && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authenticated</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Admin Metrics & Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400 border-r border-slate-800 pr-6">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Gross Sales</span>
              <span className="text-sm font-black text-emerald-400">₹{totalSales.toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Total Orders</span>
              <span className="text-sm font-black text-amber-400">{orders.length}</span>
            </div>
          </div>

          {/* Theme Switcher Button (Light Mode / Dark Mode) */}
          <button
            onClick={toggleAdminTheme}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              adminTheme === 'light'
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={`Switch to ${adminTheme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {adminTheme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          {isAdminAuthenticated ? (
            <button
              onClick={logoutAdmin}
              className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              title="Sign out of Admin Center"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Admin</span>
            </button>
          )}
        </div>
      </header>

      {isAdminAuthenticated ? (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Fixed Admin Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 overflow-y-auto space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3 py-1">Admin Operations</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    adminTab === item.id
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      adminTab === item.id ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-Bit Authenticated</span>
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Changes made here immediately sync to customer product pages, stock counts, and live tracking.
              </p>
            </div>
          </aside>

          {/* Scrollable Admin Main Content Area */}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-white">Admin Dashboard Restricted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                This section is protected by security authentication. Please sign in with your passcode to continue.
              </p>
            </div>
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Admin Passcode (admin123)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
