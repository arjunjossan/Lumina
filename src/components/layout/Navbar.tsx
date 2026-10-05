import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  LayoutDashboard, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Menu, 
  X,
  Package,
  Store,
  User,
  LogOut,
  Mail,
  Flame,
  Tag,
  Gift,
  Bell,
  Check,
  Clock,
  Star,
  Zap,
  Crown,
  ChevronDown,
  MessageSquare,
  RotateCcw,
  FileText,
  Scale
} from 'lucide-react';
import { Category } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    cart, 
    wishlist, 
    activePage, 
    navigateTo, 
    setIsCartOpen, 
    setIsWishlistOpen,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    products,
    mobileProducts,
    customerUser,
    isCustomerAuthenticated,
    setIsCustomerAuthModalOpen,
    navigateToLogin,
    logoutCustomer,
    customerPortalTab,
    setCustomerPortalTab,
    orders,
    supportInquiries,
    topNotificationConfig,
    setIsFlashSalePopupOpen,
    storeBranding,
    compareList,
    setIsCompareModalOpen
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown or mobile menu on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const customerEmail = customerUser?.email?.toLowerCase();
  const customerOrdersCount = customerEmail 
    ? orders.filter(o => o.customerEmail.toLowerCase() === customerEmail || o.shippingAddress?.email?.toLowerCase() === customerEmail).length 
    : 0;
  const customerInquiries = customerEmail
    ? supportInquiries.filter(i => i.email.toLowerCase() === customerEmail)
    : [];
  const customerInquiriesCount = customerInquiries.length;
  const answeredInquiriesCount = customerInquiries.filter(i => Boolean(i.adminReply) || i.status === 'Resolved').length;

  const categories: Category[] = ['All', 'Home Innovation', 'Smart Gadgets', 'Tech & Audio', 'Personal Care', 'Lifestyle'];

  const isMobileNav = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const searchCatalog = isMobileNav && mobileProducts && mobileProducts.length > 0 ? mobileProducts : products;

  const filteredSearchProducts = searchTerm.trim() 
    ? searchCatalog.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    navigateTo('catalog');
    setMobileMenuOpen(false);
  };

  const handleTrackOrderClick = () => {
    if (!isCustomerAuthenticated) {
      navigateToLogin('order-tracking', 'tracking');
      setMobileMenuOpen(false);
      return;
    }
    navigateTo('order-tracking');
    setMobileMenuOpen(false);
  };

  const handleNotificationClick = () => {
    if (!topNotificationConfig) return;
    const action = topNotificationConfig.centerLinkAction || 'catalog';
    if (action === 'catalog') {
      navigateTo('catalog');
    } else if (action === 'deals') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById('featured-products') || document.getElementById('catalog-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else if (action === 'flash_popup') {
      setIsFlashSalePopupOpen(true);
    }
  };

  const renderLeftIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkles': return <Sparkles className="w-3.5 h-3.5 animate-sparkle-twinkle" />;
      case 'flame': return <Flame className="w-3.5 h-3.5 text-orange-400 animate-flame-flicker" />;
      case 'tag': return <Tag className="w-3.5 h-3.5 animate-tag-swing" />;
      case 'gift': return <Gift className="w-3.5 h-3.5 animate-gift-pop" />;
      case 'bell': return <Bell className="w-3.5 h-3.5 animate-bell-ring" />;
      default: return <Sparkles className="w-3.5 h-3.5 animate-sparkle-twinkle" />;
    }
  };

  const renderRightIcon = (iconName?: string) => {
    switch (iconName) {
      case 'truck': return <Truck className="w-3 h-3 text-emerald-400 animate-truck-drive" />;
      case 'shield': return <ShieldCheck className="w-3 h-3 text-sky-400 animate-shield-pulse" />;
      case 'check': return <Check className="w-3 h-3 text-emerald-400 animate-check-bounce" />;
      case 'clock': return <Clock className="w-3 h-3 text-amber-400 animate-clock-tick" />;
      case 'star': return <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-star-twinkle" />;
      default: return null;
    }
  };

  const currentBg = topNotificationConfig?.customBgColor || '#0f172a';
  const currentText = topNotificationConfig?.customTextColor || '#f8fafc';
  const currentAccent = topNotificationConfig?.customAccentColor || '#fcd34d';

  const getLetterSpacingStyle = (spacing?: string) => {
    switch (spacing) {
      case 'tight': return '-0.025em';
      case 'wide': return '0.08em';
      case 'wider': return '0.15em';
      case 'widest': return '0.25em';
      default: return 'normal';
    }
  };

  const getWeightVal = (weight?: string) => {
    switch (weight) {
      case 'black': return 900;
      case 'extrabold': return 800;
      case 'bold': return 700;
      case 'semibold': return 600;
      case 'medium': return 500;
      default: return 400;
    }
  };

  const renderLogoGraphic = () => {
    if (!storeBranding) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
      );
    }

    if (storeBranding.logoType === 'custom_image' && storeBranding.logoImageUrl) {
      const roundedClass = 
        storeBranding.logoRounded === 'full' ? 'rounded-full' :
        storeBranding.logoRounded === '2xl' ? 'rounded-2xl' :
        storeBranding.logoRounded === 'xl' ? 'rounded-xl' :
        storeBranding.logoRounded === 'lg' ? 'rounded-lg' :
        storeBranding.logoRounded === 'md' ? 'rounded-md' :
        storeBranding.logoRounded === 'sm' ? 'rounded-xs' : '';

      return (
        <div 
          className="flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 shrink-0"
          style={{ height: `${storeBranding.logoHeight || 40}px` }}
        >
          <img
            src={storeBranding.logoImageUrl}
            alt={storeBranding.storeName || 'Store Logo'}
            className={`max-h-full object-contain ${roundedClass}`}
            style={{ height: `${storeBranding.logoHeight || 40}px` }}
          />
        </div>
      );
    }

    const roundedClass = 
      storeBranding.logoRounded === 'full' ? 'rounded-full' :
      storeBranding.logoRounded === '2xl' ? 'rounded-2xl' :
      storeBranding.logoRounded === 'xl' ? 'rounded-xl' :
      storeBranding.logoRounded === 'lg' ? 'rounded-lg' :
      storeBranding.logoRounded === 'md' ? 'rounded-md' :
      storeBranding.logoRounded === 'sm' ? 'rounded-xs' : 'rounded-xl';

    const renderIconSvg = () => {
      switch (storeBranding.logoIcon) {
        case 'flame': return <Flame className="w-5 h-5 fill-white/20" />;
        case 'star': return <Star className="w-5 h-5 fill-white/20" />;
        case 'package': return <Package className="w-5 h-5 fill-white/20" />;
        case 'store': return <Store className="w-5 h-5 fill-white/20" />;
        case 'zap': return <Zap className="w-5 h-5 fill-white/20" />;
        case 'crown': return <Crown className="w-5 h-5 fill-white/20" />;
        default: return <Sparkles className="w-5 h-5 fill-white/20" />;
      }
    };

    return (
      <div className={`w-10 h-10 ${roundedClass} bg-gradient-to-tr ${storeBranding.logoGradient || 'from-amber-500 via-orange-500 to-red-500'} flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0`}>
        {renderIconSvg()}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
      {/* Dynamic Announcement Bar */}
      {topNotificationConfig?.enabled !== false && (
        <div 
          id="top-notification-bar"
          style={{ backgroundColor: currentBg, color: currentText }}
          className="relative w-full text-xs font-medium py-0.5 sm:py-2 px-2 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 transition-colors shadow-2xs overflow-hidden"
        >
          {/* Animated Highlight Wave from Left to Right */}
          <div 
            className="absolute inset-y-0 w-2/3 pointer-events-none animate-notification-sweep z-0"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${currentAccent}22 25%, rgba(255, 255, 255, 0.28) 50%, ${currentAccent}2e 75%, transparent 100%)`
            }}
          />

          {/* Secondary animated radiant shimmer layer */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 z-0 animate-flow-right"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, ${currentAccent}33 50%, rgba(255,255,255,0.06) 70%, transparent 100%)`
            }}
          />

          {/* Animated glowing accent beam along bottom border */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none overflow-hidden z-0"
            style={{ backgroundColor: `${currentAccent}26` }}
          >
            <div 
              className="h-full w-1/3 animate-notification-beam"
              style={{
                background: `linear-gradient(90deg, transparent, ${currentAccent}, #ffffff, ${currentAccent}, transparent)`
              }}
            />
          </div>

          {/* Animated subtle light beam along top border */}
          <div 
            className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none overflow-hidden z-0"
            style={{ backgroundColor: `${currentAccent}1a` }}
          >
            <div 
              className="h-full w-1/4 animate-notification-beam"
              style={{
                background: `linear-gradient(90deg, transparent, ${currentAccent}cc, transparent)`
              }}
            />
          </div>

          {/* --- MOBILE DISPLAY (< sm) --- */}
          <div className="flex sm:hidden items-center justify-between gap-1 w-full relative z-10 min-h-[20px] max-h-[22px]">
            {/* Left Fixed Icon Slot */}
            <div 
              style={{ backgroundColor: currentBg, color: currentAccent }}
              className="z-20 shrink-0 flex items-center pr-1 font-bold cursor-pointer"
              onClick={handleNotificationClick}
            >
              <span className="p-0.5 rounded-full flex items-center justify-center shadow-2xs scale-90" style={{ backgroundColor: `${currentAccent}22` }}>
                {renderLeftIcon(topNotificationConfig?.leftBadgeIcon && topNotificationConfig.leftBadgeIcon !== 'none' ? topNotificationConfig.leftBadgeIcon : 'flame')}
              </span>
            </div>

            {/* Center Auto-Scrolling Single Line Text Area */}
            <div 
              onClick={topNotificationConfig?.centerLinkAction !== 'none' ? handleNotificationClick : undefined}
              className="flex-1 overflow-hidden relative mx-0.5 cursor-pointer py-0 flex items-center"
            >
              <div className="animate-marquee-text text-[10.5px] font-semibold tracking-tight whitespace-nowrap leading-tight">
                {topNotificationConfig?.centerMessage || '🔥 Limited Stock Available — Free Express Worldwide Shipping Over ₹999'}
              </div>
            </div>

            {/* Right Fixed Deal Action Slot */}
            <div 
              style={{ backgroundColor: currentBg }}
              className="z-20 shrink-0 pl-1 flex items-center"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick();
                }}
                style={{ 
                  color: currentAccent,
                  backgroundColor: `${currentAccent}22`,
                  borderColor: `${currentAccent}40`
                }}
                className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shadow-2xs cursor-pointer hover:opacity-90 active:scale-95 transition-all whitespace-nowrap leading-none"
              >
                <span>{topNotificationConfig?.centerHighlightText || 'Claim Deals'}</span>
                <span className="text-[8px]">→</span>
              </button>
            </div>
          </div>

          {/* --- DESKTOP DISPLAY (>= sm) --- */}
          <div className="hidden sm:flex relative z-10 items-center justify-between gap-4 max-w-7xl mx-auto">
            {/* Left Badge (Desktop: full pill badge) */}
            {topNotificationConfig?.leftBadgeText && (
              <div 
                style={{ 
                  color: currentAccent,
                  backgroundColor: `${currentAccent}1A`,
                  borderColor: `${currentAccent}33`
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold tracking-wide uppercase shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-2xs"
                onClick={handleNotificationClick}
              >
                {renderLeftIcon(topNotificationConfig.leftBadgeIcon)}
                <span>{topNotificationConfig.leftBadgeText}</span>
              </div>
            )}

            {/* Center Announcement Message (Desktop) */}
            <div 
              onClick={topNotificationConfig?.centerLinkAction !== 'none' ? handleNotificationClick : undefined}
              className={`flex items-center justify-center gap-1.5 text-center flex-1 max-w-full leading-snug ${
                topNotificationConfig?.centerLinkAction !== 'none' ? 'cursor-pointer hover:opacity-90 active:scale-[0.99] transition-transform' : ''
              }`}
            >
              <span className="text-xs font-semibold tracking-normal">
                {topNotificationConfig?.centerMessage || '🔥 Limited Stock Available — Free Express Worldwide Shipping Over ₹999'}
              </span>

              {/* Highlight Action Pill/Tag */}
              {topNotificationConfig?.centerHighlightText && (
                <span 
                  style={{ 
                    color: currentAccent,
                    backgroundColor: `${currentAccent}22`,
                    borderColor: `${currentAccent}40`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationClick();
                  }}
                  className="inline-flex items-center gap-0.5 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md border underline decoration-current/50 underline-offset-2 shrink-0 cursor-pointer hover:opacity-85 active:scale-95 transition-all ml-0.5"
                >
                  <span>{topNotificationConfig.centerHighlightText}</span>
                  <span className="text-[9px]">→</span>
                </span>
              )}
            </div>

            {/* Right Trust Badges (Desktop) */}
            <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
              {topNotificationConfig?.rightTag1Text && (
                <span className="flex items-center gap-1 text-slate-300">
                  {renderRightIcon(topNotificationConfig.rightTag1Icon)}
                  <span>{topNotificationConfig.rightTag1Text}</span>
                </span>
              )}
              {topNotificationConfig?.rightTag2Text && (
                <span className="flex items-center gap-1 text-slate-300">
                  {renderRightIcon(topNotificationConfig.rightTag2Icon)}
                  <span>{topNotificationConfig.rightTag2Text}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Nav Header */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Drawer Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-8">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px] active:scale-95"
            aria-label="Open Navigation Drawer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button 
            onClick={() => {
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer"
          >
            {renderLogoGraphic()}
            <div className="flex flex-col">
              <span 
                className={`block leading-tight truncate max-w-[130px] sm:max-w-xs md:max-w-none font-${
                  storeBranding?.storeNameFont === 'serif' ? 'serif' : storeBranding?.storeNameFont === 'mono' ? 'mono' : 'sans'
                }`}
                style={{
                  fontSize: `${storeBranding?.storeNameSize || 22}px`,
                  color: storeBranding?.storeNameColor || '#0f172a',
                  fontWeight: getWeightVal(storeBranding?.storeNameWeight || 'black')
                }}
              >
                {storeBranding?.storeName || 'LUMINA'}
              </span>
              <span 
                className="block leading-none mt-0.5 truncate max-w-[130px] sm:max-w-xs md:max-w-none text-[8px] sm:text-[10px]"
                style={{
                  fontSize: `${storeBranding?.subtitleFontSize || 10}px`,
                  color: storeBranding?.subtitleColor || '#d97706',
                  fontWeight: getWeightVal(storeBranding?.subtitleFontWeight || 'extrabold'),
                  letterSpacing: getLetterSpacingStyle(storeBranding?.subtitleLetterSpacing || 'widest'),
                  fontStyle: storeBranding?.subtitleStyle === 'italic' ? 'italic' : 'normal',
                  textTransform: (storeBranding?.subtitleTransform as any) || 'uppercase'
                }}
              >
                {storeBranding?.subtitle || 'WINNING PRODUCTS'}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar with Autocomplete Dropdown (Desktop & Tablets) */}
        <div className="hidden md:block flex-1 max-w-md lg:max-w-xl xl:max-w-2xl relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search winning gadgets, levitating lamps, earbuds..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && filteredSearchProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">Matching Products</p>
              {filteredSearchProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    navigateTo('product-detail', p.id);
                    setShowSearchDropdown(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left p-2 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <img src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} alt={p.title} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-100" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[11px] text-amber-600 font-semibold">₹{p.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions & Profile Header Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          {/* Mobile Search Toggle Button (visible < md) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center active:scale-95 ${
              mobileSearchOpen ? 'bg-amber-500/20 text-amber-800' : 'text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Search"
            title="Search Products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop My Orders / Customer Portal Link */}
          <button
            onClick={() => {
              setCustomerPortalTab('orders');
              navigateTo('my-orders', undefined, 'orders');
            }}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activePage === 'my-orders' && customerPortalTab === 'orders'
                ? 'text-amber-700 bg-amber-500/15 ring-1 ring-amber-500/30 font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className={`w-4 h-4 ${activePage === 'my-orders' && customerPortalTab === 'orders' ? 'text-amber-600' : 'text-slate-500'}`} />
            <span>My Orders</span>
          </button>

          {/* Desktop Order Tracking */}
          <button
            onClick={handleTrackOrderClick}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activePage === 'order-tracking' 
                ? 'text-amber-700 bg-amber-500/15 ring-1 ring-amber-500/30 font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className={`w-4 h-4 ${activePage === 'order-tracking' ? 'text-amber-600' : 'text-slate-500'}`} />
            <span>Track Order</span>
          </button>

          {/* Desktop Compare Button */}
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="hidden md:flex p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 relative transition-colors cursor-pointer"
            title="Product Comparison"
            aria-label="Product Comparison"
          >
            <Scale className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Desktop Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="hidden sm:flex p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 relative transition-colors"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Desktop/Tablet Cart Button */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                navigateTo('cart');
              } else {
                setIsCartOpen(true);
              }
            }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            aria-label="View Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold tracking-wide">
              {totalCartCount > 0 ? `${totalCartCount} Items` : 'Cart'}
            </span>
          </button>

          {/* Customer Profile & Dropdown Menu (Unified for Mobile & Desktop) */}
          {isCustomerAuthenticated && customerUser ? (
            <div className="relative" ref={profileDropdownRef}>
              {/* Mobile Profile Trigger (< sm screens) */}
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className={`sm:hidden p-1 rounded-full border transition-all cursor-pointer flex items-center justify-center relative active:scale-95 shadow-2xs ${
                  isProfileDropdownOpen
                    ? 'border-amber-500 ring-2 ring-amber-400/30'
                    : 'border-amber-400/80'
                }`}
                title={`${customerUser.name || 'Member'} - Account Menu`}
                aria-label="Customer Profile Menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {(customerUser.name?.[0] || customerUser.email[0] || 'U').toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </button>

              {/* Desktop Profile Trigger (>= sm screens) */}
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isProfileDropdownOpen
                    ? 'bg-amber-500/15 border-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-400/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 shadow-2xs hover:border-slate-300'
                }`}
                title="Customer Profile & Account Menu"
              >
                {/* Circle Avatar with Initial and Online Status */}
                <div className="relative flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                    {(customerUser.name?.[0] || customerUser.email[0] || 'U').toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <span className="text-xs font-bold tracking-tight text-slate-800">Profile</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
              </button>

              {/* Unified Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-amber-50/40 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                        {(customerUser.name?.[0] || customerUser.email[0] || 'U').toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {customerUser.name || 'Verified Customer'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          {customerUser.email}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>OTP Verified Member</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation items */}
                  <div className="py-1 px-1.5 space-y-0.5 text-xs">
                    {/* 1. My Profile & Info */}
                    <button
                      onClick={() => {
                        setCustomerPortalTab('profile');
                        navigateTo('my-orders');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-amber-50/70 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors">Personal Information</p>
                          <p className="text-[10px] text-slate-400">Name, phone & shipping address</p>
                        </div>
                      </div>
                    </button>

                    {/* 2. My Orders & Tracking */}
                    <button
                      onClick={() => {
                        setCustomerPortalTab('orders');
                        navigateTo('my-orders');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-amber-50/70 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-200/60 transition-colors">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors">Order History & Tracking</p>
                          <p className="text-[10px] text-slate-400">View past orders, receipts & delivery</p>
                        </div>
                      </div>
                      {customerOrdersCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full">
                          {customerOrdersCount}
                        </span>
                      )}
                    </button>

                    {/* 3. Support Queries & Replies */}
                    <button
                      onClick={() => {
                        setCustomerPortalTab('inquiries');
                        navigateTo('my-orders');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-amber-50/70 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-sky-900 transition-colors">Support Queries & Admin Replies</p>
                          <p className="text-[10px] text-slate-400">Track inquiries & view admin responses</p>
                        </div>
                      </div>
                      {customerInquiriesCount > 0 && (
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          answeredInquiriesCount > 0 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {customerInquiriesCount} {answeredInquiriesCount > 0 ? '• Reply' : ''}
                        </span>
                      )}
                    </button>

                    {/* 4. Returns & Refunds */}
                    <button
                      onClick={() => {
                        setCustomerPortalTab('returns');
                        navigateTo('my-orders');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-amber-50/70 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">Returns & Refunds</p>
                          <p className="text-[10px] text-slate-400">Request return, exchange or track status</p>
                        </div>
                      </div>
                    </button>

                    {/* 5. Contact Customer Support */}
                    <button
                      onClick={() => {
                        navigateTo('contact');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-amber-50/70 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-purple-900 transition-colors">Contact Support Concierge</p>
                          <p className="text-[10px] text-slate-400">Submit a query or send a message</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t border-slate-100 mt-1 pt-1.5 px-1.5">
                    <button
                      onClick={() => {
                        logoutCustomer();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              {/* Mobile Sign In button (< sm screens) */}
              <button
                type="button"
                onClick={() => navigateToLogin('my-orders', 'account')}
                className="sm:hidden w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-amber-700 hover:bg-amber-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                title="Sign In with Email & OTP"
                aria-label="Sign In to Customer Account"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Desktop Sign In button (>= sm screens) */}
              <button
                type="button"
                onClick={() => navigateToLogin('my-orders', 'account')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Sign In with Email & OTP"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* ADMIN DASHBOARD BUTTON TOGGLE */}
          <button
            onClick={() => navigateTo(activePage === 'admin' ? 'home' : 'admin')}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePage === 'admin'
                ? 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-400'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {activePage === 'admin' ? (
              <>
                <Store className="w-4 h-4" />
                <span>Customer View</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span>Admin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar (under Header) */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Search gadgets, lights, tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-16 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-600 text-xs font-bold mr-1"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Mobile Search Results */}
          {searchTerm.trim() && filteredSearchProducts.length > 0 && (
            <div className="mt-2 bg-slate-50 rounded-xl p-2 max-h-60 overflow-y-auto space-y-1 border border-slate-200/80">
              <p className="text-[10px] font-black uppercase text-slate-400 px-2 py-1">Matching Products</p>
              {filteredSearchProducts.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    navigateTo('product-detail', p.id);
                    setMobileSearchOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left p-2 hover:bg-white rounded-lg flex items-center gap-2.5 transition-colors bg-white/70 border border-slate-100"
                >
                  <img src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} alt={p.title} className="w-8 h-8 object-cover rounded-md shrink-0 border" />
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[10px] text-amber-600 font-extrabold">₹{p.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop Category Nav Strip with Active State Highlighting */}
      <nav className="hidden lg:block border-t border-slate-100 bg-slate-50/60 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center space-x-1.5 py-2.5">
            {/* Home / Highlights */}
            <button
              onClick={() => {
                setSelectedCategory('All');
                navigateTo('home');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activePage === 'home' 
                  ? 'text-amber-800 bg-white border border-amber-200 shadow-xs font-black' 
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              🔥 Home & Highlights
            </button>

            {/* All Products Catalog */}
            <button
              onClick={() => {
                setSelectedCategory('All');
                navigateTo('catalog');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activePage === 'catalog' && selectedCategory === 'All'
                  ? 'text-amber-800 bg-white border border-amber-200 shadow-xs font-black' 
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              All Products Catalog
            </button>

            {/* Individual Categories */}
            {categories.filter(c => c !== 'All').map((cat) => {
              const isCatActive = activePage === 'catalog' && selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    isCatActive 
                      ? 'text-amber-800 bg-white border border-amber-200 shadow-xs font-black' 
                      : 'hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-amber-700 font-bold">
            <span className="flex items-center gap-1 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
              ✨ 100% Unique Verified Winning Products
            </span>
          </div>
        </div>
      </nav>

      {/* MOBILE SLIDE-IN SIDE DRAWER (Complete with Categories, Profile, Quick Links) */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden font-sans transition-all duration-300 ${
          mobileMenuOpen 
            ? 'visible pointer-events-auto' 
            : 'invisible pointer-events-none delay-300'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop with smooth fade */}
        <div 
          className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Container with smooth slide-in/out transition */}
        <div 
          className={`fixed inset-y-0 left-0 w-[86%] max-w-sm bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-r border-slate-200 transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
            
          {/* Drawer Header */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                {renderLogoGraphic()}
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white">
                    {storeBranding?.storeName || 'LUMINA'}
                  </h3>
                  <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">
                    {storeBranding?.subtitle || 'WINNING PRODUCTS'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Close Menu Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">

              {/* 3. Catalog & Categories Section */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                  Explore Products
                </p>
                
                {/* Home */}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    navigateTo('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
                    activePage === 'home' 
                      ? 'bg-amber-500/15 text-amber-950 font-black border border-amber-300' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🔥</span>
                    <span>Home & Highlights</span>
                  </span>
                  {activePage === 'home' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </button>

                {/* All Products Catalog */}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    navigateTo('catalog');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
                    activePage === 'catalog' && selectedCategory === 'All'
                      ? 'bg-amber-500/15 text-amber-950 font-black border border-amber-300' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>All Products Catalog</span>
                  </span>
                  {activePage === 'catalog' && selectedCategory === 'All' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </button>

                {/* Individual Categories */}
                {categories.filter(c => c !== 'All').map((cat) => {
                  const isCatActive = activePage === 'catalog' && selectedCategory === cat;
                  const getCategoryIcon = (name: string) => {
                    if (name.includes('Home')) return '🏡';
                    if (name.includes('Smart')) return '⚡';
                    if (name.includes('Tech') || name.includes('Audio')) return '🎧';
                    if (name.includes('Personal')) return '✨';
                    if (name.includes('Lifestyle')) return '🌿';
                    return '📦';
                  };

                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
                        isCatActive 
                          ? 'bg-amber-500/15 text-amber-950 font-black border border-amber-300' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{getCategoryIcon(cat)}</span>
                        <span>{cat}</span>
                      </span>
                      {isCatActive && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}
              </div>

              {/* 4. Quick Customer Shopping Tools */}
              <div className="border-t border-slate-100 pt-3 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                  Shopping & Tools
                </p>

                {/* Wishlist */}
                <button
                  onClick={() => {
                    setIsWishlistOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Saved Wishlist</span>
                  </div>
                  {wishlist.length > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                {/* Cart */}
                <button
                  onClick={() => {
                    navigateTo('cart');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>View Cart</span>
                  </div>
                  {totalCartCount > 0 && (
                    <span className="px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-black rounded-full">
                      {totalCartCount}
                    </span>
                  )}
                </button>

                {/* Track Shipment */}
                <button
                  onClick={() => {
                    handleTrackOrderClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-colors ${
                    activePage === 'order-tracking' ? 'bg-amber-50 text-amber-900 font-black' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>Track Any Shipment</span>
                </button>
              </div>

              {/* 5. Customer Service & Policies */}
              <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                  Support & Policies
                </p>

                <button
                  onClick={() => {
                    navigateTo('shipping-policy');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Shipping & Delivery Policy</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('returns-policy');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>30-Day Returns & Refunds</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('faq');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Frequently Asked Questions</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Concierge Support</span>
                </button>
              </div>

              {/* 7. Sign Out (If signed in) */}
              {isCustomerAuthenticated && (
                <div className="pt-2 pb-8 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logoutCustomer();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-98 shadow-2xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out from Account</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
    </header>
  );
};
