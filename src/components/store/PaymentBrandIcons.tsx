import React from 'react';
import { ShieldCheck, Zap, Users, Wallet } from 'lucide-react';

// Google Pay Official Interlocking 4-Color Ribbons Vector Icon (Exact match to uploaded reference)
export const GooglePayIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-7 h-7", size }) => (
  <svg 
    viewBox="0 0 48 48" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(24, 24) rotate(-45) translate(-24, -24)">
      {/* 1. Green top arch */}
      <path
        d="M13 18C13 11.925 17.925 7 24 7C30.075 7 35 11.925 35 18V24H27V18C27 16.343 25.657 15 24 15C22.343 15 21 16.343 21 18V28H13V18Z"
        fill="#34A853"
      />
      {/* 2. Red right pill */}
      <path
        d="M27 18C27 13.582 30.582 10 35 10C39.418 10 43 13.582 43 18V30C43 34.418 39.418 38 35 38C30.582 38 27 34.418 27 30V18Z"
        fill="#EA4335"
      />
      {/* 3. Blue left pill */}
      <path
        d="M5 18C5 13.582 8.582 10 13 10C17.418 10 21 13.582 21 18V30C21 34.418 17.418 38 13 38C8.582 38 5 34.418 5 30V18Z"
        fill="#4285F4"
      />
      {/* 4. Yellow bottom arch */}
      <path
        d="M13 30V20H21V30C21 31.657 22.343 33 24 33C25.657 33 27 31.657 27 30V20H35V30C35 36.075 30.075 41 24 41C17.925 41 13 36.075 13 30Z"
        fill="#FBBC04"
      />
    </g>
  </svg>
);

// BHIM UPI Official Tricolor Geometry Icon
export const BhimUpiTrianglesIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-7 h-7", size }) => (
  <svg 
    viewBox="0 0 44 44" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left Saffron / Orange Triangle */}
    <path 
      d="M12.5 33.5L25.5 9.5L18.5 33.5H12.5Z" 
      fill="#F37023" 
    />
    {/* Right Green Triangle */}
    <path 
      d="M20.5 33.5L33.5 9.5L26.5 33.5H20.5Z" 
      fill="#00A859" 
    />
  </svg>
);

// UPI (Unified Payments Interface) Official Vector Logo
export const UpiIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size }) => (
  <svg 
    viewBox="0 0 48 48" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="48" rx="10" fill="#097939" fillOpacity="0.1" />
    <path d="M14 11L28 24L14 37" stroke="#00B050" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 11L36 24L22 37" stroke="#F37023" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// PhonePe Official Devanagari Pe Icon
export const PhonePeIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-6 h-6", size }) => (
  <svg 
    viewBox="0 0 44 44" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* PhonePe Purple Circle */}
    <circle cx="22" cy="22" r="22" fill="#5F259F" />
    {/* White 'पे' Calligraphic Glyph */}
    <g transform="translate(11, 10)">
      {/* Top Bar */}
      <path d="M2.5 4.5H19.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      {/* Matra (Upper Vowel Stroke) */}
      <path d="M14.5 4.5C14.5 4.5 13 0.5 9.5 0.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* 'प' Letter Loop and Stem */}
      <path
        d="M4.5 4.5V11.5C4.5 14.5 7 17 10 17H14.5M14.5 4.5V23.5"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Diagonal Kick */}
      <path
        d="M10 16.5L18.5 24"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

