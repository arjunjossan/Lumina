import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, Heart, Eye, ShoppingBag, Sparkles, Check, Image as ImageIcon, Scale } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo, addToCart, wishlist, toggleWishlist, setQuickViewProduct, cart, compareList, toggleCompare } = useStore();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.some(item => item.product.id === product.id);
  const isInCompare = compareList.includes(product.id);

  const discountPercent = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      {/* Product Image & Badges Container */}
      <div 
        className="relative aspect-[4/3] sm:aspect-square bg-slate-100 overflow-hidden cursor-pointer select-none" 
        onClick={() => navigateTo('product-detail', product.id)}
      >
        {/* Shimmer / Skeleton Loader while image downloads */}
        {!imageLoaded && (
          <div className="absolute inset-0 z-0 bg-slate-200/90 shimmer-effect flex items-center justify-center">
            <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300 opacity-40 animate-pulse" />
          </div>
        )}

        <img
          src={imageError ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' : primaryImage}
          alt={product.title}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 items-start z-10">
          {product.isWinningProduct && (
            <span className="bg-slate-900 text-amber-400 text-[8px] sm:text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-md flex items-center gap-1 border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span>Winning</span>
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Comparing Active Badge (Desktop Only) */}
        {isInCompare && (
          <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-md z-10 items-center gap-1 border border-amber-600">
            <Scale className="w-2.5 h-2.5" />
            <span>Comparing</span>
          </div>
        )}

        {/* Top Right Actions: Wishlist & Compare Buttons */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isWishlisted 
                ? 'bg-rose-500 text-white scale-110' 
                : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist toggle"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          {/* Compare Button (Desktop Only) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.id);
            }}
            className={`hidden md:flex p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isInCompare 
                ? 'bg-amber-500 text-slate-950 scale-110 shadow-amber-500/30' 
                : 'bg-white/85 text-slate-600 hover:text-amber-600 hover:bg-white'
            }`}
            title={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
            aria-label="Compare toggle"
          >
            <Scale className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isInCompare ? 'fill-slate-950' : ''}`} />
          </button>
        </div>

        {/* Quick View Button Overlay - hidden on touch devices or smaller screens for better mobile experience */}
        <div className="absolute inset-x-0 bottom-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex justify-center z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold py-2.5 rounded-xl shadow-lg hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick Inspection</span>
          </button>
        </div>

        {/* Low Stock Ticker if <= 10 */}
        {product.stock <= 10 && product.stock > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-amber-500/95 text-slate-950 text-[8px] sm:text-[10px] font-extrabold text-center py-0.5 uppercase tracking-wider">
            🔥 Hurry! Only {product.stock} left
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Badge */}
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-slate-400 mb-1">
            <span className="truncate max-w-[70px] sm:max-w-none">{product.category}</span>
            {product.badge && (
              <span className="text-amber-600 font-bold text-[8px] sm:text-[10px] truncate max-w-[70px] sm:max-w-none">{product.badge}</span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => navigateTo('product-detail', product.id)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-amber-600 cursor-pointer transition-colors leading-snug mb-1 min-h-[2rem] sm:min-h-[2.5rem]"
          >
            {product.title}
          </h3>

          {/* Subtitle */}
          {product.subtitle && (
            <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mb-1.5 font-normal">
              {product.subtitle}
            </p>
          )}

          {/* Star Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                    i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-700">{product.rating}</span>
            <span className="text-[9px] sm:text-[11px] text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2 mt-auto">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-slate-900">₹{product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{product.compareAtPrice.toFixed(2)}</span>
              )}
            </div>
            <p className="text-[8px] sm:text-[10px] font-medium text-emerald-600">Free Shipping</p>
          </div>

          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold shrink-0 cursor-pointer active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-500/30 scale-105 ring-2 ring-emerald-300'
                : isInCart
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950'
            }`}
            aria-label={`Add ${product.title} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] text-emerald-200" />
                <span>Added!</span>
              </>
            ) : isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
