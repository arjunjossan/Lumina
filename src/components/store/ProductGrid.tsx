import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import { Category } from '../../types';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Filter, Search, Scale, Package } from 'lucide-react';

const CATEGORIES: Category[] = ['All', 'Tech & Audio', 'Home Innovation', 'Personal Care', 'Smart Gadgets', 'Lifestyle'];

export const ProductGrid: React.FC = () => {
  const { products, mobileProducts, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm, supabaseStatus, compareList, setIsCompareModalOpen } = useStore();

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [onlyWinning, setOnlyWinning] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(97);
  const prevCategoryRef = useRef(selectedCategory);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure dynamic sticky header height to position sticky sub-navigation exactly below navbar
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    const headerEl = document.querySelector('header');
    if (headerEl && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateHeaderHeight);
      observer.observe(headerEl);
      return () => {
        window.removeEventListener('resize', updateHeaderHeight);
        observer.disconnect();
      };
    }
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // Trigger brief shimmer/skeleton transition on category change for perceived performance
  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategory) {
      prevCategoryRef.current = selectedCategory;
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory]);

  const activeCatalog = useMemo(() => {
    if (isMobile) {
      return mobileProducts || [];
    }
    return products || [];
  }, [isMobile, mobileProducts, products]);

  const filteredProducts = useMemo(() => {
    return activeCatalog.filter((p) => {
      // Must be Active
      if (p.status !== 'Active') return false;

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      // Winning filter
      if (onlyWinning && !p.isWinningProduct) return false;

      // Search term filter
      if (
        searchTerm.trim() &&
        !p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.category.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Max Price filter
      if (p.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // default 'featured': winning products first
      return (b.isWinningProduct ? 1 : 0) - (a.isWinningProduct ? 1 : 0);
    });
  }, [products, selectedCategory, onlyWinning, searchTerm, maxPrice, sortBy]);

  return (
    <section className="pt-3 pb-8 md:py-12 bg-slate-50 min-h-screen w-full">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-6 mb-3 md:mb-8">
          <div className="space-y-0.5 md:space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] md:text-xs uppercase tracking-wider mb-1 md:mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Catalogue</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-serif tracking-tight leading-tight">
              {selectedCategory === 'All' ? 'Explore Winning Gadgets & Innovations' : selectedCategory}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-0.5 md:mt-1">
              Handpicked viral products tested for functionality, design excellence, and customer delight.
            </p>
          </div>

          {/* Header Action Buttons: Winning Filter & Compare */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {compareList.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer animate-pulse"
                title="View Product Comparison"
              >
                <Scale className="w-4 h-4 fill-slate-950" />
                <span>Compare ({compareList.length}/4)</span>
              </button>
            )}

            {/* Quick Winning Filter Toggle */}
            <button
              id="btn-winning-products-filter"
              onClick={() => setOnlyWinning(!onlyWinning)}
              className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                onlyWinning
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-400'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${onlyWinning ? 'fill-slate-950' : 'text-amber-500'}`} />
              <span>{onlyWinning ? 'Showing Winning Products Only' : 'Filter Winning Products'}</span>
            </button>
          </div>
        </div>

        {/* Horizontally scrollable Category Chips - Sticky below navigation on mobile on scroll */}
        <div 
          style={{ top: `${headerHeight}px` }}
          className="md:hidden sticky z-30 bg-slate-50/95 backdrop-blur-md py-2 -mx-2 px-2 border-y border-slate-200/80 shadow-2xs mb-3 transition-[top] duration-150"
        >
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs transition-all font-semibold shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyWinning(!onlyWinning)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all font-semibold shrink-0 flex items-center gap-1 cursor-pointer ${
                onlyWinning
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Winning</span>
            </button>
          </div>
        </div>

        {/* Simple Search & Sort Controls (Scrolls behind the sticky category bar on mobile) */}
        <div className="md:hidden grid grid-cols-2 gap-2 mb-4 relative z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-7 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low</option>
              <option value="price-desc">Price: High</option>
              <option value="newest">Newest</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Desktop Filters & Sorting Bar (Completely Preserved for Desktop) */}
        <div className="hidden md:flex bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-700">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Filter catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Price Slider */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-slate-500 whitespace-nowrap">Max Price: <strong>₹{maxPrice.toLocaleString('en-IN')}</strong></span>
            <input
              type="range"
              min="500"
              max="25000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-900 font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="featured">Featured / Winning First</option>
              <option value="rating">Highest Customer Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrival</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid with Shimmer / Skeleton Loaders */}
        {isTransitioning || (supabaseStatus.isSyncing && activeCatalog.length === 0 && !supabaseStatus.allTablesOk) ? (
          <ProductGridSkeleton count={12} />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : activeCatalog.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Products Listed Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              {isMobile ? 'There are currently no products listed in the mobile catalog.' : 'There are currently no products listed on the store.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Products Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              We couldn't find any products matching your current filters or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setOnlyWinning(false);
                setSearchTerm('');
                setMaxPrice(200);
              }}
              className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