// Paytm Official Logo
export const PaytmIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-8 h-4", size }) => (
  <svg 
    viewBox="0 0 68 24" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 'pay' in dark navy #002E6E */}
    {/* p */}
    <path
      d="M4 4h7.5c3.6 0 6.2 2.5 6.2 5.8 0 3.3-2.6 5.8-6.2 5.8H7.6V20H4V4zm3.6 8.5h3.8c1.7 0 2.8-1.2 2.8-2.7 0-1.5-1.1-2.7-2.8-2.7H7.6v5.4z"
      fill="#002E6E"
    />
    {/* a */}
    <path
      d="M21.5 8.5h3.6V20h-3.6v-1.6c-.8 1.2-2.2 1.8-3.8 1.8-2.8 0-4.8-1.9-4.8-4.8 0-2.8 2-4.7 4.8-4.7 1.6 0 3 .6 3.8 1.8V8.5zm-3.6 8.7c1.5 0 2.6-1.1 2.6-2.5 0-1.4-1.1-2.5-2.6-2.5-1.5 0-2.6 1.1-2.6 2.5 0 1.4 1.1 2.5 2.6 2.5z"
      fill="#002E6E"
    />
    {/* y */}
    <path
      d="M26.8 8.5h3.8l2.7 7.2 2.7-7.2h3.8L34 22.8c-1 2.7-2.6 3.7-5.2 3.7h-1.6v-3h1.2c1.3 0 2-.4 2.5-1.8l.3-.7-4.4-12.5z"
      fill="#002E6E"
    />
    {/* 'tm' in light cyan #00BAF2 */}
    {/* t */}
    <path
      d="M44.5 4h3.6v4.5h3.2v3h-3.2v4.8c0 .9.5 1.4 1.5 1.4h1.7V20h-2.6c-3 0-4.2-1.6-4.2-4.4V11.5h-2.2v-3h2.2V4z"
      fill="#00BAF2"
    />
    {/* m */}
    <path
      d="M54.5 8.5h3.6v1.8c.8-1.3 2.1-2 3.6-2 1.8 0 3.2.9 3.7 2.4.9-1.5 2.4-2.4 4.2-2.4 2.6 0 4 1.6 4 4.5V20H70v-6.8c0-1.3-.6-1.9-1.8-1.9-1.1 0-1.8.7-1.8 1.9V20h-3.6v-6.8c0-1.3-.6-1.9-1.8-1.9-1.1 0-1.8.7-1.8 1.9V20h-3.6V8.5z"
      fill="#00BAF2"
    />
  </svg>
);

// Visa Official Icon
export const VisaIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-4", size }) => (
  <svg 
    viewBox="0 0 48 32" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="32" rx="6" fill="#1A1F71" />
    <path
      d="M19.2 21.8l2.5-12h3.3l-2.5 12h-3.3zm13.8-11.7c-.7-.3-1.8-.5-3.1-.5-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.3.6 1.8 1 1.8 1.6 0 .9-1.1 1.3-2.1 1.3-1.4 0-2.2-.2-3.4-.7l-.5-.2-.5 3.1c.8.4 2.4.7 4 .7 3.6 0 6-1.8 6-4.5 0-1.5-.9-2.7-2.9-3.6-1.2-.6-2-1-2-1.6 0-.6.6-1.1 2-1.1 1.1 0 2 .2 2.6.5l.3.2.6-3.4zM39.6 9.8h-2.6c-.8 0-1.4.2-1.8 1.1l-5.1 10.9h3.5l.7-1.9h4.3l.4 1.9h3.1l-2.5-12zm-4.4 7.5l1.7-4.7.9 4.7h-2.6zM15.4 9.8l-3.2 8.2-.3-1.7c-.6-2-2.3-4.2-4.3-5.2l2.8 10.7h3.5l5.2-12h-3.7z"
      fill="#FFFFFF"
    />
    <path
      d="M7.6 11.1c-1.4-.5-2.7-.8-3.6-.9l.3 1.7c1.7.5 3.4 2.3 4 3.7l2.8-4.5h-3.5z"
      fill="#F7B600"
    />
  </svg>
);

// Mastercard Official Icon
export const MastercardIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-4", size }) => (
  <svg 
    viewBox="0 0 48 32" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="32" rx="6" fill="#141414" />
    <circle cx="18" cy="16" r="9" fill="#EB001B" />
    <circle cx="30" cy="16" r="9" fill="#F79E1B" fillOpacity="0.95" />
    <path
      d="M24 9.8a8.97 8.97 0 0 0-3.6 6.2 8.97 8.97 0 0 0 3.6 6.2 8.97 8.97 0 0 0 3.6-6.2c0-2.4-1-4.7-2.6-6.2"
      fill="#FF5F00"
    />
  </svg>
);

