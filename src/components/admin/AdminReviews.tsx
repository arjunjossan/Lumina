import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductReview } from '../../types';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { 
  Star, 
  Trash2, 
  Plus, 
  Sparkles, 
  MessageSquare, 
  Check, 
  Search, 
  Calendar, 
  User, 
  Image, 
  Filter, 
  Upload,
  X,
  Film,
  Video
} from 'lucide-react';
import { AdminSuccessStories } from './AdminSuccessStories';
import { uploadProductMediaFile } from '../../lib/productMediaStorage';

export const AdminReviews: React.FC = () => {
  const { 
    products, 
    reviewsMap, 
    successStories,
    addReview, 
    deleteReview, 
    seedSampleReviewsForProduct,
    showNotification
  } = useStore();

  const [activeReviewTab, setActiveReviewTab] = useState<'reviews' | 'success_stories'>('reviews');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State for Manual Seeding
  const [selectedProductForSeed, setSelectedProductForSeed] = useState<string>(products[0]?.id || '');
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isVerified, setIsVerified] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const reviewFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [reviewSaveState, setReviewSaveState] = useState<SaveButtonState>('idle');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProductId, setFilterProductId] = useState<string>('all');

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) setImagePreview(base64);
    };
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);
    try {
      showNotification('Uploading review photo to products > reviews > product image bucket...');
      const res = await uploadProductMediaFile(file, file.name, 'reviews/product_image');
      if (res.url) {
        setImageUrl(res.url);
        setImagePreview(res.url);
        showNotification('✅ Review photo stored in products/reviews/product_image!');
      }
    } catch (err) {
      console.warn('Review photo upload notice:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) setAvatarPreview(base64);
    };
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      showNotification('Uploading reviewer avatar to products > reviews > Avatar bucket...');
      const res = await uploadProductMediaFile(file, file.name, 'reviews/Avatar');
      if (res.url) {
        setAvatarUrl(res.url);
        setAvatarPreview(res.url);
        showNotification('✅ Reviewer avatar stored in products/reviews/Avatar!');
      }
    } catch (err) {
      console.warn('Avatar upload notice:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleManualReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForSeed || !authorName.trim() || !reviewTitle.trim() || !reviewComment.trim()) {
      return;
    }

    setReviewSaveState('saving');
    const formattedDate = reviewDate ? new Date(reviewDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : undefined;
    const finalImageUrl = imageUrl.trim() || imagePreview || undefined;
    const finalAvatarUrl = avatarUrl.trim() || avatarPreview || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80`;

    addReview(selectedProductForSeed, {
      author: authorName.trim(),
      rating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      verified: isVerified,
      avatarUrl: finalAvatarUrl,
      imageUrl: finalImageUrl,
      date: formattedDate
    });

    setReviewSaveState('saved');

    // Reset Form
    setTimeout(() => {
      setAuthorName('');
      setReviewTitle('');
      setReviewComment('');
      setAvatarUrl('');
      setImageUrl('');
      setImagePreview(null);
      setAvatarPreview(null);
      setReviewSaveState('idle');
      setIsFormOpen(false);
    }, 2000);
  };

  const allReviewsList = Object.entries(reviewsMap).flatMap(([productId, revs]) => {
    const product = products.find((p) => p.id === productId);
    const reviewList = (revs || []) as ProductReview[];
    return reviewList.map((r) => ({ ...r, productId, productTitle: product ? product.title : 'Unknown Product' }));
  });

  const filteredReviews = allReviewsList.filter((rev) => {
    const matchesProduct = filterProductId === 'all' || rev.productId === filterProductId;
    const matchesQuery = !searchQuery || 
      rev.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rev.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProduct && matchesQuery;
  });

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* SECTION TABS: CUSTOMER REVIEWS vs VIDEO SUCCESS STORIES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveReviewTab('reviews')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeReviewTab === 'reviews'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Reviews & Ratings</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeReviewTab === 'reviews' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {allReviewsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveReviewTab('success_stories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeReviewTab === 'success_stories'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Video Success Stories</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeReviewTab === 'success_stories' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {successStories.length}
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
              NEW
            </span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium px-3 hidden sm:inline-block">
          {activeReviewTab === 'reviews' 
            ? 'Moderating standard customer reviews & ratings' 
            : 'Managing 3-card video reels on product detail pages'}
        </span>
      </div>

      {/* RENDER SUCCESS STORIES TAB */}
      {activeReviewTab === 'success_stories' ? (
        <AdminSuccessStories />
      ) : (
        <>
          {/* SECTION 1: MANUAL REVIEW SEEDER FORM */}
      <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 transition-all">
        <div className={`flex flex-wrap items-center justify-between gap-3 ${isFormOpen ? 'border-b border-slate-800 pb-4 mb-5' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <span>Create / Seed Product Review</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isFormOpen 
                  ? 'Fill in customer feedback details to publish directly to database' 
                  : 'Add custom verified reviews with ratings, photos, and reviewer avatars'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (selectedProductForSeed) {
                  seedSampleReviewsForProduct(selectedProductForSeed);
                }
              }}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Quick Bulk Seed 3 Reviews</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFormOpen((prev) => !prev)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isFormOpen
                  ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md'
              }`}
            >
              {isFormOpen ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel / Close</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add / Seed Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isFormOpen && (
          <form onSubmit={handleManualReviewSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Target Product */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Target Product</label>
              <select
                value={selectedProductForSeed}
                onChange={(e) => setSelectedProductForSeed(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Reviewer Name */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Reviewer Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Reviewer Avatar DP Upload */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Reviewer DP / Avatar</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 border border-slate-700 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUploadingAvatar ? 'Uploading...' : avatarPreview ? 'Change DP' : 'Upload DP'}</span>
                </button>
                {avatarPreview && avatarPreview.trim() ? (
                  <div className="relative shrink-0">
                    <img src={avatarPreview.trim()} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => { setAvatarPreview(null); setAvatarUrl(''); }}
                      className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow-sm"
                      title="Remove Avatar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">Direct to reviews &gt; Avatar</span>
                )}
              </div>
            </div>

            {/* Star Rating Picker */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Star Rating (1-5)</label>
              <div className="flex items-center gap-1 h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
                <span className="ml-auto text-xs font-bold text-amber-400">{rating}.0 / 5.0</span>
              </div>
            </div>

            {/* Review Date */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Review Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Headline Title */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Review Headline / Title</label>
              <input
                type="text"
                placeholder="e.g. Mind-blowing build quality & ultra premium packaging!"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Review Attachment Photo Upload */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Product Review Photo</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={reviewFileInputRef}
                  accept="image/*"
                  onChange={handleReviewImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => reviewFileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 border border-slate-700 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUploadingPhoto ? 'Uploading...' : imagePreview ? 'Change Photo' : 'Upload Product Photo'}</span>
                </button>
                {imagePreview && imagePreview.trim() ? (
                  <div className="relative shrink-0">
                    <img src={imagePreview.trim()} alt="Preview" className="w-10 h-10 rounded-lg object-cover border-2 border-amber-500 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImageUrl(''); }}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow-sm"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">Direct to reviews &gt; product image</span>
                )}
              </div>
            </div>
          </div>

          {/* Comment Body */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Detailed Review Content</label>
            <textarea
              rows={3}
              placeholder="Write a realistic customer comment detailing their experience with the product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span className="text-slate-300 font-semibold text-xs">Mark as Verified Purchase Buyer</span>
            </label>

            <AdminSaveButton
              type="submit"
              saveState={reviewSaveState}
              idleText="Seed & Save Review to Database"
              savingText="Saving Review..."
              savedText="Review Saved & Published!"
              idleIcon={<Plus className="w-4 h-4" />}
            />
          </div>
        </form>
        )}
      </div>

      {/* SECTION 2: REVIEWS MODERATION & LISTING */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white font-serif">Storefront Reviews Catalog ({filteredReviews.length})</h3>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            {/* Filter Product */}
            <select
              value={filterProductId}
              onChange={(e) => setFilterProductId(e.target.value)}
              className="py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Product: {rev.productTitle}
                    </span>
                    <span className="font-bold text-white text-xs">{rev.author}</span>
                    {rev.verified && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Verified Buyer
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-800'}`} />
                      ))}
                    </div>

                    <button
                      onClick={() => deleteReview(rev.productId, rev.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete review from database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="font-bold text-white text-xs">{rev.title}</p>
                <p className="text-slate-300 leading-relaxed text-xs">{rev.comment}</p>

                {rev.imageUrl?.trim() ? (
                  <div className="pt-2">
                    <img src={rev.imageUrl.trim()} alt="" className="w-16 h-16 object-cover rounded-xl border border-slate-800" />
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-slate-900/30 rounded-2xl border border-slate-800/50">
              <p className="text-xs text-slate-500">No reviews found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>
  );
};

