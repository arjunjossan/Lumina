import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';

export const FloatingCompareBar: React.FC = () => {
  const { 
    compareList, 
    products, 
    removeFromCompare, 
    clearCompare, 
    setIsCompareModalOpen, 
    isCompareModalOpen, 
    activePage 
  } = useStore();

  // Do not render if no items, if modal is already open, or in admin mode
  if (compareList.length === 0 || isCompareModalOpen || activePage === 'admin') {
    return null;
  }

  const comparedProducts = compareList
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  const maxSlots = 4;
  const emptySlotsCount = Math.max(0, maxSlots - comparedProducts.length);

  return (
    <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl animate-fadeIn">
      <div className="bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 shadow-2xl rounded-full px-5 py-3 flex flex-row items-center justify-between gap-3">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-3 justify-start">
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Scale className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Compare</span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {comparedProducts.length}/{maxSlots}
                </span>
              </p>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {comparedProducts.length === 1 ? 'Select 1 more to compare' : 'Ready to compare specs'}
              </p>
            </div>
          </div>

          {/* Product Thumbnails */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {comparedProducts.map((prod) => (
              <div 
                key={prod!.id} 
                className="relative group shrink-0"
                title={prod!.title}
              >
                <img
                  src={prod!.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                  alt={prod!.title}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border-2 border-slate-700 group-hover:border-amber-400 transition-colors bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => removeFromCompare(prod!.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"
                  title="Remove"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            {/* Empty Slot Placeholders */}
            {[...Array(emptySlotsCount)].map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-dashed border-slate-700/80 flex items-center justify-center text-slate-600 text-[10px] shrink-0"
                title="Empty slot (click compare icon on another product)"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={clearCompare}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-colors text-xs font-semibold"
            title="Clear comparison"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
