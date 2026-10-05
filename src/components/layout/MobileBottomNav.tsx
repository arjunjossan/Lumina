import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Home, 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  User, 
  Package
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { 
    activePage, 
    navigateTo, 
    cart, 
    wishlist, 
    setIsCartOpen, 
    setIsWishlistOpen, 
    isCustomerAuthenticated,
    customerUser,
    customerPortalTab,
    setIsCustomerAuthModalOpen,
    navigateToLogin,
    setCustomerPortalTab
  } = useStore();

  // If in admin mode, do not show customer bottom nav
  if (activePage === 'admin') {
    return null;
  }

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAccountClick = () => {
    if (isCustomerAuthenticated && customerUser) {
      setCustomerPortalTab('orders');
      navigateTo('my-orders');
    } else {
      navigateToLogin('my-orders', 'account');
    }
  };

  const isAccountActive = activePage === 'my-orders' || activePage === 'login';

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] md:hidden transition-transform duration-300 select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
        
        {/* 1. HOME TAB */}
        <button
          type="button"
          onClick={() => {
            navigateTo('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 px-1 transition-all rounded-xl relative ${
            activePage === 'home' 
              ? 'text-amber-600 font-extrabold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Go to Home"
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activePage === 'home' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {activePage === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold tracking-tight">Home</span>
        </button>

        {/* 2. SHOP / CATALOG TAB */}
        <button
          type="button"
          onClick={() => {
            navigateTo('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 px-1 transition-all rounded-xl relative ${
            activePage === 'catalog' 
              ? 'text-amber-600 font-extrabold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Browse Catalog"
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 transition-transform ${activePage === 'catalog' ? 'scale-110 fill-amber-500 text-amber-500' : ''}`} />
            {activePage === 'catalog' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold tracking-tight">Shop</span>
        </button>

        {/* 3. WISHLIST TAB */}
        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center justify-center h-full min-h-[44px] py-1 px-1 text-slate-500 hover:text-slate-900 transition-all rounded-xl relative"
          aria-label="View Saved Wishlist"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 transition-transform ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500/20 stroke-[2.2]' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold tracking-tight">Wishlist</span>
        </button>

        {/* 4. ORDERS / ACCOUNT TAB */}
        <button
          type="button"
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 px-1 transition-all rounded-xl relative ${
            isAccountActive 
              ? 'text-amber-600 font-extrabold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Customer Orders and Account"
        >
          <div className="relative">
            {isCustomerAuthenticated ? (
              <Package className={`w-5 h-5 transition-transform ${isAccountActive ? 'scale-110 stroke-[2.5]' : ''}`} />
            ) : (
              <User className="w-5 h-5" />
            )}
            {isAccountActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold tracking-tight">
            {isCustomerAuthenticated ? 'Orders' : 'Account'}
          </span>
        </button>

        {/* 5. CART TAB */}
        <button
          type="button"
          onClick={() => {
            navigateTo('cart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 px-1 transition-all rounded-xl relative group ${
            activePage === 'cart' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Open Shopping Cart"
        >
          <div className="relative">
            <div className={`p-1.5 rounded-xl transition-all ${
              activePage === 'cart'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : totalCartCount > 0 
                  ? 'bg-amber-100 text-amber-900 shadow-xs' 
                  : 'text-slate-600 group-hover:text-slate-950'
            }`}>
              <ShoppingBag className={`w-4 h-4 stroke-[2.5] ${activePage === 'cart' ? 'scale-105' : ''}`} />
            </div>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-slate-950 text-amber-400 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                {totalCartCount}
              </span>
            )}
            {activePage === 'cart' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-0.5 font-bold tracking-tight ${
            activePage === 'cart' ? 'text-amber-600 font-black' : totalCartCount > 0 ? 'text-amber-700' : 'text-slate-600'
          }`}>
            Cart
          </span>
        </button>

      </div>
    </nav>
  );
};
