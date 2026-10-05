import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductDetailsSkeleton } from './ProductDetailsSkeleton';
import { RichDescriptionRenderer } from '../common/RichDescriptionRenderer';
import { 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  Check, 
  Sparkles, 
  Plus, 
  Minus, 
  ArrowLeft,
  ArrowRight,
  Share2,
  Clock,
  ThumbsUp,
  MessageSquarePlus,
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Maximize2,
  Video,
  Volume2,
  VolumeX,
  Film,
  Play,
  ChevronDown,
  Copy,
  Scale,
  User,
  Zap,
  Package,
  Tag,
  Crown
} from 'lucide-react';
import { SuccessStory } from '../../types';
import { resolveVideoUrl } from '../../lib/videoStorage';
import { getEffectiveProductBundle } from '../../lib/pricingUtils';
import { uploadProductMediaFile } from '../../lib/productMediaStorage';

const SuccessStoriesVideoCard: React.FC<{ story: SuccessStory }> = ({ story }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fallbackUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    if (!story.videoUrl || story.videoUrl.includes('commondatastorage.googleapis.com')) {
      return fallbackUrl;
    }
    if (story.videoUrl.startsWith('http') || story.videoUrl.startsWith('blob:') || story.videoUrl.startsWith('data:') || story.videoUrl.startsWith('/api/videos/')) {
      return story.videoUrl;
    }
    return '';
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    if (!story.videoUrl || story.videoUrl.includes('commondatastorage.googleapis.com')) {
      setResolvedSrc(fallbackUrl);
      return;
    }
    if (story.videoUrl.startsWith('/api/videos/')) {
      setResolvedSrc(story.videoUrl);
      return;
    }
    resolveVideoUrl(story.videoUrl).then((url) => {
      if (isMounted) {
        setResolvedSrc(url || fallbackUrl);
      }
    }).catch(() => {
      if (isMounted) setResolvedSrc(fallbackUrl);
    });
    return () => {
      isMounted = false;
    };
  }, [story.videoUrl]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current && !hasError) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current && !hasError) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    }
  };

  return (
    <div 
      onClick={togglePlay}
      className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 aspect-4/5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end select-none"
    >
      {!hasError && resolvedSrc ? (
        <video
          ref={videoRef}
          key={resolvedSrc}
          src={resolvedSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            e.preventDefault();
            setHasError(true);
          }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Film className="w-6 h-6 text-amber-400/80" />
          </div>
        </div>
      )}

      {/* Dark gradient overlay for high contrast readability of customer name & text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15 pointer-events-none" />

      {/* Top Bar: Badge & Sound Toggle */}
      <div className="absolute top-2.5 sm:top-3.5 inset-x-2.5 sm:inset-x-3.5 flex items-center justify-between z-10">
        <span className="bg-black/60 backdrop-blur-md text-amber-400 border border-amber-400/30 text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Success Story
        </span>

        {!hasError && (
          <button
            type="button"
            onClick={toggleSound}
            className="bg-black/60 hover:bg-black/85 backdrop-blur-md text-white p-1.5 sm:p-2 rounded-full border border-white/20 transition-all cursor-pointer shadow-xs"
            title={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />}
          </button>
        )}
      </div>

      {/* Play/Pause center indicator when paused */}
      {!isPlaying && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/40 backdrop-blur-[1px]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-slate-950" />
          </div>
        </div>
      )}

      {/* Customer Information & Story Text Over Video */}
      <div className="relative z-10 p-3 sm:p-5 space-y-1 sm:space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {[...Array(story.rating || 5)].map((_, i) => (
            <Star key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
          ))}
          {story.verified && (
            <span className="ml-1 text-[8px] sm:text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full font-bold">
              Verified
            </span>
          )}
        </div>

        <div>
          <h4 className="font-bold text-white text-xs sm:text-base tracking-tight font-serif drop-shadow-xs truncate">
            {story.customerName}
          </h4>
          {story.customerRoleOrLocation && (
            <p className="text-[9px] sm:text-[11px] text-amber-300/90 font-medium truncate">
              {story.customerRoleOrLocation}
            </p>
          )}
        </div>

        <p className="text-[10px] sm:text-xs text-slate-100 leading-snug sm:leading-relaxed font-normal line-clamp-2 sm:line-clamp-3">
          "{story.storyText}"
        </p>

        <div className="pt-0.5 sm:pt-1 flex items-center justify-between text-[8px] sm:text-[10px] text-slate-400">
          <span className="truncate max-w-[70px] sm:max-w-none">{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Verified'}</span>
          <span className="text-amber-400/90 font-medium">{hasError ? 'Verified' : isPlaying ? 'Playing' : 'Paused'}</span>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailsPage: React.FC = () => {
  const { 
    products, 
    mobileProducts,
    selectedProductId, 
    navigateTo, 
    addToCart, 
    toggleWishlist, 
    wishlist,
    reviewsMap,
    addReview,
    setIsCartOpen,
    bundleConfig,
    successStories,
    compareList,
    toggleCompare,
    setIsCompareModalOpen,
    setMobileCartNotification,
    isCustomerAuthenticated,
    customerUser,
    navigateToLogin,
    showNotification
  } = useStore();

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCatalog = useMemo(() => {
    if (isMobile) {
      // Prioritize mobile product catalog entries with individual descriptions, images, specs, etc.
      const list = [...(mobileProducts || [])];
      if (products && products.length > 0) {
        products.forEach(dp => {
          if (!list.some(p => p.id === dp.id)) {
            list.push(dp);
          }
        });
      }
      return list;
    } else {
      // Prioritize desktop product catalog entries
      const list = [...(products || [])];
      if (mobileProducts && mobileProducts.length > 0) {
        mobileProducts.forEach(mp => {
          if (!list.some(p => p.id === mp.id)) {
            list.push(mp);
          }
        });
      }
      return list;
    }
  }, [isMobile, mobileProducts, products]);

  const product = activeCatalog.find(p => p.id === selectedProductId);
  const isInCompare = product ? compareList.includes(product.id) : false;

  const effectiveBundle = useMemo(() => {
    if (!product) return null;
    return getEffectiveProductBundle(product.id, bundleConfig);
  }, [product?.id, bundleConfig]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [loadedThumbnails, setLoadedThumbnails] = useState<Record<number, boolean>>({});

  // Reset main image loading state on image index or product change
  useEffect(() => {
    setMainImageLoaded(false);
    setMainImageError(false);
  }, [selectedImageIndex, selectedProductId, product?.id]);

  // Reset thumbnail load map when product changes
  useEffect(() => {
    setLoadedThumbnails({});
  }, [product?.id]);

  // Fallback to description if the current active tab is toggled off
  useEffect(() => {
    if (activeTab === 'specs' && product?.showSpecs === false) {
      setActiveTab('description');
    }
    if (activeTab === 'shipping' && product?.showShippingWarranty === false) {
      setActiveTab('description');
    }
  }, [activeTab, product?.showSpecs, product?.showShippingWarranty]);

  // Share & Copy Link state & handlers
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddedToCartRecently, setIsAddedToCartRecently] = useState(false);

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      }).catch(() => {
        fallbackCopyText(currentUrl);
      });
    } else {
      fallbackCopyText(currentUrl);
    }
  };

  const handleShareTwitter = () => {
    const url = window.location.href;
    const text = `Check out ${product.title} on ${window.location.host}!`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out this product: ${product.title}\n${url}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [revAuthor, setRevAuthor] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revImageUrl, setRevImageUrl] = useState('');
  const [revImagePreview, setRevImagePreview] = useState<string | null>(null);
  const [revAvatarUrl, setRevAvatarUrl] = useState('');
  const [revAvatarPreview, setRevAvatarPreview] = useState<string | null>(null);
  const [isUploadingRevAvatar, setIsUploadingRevAvatar] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top and reset image index when viewing a new product
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setSelectedBundle(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProductId]);

  // Dynamically suggest similar products based on category matching
  const similarProducts = useMemo(() => {
    if (!product) return [];
    
    // First priority: same category excluding current product
    const sameCategory = activeCatalog.filter(p => p.id !== product.id && p.category === product.category);
    
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    
    // Fallback: fill remaining slots with other winning/popular products from different categories
    const otherProducts = activeCatalog.filter(p => p.id !== product.id && p.category !== product.category);
    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [activeCatalog, product]);

  if (!product) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-600">Product not found.</p>
        <button onClick={() => navigateTo('home')} className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-xl">
          Return Home
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const [helpfulLikes, setHelpfulLikes] = useState<Record<string, boolean>>({});
  const [showAllSuccessStories, setShowAllSuccessStories] = useState<boolean>(false);

  // Strictly return only real reviews seeded or submitted for this specific product
  const productReviews = useMemo(() => {
    return reviewsMap[product.id] || [];
  }, [reviewsMap, product.id]);

  // Calculated dynamic average rating
  const calculatedRating = useMemo(() => {
    if (productReviews.length === 0) return product.rating || 5.0;
    const sum = productReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return Number((sum / productReviews.length).toFixed(1));
  }, [productReviews, product.rating]);

  // Video Success Stories: strictly filter by product ID for product-level scoping
  const allProductStories = useMemo(() => {
    if (!product) return [];
    return (successStories || []).filter(s => s.productId === product.id && s.published);
  }, [successStories, product?.id]);

  // Max 8 cards initially (2 rows of 4 cards per row). If more exist, View More reveals all.
  const displayedStories = useMemo(() => {
    if (showAllSuccessStories) {
      return allProductStories;
    }
    return allProductStories.slice(0, 8);
  }, [allProductStories, showAllSuccessStories]);

  const toggleHelpful = (id: string) => {
    setHelpfulLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBundleSelect = (bundleCount: 1 | 2 | 3) => {
    setSelectedBundle(bundleCount);
    if (bundleCount === 2) setQuantity(effectiveBundle.tier2Quantity);
    else if (bundleCount === 3) setQuantity(effectiveBundle.tier3Quantity);
    else setQuantity(1);
  };

  const handleAddToCart = () => {
    let bundleDiscount = 0;
    if (effectiveBundle.enabled) {
      if (selectedBundle === 2) bundleDiscount = effectiveBundle.tier2DiscountPercent;
      if (selectedBundle === 3) bundleDiscount = effectiveBundle.tier3DiscountPercent;
    }
    addToCart(product, quantity, bundleDiscount, selectedBundle);
    setIsAddedToCartRecently(true);
    setTimeout(() => setIsAddedToCartRecently(false), 2200);
  };

  const handleBuyNow = () => {
    let bundleDiscount = 0;
    if (effectiveBundle.enabled) {
      if (selectedBundle === 2) bundleDiscount = effectiveBundle.tier2DiscountPercent;
      if (selectedBundle === 3) bundleDiscount = effectiveBundle.tier3DiscountPercent;
    }
    setMobileCartNotification(null);
    addToCart(product, quantity, bundleDiscount, selectedBundle, true);
    setIsCartOpen(false);

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

    if (isDesktop) {
      if (isCustomerAuthenticated || Boolean(customerUser)) {
        // Logged-in desktop customer proceeds directly to checkout
        navigateTo('checkout');
      } else {
        // Logged-out desktop customer is routed to the sign-in page with selected products preserved
        showNotification('Please sign in to proceed to checkout with your selected items.');
        navigateToLogin('checkout', 'checkout');
      }
    } else {
      // Mobile user flow
      navigateTo('cart');
    }
  };

  const [isUploadingRevPhoto, setIsUploadingRevPhoto] = useState(false);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Avatar image file size should be less than 15MB.');
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) setRevAvatarPreview(base64);
    };
    reader.readAsDataURL(file);

    setIsUploadingRevAvatar(true);
    try {
      showNotification('Uploading customer avatar to products > reviews > Avatar bucket...');
      const res = await uploadProductMediaFile(file, file.name, 'reviews/Avatar');
      if (res.url) {
        setRevAvatarUrl(res.url);
        setRevAvatarPreview(res.url);
        showNotification('✅ Profile avatar stored in products/reviews/Avatar!');
      }
    } catch (err) {
      console.warn('Customer avatar upload notice:', err);
    } finally {
      setIsUploadingRevAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Photo file size should be less than 15MB.');
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) setRevImagePreview(base64);
    };
    reader.readAsDataURL(file);

    setIsUploadingRevPhoto(true);
    try {
      showNotification('Uploading review photo to products > reviews > product image bucket...');
      const res = await uploadProductMediaFile(file, file.name, 'reviews/product_image');
      if (res.url) {
        setRevImageUrl(res.url);
        setRevImagePreview(res.url);
        showNotification('✅ Photo stored in products/reviews/product_image!');
      }
    } catch (err) {
      console.warn('Customer review photo upload notice:', err);
    } finally {
      setIsUploadingRevPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revAuthor || !revTitle || !revComment) return;

    const finalImage = revImageUrl.trim() || revImagePreview || undefined;
    const authorInitials = encodeURIComponent(revAuthor.trim() || 'User');
    const defaultAvatar = `https://ui-avatars.com/api/?name=${authorInitials}&background=f59e0b&color=0f172a&bold=true`;
    const finalAvatar = revAvatarUrl.trim() || revAvatarPreview || defaultAvatar;

    addReview(product.id, {
      author: revAuthor.trim(),
      rating: revRating,
      title: revTitle.trim(),
      comment: revComment.trim(),
      verified: true,
      imageUrl: finalImage,
      avatarUrl: finalAvatar
    });

    setIsReviewModalOpen(false);
    setRevAuthor('');
    setRevTitle('');
    setRevComment('');
    setRevImageUrl('');
    setRevImagePreview(null);
    setRevAvatarUrl('');
    setRevAvatarPreview(null);
  };

  const currentBundleDiscountPercent = effectiveBundle?.enabled
    ? (selectedBundle === 2 ? effectiveBundle.tier2DiscountPercent : selectedBundle === 3 ? effectiveBundle.tier3DiscountPercent : 0)
    : 0;
  const currentUnitDiscountedPrice = currentBundleDiscountPercent > 0
    ? product.price * (1 - currentBundleDiscountPercent / 100)
    : product.price;
  const currentTotalCalculatedPrice = currentUnitDiscountedPrice * quantity;
  const compareAtTotal = (product.compareAtPrice || product.price) * quantity;
  const totalSavings = Math.max(0, compareAtTotal - currentTotalCalculatedPrice);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="bg-slate-50 border-b border-slate-200/80 py-3">
        <div className="w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-medium text-slate-500">
          <button 
            onClick={() => navigateTo('catalog')}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors py-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-xs">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Image Gallery with Vertical Thumbnails on Left */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 items-start w-full">
              {/* Vertical Thumbnail Navigation on Left */}
              {product.images && product.images.filter(img => Boolean(img && img.trim())).length > 1 && (
                <div className="flex md:flex-col items-center gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[580px] lg:max-h-[610px] w-full md:w-20 lg:w-24 shrink-0 pb-1 md:pb-0 scrollbar-thin">
                  {product.images.filter(img => Boolean(img && img.trim())).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 md:w-20 md:h-20 lg:w-22 lg:h-22 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 cursor-pointer ${
                        selectedImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      {!loadedThumbnails[idx] && (
                        <div className="absolute inset-0 bg-slate-200 shimmer-effect flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-slate-300 opacity-50 animate-pulse" />
                        </div>
                      )}
                      <img
                        src={img}
                        alt=""
                        onLoad={() => setLoadedThumbnails(prev => ({ ...prev, [idx]: true }))}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          loadedThumbnails[idx] ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Box - Well-balanced proportional height with edge-to-edge width */}
              <div className="relative flex-1 aspect-[5/4] sm:aspect-[5/4] md:aspect-[5/4] lg:aspect-[5/4] max-h-[580px] lg:max-h-[610px] w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/80 group">
                {/* Shimmer / Skeleton placeholder while main image loads */}
                {!mainImageLoaded && (
                  <div className="absolute inset-0 z-0 bg-slate-200/90 shimmer-effect flex flex-col items-center justify-center select-none">
                    <ImageIcon className="w-12 h-12 text-slate-300 opacity-40 animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-medium mt-2">Loading preview...</span>
                  </div>
                )}

                <img
                  key={`${product.id}-${selectedImageIndex}`}
                  src={mainImageError ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' : (product.images[selectedImageIndex] || product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80')}
                  alt={product.title}
                  onLoad={() => setMainImageLoaded(true)}
                  onError={() => {
                    setMainImageError(true);
                    setMainImageLoaded(true);
                  }}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    mainImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {product.isWinningProduct && (
                  <span className="absolute top-4 left-4 bg-slate-950 text-amber-400 text-xs font-extrabold uppercase px-3 py-1 rounded-xl shadow-lg flex items-center gap-1 z-10">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Winning Choice</span>
                  </span>
                )}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <button
                    onClick={handleCopyLink}
                    type="button"
                    title={copiedLink ? "Link Copied!" : "Copy Product Link"}
                    className={`p-3 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                      copiedLink ? 'bg-emerald-500 text-white' : 'bg-white/80 text-slate-600 hover:text-slate-950 hover:bg-white'
                    }`}
                  >
                    {copiedLink ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                  </button>
                  {/* Compare Button (Desktop Only - Not implemented for mobile users) */}
                  <button
                    onClick={() => toggleCompare(product.id)}
                    type="button"
                    title={isInCompare ? "Remove from Compare" : "Add to Product Compare"}
                    className={`hidden md:flex items-center justify-center p-3 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                      isInCompare ? 'bg-amber-500 text-slate-950 scale-105 shadow-amber-500/30' : 'bg-white/80 text-slate-600 hover:text-amber-600 hover:bg-white'
                    }`}
                  >
                    <Scale className={`w-5 h-5 ${isInCompare ? 'fill-slate-950' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    type="button"
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    className={`p-3 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                      isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Buy Box */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6">
            <div>
              {/* Badge & Title */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-extrabold tracking-wider uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {product.badge || 'PRO VERIFIED WINNER'}
                </span>
                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80 inline-flex items-center gap-1 shadow-2xs select-all">
                  <span className="text-slate-400 font-normal">SKU:</span> {product.sku}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif leading-tight mb-2">
                {product.title}
              </h1>

              {product.subtitle && (
                <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed mb-3">
                  {product.subtitle}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">{product.rating}</span>
                <button 
                  onClick={() => {
                    document.getElementById('customer-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="text-xs font-semibold text-amber-600 underline hover:text-amber-700 cursor-pointer"
                >
                  ({productReviews.length} customer reviews)
                </button>
              </div>

              {/* Price Display */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-baseline gap-3 mb-4 flex-wrap">
                <span className="text-3xl font-black text-slate-900">
                  ₹{selectedBundle > 1 ? currentTotalCalculatedPrice.toFixed(2) : product.price.toFixed(2)}
                </span>
                {(product.compareAtPrice || selectedBundle > 1) && (
                  <span className="text-base text-slate-400 line-through">
                    ₹{selectedBundle > 1 ? compareAtTotal.toFixed(2) : product.compareAtPrice?.toFixed(2)}
                  </span>
                )}
                {(product.compareAtPrice || currentBundleDiscountPercent > 0) && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto">
                    SAVE ₹{selectedBundle > 1 
                      ? totalSavings.toFixed(2) 
                      : (product.compareAtPrice ? (product.compareAtPrice - product.price).toFixed(2) : '0.00')}
                    {currentBundleDiscountPercent > 0 && ` (${currentBundleDiscountPercent}% OFF)`}
                  </span>
                )}
                {selectedBundle > 1 && (
                  <span className="w-full text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Includes {quantity} units at ₹{currentUnitDiscountedPrice.toFixed(2)}/unit with admin bundle savings applied
                  </span>
                )}
              </div>

              {/* High Demand Stock Urgency Banner (Matching Design with Full-Width 2-Line Header and Animated Bottom Progress Section) */}
              <div className="bg-[#FFFDEB] border border-[#FDE68A] text-slate-900 p-3.5 sm:p-4 rounded-2xl shadow-xs flex flex-col gap-3 relative overflow-hidden">
                {/* 1. Top Section: Running Animated Clock Icon + 2 Full-Width Text Lines */}
                <div className="flex items-center gap-3 sm:gap-3.5 w-full min-w-0">
                  {/* Running Clock with Rotating Hands & Glowing Sunburst Rays */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    {/* Pulsing Sunburst Ray Accents */}
                    <svg
                      className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 text-amber-500 pointer-events-none animate-pulse"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="3" y1="3" x2="6" y2="6" />
                      <line x1="1" y1="12" x2="5" y2="12" />
                      <line x1="12" y1="1" x2="12" y2="5" />
                    </svg>

                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FEF3C7] border-2 border-[#FDE68A] flex items-center justify-center shadow-2xs relative">
                      {/* Running Ticking Clock Hands SVG */}
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-[#EA580C]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        {/* Minute Hand - Rapidly ticks/runs */}
                        <line x1="12" y1="12" x2="12" y2="6" stroke="#EA580C" strokeWidth="2.4" className="animate-clock-minute" />
                        {/* Hour Hand - Steady rotation */}
                        <line x1="12" y1="12" x2="16" y2="12" stroke="#EA580C" strokeWidth="2.4" className="animate-clock-hour" />
                        {/* Center Axis Pin */}
                        <circle cx="12" cy="12" r="1.5" fill="#EA580C" stroke="none" />
                      </svg>
                    </div>
                  </div>

                  {/* Vertical Subtle Divider */}
                  <div className="hidden sm:block w-px h-9 bg-amber-300/70 shrink-0" />

                  {/* Text Content: 2 Full-Width Lines */}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="text-xs sm:text-sm md:text-base leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="font-extrabold text-slate-900">High Demand: </span>
                      <span className="font-black text-[#EA580C] whitespace-nowrap">Only {product.stock} units remaining!</span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] md:text-xs text-slate-600 font-medium leading-tight mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      Hurry up! Stock is limited and may not be restocked soon.
                    </p>
                  </div>
                </div>

                {/* 2. Bottom Section: Almost Sold Out Card & Animated Decreasing Stock Bar */}
                <div className="w-full pt-2 sm:pt-2.5 border-t border-amber-200/60 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-[13px] font-extrabold text-[#C2410C]">Almost Sold Out</span>
                      <span className="text-xs sm:text-sm animate-flame inline-block">🔥</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300/70 px-2 py-0.5 rounded-full">
                      {Math.round((product.stock / Math.max(product.stock, 100)) * 100)}% Available
                    </span>
                  </div>

                  {/* Animated Decreasing Progress Bar */}
                  <div className="w-full h-2.5 sm:h-3 bg-amber-200/70 rounded-full overflow-hidden p-0.5 border border-amber-300/70 relative">
                    <div
                      className="bg-gradient-to-r from-[#EA580C] via-orange-500 to-[#F59E0B] h-full rounded-full transition-all duration-700 shadow-2xs relative overflow-hidden"
                      style={{
                        width: `${Math.min(100, Math.max(12, (product.stock / Math.max(product.stock, 100)) * 100))}%`,
                      }}
                    >
                      {/* Animated Continuous Sweeping Shimmer (Simulating Decreasing / Depleting Energy) */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep" />
                      {/* Moving Striped Flow */}
                      <div 
                        className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.7)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.7)_50%,rgba(255,255,255,0.7)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-stripes-left" 
                      />
                    </div>
                  </div>

                  {/* Stock Left / Total Indicators */}
                  <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] font-semibold text-slate-700">
                    <span className="font-bold text-[#C2410C]">{product.stock} left in stock</span>
                    <span className="text-slate-500">100 total capacity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle Options (Matches Reference Design) */}
            {effectiveBundle.enabled && (
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF5ED] border border-[#FED7AA] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#EA580C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
                        Select Bundle & <span className="text-[#EA580C]">Save Extra</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Choose the best option for you and enjoy special discounts
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FFF5ED] border border-[#FED7AA] text-[#EA580C] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs">
                    <Tag className="w-3.5 h-3.5 rotate-90" />
                    <span>Volume Discount Active</span>
                  </div>
                </div>

                {/* 3 Bundle Tier Cards */}
                <div className="space-y-3 pt-1">
                  {/* Bundle 1 (Standard) */}
                  <div
                    onClick={() => handleBundleSelect(1)}
                    className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      selectedBundle === 1
                        ? 'border-2 border-[#F97316] bg-gradient-to-r from-[#FFFBF7] via-[#FFF6EE] to-[#FFEDE0]/50 shadow-[0_4px_20px_rgba(249,115,22,0.1)]'
                        : 'border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      {/* Radio button */}
                      {selectedBundle === 1 ? (
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-[#EA580C] bg-white flex items-center justify-center shrink-0 shadow-2xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-slate-300 bg-white shrink-0" />
                      )}

                      {/* Single Warm Amber Box Icon */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF5ED] border border-[#FED7AA] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#78350F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                          Buy 1 Unit (Standard)
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                          Regular individual pricing
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-xl font-black text-[#EA580C]">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Bundle 2 (Multi-Pack) */}
                  <div
                    onClick={() => handleBundleSelect(2)}
                    className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 relative ${
                      selectedBundle === 2
                        ? 'border-2 border-[#F97316] bg-gradient-to-r from-[#FFFBF7] via-[#FFF6EE] to-[#FFEDE0]/50 shadow-[0_4px_20px_rgba(249,115,22,0.1)]'
                        : 'border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute -top-2.5 sm:-top-3 right-4 sm:right-6 bg-gradient-to-r from-[#FFEDD5] to-[#FED7AA] text-[#9A3412] font-black text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-orange-200 uppercase tracking-tight">
                      <span className="text-xs">🔥</span>
                      <span>{effectiveBundle.tier2Badge || `MOST POPULAR — SAVE ${effectiveBundle.tier2DiscountPercent}%`}</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      {/* Radio button */}
                      {selectedBundle === 2 ? (
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-[#EA580C] bg-white flex items-center justify-center shrink-0 shadow-2xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-slate-300 bg-white shrink-0" />
                      )}

                      {/* Two Blue Boxes Icon */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <g transform="translate(4, 0) scale(0.68)">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </g>
                          <g transform="translate(-1, 5) scale(0.68)">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#EFF6FF" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </g>
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                          Buy {effectiveBundle.tier2Quantity} Units (Multi-Pack)
                        </p>
                        <p className="text-[11px] sm:text-xs text-[#059669] font-bold">
                          Includes {effectiveBundle.tier2DiscountPercent}% Instant Discount
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-xl font-black text-slate-900 block leading-tight">
                        ₹{(product.price * effectiveBundle.tier2Quantity * (1 - effectiveBundle.tier2DiscountPercent / 100)).toFixed(2)}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium">
                        ₹{(product.price * effectiveBundle.tier2Quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Bundle 3 (Family & Gift Pack) */}
                  <div
                    onClick={() => handleBundleSelect(3)}
                    className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 relative ${
                      selectedBundle === 3
                        ? 'border-2 border-[#F97316] bg-gradient-to-r from-[#FFFBF7] via-[#FFF6EE] to-[#FFEDE0]/50 shadow-[0_4px_20px_rgba(249,115,22,0.1)]'
                        : 'border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute -top-2.5 sm:-top-3 right-4 sm:right-6 bg-[#00875A] text-white font-black text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs uppercase tracking-tight">
                      <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                      <span>{effectiveBundle.tier3Badge || `BEST VALUE — SAVE ${effectiveBundle.tier3DiscountPercent}%`}</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      {/* Radio button */}
                      {selectedBundle === 3 ? (
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-[#EA580C] bg-white flex items-center justify-center shrink-0 shadow-2xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-slate-300 bg-white shrink-0" />
                      )}

                      {/* Three Green Boxes Icon */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#065F46]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <g transform="translate(4, -1) scale(0.55)">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </g>
                          <g transform="translate(-1, 6) scale(0.55)">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#ECFDF5" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </g>
                          <g transform="translate(9, 6) scale(0.55)">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#ECFDF5" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </g>
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                          Buy {effectiveBundle.tier3Quantity} Units (Family & Gift Pack)
                        </p>
                        <p className="text-[11px] sm:text-xs text-[#059669] font-bold">
                          Includes {effectiveBundle.tier3DiscountPercent}% Instant Discount
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-xl font-black text-slate-900 block leading-tight">
                        ₹{(product.price * effectiveBundle.tier3Quantity * (1 - effectiveBundle.tier3DiscountPercent / 100)).toFixed(2)}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium">
                        ₹{(product.price * effectiveBundle.tier3Quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    const newQ = Math.max(1, quantity - 1);
                    setQuantity(newQ);
                    if (effectiveBundle?.enabled) {
                      if (newQ === effectiveBundle.tier3Quantity) setSelectedBundle(3);
                      else if (newQ === effectiveBundle.tier2Quantity) setSelectedBundle(2);
                      else setSelectedBundle(1);
                    }
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newQ = quantity + 1;
                    setQuantity(newQ);
                    if (effectiveBundle?.enabled) {
                      if (newQ === effectiveBundle.tier3Quantity) setSelectedBundle(3);
                      else if (newQ === effectiveBundle.tier2Quantity) setSelectedBundle(2);
                      else setSelectedBundle(1);
                    }
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full text-sm font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
                  isAddedToCartRecently
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isAddedToCartRecently ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-200 animate-bounce-short" />
                    <span className="tracking-wide">ADDED TO CART! ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <span>ADD TO SHOPPING CART</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-sm font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>EXPRESS CHECKOUT — BUY IT NOW</span>
              </button>

              {/* Compare Feature Row (Desktop Only) */}
              <div className="hidden md:flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleCompare(product.id)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    isInCompare
                      ? 'bg-amber-500/15 border-amber-400 text-amber-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Scale className={`w-4 h-4 ${isInCompare ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
                  <span>{isInCompare ? 'In Comparison List' : 'Compare Specifications'}</span>
                </button>

                {compareList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>View Compare ({compareList.length}/4)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Social Media Share & Copy Link Panel (Styled to Exact Visual Spec) */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5 relative overflow-hidden">
              {/* Header Row: Icon, Titles, More Options */}
              <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3">
                {/* Left: Icon Badge + Typography */}
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFF3EC] border border-[#FFE2D5] flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                    <Share2 className="w-5 h-5 text-[#FF5B22]" strokeWidth={2.4} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      SPREAD THE WORD
                    </span>
                    <h4 className="text-xs sm:text-base font-black text-slate-900 leading-tight">
                      Share Winning Product
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-snug sm:leading-normal mt-0.5">
                      Let others know about this amazing deal!
                    </p>
                  </div>
                </div>

                {/* Right: More Options Button */}
                <div className="flex items-center shrink-0 pt-0.5 sm:pt-0">
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleNativeShare}
                      type="button"
                      className="bg-[#FFF2EA] hover:bg-[#FFE6D9] active:bg-[#FFDEC9] text-[#FF5B22] border border-[#FFE2D5] rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                    >
                      <span>More Options</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    </button>
                  )}
                </div>
              </div>

              {/* Social Share Action Icons Row with 'Share Happiness!' on the Right */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Left: 3 Social Buttons */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* 1. Facebook Icon Button */}
                  <button
                    onClick={handleShareFacebook}
                    title="Share on Facebook"
                    type="button"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center shadow-md shadow-blue-500/25 active:scale-95 hover:scale-105 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>

                  {/* 2. WhatsApp Icon Button */}
                  <button
                    onClick={handleShareWhatsApp}
                    title="Share on WhatsApp"
                    type="button"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center shadow-md shadow-emerald-500/25 active:scale-95 hover:scale-105 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>

                  {/* 3. Copy Link Icon Button */}
                  <button
                    onClick={handleCopyLink}
                    title="Copy Product URL"
                    type="button"
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-xs active:scale-95 hover:scale-105 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/90'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />}
                  </button>
                </div>

                {/* Right: 'Share Happiness!' with Whimsical Paper Plane */}
                <div className="flex items-center gap-1.5 text-amber-500 select-none shrink-0 pl-2">
                  <span className="text-[11px] sm:text-xs font-serif italic text-slate-400">
                    Share Happiness!
                  </span>
                  <div className="relative">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 -rotate-12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    <span className="absolute -top-1.5 -right-1 text-[9px] text-amber-400 font-black">✦</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Benefits List */}
            {product.showFeatures !== false && product.features && product.features.length > 0 && (
              <div className="border-t border-slate-200 pt-6 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Key Highlights:</p>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Guarantees Trust Cards (Express Delivery, 30-Day Guarantee, Easy Returns) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 pt-2">
              {/* Card 1: Express Delivery */}
              <div className="bg-gradient-to-b from-[#F8FAFF] via-white to-[#EFF6FF] p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#DBEAFE] shadow-[0_4px_16px_rgba(37,99,235,0.04)] relative overflow-hidden flex flex-col justify-between">
                {/* Top Row: Icon Badge + Pill */}
                <div className="flex items-start justify-between gap-1 mb-2 sm:mb-3">
                  {/* Delivery Truck with Speed Streaks Badge */}
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0 shadow-2xs">
                    <div className="relative flex items-center justify-center text-[#1A73E8]">
                      {/* Speed Streaks */}
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Speed lines */}
                        <path d="M2 8H6M1 12H7M3 16H6" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
                        {/* Truck body */}
                        <path d="M8 6H16V14H8V6Z" fill="#1A73E8" />
                        <path d="M16 9H19.5L22 12.5V14H16V9Z" fill="#2563EB" />
                        {/* Wheels */}
                        <circle cx="10.5" cy="15.5" r="2" fill="#1E40AF" stroke="#EBF3FE" strokeWidth="1" />
                        <circle cx="18.5" cy="15.5" r="2" fill="#1E40AF" stroke="#EBF3FE" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>

                  {/* FAST Pill Badge */}
                  <div className="bg-[#EBF5FF] text-[#1E6BFF] px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-tight flex items-center gap-0.5 shrink-0">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                    <span>FAST</span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-[11px] sm:text-base font-black text-slate-900 leading-tight">
                    Express Delivery
                  </h4>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-500 mt-0.5">
                    3-5 Days
                  </p>
                  <p className="text-[9px] sm:text-xs text-slate-400 font-normal leading-tight sm:leading-relaxed mt-1 hidden xs:block sm:block">
                    Get your order quickly at your doorstep
                  </p>
                </div>
              </div>

              {/* Card 2: 30-Day Guarantee */}
              <div className="bg-gradient-to-b from-[#F6FDF9] via-white to-[#ECFDF5] p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#A7F3D0] shadow-[0_4px_16px_rgba(16,185,129,0.04)] relative overflow-hidden flex flex-col justify-between">
                {/* Subtle Background Watermark */}
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-100/60 absolute -right-2 -bottom-2 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z" />
                </svg>

                {/* Top Row: Icon Badge + Pill */}
                <div className="flex items-start justify-between gap-1 mb-2 sm:mb-3 z-10">
                  {/* Shield with Checkmark Badge */}
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#E6F8EE] flex items-center justify-center shrink-0 shadow-2xs">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#00A859] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3.5} />
                    </div>
                  </div>

                  {/* TRUSTED Pill Badge */}
                  <div className="bg-[#E6F8EE] text-[#00A859] px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-tight flex items-center gap-0.5 shrink-0">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    <span>TRUSTED</span>
                  </div>
                </div>

                {/* Content */}
                <div className="z-10">
                  <h4 className="text-[11px] sm:text-base font-black text-slate-900 leading-tight">
                    30-Day Guarantee
                  </h4>
                  <p className="text-[10px] sm:text-sm font-bold text-[#00A859] mt-0.5">
                    Full Refund
                  </p>
                  <p className="text-[9px] sm:text-xs text-slate-400 font-normal leading-tight sm:leading-relaxed mt-1 hidden xs:block sm:block">
                    Shop with confidence risk-free
                  </p>
                </div>
              </div>

              {/* Card 3: Easy Returns */}
              <div className="bg-gradient-to-b from-[#FFFBF7] via-white to-[#FFF4EB] p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#FED7AA] shadow-[0_4px_16px_rgba(249,115,22,0.04)] relative overflow-hidden flex flex-col justify-between">
                {/* Subtle Background Box Watermark */}
                <svg
                  className="w-14 h-14 sm:w-18 sm:h-18 text-orange-100/70 absolute -right-1 -bottom-2 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 7.8L4.6 7 12 3.8 19.4 7 12 9.8zM2 9v8l10 5v-8L2 9zm12 5v8l10-5V9l-10 5z" />
                </svg>

                {/* Top Row: Icon Badge + Pill */}
                <div className="flex items-start justify-between gap-1 mb-2 sm:mb-3 z-10">
                  {/* Circular Orange Return Arrow Badge */}
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#FFF0E5] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF5B22]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </div>

                  {/* HASSLE FREE Pill Badge */}
                  <div className="bg-[#FFF0E5] text-[#FF5B22] px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-tight flex items-center gap-0.5 shrink-0">
                    <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">HASSLE FREE</span>
                    <span className="sm:hidden">FREE</span>
                  </div>
                </div>

                {/* Content */}
                <div className="z-10">
                  <h4 className="text-[11px] sm:text-base font-black text-slate-900 leading-tight">
                    Easy Returns
                  </h4>
                  <p className="text-[10px] sm:text-sm font-bold text-[#EA580C] mt-0.5">
                    No Hassle
                  </p>
                  <p className="text-[9px] sm:text-xs text-slate-400 font-normal leading-tight sm:leading-relaxed mt-1 hidden xs:block sm:block">
                    Not happy? Return it with ease
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tabbed Product Details Section */}
        <div className="mt-16 border-t border-slate-200 pt-10">
          <div className="flex items-center gap-6 border-b border-slate-200 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'description' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Product Description & GIFs</span>
            </button>

            {product.showSpecs !== false && (
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm font-bold pb-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'specs' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Technical Specifications
              </button>
            )}

            {product.showShippingWarranty !== false && (
              <button
                onClick={() => setActiveTab('shipping')}
                className={`text-sm font-bold pb-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'shipping' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Shipping & Warranty
              </button>
            )}
          </div>

          {/* Description & GIF Showcase Tab */}
          {activeTab === 'description' && (
            <div className="py-8 space-y-8 w-full max-w-full overflow-hidden">
              <div className="bg-slate-50 p-0 rounded-3xl border border-slate-200 w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
                <div className="px-5 sm:px-8 pt-6 pb-1">
                  <h3 className="text-lg font-bold text-slate-900 font-serif">Comprehensive Overview</h3>
                </div>
                <div className="p-0 pb-6 w-full">
                  <RichDescriptionRenderer 
                    content={product.description || product.shortDescription} 
                    className="text-sm text-slate-700 leading-relaxed w-full max-w-full"
                  />
                </div>
              </div>

              {/* Animated GIF / Visual Showcase */}
              {product.gifUrls && product.gifUrls.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Live Product & Feature Demonstrations (Animated GIFs)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.gifUrls.filter(mediaUrl => Boolean(mediaUrl && mediaUrl.trim())).map((mediaUrl, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative group shadow-md">
                        <img src={mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-amber-500/90 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                          LIVE DEMO
                        </div>
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
                          Demonstration #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features Breakdown */}
              {product.showFeatures !== false && product.features && product.features.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200/80 p-6 rounded-3xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Why Customers Love This Product:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-amber-200/50 text-xs text-slate-800 font-medium shadow-2xs">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUCCESS STORIES VIDEO SECTION (strictly for this product) */}
              {allProductStories.length > 0 && (
                <div className="pt-6 space-y-5 border-t border-slate-200/80 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Film className="w-4 h-4 text-amber-500" />
                        <span>Customer Success Stories & Video Reels</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Real customer demonstrations, unboxings, and verified reviews.
                      </p>
                    </div>

                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 w-fit">
                      {allProductStories.length} Verified {allProductStories.length === 1 ? 'Story' : 'Stories'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
                    {displayedStories.map((story) => (
                      <SuccessStoriesVideoCard key={story.id} story={story} />
                    ))}
                  </div>

                  {allProductStories.length > 8 && (
                    <div className="flex justify-center pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAllSuccessStories(prev => !prev)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer border border-slate-700 hover:border-amber-500/50"
                      >
                        <Film className="w-4 h-4 text-amber-400" />
                        <span>
                          {showAllSuccessStories
                            ? 'Show Fewer Stories (First 8)'
                            : `View More Success Stories (${allProductStories.length - 8} Additional)`}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showAllSuccessStories ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Technical Specs Tab */}
          {activeTab === 'specs' && product.showSpecs !== false && (
            <div className="py-6 max-w-2xl space-y-4">
              {product.specifications && product.specifications.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="p-3.5 font-bold text-slate-800 w-1/3 border-b border-slate-100/80">{spec.name}</td>
                          <td className="p-3.5 text-slate-600 border-b border-slate-100/80 font-medium">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">Standard Quality Specifications</p>
                  <p>OEM Certified hardware components engineered to rigorous international quality benchmarks.</p>
                </div>
              )}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && product.showShippingWarranty !== false && (
            <div className="py-6 text-xs text-slate-700 space-y-4 max-w-2xl leading-relaxed">
              {product.shippingWarranty && product.shippingWarranty.trim() ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-xs border-b border-slate-200/80 pb-2">
                    <Truck className="w-4 h-4 text-amber-500" />
                    <span>Shipping, Delivery & Warranty Information</span>
                  </div>
                  <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {product.shippingWarranty.trim()}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    <strong>Shipping Duration:</strong> Orders are processed within 24 hours. Express tracked shipping takes 3 - 5 business days worldwide.
                  </p>
                  <p>
                    <strong>30-Day Money Back Guarantee:</strong> If you are not 100% satisfied with your Lumina product, contact our support team within 30 days of receiving your item for an effortless full refund or unit replacement.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <div id="customer-reviews-section" className="mt-16 pt-12 border-t border-slate-200/80 space-y-8">
          {/* Header with write review button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Verified Buyer Feedback</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">{calculatedRating}</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(calculatedRating) ? 'fill-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {productReviews.length > 0
                  ? `Based on ${productReviews.length} verified customer review${productReviews.length === 1 ? '' : 's'} for this item.`
                  : 'No customer reviews submitted yet for this product.'}
              </p>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Customer Review</span>
            </button>
          </div>

          {/* Review List */}
          <div>
            {productReviews.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 w-full">
                {productReviews.map((rev) => {
                  const isHelpful = !!helpfulLikes[rev.id];
                  const currentHelpfulCount = (rev.helpfulCount || 0) + (isHelpful ? 1 : 0);

                  return (
                    <div 
                      key={rev.id} 
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400/80 p-3 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {/* Header: User Info & Avatar */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img 
                            src={rev.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                            alt={rev.author} 
                            className="w-7 h-7 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                              {rev.author}
                            </p>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 block font-medium truncate">
                              {rev.date || 'Recent Buyer'}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating & Verified Buyer Badge */}
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                              />
                            ))}
                          </div>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-emerald-50 text-emerald-700 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Comment */}
                        <div>
                          <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                            {rev.title}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Review Image (if user attached one) */}
                        {Boolean(rev.imageUrl && rev.imageUrl.trim()) && (
                          <div className="pt-1">
                            <div 
                              onClick={() => setZoomImage(rev.imageUrl || null)}
                              className="relative group/img cursor-pointer rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100"
                            >
                              <img 
                                src={rev.imageUrl} 
                                alt="Customer review attachment" 
                                className="w-full h-20 sm:h-32 object-cover group-hover/img:scale-105 transition-transform duration-300" 
                              />
                              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Helpful button & Rating Indicator */}
                      <div className="flex items-center justify-between pt-2 sm:pt-3 mt-3 sm:mt-4 border-t border-slate-100 text-[10px] sm:text-[11px]">
                        <button 
                          onClick={() => toggleHelpful(rev.id)}
                          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all cursor-pointer ${
                            isHelpful 
                              ? 'bg-amber-500 text-white shadow-xs' 
                              : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200/60'
                          }`}
                        >
                          <ThumbsUp className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isHelpful ? 'fill-white' : ''}`} />
                          <span>Helpful ({currentHelpfulCount})</span>
                        </button>
                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full border border-amber-200/60">
                          {rev.rating}.0 ★
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No Customer Reviews Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first verified customer to share your thoughts, photos, and rating for this product!
                </p>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-amber-400 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Leave First Review</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* YOU MIGHT ALSO LIKE / RECOMMENDED PRODUCTS SECTION */}
        {similarProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Curated Recommendations</span>
                </div>
                <h2 className="text-2xl font-black font-serif text-slate-900 tracking-tight">
                  You Might Also Like
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Discover top-rated winning items related to <strong className="text-slate-800">{product.category}</strong>
                </p>
              </div>

              <button
                onClick={() => navigateTo('catalog')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 hover:underline self-start sm:self-auto group transition-all"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6 w-full">
              {similarProducts.map((simProduct) => (
                <ProductCard key={simProduct.id} product={simProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WRITE REVIEW MODAL WITH IMAGE UPLOAD */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-3 sm:space-y-4 relative my-auto max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsReviewModalOpen(false)} 
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 mb-1">
                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                <span>Verified Buyer Feedback</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Write a Customer Review</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Reviewing: <strong className="text-slate-800">{product.title}</strong></p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-2.5 sm:space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5 sm:mb-1">Overall Rating</label>
                <div className="flex items-center gap-1.5 text-amber-400 py-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setRevRating(star)}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 cursor-pointer hover:scale-110 transition-transform ${star <= revRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                  <span className="ml-auto font-bold text-slate-700 text-xs">{revRating}.0 / 5.0 Stars</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5 sm:mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Miller"
                  value={revAuthor}
                  onChange={(e) => setRevAuthor(e.target.value)}
                  required
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Customer Profile Photo / DP Upload Section */}
              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] sm:text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Your Profile Photo / DP (Optional)</span>
                  </label>
                  {isUploadingRevAvatar && (
                    <span className="text-[10px] text-amber-600 font-semibold animate-pulse">Uploading to bucket...</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Avatar Preview */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        revAvatarPreview || 
                        (revAuthor.trim() 
                          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(revAuthor.trim())}&background=f59e0b&color=0f172a&bold=true`
                          : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80`)
                      }
                      alt="Profile Avatar"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-500/50 shadow-sm bg-white"
                    />
                    {revAvatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setRevAvatarPreview(null);
                          setRevAvatarUrl('');
                        }}
                        className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow-sm"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      disabled={isUploadingRevAvatar}
                      className="px-3 py-1.5 sm:py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isUploadingRevAvatar ? 'Uploading to Bucket...' : revAvatarPreview ? 'Change Profile DP' : 'Upload Profile DP'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5 sm:mb-1">Review Headline / Summary *</label>
                <input
                  type="text"
                  placeholder="e.g. Incredible quality, works like a charm!"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  required
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5 sm:mb-1">Detailed Customer Feedback *</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about the build quality, usage experience, unboxing, and value..."
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  required
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Photo Upload & Preview Section */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">Attach Real Product Photo (Optional)</label>
                
                {revImagePreview && revImagePreview.trim() ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/50 bg-slate-50 p-2 flex items-center gap-3">
                    <img src={revImagePreview} alt="Upload preview" className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">Photo Attached ✓</p>
                      <p className="text-[10px] text-slate-500">Ready to upload with your review</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRevImagePreview(null);
                        setRevImageUrl('');
                      }}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors text-xs font-bold mr-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-2.5 sm:p-3 text-center cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-colors flex items-center justify-center gap-2 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to upload product photo
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-2.5 sm:py-3.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Submit Verified Customer Review</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL PHOTO ZOOM MODAL */}
      {zoomImage && zoomImage.trim() && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-transparent">
            <button 
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={zoomImage} alt="Zoomed review attachment" className="rounded-2xl max-h-[80vh] w-auto mx-auto object-contain border border-white/20 shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
