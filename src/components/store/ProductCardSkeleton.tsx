import React from 'react';

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full overflow-hidden animate-pulse select-none">
      {/* Product Image Skeleton with Shimmer */}
      <div className="relative aspect-[4/3] sm:aspect-square bg-slate-200/90 shimmer-effect overflow-hidden">
        {/* Top Badges Placeholders */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
          <div className="w-14 sm:w-16 h-4 sm:h-5 bg-slate-300/80 rounded-md" />
        </div>

        {/* Wishlist Button Placeholder */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300/80" />
      </div>

      {/* Content Container Skeleton */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category & Badge Line */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-16 sm:w-20 h-3 bg-slate-200 rounded-md" />
            <div className="w-12 sm:w-14 h-3 bg-slate-200/70 rounded-md" />
          </div>

          {/* Title Lines */}
          <div className="space-y-1.5 mb-2">
            <div className="w-full h-3.5 sm:h-4 bg-slate-200 rounded-md" />
            <div className="w-4/5 h-3.5 sm:h-4 bg-slate-200 rounded-md" />
          </div>

          {/* Subtitle Line */}
          <div className="w-3/5 h-2.5 sm:h-3 bg-slate-100 rounded-md mb-2.5" />

          {/* Star Rating Line */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-slate-200 rounded-xs" />
              ))}
            </div>
            <div className="w-8 h-2.5 bg-slate-200 rounded-md ml-1" />
          </div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div className="space-y-1">
            <div className="w-16 sm:w-20 h-4 sm:h-5 bg-slate-200 rounded-md" />
            <div className="w-12 h-2.5 bg-emerald-100 rounded-xs" />
          </div>

          {/* Add Button */}
          <div className="w-8 sm:w-16 h-7 sm:h-9 bg-slate-200 rounded-lg sm:rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
      {[...Array(count)].map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};
