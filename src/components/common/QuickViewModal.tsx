import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShimmerImage } from './ShimmerImage';
import { X, Star, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, navigateTo } = useStore();

  if (!quickViewProduct) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 overflow-hidden space-y-6">
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
            <ShimmerImage
              src={quickViewProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
              alt={quickViewProduct.title}
              containerClassName="w-full h-full"
            />
          </div>

          <div className="space-y-4">
            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border border-amber-200">
              {quickViewProduct.category}
            </span>

            <h3 className="text-xl font-bold text-slate-900 font-serif leading-snug">{quickViewProduct.title}</h3>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.rating) ? 'fill-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{quickViewProduct.rating}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">₹{quickViewProduct.price.toFixed(2)}</span>
              {quickViewProduct.compareAtPrice && (
                <span className="text-sm text-slate-400 line-through">₹{quickViewProduct.compareAtPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{quickViewProduct.shortDescription}</p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  addToCart(quickViewProduct, 1);
                  setQuickViewProduct(null);
                }}
                className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  const pid = quickViewProduct.id;
                  setQuickViewProduct(null);
                  navigateTo('product-detail', pid);
                }}
                className="w-full bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                <span>Full Product Page & Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
