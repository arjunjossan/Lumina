import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, products, mobileProducts, isWishlistOpen, setIsWishlistOpen, toggleWishlist, addToCart, setIsCartOpen, navigateTo } = useStore();

  if (!isWishlistOpen) return null;

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const activeList = isMobile && mobileProducts && mobileProducts.length > 0 ? mobileProducts : products;
  const wishlistedProducts = activeList.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      <div 
        onClick={() => setIsWishlistOpen(false)} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 flex justify-end">
        <div className="w-[75vw] sm:w-[420px] max-w-[85vw] sm:max-w-md bg-white shadow-2xl flex flex-col h-full h-[100dvh] max-h-screen overflow-hidden border-l border-slate-200">
          
          <div className="px-3.5 py-3 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 shrink-0" />
              <h3 className="text-xs sm:text-base font-bold font-serif truncate">Saved Wishlist ({wishlistedProducts.length})</h3>
            </div>
            <button 
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center shrink-0"
              aria-label="Close Wishlist"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-3">
            {wishlistedProducts.length > 0 ? (
              wishlistedProducts.map((p) => (
                <div key={p.id} className="flex gap-2.5 sm:gap-4 p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 relative">
                  <img src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} alt="" className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg sm:rounded-xl border border-slate-200 shrink-0" />
                  <div className="flex-1 min-w-0 pr-5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                    <p className="text-xs font-black text-amber-600 mt-0.5">₹{p.price.toFixed(2)}</p>

                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        toggleWishlist(p.id);
                      }}
                      className="mt-1.5 bg-slate-900 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Cart</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Your wishlist is empty</p>
                <p className="text-xs text-slate-400">Save your favorite winning products for later!</p>
              </div>
            )}
          </div>

          {/* Action Button at bottom */}
          {wishlistedProducts.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
              <button
                onClick={() => {
                  wishlistedProducts.forEach(p => addToCart(p, 1));
                  setIsWishlistOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Move All to Cart</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
