import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Send, 
  CheckCircle,
  ChevronDown,
  Lock,
  ArrowRight,
  Facebook,
  Instagram,
  Music2,
  Share2,
  Phone,
  Star,
  Award,
  Zap,
  Globe,
  FileText,
  HelpCircle,
  Package,
  Copy,
  Check,
  Twitter,
  Youtube,
  Linkedin,
  MapPin,
  Mail,
  QrCode
} from 'lucide-react';

const WhatsappIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const Footer: React.FC = () => {
  const { activePage, navigateTo, setSelectedCategory, showNotification, storeBranding, socialSettings } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);

  // Profile dropdown pages and Cart page should hide footer on mobile
  const isMobileFooterHidden = ['my-orders', 'contact', 'order-tracking', 'returns-policy', 'cart'].includes(activePage);

  const toggleMobileSection = (section: string) => {
    setMobileExpandedSection(prev => prev === section ? null : section);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    showNotification('🎉 VIP Pass unlocked! Use code WINNING20 for 15% OFF your entire order.');
    setNewsletterEmail('');
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('WINNING20');
    setCopiedCoupon(true);
    showNotification('Coupon code WINNING20 copied to clipboard!');
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <footer className={`${isMobileFooterHidden ? 'hidden md:block' : 'block'} font-sans relative overflow-hidden w-full`}>
      {/* ================= DESKTOP FOOTER (Full-Width, Existing Layout Preserved) ================= */}
      <div className="hidden md:block bg-slate-950 text-slate-300 pt-10 sm:pt-14 pb-5 sm:pb-6 border-t border-slate-800/90 relative overflow-hidden w-full">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
          
          {/* Value Proposition Bar: 2x2 on Mobile, 4-col on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-5 pb-8 sm:pb-12 border-b border-slate-800/80">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 bg-slate-900/70 hover:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 group shadow-xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 group-hover:bg-amber-500/25 text-amber-400 flex items-center justify-center shrink-0 transition-colors">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-white leading-snug">Free Express Shipping</p>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Orders over ₹999 • 2-4 day dispatch</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 bg-slate-900/70 hover:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group shadow-xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 transition-colors">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-white leading-snug">30-Day Guarantee</p>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">100% risk-free return & refund</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 bg-slate-900/70 hover:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all duration-300 group shadow-xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-500/15 group-hover:bg-sky-500/25 text-sky-400 flex items-center justify-center shrink-0 transition-colors">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-white leading-snug">Hassle-Free Returns</p>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Instant portal & prepaid labels</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 bg-slate-900/70 hover:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all duration-300 group shadow-xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-500/15 group-hover:bg-purple-500/25 text-purple-400 flex items-center justify-center shrink-0 transition-colors">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-white leading-snug">24/7 VIP Concierge</p>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Dedicated human support desk</p>
            </div>
          </div>
        </div>

        {/* VIP Club Newsletter Top Section (Above Explore Catalog & Customer Support) */}
        <div className="py-6 sm:py-10 border-b border-slate-800/80">
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 p-5 sm:p-8 rounded-3xl border border-slate-800/90 shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Background accent badge */}
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2 max-w-xl relative z-10">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  <span>VIP Member Club</span>
                </span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Instant 15% Discount
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white font-serif tracking-tight">
                Unlock Exclusive Drop Alerts & VIP Member Savings
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Join 45,000+ smart shoppers receiving private flash sale invitations, secret voucher drops, and early access to newly discovered viral products.
              </p>
            </div>

            <div className="w-full lg:max-w-md relative z-10">
              {subscribed ? (
                <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-200 p-4 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white text-xs">You're on the VIP list!</p>
                      <p className="text-[11px] text-emerald-300">Use coupon code below at checkout:</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-white border border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Copy promo code"
                  >
                    <span>WINNING20</span>
                    {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-emerald-300" />}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                    <input
                      type="email"
                      placeholder="Enter your email address..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                      className="flex-1 bg-slate-950 border border-slate-700/90 text-xs text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      <span>Claim 15% Off</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 pl-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Zero spam. 100% Privacy guaranteed. Unsubscribe anytime in 1-click.</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Links & Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-8 lg:gap-10 pt-8 sm:pt-10 pb-5 sm:pb-6">
          
          {/* Column 1: Brand, Trust Score & Social Channels */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {storeBranding?.logoType === 'custom_image' && storeBranding?.logoImageUrl ? (
                <img 
                  src={storeBranding.logoImageUrl} 
                  alt={storeBranding.storeName || 'Store Logo'} 
                  className="h-8 max-w-[130px] object-contain rounded-md"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-xl font-black text-white tracking-wider font-serif block leading-none">
                  {storeBranding?.storeName || 'LUMINA'}
                </span>
                <span className="text-[9px] font-bold text-amber-400/90 tracking-widest uppercase">
                  Curated Innovation
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {storeBranding?.storeName || 'Lumina'} discovers and curates viral, high-utility lifestyle products engineered for reliability, modern aesthetics, and daily ease.
            </p>

            {/* Trustpilot & Buyer Ratings Widget */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-black text-white">4.9 / 5.0</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Rated by <strong className="text-slate-200">14,800+</strong> verified global buyers
              </p>
            </div>
          </div>

          {/* Column 2: Explore Catalog */}
          <div className="border-t border-slate-900 pt-4 md:border-0 md:pt-0 space-y-3">
            <button
              type="button"
              onClick={() => toggleMobileSection('catalog')}
              className="w-full flex items-center justify-between md:cursor-default text-left group"
            >
              <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Explore Catalog</span>
              </p>
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 md:hidden transition-transform duration-200 ${
                  mobileExpandedSection === 'catalog' ? 'rotate-180 text-amber-400' : ''
                }`} 
              />
            </button>

            <ul className={`space-y-2 text-xs text-slate-400 ${
              mobileExpandedSection === 'catalog' ? 'block pt-1' : 'hidden md:block'
            }`}>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('All'); navigateTo('catalog'); }} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center justify-between text-left w-full group"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    <span>All Winning Products</span>
                  </span>
                  <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">NEW</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('Home Innovation'); navigateTo('catalog'); }} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center justify-between text-left w-full group"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    <span>Home Innovation & Living</span>
                  </span>
                  <span className="text-[9px] font-black bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">HOT</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('Smart Gadgets'); navigateTo('catalog'); }} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  <span>Smart Gadgets & Automation</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('Tech & Audio'); navigateTo('catalog'); }} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  <span>Tech, Audio & Wearables</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('Personal Care'); navigateTo('catalog'); }} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  <span>Personal Care & Wellness</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { navigateTo('catalog'); }} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center justify-between text-left w-full group"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    <span>Trending Deals & Bundles</span>
                  </span>
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">15% OFF</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Self-Service */}
          <div className="border-t border-slate-900 pt-4 md:border-0 md:pt-0 space-y-3">
            <button
              type="button"
              onClick={() => toggleMobileSection('support')}
              className="w-full flex items-center justify-between md:cursor-default text-left group"
            >
              <p className="text-xs font-bold text-white uppercase tracking-wider">Customer Support</p>
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 md:hidden transition-transform duration-200 ${
                  mobileExpandedSection === 'support' ? 'rotate-180 text-amber-400' : ''
                }`} 
              />
            </button>

            <ul className={`space-y-2 text-xs text-slate-400 ${
              mobileExpandedSection === 'support' ? 'block pt-1' : 'hidden md:block'
            }`}>
              <li>
                <button 
                  onClick={() => navigateTo('order-tracking')} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center justify-between text-left w-full group"
                >
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-amber-400" />
                    <span>Track Your Package (Live)</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('my-orders', undefined, 'orders')} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <Package className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <span>My Orders & Invoices</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('shipping-policy')} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  <span>Shipping & Delivery Timelines</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('returns-policy')} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <span>30-Day Returns & Refund Portal</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('faq')} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <span>Frequently Asked Questions</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('contact')} 
                  className="hover:text-amber-400 transition-colors py-1 flex items-center gap-1.5 text-left w-full group"
                >
                  <Headphones className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <span>Contact 24/7 Support Desk</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Get In Touch & Social Channels */}
          <div className="border-t border-slate-900 pt-4 md:border-0 md:pt-0 space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Get In Touch</p>
              <div className="w-8 h-0.5 bg-amber-500 rounded-full" />
            </div>

            {/* Contact Details matching Mobile 'Get In Touch' */}
            <div className="space-y-3 text-xs text-slate-400">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/25">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <p className="leading-relaxed text-[11px] text-slate-300">
                  <span className="font-semibold text-white">Address:</span> Lumina E-Commerce Plaza, Suite 800, New York, NY 10001 USA
                </p>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/25">
                  <WhatsappIcon className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <div className="leading-relaxed text-[11px]">
                  {socialSettings?.whatsapp ? (
                    <a 
                      href={socialSettings.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-emerald-400 text-slate-300 transition-colors font-medium"
                    >
                      +1 (800) 892-4821 • Chat on WhatsApp
                    </a>
                  ) : (
                    <a 
                      href="tel:+18008924821" 
                      className="hover:text-emerald-400 text-slate-300 transition-colors font-medium"
                    >
                      +1 (800) 892-4821 (VIP Concierge)
                    </a>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/25">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="leading-relaxed text-[11px]">
                  <a 
                    href="mailto:support@lumina-store.com" 
                    className="hover:text-amber-400 text-slate-300 transition-colors font-medium"
                  >
                    support@lumina-store.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media Channels - Dynamic from Admin Social Settings */}
            <div className="pt-3 border-t border-slate-900/70 md:border-0 md:pt-1">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{socialSettings?.communityTitle || 'Join Our Community'}</span>
                </p>
                {socialSettings?.communityCount && (
                  <span className="text-[10px] text-amber-400/90 font-bold">
                    {socialSettings.communityCount}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full">
                {/* Facebook */}
                {(socialSettings?.facebookEnabled ?? true) && socialSettings?.facebook && (
                  <a
                    href={socialSettings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Facebook"
                    title="Follow us on Facebook"
                    className="group relative flex items-center justify-center h-9.5 px-3 bg-slate-900/90 hover:bg-[#1877F2] text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-[#1877F2] transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1877F2]/30 active:scale-95 cursor-pointer"
                  >
                    <Facebook className="w-4 h-4 text-[#1877F2] group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                  </a>
                )}

                {/* Instagram */}
                {(socialSettings?.instagramEnabled ?? true) && socialSettings?.instagram && (
                  <a
                    href={socialSettings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Instagram"
                    title="Follow us on Instagram"
                    className="group relative flex items-center justify-center h-9.5 px-3 bg-slate-900/90 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-pink-500/80 transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/30 active:scale-95 cursor-pointer"
                  >
                    <Instagram className="w-4 h-4 text-pink-500 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                  </a>
                )}

                {/* Twitter / X */}
                {(socialSettings?.twitterEnabled ?? true) && socialSettings?.twitter && (
                  <a
                    href={socialSettings.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on X (Twitter)"
                    title="Follow us on X (Twitter)"
                    className="group relative flex items-center justify-center h-9.5 px-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-500 transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Twitter className="w-4 h-4 text-sky-400 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                  </a>
                )}

                {/* TikTok */}
                {(socialSettings?.tiktokEnabled ?? true) && socialSettings?.tiktok && (
                  <a
                    href={socialSettings.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on TikTok"
                    title="Follow us on TikTok"
                    className="group relative flex items-center justify-center h-9.5 px-3 bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-cyan-400 transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95 cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <Music2 className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-all duration-300 group-hover:scale-110" />
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping group-hover:block hidden" />
                    </div>
                  </a>
                )}

                {/* YouTube */}
                {(socialSettings?.youtubeEnabled) && socialSettings?.youtube && (
                  <a
                    href={socialSettings.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Subscribe on YouTube"
                    title="Subscribe on YouTube"
                    className="group relative flex items-center justify-center h-9.5 px-3 bg-slate-900/90 hover:bg-[#FF0000] text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-[#FF0000] transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FF0000]/30 active:scale-95 cursor-pointer"
                  >
                    <Youtube className="w-4 h-4 text-[#FF0000] group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                  </a>
                )}

                {/* WhatsApp */}
                {(socialSettings?.whatsappEnabled ?? true) && socialSettings?.whatsapp && (
                  <a
                    href={socialSettings.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                    title="Chat on WhatsApp"
                    className="group relative flex items-center justify-center h-9.5 px-3 bg-slate-900/90 hover:bg-[#25D366] text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-[#25D366] transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#25D366]/30 active:scale-95 cursor-pointer"
                  >
                    <WhatsappIcon className="w-4 h-4 text-[#25D366] group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                  </a>
                )}

                {/* LinkedIn */}
                {(socialSettings?.linkedinEnabled) && socialSettings?.linkedin && (
                  <a
                    href={socialSettings.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Connect on LinkedIn"
                    title="Connect on LinkedIn"
                    className="group relative flex items-center justify-center h-9.5 px-3 bg-slate-900/90 hover:bg-[#0A66C2] text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-[#0A66C2] transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0A66C2]/30 active:scale-95 cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4 text-[#0A66C2] group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright notice */}
        <div className="pt-3.5 sm:pt-4 border-t border-slate-900/80 text-center text-xs text-slate-500">
          <p>© 2026 {storeBranding?.storeName || 'Lumina'} E-Commerce Ltd. All rights reserved. {storeBranding?.subtitle || 'Engineered for Viral Living & Modern Homes'}.</p>
        </div>

      </div>
      </div>

      {/* ================= MOBILE FOOTER (Structured according to User Reference Image) ================= */}
      <div className={`${activePage === 'cart' ? 'hidden' : 'md:hidden'} bg-[#FAFAF9] text-slate-700 pt-8 pb-20 px-4 border-t border-slate-200/90 relative w-full`}>
        <div className="max-w-md mx-auto space-y-6">
          
          {/* 1. Centered Logo, Store Name & Tagline */}
          <div className="text-center space-y-1.5">
            {storeBranding?.logoType === 'custom_image' && storeBranding?.logoImageUrl ? (
              <div className="flex items-center justify-center">
                <img 
                  src={storeBranding.logoImageUrl} 
                  alt={storeBranding.storeName || 'Store Logo'} 
                  className="h-10 max-w-[170px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-5 h-5 fill-white/20" />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight font-serif uppercase">
                  {storeBranding?.storeName || 'LUMINA'}
                </span>
              </div>
            )}
            <p className="text-[10px] font-extrabold text-amber-600 tracking-widest uppercase">
              {storeBranding?.subtitle || 'WINNING PRODUCTS'}
            </p>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed pt-1 px-2">
              {storeBranding?.storeName || 'Lumina'} discovers and curates viral, high-utility lifestyle products engineered for reliability, modern aesthetics, and daily ease.
            </p>
          </div>

          {/* 2. Centered Social Media Circular Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {/* Facebook */}
            {(socialSettings?.facebookEnabled ?? true) && socialSettings?.facebook && (
              <a
                href={socialSettings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#1877F2] hover:border-[#1877F2] shadow-2xs flex items-center justify-center transition-all active:scale-95"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {/* Instagram */}
            {(socialSettings?.instagramEnabled ?? true) && socialSettings?.instagram && (
              <a
                href={socialSettings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-pink-600 hover:border-pink-500 shadow-2xs flex items-center justify-center transition-all active:scale-95"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {/* Twitter / X */}
            {(socialSettings?.twitterEnabled ?? true) && socialSettings?.twitter && (
              <a
                href={socialSettings.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-500 hover:border-sky-500 shadow-2xs flex items-center justify-center transition-all active:scale-95"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {/* LinkedIn */}
            {((socialSettings?.linkedinEnabled ?? true) && socialSettings?.linkedin) && (
              <a
                href={socialSettings.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#0A66C2] hover:border-[#0A66C2] shadow-2xs flex items-center justify-center transition-all active:scale-95"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {/* WhatsApp */}
            {(socialSettings?.whatsappEnabled ?? true) && socialSettings?.whatsapp && (
              <a
                href={socialSettings.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#25D366] hover:border-[#25D366] shadow-2xs flex items-center justify-center transition-all active:scale-95"
              >
                <WhatsappIcon className="w-4 h-4 text-[#25D366]" />
              </a>
            )}
            {/* YouTube */}
            {socialSettings?.youtubeEnabled && socialSettings?.youtube && (
              <a
                href={socialSettings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe on YouTube"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#FF0000] hover:border-[#FF0000] shadow-2xs flex items-center justify-center transition-all active:scale-95"
              >
                <Youtube className="w-4 h-4 text-[#FF0000]" />
              </a>
            )}
          </div>

          {/* 3. Two-Column Links Grid: "Explore" and "Information" */}
          <div className="grid grid-cols-2 gap-6 pt-3 px-1">
            {/* Left Column: Explore */}
            <div>
              <h4 className="text-base font-bold text-slate-900 tracking-tight">Explore</h4>
              <div className="w-10 h-1 bg-amber-500 rounded-full mt-1.5 mb-3.5" />
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <button 
                    onClick={() => { setSelectedCategory('All'); navigateTo('catalog'); }}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Explore Catalog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedCategory('Home Innovation'); navigateTo('catalog'); }}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Home Living
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedCategory('Smart Gadgets'); navigateTo('catalog'); }}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Smart Gadgets
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedCategory('Tech & Audio'); navigateTo('catalog'); }}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Tech & Audio
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedCategory('Personal Care'); navigateTo('catalog'); }}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Personal Care
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('catalog')}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Trending Deals
                  </button>
                </li>
              </ul>
            </div>

            {/* Right Column: Information */}
            <div>
              <h4 className="text-base font-bold text-slate-900 tracking-tight">Information</h4>
              <div className="w-10 h-1 bg-amber-500 rounded-full mt-1.5 mb-3.5" />
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <button 
                    onClick={() => navigateTo('order-tracking')}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Track Your Order
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('my-orders', undefined, 'orders')}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Order History
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('shipping-policy')}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('returns-policy')}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Returns & Refunds
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('faq')}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    FAQs & Help
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('contact')}
                    className="hover:text-amber-600 transition-colors text-left"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* 4. Distinct "Get In Touch" Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-base font-bold text-slate-900 text-center tracking-tight">Get In Touch</h4>
            <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mt-1.5 mb-4" />

            <div className="space-y-3.5 text-xs">
              {/* Address */}
              <div className="flex items-start gap-3 text-slate-600">
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="leading-relaxed">
                  <span className="font-bold text-slate-800">Address:</span> Lumina E-Commerce Plaza, Suite 800, New York, NY 10001 USA
                </p>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-start gap-3 text-slate-600">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <WhatsappIcon className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <div className="leading-relaxed">
                  {socialSettings?.whatsapp ? (
                    <a 
                      href={socialSettings.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-emerald-700 font-semibold text-slate-800"
                    >
                      +1 (800) 892-4821 • Chat on WhatsApp
                    </a>
                  ) : (
                    <a 
                      href="tel:+18008924821" 
                      className="hover:text-emerald-700 font-semibold text-slate-800"
                    >
                      +1 (800) 892-4821 (VIP Concierge)
                    </a>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 text-slate-600">
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="leading-relaxed">
                  <a 
                    href="mailto:support@lumina-store.com" 
                    className="hover:text-amber-700 font-semibold text-slate-800"
                  >
                    support@lumina-store.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Trust & Verification Row */}
          <div className="pt-3 border-t border-slate-200/80 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Secure Checkout. Verified Quality. 30-Day Guarantee.</span>
            </div>

            {/* Accepted Payment Badges - Mobile Only Specific (UPI, PhonePe, Google Pay, QR Code) */}
            <div className="pt-1 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Accepted Payment Methods</p>
              
              {/* Row 1: The 4 Payment Methods */}
              <div className="flex items-center justify-center gap-2 flex-nowrap overflow-x-auto no-scrollbar py-0.5 max-w-full">
                {/* 1. Official UPI Logo Badge */}
                <div className="px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg shadow-2xs flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-black italic tracking-tighter text-[#23282C] leading-none">
                    UPI
                  </span>
                  <svg viewBox="0 0 25 20" className="w-3.5 h-3 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1L2 19L17 10Z" fill="#F47920" />
                    <path d="M13 1L9 19L24 10Z" fill="#097939" />
                  </svg>
                </div>

                {/* 2. Standard PhonePe Logo Badge */}
                <div className="px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg shadow-2xs flex items-center gap-1 shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#5f259f] flex items-center justify-center text-white text-[8px] font-black shrink-0">
                    पे
                  </div>
                  <span className="text-[11px] font-bold text-[#5f259f] tracking-tight leading-none">PhonePe</span>
                </div>

                {/* 3. Standard Google Pay (GPay) Logo Badge */}
                <div className="px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg shadow-2xs flex items-center gap-1 shrink-0">
                  <div className="flex items-center font-bold text-[11px] tracking-tight leading-none">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                    <span className="text-slate-600 ml-0.5 text-[9px] font-semibold">Pay</span>
                  </div>
                </div>

                {/* 4. Standard QR Code Badge */}
                <div className="px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg shadow-2xs flex items-center gap-1 shrink-0">
                  <QrCode className="w-3 h-3 text-slate-800 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-800 leading-none">QR Pay</span>
                </div>
              </div>

              {/* Row 2: Centered 100% Secure Seal */}
              <div className="flex items-center justify-center pt-0.5">
                <div className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-[10px] font-bold text-emerald-700 shadow-2xs flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                  <span>100% Encrypted & Secure Payments</span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-4 border-t border-slate-200/60">
              <p className="text-[11px] text-slate-500">
                Copyright © 2026 {storeBranding?.storeName || 'Lumina'} E-Commerce Ltd. All Rights Reserved.
              </p>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
};


