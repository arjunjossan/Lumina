import React, { useState, useId } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  ShieldCheck, 
  Radio, 
  Building2, 
  Home, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';

interface PackageTrackingMapProps {
  order: Order;
  className?: string;
}

export const PackageTrackingMap: React.FC<PackageTrackingMapProps> = ({ order, className = '' }) => {
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gradientId = useId();

  const destinationCity = order.shippingAddress?.city || 'Destination';
  const destinationState = order.shippingAddress?.state || '';
  const destinationAddress = `${order.shippingAddress?.address || ''}, ${destinationCity}, ${destinationState} ${order.shippingAddress?.zipCode || ''}`;
  
  // Origin fulfillment center
  const originHub = {
    name: 'National Logistics Hub',
    city: 'Central Distribution Center',
    code: 'HUB-01',
    x: 100,
    y: 280,
  };

  // Destination coordinates on stylized 800x400 canvas
  const destinationPoint = {
    name: `${destinationCity} Delivery Point`,
    city: `${destinationCity}${destinationState ? `, ${destinationState}` : ''}`,
    code: order.shippingAddress?.zipCode ? `ZIP ${order.shippingAddress.zipCode}` : 'DEST',
    x: 700,
    y: 130,
  };

  // Waypoints along the journey
  const waypoints = [
    {
      id: 0,
      title: 'Fulfillment & Sorting Hub',
      city: 'Central Distribution Center',
      status: 'Departed Facility',
      time: 'Day 1 - 09:30 AM',
      x: 100,
      y: 280,
      completed: true,
      description: 'Order inspected, packed, barcoded, and dispatched.',
    },
    {
      id: 1,
      title: 'Regional Freight Corridor Hub',
      city: 'Intermodal Transit Center',
      status: 'Transferred via Linehaul',
      time: 'Day 2 - 04:15 PM',
      x: 310,
      y: 220,
      completed: order.status === 'Shipped' || order.status === 'Delivered',
      description: 'Package arrived at regional hub and scanned onto outbound expressway carrier.',
    },
    {
      id: 2,
      title: 'Metro Sorting Facility',
      city: `${destinationCity} Gateway Hub`,
      status: 'Processed & Sorted',
      time: 'Day 3 - 06:45 AM',
      x: 520,
      y: 165,
      completed: order.status === 'Shipped' || order.status === 'Delivered',
      description: 'Received at destination metro facility; route assigned to final delivery van.',
    },
    {
      id: 3,
      title: 'Final Delivery Address',
      city: `${destinationCity} (${destinationState || 'Customer Doorstep'})`,
      status: order.status === 'Delivered' ? 'Delivered & Signed' : 'Out for Delivery',
      time: order.status === 'Delivered' ? 'Delivered' : `Estimated ${order.estimatedDelivery || 'Soon'}`,
      x: 700,
      y: 130,
      completed: order.status === 'Delivered',
      description: order.status === 'Delivered' 
        ? 'Package delivered safely to customer doorstep / recipient.' 
        : 'Dispatched with local delivery driver for final delivery attempt.',
    },
  ];

  // Calculate package position based on order status
  let currentProgressPercent = 15; // default pending/processing
  let currentPos = { x: 100, y: 280 };
  let statusBadgeText = 'Order Processing';
  let speedText = 'Awaiting Dispatch';
  let transitStatusDescription = 'Preparing in warehouse fulfillment bay';

  if (order.status === 'Pending') {
    currentProgressPercent = 10;
    currentPos = { x: 100, y: 280 };
    statusBadgeText = 'Order Confirmed';
    speedText = 'Staged at Origin Bay';
    transitStatusDescription = 'Package queued for carrier pickup.';
  } else if (order.status === 'Processing') {
    currentProgressPercent = 25;
    currentPos = { x: 160, y: 260 };
    statusBadgeText = 'Processing & Staged';
    speedText = 'Loading on Carrier';
    transitStatusDescription = 'Shipping label generated; loading onto linehaul truck.';
  } else if (order.status === 'Shipped') {
    currentProgressPercent = 68;
    currentPos = { x: 440, y: 185 };
    statusBadgeText = 'Active In Transit';
    speedText = 'Express Ground • 68 km/h';
    transitStatusDescription = `En route to ${destinationCity} Local Gateway Hub.`;
  } else if (order.status === 'Delivered') {
    currentProgressPercent = 100;
    currentPos = { x: 700, y: 130 };
    statusBadgeText = 'Delivered';
    speedText = 'Completed';
    transitStatusDescription = `Package safely delivered at destination in ${destinationCity}.`;
  }

  const handleCopyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2500);
    }
  };

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Central Fulfillment Center')}&destination=${encodeURIComponent(destinationAddress)}`;

  const isDarkMode = mapTheme === 'dark';

  return (
    <div className={`rounded-3xl border overflow-hidden shadow-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-950 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800'
    } ${isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto' : ''} ${className}`}>
      
      {/* Top Header / Status bar */}
      <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
        isDarkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-100 bg-slate-50/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-xs">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black font-serif tracking-tight">
                Live Package Transit Map
              </h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                order.status === 'Delivered' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                {statusBadgeText}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Carrier: <span className="font-bold text-amber-400">{order.carrier || 'Global Express Logistics'}</span>
              {order.trackingNumber && (
                <> • Tracking: <span className="font-mono font-bold">{order.trackingNumber}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {order.trackingNumber && (
            <button
              onClick={handleCopyTracking}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="Copy Carrier Tracking Code"
            >
              {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedTracking ? 'Copied' : 'Copy Tracking #'}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setMapTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Toggle Map Style (Dark / Light)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Google Maps External View */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="View Route & Directions in Google Maps"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Stylized Map Canvas Container */}
      <div className={`relative w-full h-[320px] sm:h-[400px] overflow-hidden select-none ${
        isDarkMode ? 'bg-[#080d1a]' : 'bg-[#eef2f6]'
      }`}>
        
        {/* Interactive Stylized Vector SVG Map */}
        <div 
          className="w-full h-full transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg 
            viewBox="0 0 800 400" 
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Map Route Gradients */}
              <linearGradient id={`${gradientId}-route`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
              </linearGradient>

              {/* Background Grid Pattern */}
              <pattern id={`${gradientId}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
                <path 
                  d="M 40 0 L 0 0 0 40" 
                  fill="none" 
                  stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} 
                  strokeWidth="1" 
                />
              </pattern>

              {/* Radar pulse animation for current position */}
              <radialGradient id={`${gradientId}-radar`}>
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Grid */}
            <rect width="800" height="400" fill={`url(#${gradientId}-grid)`} />

            {/* Decorative Topographic Land & Highway Contours */}
            <g opacity={isDarkMode ? '0.2' : '0.35'}>
              {/* Major arterial highway grid */}
              <path d="M 0 100 Q 200 80 400 120 T 800 90" fill="none" stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 0 220 Q 300 250 500 200 T 800 260" fill="none" stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" strokeDasharray="6 4" />
              <path d="M 0 320 Q 250 300 600 350 T 800 310" fill="none" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
              <path d="M 180 0 Q 220 200 200 400" fill="none" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
              <path d="M 450 0 Q 430 180 470 400" fill="none" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
              <path d="M 680 0 Q 640 220 690 400" fill="none" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />

              {/* Regional terrain blobs */}
              <path d="M 60 40 C 140 20 200 80 240 120 C 280 160 220 230 160 250 C 90 270 40 210 30 140 Z" fill={isDarkMode ? '#0f172a' : '#e2e8f0'} opacity="0.6" />
              <path d="M 380 60 C 460 30 520 80 560 140 C 600 200 540 260 470 270 C 410 280 360 210 350 130 Z" fill={isDarkMode ? '#0f172a' : '#e2e8f0'} opacity="0.6" />
              <path d="M 590 100 C 670 70 750 110 770 170 C 790 230 730 310 660 310 C 600 310 560 240 570 170 Z" fill={isDarkMode ? '#0f172a' : '#e2e8f0'} opacity="0.6" />
            </g>

            {/* Active Delivery Route Polyline Path (Smooth Bezier Curve) */}
            {/* Background Route Shadow/Glow */}
            <path 
              d="M 100 280 C 220 270 280 230 310 220 C 370 200 450 180 520 165 C 600 150 640 140 700 130" 
              fill="none" 
              stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
              strokeWidth="6" 
              strokeLinecap="round"
            />
            {/* Colored Active Route */}
            <path 
              d="M 100 280 C 220 270 280 230 310 220 C 370 200 450 180 520 165 C 600 150 640 140 700 130" 
              fill="none" 
              stroke={`url(#${gradientId}-route)`} 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray={order.status === 'Delivered' ? 'none' : '8 4'}
              className="animate-pulse"
            />

            {/* Waypoint Nodes along the route */}
            {waypoints.map((wp) => {
              const isSelected = selectedCheckpoint === wp.id;
              return (
                <g 
                  key={wp.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedCheckpoint(isSelected ? null : wp.id)}
                >
                  {/* Outer circle indicator */}
                  <circle 
                    cx={wp.x} 
                    cy={wp.y} 
                    r={isSelected ? "14" : "10"} 
                    fill={isDarkMode ? '#0f172a' : '#ffffff'} 
                    stroke={wp.completed ? '#f59e0b' : (isDarkMode ? '#334155' : '#cbd5e1')} 
                    strokeWidth={isSelected ? "3" : "2"}
                    className="transition-all duration-200 group-hover:scale-125"
                  />
                  {/* Inner node bullet */}
                  <circle 
                    cx={wp.x} 
                    cy={wp.y} 
                    r={isSelected ? "6" : "4"} 
                    fill={wp.completed ? '#f59e0b' : (isDarkMode ? '#475569' : '#94a3b8')} 
                  />

                  {/* Waypoint Label */}
                  <text 
                    x={wp.x} 
                    y={wp.y + 22} 
                    textAnchor="middle" 
                    fill={isDarkMode ? '#94a3b8' : '#475569'} 
                    fontSize="10" 
                    fontWeight="700"
                    className="pointer-events-none select-none font-sans"
                  >
                    {wp.city}
                  </text>
                </g>
              );
            })}

            {/* Origin Marker Badge */}
            <g transform={`translate(${originHub.x - 20}, ${originHub.y - 45})`}>
              <rect 
                width="40" 
                height="22" 
                rx="6" 
                fill={isDarkMode ? '#1e293b' : '#ffffff'} 
                stroke="#f59e0b" 
                strokeWidth="1.5" 
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              />
              <text 
                x="20" 
                y="14" 
                textAnchor="middle" 
                fill={isDarkMode ? '#fbbf24' : '#d97706'} 
                fontSize="9" 
                fontWeight="800"
              >
                ORIGIN
              </text>
            </g>

            {/* Destination Marker Badge */}
            <g transform={`translate(${destinationPoint.x - 24}, ${destinationPoint.y - 45})`}>
              <rect 
                width="48" 
                height="22" 
                rx="6" 
                fill={order.status === 'Delivered' ? '#10b981' : (isDarkMode ? '#1e293b' : '#ffffff')} 
                stroke="#10b981" 
                strokeWidth="1.5" 
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              />
              <text 
                x="24" 
                y="14" 
                textAnchor="middle" 
                fill={order.status === 'Delivered' ? '#ffffff' : '#10b981'} 
                fontSize="9" 
                fontWeight="800"
              >
                DEST
              </text>
            </g>

            {/* Current Real-time Moving Courier Position Indicator */}
            <g transform={`translate(${currentPos.x}, ${currentPos.y})`}>
              {/* Radar pulse wave effect */}
              {order.status !== 'Delivered' && (
                <>
                  <circle cx="0" cy="0" r="28" fill={`url(#${gradientId}-radar)`} className="animate-ping opacity-60" />
                  <circle cx="0" cy="0" r="18" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                </>
              )}

              {/* Marker pin backing */}
              <circle 
                cx="0" 
                cy="0" 
                r="14" 
                fill="#f59e0b" 
                stroke={isDarkMode ? '#0f172a' : '#ffffff'} 
                strokeWidth="2.5" 
                filter="drop-shadow(0 4px 8px rgba(245, 158, 11, 0.5))"
              />

              {/* Vehicle / Package Icon */}
              <g transform="translate(-7, -7)">
                <path 
                  d="M1 3h9v8H1zm9 3h3l2 3v2h-5z" 
                  fill="#020617" 
                />
              </g>
            </g>
          </svg>
        </div>

        {/* Map Control Floating Widget (Zoom In / Out / Center) */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-md transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80' 
                : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.8))}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-md transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80' 
                : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-md transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80' 
                : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200'
            }`}
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live HUD Telemetry Overlay on Bottom Left */}
        <div className="absolute left-4 bottom-4 z-10 max-w-[280px] sm:max-w-xs">
          <div className={`p-3.5 rounded-2xl backdrop-blur-md border shadow-xl ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2 border-current/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-ping" />
                Live Courier Telemetry
              </span>
              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                GPS Active
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold truncate">{transitStatusDescription}</p>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Speed / Mode:</span>
                <span className="font-mono font-bold text-amber-500">{speedText}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Route Progress:</span>
                <span className="font-bold text-emerald-500">{currentProgressPercent}% Completed</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-700/30 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${currentProgressPercent}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Selected Checkpoint Popover */}
        {selectedCheckpoint !== null && (
          <div className="absolute right-4 bottom-4 z-10 max-w-[260px]">
            <div className={`p-3 rounded-2xl backdrop-blur-md border shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
              isDarkMode ? 'bg-slate-900/95 border-amber-500/40 text-slate-100' : 'bg-white/95 border-amber-300 text-slate-900'
            }`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-black text-amber-500">
                  {waypoints[selectedCheckpoint].title}
                </p>
                <button 
                  onClick={() => setSelectedCheckpoint(null)}
                  className="text-slate-400 hover:text-slate-600 text-[10px] font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] font-semibold">{waypoints[selectedCheckpoint].city}</p>
              <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {waypoints[selectedCheckpoint].description}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                {waypoints[selectedCheckpoint].time}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Checkpoints Legend / Transit Details Bar */}
      <div className={`p-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs ${
        isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Origin Facility</p>
            <p className="font-bold truncate">{originHub.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Carrier Network</p>
            <p className="font-bold truncate">{order.carrier || 'Global Express'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Home className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Final Destination</p>
            <p className="font-bold truncate">{destinationCity}{destinationState ? `, ${destinationState}` : ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
