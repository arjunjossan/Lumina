import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const ProductDetailsSkeleton: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white pb-20 animate-pulse select-none">
      {/* Top Breadcrumb Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-16 h-3.5 bg-slate-200 rounded-md" />
            <span>/</span>
            <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Image Gallery Skeleton */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image Skeleton */}
            <div className="relative aspect-square bg-slate-200 rounded-3xl overflow-hidden border border-slate-200/80 shimmer-effect">
              {/* Badge placeholder */}
              <div className="absolute top-4 left-4 w-28 h-6 bg-slate-300/80 rounded-xl" />
              {/* Top right buttons placeholder */}
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-300/80" />
                <div className="w-10 h-10 rounded-full bg-slate-300/80" />
              </div>
            </div>

            {/* Thumbnail Navigation Skeletons */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-2xl bg-slate-200 shimmer-effect border-2 border-slate-200 shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Product Info Skeleton */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Badge & SKU */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-24 h-5 bg-amber-100 rounded-md" />
                <div className="w-16 h-3 bg-slate-200 rounded-md" />
              </div>

              {/* Title */}
              <div className="space-y-2 mb-3">
                <div className="w-full h-8 bg-slate-200 rounded-lg" />
                <div className="w-3/4 h-8 bg-slate-200 rounded-lg" />
              </div>

              {/* Subtitle */}
              <div className="w-2/3 h-4 bg-slate-100 rounded-md mb-4" />

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-slate-200 rounded-xs" />
                  ))}
                </div>
                <div className="w-12 h-3.5 bg-slate-200 rounded-md" />
                <div className="w-16 h-3.5 bg-slate-100 rounded-md" />
              </div>
            </div>

            {/* Price Box Skeleton */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline gap-3">
                <div className="w-24 h-8 bg-slate-200 rounded-lg" />
                <div className="w-16 h-5 bg-slate-200/70 rounded-md" />
                <div className="w-16 h-5 bg-rose-100 rounded-md ml-auto" />
              </div>
              <div className="w-full h-3 bg-emerald-100 rounded-md" />
            </div>

            {/* Quantity & CTA Skeleton */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-32 h-12 bg-slate-100 rounded-xl border border-slate-200" />
                <div className="flex-1 h-12 bg-slate-200 rounded-xl shimmer-effect" />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="w-6 h-6 bg-slate-200 rounded-md" />
                  <div className="w-16 h-3 bg-slate-200 rounded-xs" />
                  <div className="w-12 h-2.5 bg-slate-100 rounded-xs" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