// RuPay Official Icon
export const RuPayIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-4", size }) => (
  <svg 
    viewBox="0 0 48 32" 
    width={size} 
    height={size} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="32" rx="6" fill="#0C2340" />
    <path d="M12 9h6c3 0 5 1.5 5 4s-2 4-5 4h-3v6h-3V9zm3 5.5h2.8c1.3 0 2.2-.6 2.2-1.5s-.9-1.5-2.2-1.5H15v3z" fill="#FFFFFF" />
    <path d="M23 16l4 7h3.5l-4.5-7.5c2-1 3-2.5 3-4.5 0-3-2.5-4-5.5-4H20v14h3v-5zm0-2.5v-3h1.5c1.5 0 2.5.5 2.5 1.5s-1 1.5-2.5 1.5H23z" fill="#FFFFFF" />
    {/* RuPay Tricolor Accents */}
    <path d="M35 8l-3 16h3.5l3-16H35z" fill="#00A551" />
    <path d="M39 8l-3 16h3.5l3-16H39z" fill="#F37023" />
  </svg>
);

// Netbanking Bank Logos
export const HdfcBankIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#004C8F" />
    <rect x="6" y="6" width="20" height="20" fill="#ED232A" rx="3" />
    <rect x="10" y="10" width="12" height="12" fill="#FFFFFF" rx="2" />
    <rect x="13" y="6" width="6" height="20" fill="#004C8F" />
    <rect x="6" y="13" width="20" height="6" fill="#004C8F" />
    <rect x="13" y="13" width="6" height="6" fill="#FFFFFF" />
  </svg>
);

export const SbiBankIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#00B1EA" />
    <circle cx="16" cy="16" r="10" fill="#FFFFFF" />
    <circle cx="16" cy="14" r="5" fill="#00B1EA" />
    <rect x="14.5" y="14" width="3" height="8" fill="#00B1EA" />
  </svg>
);

export const IciciBankIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#F58220" />
    <path d="M16 6a10 10 0 0 0-10 10c0 5.5 4.5 10 10 10s10-4.5 10-10A10 10 0 0 0 16 6zm0 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="#052F5F" />
    <circle cx="16" cy="16" r="3.5" fill="#FFFFFF" />
  </svg>
);

export const AxisBankIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#97144D" />
    <path d="M16 6L7 24h6l4.5-9 4.5 9h6L16 6z" fill="#FFFFFF" />
  </svg>
);

// CRED Icon
export const CredIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#121212" />
    <path d="M8 8h16v16H8V8zm3 3v10h10V11H11zm3 3h4v4h-4v-4z" fill="#FFFFFF" />
  </svg>
);

// Razorpay Official Logo Badge
export const RazorpayBadgeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#0C2340" />
    <path d="M14 28L24 12H18L12 28h2z" fill="#0C83FF" />
    <path d="M20 28l8-12h-4l-6 12h2z" fill="#3395FF" />
  </svg>
);

// Combined Payment Badges Row
export const PaymentBadgesRow: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-slate-800">
          <GooglePayIcon className="w-3.5 h-3.5" />
          <span>GPay</span>
        </span>
        <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-indigo-900">
          <PhonePeIcon className="w-3.5 h-3.5" />
          <span>PhonePe</span>
        </span>
        <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-sky-800">
          <PaytmIcon className="w-3.5 h-3.5" />
          <span>Paytm</span>
        </span>
        <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-emerald-800">
          <UpiIcon className="w-3.5 h-3.5" />
          <span>UPI</span>
        </span>
        <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-slate-800">
          <VisaIcon className="w-4 h-2.5" />
          <MastercardIcon className="w-4 h-2.5" />
        </span>
      </div>
    );
  }

  return <AvailablePaymentMethodsSection />;
};

