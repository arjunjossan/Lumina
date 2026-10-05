import React, { useState, useEffect } from 'react';
import { ArrowUp, ChevronUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ScrollToTop: React.FC = () => {
  const { activePage } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Hide on admin dashboard if desired, or keep only for store pages
  const isStorePage = activePage !== 'admin';

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight > 0) {
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }

      // Show button once user has scrolled past 280px
      if (scrollTop > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case page starts already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isStorePage || !isVisible) {
    return null;
  }

  // Calculate SVG circular progress stroke dash offset
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div 
      id="scroll-to-top-container"
      className="fixed bottom-36 md:bottom-24 right-4 sm:right-6 z-30 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-3"
    >
      <button
        id="scroll-to-top-button"
        type="button"
        onClick={scrollToTop}
        className="group relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white hover:text-amber-400 backdrop-blur-md border border-slate-700/90 hover:border-amber-400/80 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer"
        aria-label="Scroll to top of page"
        title="Scroll to top"
      >
        {/* Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
          viewBox="0 0 44 44"
          aria-hidden="true"
        >
          {/* Background circle track */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="text-slate-800/80"
            strokeWidth="2.5"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Animated progress fill */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="text-amber-500 transition-all duration-150 ease-out"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Up Arrow Icon */}
        <ChevronUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5 relative z-10" />

        {/* Hover Tooltip for Desktop */}
        <span className="sr-only">Scroll to top</span>
        <span 
          id="scroll-to-top-tooltip"
          className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-950/95 text-slate-200 text-[10px] font-bold tracking-wider uppercase rounded-lg border border-slate-800 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block"
        >
          Back to top • {Math.round(scrollProgress)}%
        </span>
      </button>
    </div>
  );
};
