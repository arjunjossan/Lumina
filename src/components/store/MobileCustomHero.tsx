import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { DesktopHeroButtonConfig } from '../../types';

interface MobileCustomHeroProps {
  onCatalogScroll?: () => void;
}

export const MobileCustomHero: React.FC<MobileCustomHeroProps> = ({ onCatalogScroll }) => {
  const { 
    mobileHeroConfig, 
    products, 
    mobileProducts,
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

  // Detect scroll to trigger glowing ripple effect
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

  // Intersection observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!mobileHeroConfig || !mobileHeroConfig.imageUrl) {
    return null;
  }

  const { button1, button2, viewFitting, maxHeightVh = 75 } = mobileHeroConfig;

  // Execute button action
  const handleButtonClick = (button: DesktopHeroButtonConfig, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!button.enabled) return;

    switch (button.actionType) {
      case 'product_page': {
        const allProds = [...(mobileProducts || []), ...(products || [])];
        if (button.productId) {
          const prod = allProds.find(p => p.id === button.productId);
          if (prod) {
            navigateTo('product-detail', prod.id);
            return;
          }
        }
        const fallback = allProds.find(p => p.isWinningProduct) || allProds[0];
        if (fallback) {
          navigateTo('product-detail', fallback.id);
        } else {
          navigateTo('catalog');
        }
        break;
      }

      case 'add_to_cart': {
        const allProds = [...(mobileProducts || []), ...(products || [])];
        const prod = allProds.find(p => p.id === button.productId) || allProds.find(p => p.isWinningProduct) || allProds[0];
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

  const hasTopBar = topNotificationConfig?.enabled;
  const maxAvailableHeight = hasTopBar ? 'calc(100vh - 6.5rem)' : 'calc(100vh - 4.25rem)';

  return (
    <section 
      ref={containerRef}
      className="md:hidden relative w-full bg-slate-950 overflow-hidden border-b border-slate-800 select-none"
      style={{
        maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`
      }}
    >
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-slate-950/40 to-slate-950 pointer-events-none" />

      {/* Hero Content Container */}
      <div 
        className="w-full h-full mx-auto flex items-center justify-center relative"
        style={{
          maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`
        }}
      >
        <div 
          className="relative inline-block w-full max-w-full"
          style={{
            maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`
          }}
        >
          {/* Main Mobile Hero Graphic Banner */}
          <img
            src={mobileHeroConfig.imageUrl}
            alt={mobileHeroConfig.imageAltText || 'Mobile Hero Banner'}
            className={`w-full mx-auto block ${
              viewFitting === 'cover' ? 'object-cover' : 'object-contain'
            }`}
            style={{
              maxHeight: viewFitting === 'fit_screen' ? maxAvailableHeight : `${maxHeightVh}vh`
            }}
            loading="eager"
          />

          {/* OVERLAY BUTTON / HOTSPOT 1 */}
          {button1 && button1.enabled && (
            <button
              type="button"
              id="mobile-hero-hotspot-1"
              aria-label={button1.name || 'Mobile Action Button 1'}
              onClick={(e) => handleButtonClick(button1, e)}
              className="absolute cursor-pointer transition-transform duration-200 active:scale-95 focus:outline-hidden z-20"
              style={{
                left: `${button1.x}%`,
                top: `${button1.y}%`,
                width: `${button1.width}%`,
                height: `${button1.height}%`,
                borderRadius: `${button1.borderRadius}px`,
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                backdropFilter: 'none'
              }}
            />
          )}

          {/* OVERLAY BUTTON / HOTSPOT 2 */}
          {button2 && button2.enabled && (
            <button
              type="button"
              id="mobile-hero-hotspot-2"
              aria-label={button2.name || 'Mobile Action Button 2'}
              onClick={(e) => handleButtonClick(button2, e)}
              className="absolute cursor-pointer transition-transform duration-200 active:scale-95 focus:outline-hidden z-20"
              style={{
                left: `${button2.x}%`,
                top: `${button2.y}%`,
                width: `${button2.width}%`,
                height: `${button2.height}%`,
                borderRadius: `${button2.borderRadius}px`,
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                backdropFilter: 'none'
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};