// Available Payment Methods Section (Matches Reference Design in 2x2 Grid with Exact Typography, Badges, Logos, and Security Banner)
export const AvailablePaymentMethodsSection: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`bg-gradient-to-b from-[#F5F8FE] via-[#FAFBFD] to-[#EFF5FF] p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border border-[#DDE7F5] shadow-[0_8px_30px_rgba(20,119,255,0.04)] space-y-3.5 sm:space-y-4 ${className}`}>
      {/* 1. Header Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Wallet Icon with Radiating Sunburst Dashes + Text */}
        <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
          {/* Blue Circular Wallet Badge with 3 Radiating Accent Dashes */}
          <div className="relative shrink-0 mt-0.5">
            {/* 3 Radiating Accent Dashes (Top-Left & Top) */}
            <svg
              className="absolute -top-2.5 -left-2 w-6 h-6 text-[#1477FF] select-none pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
            >
              <line x1="4" y1="12" x2="8" y2="12" />
              <line x1="6.5" y1="6.5" x2="9.5" y2="9.5" />
              <line x1="12" y1="4" x2="12" y2="8" />
            </svg>

            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#EBF3FF] border border-[#D5E5FF] flex items-center justify-center shadow-xs">
              {/* Rounded Wallet Icon with card notch */}
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-[#1477FF]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3" />
                <circle cx="17.5" cy="14.5" r="1" fill="#1477FF" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Typography */}
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#7183A6] block leading-tight">
              SECURE &amp; FLEXIBLE PAYMENTS
            </span>
            <h3 className="text-base sm:text-xl md:text-2xl font-black text-[#101A3A] tracking-tight leading-tight mt-0.5">
              Available Payment Methods
            </h3>
            <p className="text-[11px] sm:text-xs md:text-[13px] text-[#7183A6] font-medium leading-snug mt-1">
              Pay using any of the following UPI apps.<br className="hidden sm:inline" /> Fast, safe and hassle-free!
            </p>
          </div>
        </div>

        {/* Right: 100% Secure Green Shield Pill / Badge */}
        <div className="flex flex-col items-center shrink-0 pl-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E6F8EE] border border-[#C2F0D5] flex items-center justify-center text-[#00A859] shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#00A859] text-white flex items-center justify-center shadow-xs">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#00A859] text-center tracking-tight leading-tight mt-1">
            100%<br />SECURE<br />PAYMENTS
          </span>
        </div>
      </div>

      {/* 2. 2x2 Payment Methods Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* 1. Google Pay Card */}
        <div className="bg-white/95 backdrop-blur-xs rounded-[18px] sm:rounded-[22px] border border-[#DDE7F5] p-3 sm:p-4 shadow-[0_2px_12px_rgba(20,119,255,0.03)] hover:shadow-[0_6px_20px_rgba(20,119,255,0.08)] hover:border-[#BFD6F6] transition-all duration-200 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Google Pay Logo in soft light blue circle */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EBF3FF] border border-[#D5E5FF] flex items-center justify-center shrink-0 shadow-2xs">
                <GooglePayIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm md:text-base font-black text-[#101A3A] leading-tight truncate">
                  Google Pay
                </h4>
                <p className="text-[10px] sm:text-xs text-[#7183A6] font-medium truncate mt-0.5">
                  Instant UPI 1-Tap
                </p>
              </div>
            </div>

            {/* Circular Chevron Arrow Button */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EBF3FF] text-[#1477FF] flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Benefit Badge: Fast & Secure */}
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 bg-[#E8F3FF] text-[#1477FF] border border-[#CDE3FF] px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>Fast &amp; Secure</span>
            </span>
          </div>
        </div>

        {/* 2. PhonePe Card */}
        <div className="bg-white/95 backdrop-blur-xs rounded-[18px] sm:rounded-[22px] border border-[#DDE7F5] p-3 sm:p-4 shadow-[0_2px_12px_rgba(20,119,255,0.03)] hover:shadow-[0_6px_20px_rgba(95,37,159,0.08)] hover:border-[#DDD6FE] transition-all duration-200 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* PhonePe Purple Circle Logo */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F5EEFD] border border-[#E9D5FF] flex items-center justify-center shrink-0 shadow-2xs">
                <PhonePeIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm md:text-base font-black text-[#101A3A] leading-tight truncate">
                  PhonePe
                </h4>
                <p className="text-[10px] sm:text-xs text-[#7183A6] font-medium truncate mt-0.5">
                  UPI &amp; Wallet
                </p>
              </div>
            </div>

            {/* Circular Chevron Arrow Button */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EBF3FF] text-[#1477FF] flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Benefit Badge: Trusted by Millions */}
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 bg-[#F4EBFF] text-[#7E22CE] border border-[#E9D5FF] px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2.4} />
              <span>Trusted by Millions</span>
            </span>
          </div>
        </div>

        {/* 3. Paytm UPI Card */}
        <div className="bg-white/95 backdrop-blur-xs rounded-[18px] sm:rounded-[22px] border border-[#DDE7F5] p-3 sm:p-4 shadow-[0_2px_12px_rgba(20,119,255,0.03)] hover:shadow-[0_6px_20px_rgba(0,186,242,0.08)] hover:border-[#BAE6FD] transition-all duration-200 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Paytm Logo in soft light blue circle */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EBF5FF] border border-[#D5E5FF] flex items-center justify-center shrink-0 px-1 shadow-2xs">
                <PaytmIcon className="w-7 h-3.5 sm:w-8 sm:h-4" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm md:text-base font-black text-[#101A3A] leading-tight truncate">
                  Paytm UPI
                </h4>
                <p className="text-[10px] sm:text-xs text-[#7183A6] font-medium truncate mt-0.5">
                  Fast Scan &amp; Pay
                </p>
              </div>
            </div>

            {/* Circular Chevron Arrow Button */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EBF3FF] text-[#1477FF] flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Benefit Badge: Quick Payments */}
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 bg-[#E8F3FF] text-[#1477FF] border border-[#CDE3FF] px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>Quick Payments</span>
            </span>
          </div>
        </div>

        {/* 4. BHIM UPI Card */}
        <div className="bg-white/95 backdrop-blur-xs rounded-[18px] sm:rounded-[22px] border border-[#DDE7F5] p-3 sm:p-4 shadow-[0_2px_12px_rgba(20,119,255,0.03)] hover:shadow-[0_6px_20px_rgba(0,168,89,0.08)] hover:border-[#A7F3D0] transition-all duration-200 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* BHIM UPI Tricolor Triangles in soft mint circle */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EBF8F2] border border-[#D1F2E2] flex items-center justify-center shrink-0 shadow-2xs">
                <BhimUpiTrianglesIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm md:text-base font-black text-[#101A3A] leading-tight truncate">
                  BHIM UPI
                </h4>
                <p className="text-[10px] sm:text-xs text-[#7183A6] font-medium truncate mt-0.5">
                  Any UPI App
                </p>
              </div>
            </div>

            {/* Circular Chevron Arrow Button */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EBF3FF] text-[#1477FF] flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Benefit Badge: Government Verified */}
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 bg-[#E8F8F0] text-[#059669] border border-[#C2EFE0] px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2.4} />
              <span>Government Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Security Banner with Decorative Curved Waves */}
      <div className="bg-[#EBF9F1] border border-[#C7F0D8] p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] flex items-center gap-3 sm:gap-3.5 relative overflow-hidden shadow-2xs">
        {/* Subtle Decorative Curved Vector Waves on the Right */}
        <svg
          className="absolute -right-2 -bottom-2 w-36 sm:w-44 h-16 sm:h-20 pointer-events-none opacity-50 text-[#34D399]"
          viewBox="0 0 180 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 45 C 50 15, 110 55, 180 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M15 52 C 65 24, 120 62, 180 25"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M35 58 C 85 32, 135 65, 180 35"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>

        {/* Green Shield with Checkmark Icon */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#00A859] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="w-px h-8 bg-[#A7F3D0] shrink-0 z-10" />

        {/* Text */}
        <div className="min-w-0 z-10">
          <h4 className="text-xs sm:text-sm md:text-[15px] font-black text-[#0B7844] leading-tight">
            Your payment is 100% secure
          </h4>
          <p className="text-[10px] sm:text-xs text-[#527E6A] font-medium leading-tight mt-0.5">
            We use trusted and encrypted payment partners.
          </p>
        </div>
      </div>

      {/* 4. Bottom 3 Trust Row */}
      <div className="flex items-center justify-between pt-1 sm:pt-1.5 text-[#101A3A] text-[11px] sm:text-xs md:text-[13px] font-bold">
        {/* Item 1: Fast Payments */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1477FF]" strokeWidth={2.4} />
          <span className="truncate">Fast Payments</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 sm:h-5 bg-[#DCE7F5] shrink-0" />

        {/* Item 2: Secure Transactions */}
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1477FF]" strokeWidth={2.4} />
          <span className="truncate">Secure Transactions</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 sm:h-5 bg-[#DCE7F5] shrink-0" />

        {/* Item 3: Trusted by Millions */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1477FF]" strokeWidth={2.4} />
          <span className="truncate">Trusted by Millions</span>
        </div>
      </div>
    </div>
  );
};
