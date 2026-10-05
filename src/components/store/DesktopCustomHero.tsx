import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { DesktopHeroButtonConfig } from '../../types';

interface DesktopCustomHeroProps {
  onCatalogScroll?: () => void;
}

export const DesktopCustomHero: React.FC<DesktopCustomHeroProps> = ({ onCatalogScroll }) => {
  const { 
    desktopHeroConfig, 
    products, 
    navigateTo, 
    addToCart, 
    setIsCartOpen, 
    openFlashSalePopup,
    topNotificationConfig,
    showNotification
  } = useStore();

  const [isScrolling, setIsScrolling] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);

  // Detect scroll to trigger the requested button glowing effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Intersection observer to know if hero is in viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!desktopHeroConfig || !desktopHeroConfig.imageUrl) {
    return null;
  }

  const { button1, button2, viewFitting, maxHeightVh = 82 } = desktopHeroConfig;

  // Execute configured button click action
  const handleButtonClick = (button: DesktopHeroButtonConfig, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!button.enabled) return;

    switch (button.actionType) {
      case 'product_page': {
        if (button.productId) {
          const prod = products.find(p => p.id === button.productId);
          if (prod) {
            navigateTo('product-detail', prod.id);
            return;
          }
        }
        // Fallback to first winning product or catalog
        const fallback = products.find(p => p.isWinningProduct) || products[0];
        if (fallback) {
          navigateTo('product-detail', fallback.id);
        } else {
          navigateTo('catalog');
        }
        break;
      }

      case 'add_to_cart': {
        const prod = products.find(p => p.id === button.productId) || products.find(p => p.isWinningProduct) || products[0];
        if (prod) {
          addToCart(prod, 1);
          setIsCartOpen(true);
        } else {
          showNotification('Product not found to add to cart.');
        }
        break;
      }

      case 'catalog': {
        if (onCatalogScroll) {
          onCatalogScroll();
        } else {
          const catalogEl = document.getElementById('catalog-grid') || document.getElementById('products-section');
          if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            navigateTo('catalog');
          }
        }
        break;
      }

      case 'deals': {
        openFlashSalePopup();
        break;
      }

      case 'cart': {
        setIsCartOpen(true);
        break;
      }

      case 'custom_url': {
        if (button.customUrl) {
          if (button.customUrl.startsWith('#')) {
            const el = document.querySelector(button.customUrl);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (button.customUrl.startsWith('http')) {
            window.location.href = button.customUrl;
          } else {
            navigateTo(button.customUrl as any);
          }
        }
        break;
      }

      default:
        navigateTo('catalog');
    }
  };

  // Glow styling based on configured theme
  const getGlowClasses = (glowColor: string, isHovered: boolean) => {
    const isPulsing = isInView || isScrolling;
    
    switch (glowColor) {
      case 'cyan':
        return `${
          isPulsing ? 'shadow-[0_0_22px_rgba(6,182,212,0.85),inset_0_0_12px_rgba(6,182,212,0.4)] border-cyan-400/80' : 'shadow-[0_0_10px_rgba(6,182,212,0.4)] border-cyan-400/50'
        } ${isHovered ? 'shadow-[0_0_36px_rgba(6,182,212,1),inset_0_0_20px_rgba(255,255,255,0.6)] border-cyan-300 ring-2 ring-cyan-400/60' : ''}`;
      
      case 'emerald':
        return `${
          isPulsing ? 'shadow-[0_0_22px_rgba(16,185,129,0.85),inset_0_0_12px_rgba(16,185,129,0.4)] border-emerald-400/80' : 'shadow-[0_0_10px_rgba(16,185,129,0.4)] border-emerald-400/50'
        } ${isHovered ? 'shadow-[0_0_36px_rgba(16,185,129,1),inset_0_0_20px_rgba(255,255,255,0.6)] border-emerald-300 ring-2 ring-emerald-400/60' : ''}`;
      
      case 'rose':
        return `${
          isPulsing ? 'shadow-[0_0_22px_rgba(244,63,94,0.85),inset_0_0_12px_rgba(244,63,94,0.4)] border-rose-400/80' : 'shadow-[0_0_10px_rgba(244,63,94,0.4)] border-rose-400/50'
        } ${isHovered ? 'shadow-[0_0_36px_rgba(244,63,94,1),inset_0_0_20px_rgba(255,255,255,0.6)] border-rose-300 ring-2 ring-rose-400/60' : ''}`;
      
      case 'purple':
        return `${
          isPulsing ? 'shadow-[0_0_22px_rgba(168,85,247,0.85),inset_0_0_12px_rgba(168,85,247,0.4)] border-purple-400/80' : 'shadow-[0_0_10px_rgba(168,85,247,0.4)] border-purple-400/50'
        } ${isHovered ? 'shadow-[0_0_36px_rgba(168,85,247,1),inset_0_0_20px_rgba(255,255,255,0.6)] border-purple-300 ring-2 ring-purple-400/60' : ''}`;
      
      case 'white':
        return `${
          isPulsing ? 'shadow-[0_0_22px_rgba(255,255,255,0.9),inset_0_0_12px_rgba(255,255,255,0.5)] border-white/90' : 'shadow-[0_0_10px_rgba(255,255,255,0.4)] border-white/60'
        } ${isHovered ? 'shadow-[0_0_36px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,0.8)] border-white ring-2 ring-white/70' : ''}`;
      
      case 'amber':
      default:
        return `${
          isPulsing ? 'shadow-[0_0_24px_rgba(245,158,11,0.9),inset_0_0_14px_rgba(255,255,255,0.4)] border-amber-400/90' : 'shadow-[0_0_10px_rgba(245,158,11,0.4)] border-amber-400/60'
        } ${isHovered ? 'shadow-[0_0_38px_rgba(245,158,11,1),inset_0_0_22px_rgba(255,255,255,0.7)] border-amber-300 ring-2 ring-amber-400/70' : ''}`;
    }
  };

  // Screen height calculation:
  // Top nav: ~70px. Top announcement bar (if enabled): ~38px.
  // We reserve space so the hero image is completely visible in one open without scrolling!
  const hasTopBar = topNotificationConfig?.enabled;
  const maxAvailableHeight = hasTopBar ? 'calc(100vh - 7rem)' : 'calc(100vh - 4.75rem)';

  return (
    <section 
      ref={containerRef}
      className="hidden md:block relative w-full bg-slate-950 overflow-hidden border-b border-slate-800/80 select-none"
      style={{
        maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-slate-950/40 to-slate-950 pointer-events-none" />

      {/* Hero Content Container - Fitted to screen view */}
      <div 
        className="w-full h-full mx-auto flex items-center justify-center relative"
        style={{
          maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`
        }}
      >
        {/* Relative Wrapper tightly wrapping the aspect-ratio image */}
        <div 
          className="relative inline-block w-full max-w-full"
          style={{
            maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`
          }}
        >
          {/* Main Hero Graphic Image */}
          <img
            src={desktopHeroConfig.imageUrl}
            alt={desktopHeroConfig.imageAltText || 'Desktop Hero Banner'}
            className={`w-full mx-auto block ${
              viewFitting === 'cover' ? 'object-cover' : 'object-contain'
            }`}
            style={{
              maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`,
              width: viewFitting === 'cover' ? '100%' : 'auto'
            }}
          />

          {/* ========================================================= */}
          {/* INTERACTIVE BUTTON 1 (HOTSPOT 1) - NO CLIENT TEXT AS REQUESTED */}
          {/* ========================================================= */}
          {button1 && button1.enabled && (
            <button
              type="button"
              id="desktop-hero-btn-1"
              onClick={(e) => handleButtonClick(button1, e)}
              aria-label={button1.name || 'Hero Action Button 1'}
              title={button1.name || 'Click to explore'}
              className={`absolute cursor-pointer transition-all duration-300 border focus:outline-none group overflow-hidden ${
                isScrolling ? 'scale-[1.02]' : 'hover:scale-[1.02]'
              } ${getGlowClasses(button1.glowColor, false)}`}
              style={{
                left: `${button1.x}%`,
                top: `${button1.y}%`,
                width: `${button1.width}%`,
                height: `${button1.height}%`,
                borderRadius: `${button1.borderRadius || 12}px`,
                backgroundColor: 'transparent'
              }}
            >
              {/* Animated radiant shimmer wave across button hotspot */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              
              {/* Continuous subtle pulsing glow ring */}
              <div 
                className={`absolute inset-0 rounded-[inherit] transition-opacity duration-500 pointer-events-none ${
                  isScrolling || isInView ? 'opacity-80 animate-pulse' : 'opacity-40'
                }`}
                style={{
                  boxShadow: `0 0 16px ${
                    button1.glowColor === 'cyan' ? '#06b6d4' :
                    button1.glowColor === 'emerald' ? '#10b981' :
                    button1.glowColor === 'rose' ? '#f43f5e' :
                    button1.glowColor === 'purple' ? '#a855f7' :
                    button1.glowColor === 'white' ? '#ffffff' : '#f59e0b'
                  }`
                }}
              />
            </button>
          )}

          {/* ========================================================= */}
          {/* INTERACTIVE BUTTON 2 (HOTSPOT 2) - NO CLIENT TEXT AS REQUESTED */}
          {/* ========================================================= */}
          {button2 && button2.enabled && (
            <button
              type="button"
              id="desktop-hero-btn-2"
              onClick={(e) => handleButtonClick(button2, e)}
              aria-label={button2.name || 'Hero Action Button 2'}
              title={button2.name || 'Click to explore'}
              className={`absolute cursor-pointer transition-all duration-300 border focus:outline-none group overflow-hidden ${
                isScrolling ? 'scale-[1.02]' : 'hover:scale-[1.02]'
              } ${getGlowClasses(button2.glowColor, false)}`}
              style={{
                left: `${button2.x}%`,
                top: `${button2.y}%`,
                width: `${button2.width}%`,
                height: `${button2.height}%`,
                borderRadius: `${button2.borderRadius || 12}px`,
                backgroundColor: 'transparent'
              }}
            >
              {/* Animated radiant shimmer wave across button hotspot */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              
              {/* Continuous subtle pulsing glow ring */}
              <div 
                className={`absolute inset-0 rounded-[inherit] transition-opacity duration-500 pointer-events-none ${
                  isScrolling || isInView ? 'opacity-80 animate-pulse' : 'opacity-40'
                }`}
                style={{
                  boxShadow: `0 0 16px ${
                    button2.glowColor === 'cyan' ? '#06b6d4' :
                    button2.glowColor === 'emerald' ? '#10b981' :
                    button2.glowColor === 'rose' ? '#f43f5e' :
                    button2.glowColor === 'purple' ? '#a855f7' :
                    button2.glowColor === 'white' ? '#ffffff' : '#f59e0b'
                  }`
                }}
              />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
