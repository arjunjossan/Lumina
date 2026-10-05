import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { 
  Scale, 
  X, 
  Trash2, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Banknote, 
  Package, 
  Layers, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const ProductCompareModal: React.FC = () => {
  const { 
    products, 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    toggleCompare, 
    isCompareModalOpen, 
    setIsCompareModalOpen, 
    addToCart, 
    cart, 
    navigateTo 
  } = useStore();

  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [quickAddSearch, setQuickAddSearch] = useState<string>('');

  // Products currently in comparison
  const comparedProducts = useMemo(() => {
    return compareList
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [compareList, products]);

  // Available products to add (not currently in compare)
  const availableToAdd = useMemo(() => {
    return products.filter(
      p => p.status === 'Active' && !compareList.includes(p.id) &&
      (!quickAddSearch.trim() || p.title.toLowerCase().includes(quickAddSearch.toLowerCase()) || p.category.toLowerCase().includes(quickAddSearch.toLowerCase()))
    );
  }, [products, compareList, quickAddSearch]);

  // Lowest price among compared products
  const lowestPrice = useMemo(() => {
    if (comparedProducts.length === 0) return 0;
    return Math.min(...comparedProducts.map(p => p.price));
  }, [comparedProducts]);

  // Aggregate all unique specification keys across compared products
  const allSpecKeys = useMemo(() => {
    const keysMap = new Map<string, string>(); // normalized lowercase -> display name
    comparedProducts.forEach(product => {
      if (Array.isArray(product.specifications)) {
        product.specifications.forEach(spec => {
          if (spec.name && spec.name.trim()) {
            const normalized = spec.name.trim().toLowerCase();
            if (!keysMap.has(normalized)) {
              keysMap.set(normalized, spec.name.trim());
            }
          }
        });
      }
    });
    return Array.from(keysMap.entries()).map(([_, displayName]) => displayName);
  }, [comparedProducts]);

  if (!isCompareModalOpen) return null;

  // Helper to check if values in a row differ
  const checkValuesDiffer = (values: (string | number | boolean | undefined)[]) => {
    if (values.length <= 1) return false;
    const normalized = values.map(v => String(v ?? '').trim().toLowerCase());
    return new Set(normalized).size > 1;
  };

  // Pre-calculate whether prices, ratings, stocks, etc differ
  const pricesDiffer = checkValuesDiffer(comparedProducts.map(p => p.price));
  const ratingsDiffer = checkValuesDiffer(comparedProducts.map(p => p.rating));
  const categoriesDiffer = checkValuesDiffer(comparedProducts.map(p => p.category));
  const stocksDiffer = checkValuesDiffer(comparedProducts.map(p => p.stock));
  const codDiffer = checkValuesDiffer(comparedProducts.map(p => p.codAllowed ?? true));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsCompareModalOpen(false)}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-serif">
                  Product Comparison
                </h2>
                <span className="bg-amber-500/20 text-amber-700 border border-amber-500/30 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {comparedProducts.length} of 4 Selected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side analysis of pricing, features, customer satisfaction, and technical specifications.
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Highlight Differences Switch */}
            {comparedProducts.length > 1 && (
              <button
                type="button"
                onClick={() => setHighlightDifferences(!highlightDifferences)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  highlightDifferences
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Highlight rows where product attributes differ"
              >
                <Sparkles className={`w-3.5 h-3.5 ${highlightDifferences ? 'fill-slate-950' : 'text-amber-500'}`} />
                <span>Highlight Differences</span>
                <span className={`w-2 h-2 rounded-full ${highlightDifferences ? 'bg-slate-950 animate-pulse' : 'bg-slate-300'}`} />
              </button>
            )}

            {/* Clear All */}
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                title="Clear all selected products"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 custom-scrollbar space-y-6">
          {/* EMPTY STATE */}
          {comparedProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mx-auto shadow-inner">
                <Scale className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">No Products Selected</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You haven't added any products to the comparison yet. Click the balance scale icon on any product in the store to compare features, specs, and prices side-by-side.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCompareModalOpen(false);
                  navigateTo('catalog');
                }}
                className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Products Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="min-w-[640px]">
              {/* NOTICE IF ONLY 1 PRODUCT SELECTED */}
              {comparedProducts.length === 1 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-xs text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Pro tip:</strong> Add at least <strong>1 more product</strong> to see side-by-side contrast and highlighted differences!
                    </span>
                  </div>
                  {comparedProducts.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(!quickAddOpen)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{quickAddOpen ? 'Close Quick Add' : 'Quick Add Product'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* QUICK ADD ACCORDION BAR (IF OPEN) */}
              {quickAddOpen && comparedProducts.length < 4 && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-lg animate-fadeIn">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-100">Add Another Product to Comparison</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Dismiss
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search active products to add..."
                    value={quickAddSearch}
                    onChange={(e) => setQuickAddSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar pt-1">
                    {availableToAdd.slice(0, 9).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          toggleCompare(prod.id);
                          if (comparedProducts.length + 1 >= 4) {
                            setQuickAddOpen(false);
                          }
                        }}
                        className="p-2 bg-slate-950/80 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all group"
                      >
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
                            {prod.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ₹{prod.price.toFixed(2)} • {prod.category}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-amber-400 shrink-0" />
                      </div>
                    ))}
                    {availableToAdd.length === 0 && (
                      <p className="text-xs text-slate-400 col-span-full py-2 text-center">
                        No other matching products available to add.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* COMPARISON GRID / TABLE */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {/* 1. PRODUCT CARDS TOP ROW */}
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 bg-slate-50/50 border-b border-slate-200">
                  <div className="p-4 flex flex-col justify-between bg-slate-100/60">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Product Overview
                    </span>
                    {comparedProducts.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setQuickAddOpen(!quickAddOpen)}
                        className="mt-4 bg-white hover:bg-amber-50 border border-dashed border-slate-300 hover:border-amber-400 text-slate-700 hover:text-amber-700 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                      </button>
                    )}
                  </div>

                  {comparedProducts.map((prod) => {
                    const isInCart = cart.some(item => item.product.id === prod.id);
                    const discount = prod.compareAtPrice && prod.compareAtPrice > prod.price
                      ? Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)
                      : 0;

                    return (
                      <div key={prod.id} className="p-4 flex flex-col justify-between relative bg-white group">
                        {/* Remove from compare button */}
                        <button
                          type="button"
                          onClick={() => removeFromCompare(prod.id)}
                          className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer z-10"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-3">
                          {/* Image */}
                          <div 
                            className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 cursor-pointer shadow-xs border border-slate-100"
                            onClick={() => {
                              setIsCompareModalOpen(false);
                              navigateTo('product-detail', prod.id);
                            }}
                          >
                            <img
                              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {discount > 0 && (
                              <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                -{discount}% OFF
                              </span>
                            )}
                          </div>

                          {/* Category & Badge */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                              {prod.category}
                            </span>
                            {prod.isWinningProduct && (
                              <span className="bg-amber-500/15 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Winning</span>
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 
                            onClick={() => {
                              setIsCompareModalOpen(false);
                              navigateTo('product-detail', prod.id);
                            }}
                            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 cursor-pointer line-clamp-2 transition-colors leading-snug min-h-[2.5rem]"
                            title={prod.title}
                          >
                            {prod.title}
                          </h4>
                        </div>

                        {/* Top Add to Cart CTA */}
                        <div className="pt-3 mt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => addToCart(prod, 1)}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              isInCart
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950'
                            }`}
                          >
                            {isInCart ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Cart</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. SECTION: PRICING & SAVINGS */}
                <div className="bg-slate-100/40 px-4 py-2 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Price & Value Analysis</span>
                  </span>
                  {highlightDifferences && pricesDiffer && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full lowercase">
                      prices differ
                    </span>
                  )}
                </div>

                {/* Current Price Row */}
                <div className={`grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 ${
                  highlightDifferences && pricesDiffer ? 'bg-amber-50/50' : 'bg-white'
                }`}>
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Current Sale Price
                  </div>
                  {comparedProducts.map((prod) => {
                    const isLowest = prod.price === lowestPrice && comparedProducts.length > 1;
                    return (
                      <div key={prod.id} className="p-3 flex items-center justify-between gap-2">
                        <span className="text-base font-black text-slate-900">
                          ₹{prod.price.toFixed(2)}
                        </span>
                        {isLowest && (
                          <span className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Lowest Price</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Original / Compare At Price */}
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Original Price (MSRP)
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 text-xs text-slate-500 flex items-center">
                      {prod.compareAtPrice ? (
                        <span className="line-through">₹{prod.compareAtPrice.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Savings / Discount */}
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Total Savings
                  </div>
                  {comparedProducts.map((prod) => {
                    const savingsAmount = prod.compareAtPrice && prod.compareAtPrice > prod.price
                      ? prod.compareAtPrice - prod.price
                      : 0;
                    const discountPercent = prod.compareAtPrice && prod.compareAtPrice > prod.price
                      ? Math.round((savingsAmount / prod.compareAtPrice) * 100)
                      : 0;

                    return (
                      <div key={prod.id} className="p-3 text-xs flex items-center">
                        {savingsAmount > 0 ? (
                          <span className="text-emerald-600 font-bold">
                            Save ₹{savingsAmount.toFixed(2)} ({discountPercent}%)
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard Price</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3. SECTION: CUSTOMER RATINGS & REPUTATION */}
                <div className="bg-slate-100/40 px-4 py-2 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Customer Ratings & Social Proof</span>
                  </span>
                  {highlightDifferences && ratingsDiffer && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full lowercase">
                      ratings differ
                    </span>
                  )}
                </div>

                {/* Star Rating Row */}
                <div className={`grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 ${
                  highlightDifferences && ratingsDiffer ? 'bg-amber-50/50' : 'bg-white'
                }`}>
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Customer Rating
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(prod.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-900">{prod.rating.toFixed(1)} / 5</span>
                    </div>
                  ))}
                </div>

                {/* Review Count Row */}
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Verified Reviews
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 text-xs text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-semibold">{prod.reviewCount} customer reviews</span>
                    </div>
                  ))}
                </div>

                {/* 4. SECTION: STOCK & FULFILLMENT */}
                <div className="bg-slate-100/40 px-4 py-2 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-sky-600" />
                    <span>Inventory, Delivery & Policies</span>
                  </span>
                  {highlightDifferences && (stocksDiffer || codDiffer) && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full lowercase">
                      fulfillment differs
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className={`grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 ${
                  highlightDifferences && stocksDiffer ? 'bg-amber-50/50' : 'bg-white'
                }`}>
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Availability
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 text-xs flex items-center">
                      {prod.stock > 10 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>In Stock ({prod.stock} units)</span>
                        </span>
                      ) : prod.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>Low Stock (Only {prod.stock} left)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Sold Out</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cash on Delivery (COD) */}
                <div className={`grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 ${
                  highlightDifferences && codDiffer ? 'bg-amber-50/50' : 'bg-white'
                }`}>
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Cash on Delivery
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 text-xs flex items-center">
                      {prod.codAllowed !== false ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Available on Delivery</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Prepaid Only</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Shipping Speed */}
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Shipping Policy
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 text-xs text-slate-700 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Free Express Shipping (2-4 Days)</span>
                    </div>
                  ))}
                </div>

                {/* Warranty */}
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-center">
                    Guarantee & Returns
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-3 text-xs text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>30-Day Money Back Guarantee</span>
                    </div>
                  ))}
                </div>

                {/* 5. SECTION: FEATURES BREAKDOWN */}
                <div className="bg-slate-100/40 px-4 py-2 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Key Features Breakdown</span>
                  </span>
                </div>

                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-start pt-4">
                    Core Capabilities
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-4 space-y-2">
                      {prod.features && prod.features.length > 0 ? (
                        <ul className="space-y-1.5">
                          {prod.features.map((feat, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No features listed.</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* 6. SECTION: TECHNICAL SPECIFICATIONS MATRIX */}
                {allSpecKeys.length > 0 && (
                  <>
                    <div className="bg-slate-100/40 px-4 py-2 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span>Technical Specifications Matrix</span>
                      </span>
                      <span className="text-[10px] text-slate-400 normal-case font-medium">
                        {allSpecKeys.length} spec attributes compared
                      </span>
                    </div>

                    {allSpecKeys.map((specKey) => {
                      const values = comparedProducts.map(prod => {
                        const found = prod.specifications?.find(
                          s => s.name.trim().toLowerCase() === specKey.toLowerCase()
                        );
                        return found ? found.value : '—';
                      });
                      const doesDiffer = checkValuesDiffer(values);

                      return (
                        <div 
                          key={specKey}
                          className={`grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 transition-colors ${
                            highlightDifferences && doesDiffer ? 'bg-amber-50/60' : 'bg-white'
                          }`}
                        >
                          <div className="p-3 text-xs font-bold text-slate-700 flex items-center justify-between gap-1">
                            <span className="truncate" title={specKey}>{specKey}</span>
                            {highlightDifferences && doesDiffer && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Values differ" />
                            )}
                          </div>
                          {comparedProducts.map((prod) => {
                            const spec = prod.specifications?.find(
                              s => s.name.trim().toLowerCase() === specKey.toLowerCase()
                            );
                            return (
                              <div key={prod.id} className="p-3 text-xs text-slate-700 flex items-center">
                                {spec ? (
                                  <span className="font-medium text-slate-800">{spec.value}</span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 7. SECTION: SUMMARY DESCRIPTION */}
                <div className="bg-slate-100/40 px-4 py-2 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700">
                  Short Description
                </div>
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  <div className="p-3 text-xs font-bold text-slate-700 flex items-start pt-4">
                    Overview
                  </div>
                  {comparedProducts.map((prod) => (
                    <div key={prod.id} className="p-4 text-xs text-slate-600 leading-relaxed">
                      {prod.shortDescription || prod.description.slice(0, 150) + '...'}
                    </div>
                  ))}
                </div>

                {/* 8. BOTTOM ACTIONS ROW */}
                <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] divide-x divide-slate-200 bg-slate-50">
                  <div className="p-4 flex items-center text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Decision Actions
                  </div>
                  {comparedProducts.map((prod) => {
                    const isInCart = cart.some(item => item.product.id === prod.id);
                    return (
                      <div key={prod.id} className="p-4 space-y-2">
                        <button
                          type="button"
                          onClick={() => addToCart(prod, 1)}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                            isInCart
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950'
                          }`}
                        >
                          {isInCart ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Added to Cart</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>Add to Cart (₹{prod.price.toFixed(2)})</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            navigateTo('product-detail', prod.id);
                          }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Full Product Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>
              Tip: You can compare up to <strong>4 products</strong> simultaneously.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCompareModalOpen(false)}
            className="bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-4 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
