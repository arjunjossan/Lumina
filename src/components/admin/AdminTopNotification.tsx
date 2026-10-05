import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { TopNotificationConfig } from '../../types';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { 
  Sparkles, 
  Flame, 
  Tag, 
  Gift, 
  Bell, 
  Truck, 
  ShieldCheck, 
  Check, 
  Clock, 
  Star, 
  Eye, 
  CheckCircle2, 
  Palette, 
  Layers, 
  Radio, 
  ExternalLink,
  ArrowRight,
  Monitor,
  Smartphone,
  Play,
  Zap,
  CheckCircle,
  Save
} from 'lucide-react';
import { DEFAULT_TOP_NOTIFICATION_CONFIG } from '../../data/initialData';

export const AdminTopNotification: React.FC = () => {
  const { 
    topNotificationConfig, 
    updateTopNotificationConfig, 
    showNotification, 
    navigateTo,
    openFlashSalePopup 
  } = useStore();

  const [formData, setFormData] = useState<TopNotificationConfig>({ ...topNotificationConfig });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saveState, setSaveState] = useState<SaveButtonState>('idle');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Sync state if store updates
  useEffect(() => {
    setFormData({ ...topNotificationConfig });
  }, [topNotificationConfig]);

  const handleChange = <K extends keyof TopNotificationConfig>(field: K, value: TopNotificationConfig[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (preset: TopNotificationConfig['themePreset']) => {
    let customBg = '#0f172a';
    let customText = '#f8fafc';
    let customAccent = '#fcd34d';

    if (preset === 'amber') {
      customBg = '#78350f';
      customText = '#fef3c7';
      customAccent = '#fde047';
    } else if (preset === 'emerald') {
      customBg = '#064e3b';
      customText = '#ecfdf5';
      customAccent = '#6ee7b7';
    } else if (preset === 'indigo') {
      customBg = '#1e1b4b';
      customText = '#e0e7ff';
      customAccent = '#a5b4fc';
    } else if (preset === 'crimson') {
      customBg = '#7f1d1d';
      customText = '#ffe4e6';
      customAccent = '#fca5a5';
    } else if (preset === 'dark') {
      customBg = '#0f172a';
      customText = '#f8fafc';
      customAccent = '#fcd34d';
    }

    setFormData((prev) => ({
      ...prev,
      themePreset: preset,
      customBgColor: customBg,
      customTextColor: customText,
      customAccentColor: customAccent
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState('saving');
    try {
      await updateTopNotificationConfig(formData);
      setSaveState('saved');
      setSavedNotice('✓ Top Announcement & Notification bar settings saved and deployed to live storefront!');
      showNotification('✓ Top Notification Bar successfully updated & deployed!');
      setTimeout(() => {
        setSaveState('idle');
      }, 3500);
      setTimeout(() => setSavedNotice(null), 5000);
    } catch (err) {
      setSaveState('idle');
      showNotification('Failed to save top notification settings.');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset the top announcement bar to store default settings?')) {
      setFormData(DEFAULT_TOP_NOTIFICATION_CONFIG);
      await updateTopNotificationConfig(DEFAULT_TOP_NOTIFICATION_CONFIG);
      setSavedNotice('✓ Top Announcement Bar reset to default settings!');
      showNotification('✓ Top Announcement Bar reset to default!');
      setTimeout(() => setSavedNotice(null), 4000);
    }
  };

  const handleTestReactionAction = () => {
    const action = formData.centerLinkAction || 'catalog';
    if (action === 'flash_popup') {
      openFlashSalePopup();
      showNotification('🚀 Reaction triggered: Opened Flash Sale Promo Popup Modal!');
    } else if (action === 'catalog') {
      showNotification('🚀 Reaction target: Opens All Products Catalog page.');
    } else if (action === 'deals') {
      showNotification('🚀 Reaction target: Opens Deals & Featured Highlights on Home.');
    } else {
      showNotification('ℹ️ Reaction target: None (Static text only).');
    }
  };

  const renderLeftIcon = (iconName: string, className = "w-3.5 h-3.5") => {
    switch (iconName) {
      case 'sparkles': return <Sparkles className={`${className} animate-sparkle-twinkle`} />;
      case 'flame': return <Flame className={`${className} text-orange-400 animate-flame-flicker`} />;
      case 'tag': return <Tag className={`${className} animate-tag-swing`} />;
      case 'gift': return <Gift className={`${className} animate-gift-pop`} />;
      case 'bell': return <Bell className={`${className} animate-bell-ring`} />;
      default: return null;
    }
  };

  const renderRightIcon = (iconName: string, className = "w-3 h-3") => {
    switch (iconName) {
      case 'truck': return <Truck className={`${className} text-emerald-400 animate-truck-drive`} />;
      case 'shield': return <ShieldCheck className={`${className} text-sky-400 animate-shield-pulse`} />;
      case 'check': return <Check className={`${className} text-emerald-400 animate-check-bounce`} />;
      case 'clock': return <Clock className={`${className} text-amber-400 animate-clock-tick`} />;
      case 'star': return <Star className={`${className} text-yellow-400 fill-yellow-400 animate-star-twinkle`} />;
      default: return null;
    }
  };

  const currentBg = formData.customBgColor || '#0f172a';
  const currentText = formData.customTextColor || '#f8fafc';
  const currentAccent = formData.customAccentColor || '#fcd34d';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Live Storefront Header
            </span>
            <span className="text-xs text-slate-500">• Synced with Database</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-serif">Top Notification & Announcement Bar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize the header banner that appears at the very top of your store. Changes instantly sync to live customers and the database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminSaveButton
            type="button"
            onClick={handleSubmit}
            saveState={saveState}
            idleText="Save & Deploy Bar"
            savingText="Deploying..."
            savedText="Deployed & Live!"
            idleIcon={<Save className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Saved Notification Prompt Banner */}
      {savedNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-300 text-xs font-bold shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{savedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedNotice(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Live Preview Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Real-Time Storefront Preview</h3>
            {!formData.enabled && (
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Bar Disabled (Hidden)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestReactionAction}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Test the configured action target"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Test Click Reaction</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Banner Mockup */}
        <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-md' : 'w-full'}`}>
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
            {formData.enabled ? (
              <div 
                style={{ backgroundColor: currentBg, color: currentText }}
                className="relative text-xs font-medium py-2.5 px-4 text-center flex items-center justify-between sm:justify-center gap-4 transition-colors select-none overflow-hidden"
              >
                {/* Animated Highlight Wave from Left to Right */}
                <div 
                  className="absolute inset-y-0 w-2/3 pointer-events-none animate-notification-sweep z-0"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${currentAccent}22 25%, rgba(255, 255, 255, 0.28) 50%, ${currentAccent}2e 75%, transparent 100%)`
                  }}
                />

                {/* Secondary animated radiant shimmer layer */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40 z-0 animate-flow-right"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, ${currentAccent}33 50%, rgba(255,255,255,0.06) 70%, transparent 100%)`
                  }}
                />

                {/* Animated glowing accent beam along bottom border */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none overflow-hidden z-0"
                  style={{ backgroundColor: `${currentAccent}26` }}
                >
                  <div 
                    className="h-full w-1/3 animate-notification-beam"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${currentAccent}, #ffffff, ${currentAccent}, transparent)`
                    }}
                  />
                </div>

                {/* Animated subtle light beam along top border */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none overflow-hidden z-0"
                  style={{ backgroundColor: `${currentAccent}1a` }}
                >
                  <div 
                    className="h-full w-1/4 animate-notification-beam"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${currentAccent}cc, transparent)`
                    }}
                  />
                </div>

                {/* Left Badge */}
                {formData.leftBadgeText && (
                  <div 
                    style={{ color: currentAccent }}
                    className="relative z-10 hidden sm:flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-90"
                    onClick={handleTestReactionAction}
                    title="Click to test action reaction"
                  >
                    {renderLeftIcon(formData.leftBadgeIcon)}
                    <span className="font-semibold tracking-wide uppercase text-[11px]">{formData.leftBadgeText}</span>
                  </div>
                )}

                {/* Center Announcement Message */}
                <p 
                  onClick={handleTestReactionAction}
                  className="relative z-10 flex items-center justify-center gap-2 text-center flex-1 cursor-pointer hover:opacity-95"
                  title="Click to test action reaction"
                >
                  <span>{formData.centerMessage}</span>
                  {formData.centerHighlightText && (
                    <span 
                      style={{ color: currentAccent }}
                      className="font-bold underline cursor-pointer hover:opacity-80 transition-opacity ml-1"
                    >
                      {formData.centerHighlightText}
                    </span>
                  )}
                </p>

                {/* Right Trust Badges */}
                <div className="relative z-10 hidden md:flex items-center gap-4 text-slate-400 text-[11px] shrink-0">
                  {formData.rightTag1Text && (
                    <span className="flex items-center gap-1 text-slate-300">
                      {renderRightIcon(formData.rightTag1Icon)}
                      <span>{formData.rightTag1Text}</span>
                    </span>
                  )}
                  {formData.rightTag2Text && (
                    <span className="flex items-center gap-1 text-slate-300">
                      {renderRightIcon(formData.rightTag2Icon)}
                      <span>{formData.rightTag2Text}</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 font-mono">
                [Top Notification Bar is currently switched OFF — will not render in storefront]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Toggle Switch */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white">Enable Top Announcement Bar</h3>
            <p className="text-xs text-slate-400">
              When turned on, this notification banner sits at the very top of every page above the main navigation bar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('enabled', !formData.enabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
              formData.enabled ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-slate-950 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                formData.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Content Configuration Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Banner Content & Text Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Center Announcement Message */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Main Announcement Message <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.centerMessage}
                onChange={(e) => handleChange('centerMessage', e.target.value)}
                placeholder="e.g. 🔥 Limited Stock Available — Free Express Worldwide Shipping Over ₹999"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                required
              />
              <p className="text-[11px] text-slate-500">Emojis (🔥, ✨, ⚡, 🎁) and special characters are fully supported.</p>
            </div>

            {/* Clickable Highlight Link Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Action / Call-to-Action Link Text (Optional)
              </label>
              <input
                type="text"
                value={formData.centerHighlightText || ''}
                onChange={(e) => handleChange('centerHighlightText', e.target.value)}
                placeholder="e.g. Claim Deals, Shop Now, Learn More"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Link Action */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Click Action Target / Reaction
                </label>
                <button
                  type="button"
                  onClick={handleTestReactionAction}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Test Target Reaction</span>
                </button>
              </div>
              <select
                value={formData.centerLinkAction || 'catalog'}
                onChange={(e) => handleChange('centerLinkAction', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
              >
                <option value="flash_popup">⚡ Flash Sale Promo Popup Modal (Opens Discount Box)</option>
                <option value="catalog">🛍️ Open All Products Catalog Page</option>
                <option value="deals">🔥 Open Deals & Featured Highlights on Home</option>
                <option value="none">🚫 None (Static Announcement Only)</option>
              </select>
            </div>

            {/* Left Badge Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Left Badge Text
              </label>
              <input
                type="text"
                value={formData.leftBadgeText}
                onChange={(e) => handleChange('leftBadgeText', e.target.value)}
                placeholder="e.g. LUMINA EXCLUSIVE DEALS"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Left Badge Icon */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Left Badge Icon
              </label>
              <select
                value={formData.leftBadgeIcon}
                onChange={(e) => handleChange('leftBadgeIcon', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="sparkles">✨ Sparkles (Animated Pulse)</option>
                <option value="flame">🔥 Flame Fire</option>
                <option value="tag">🏷️ Promo Tag</option>
                <option value="gift">🎁 Gift Box</option>
                <option value="bell">🔔 Notification Bell</option>
                <option value="none">No Icon</option>
              </select>
            </div>

            {/* Right Tag 1 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Right Trust Tag 1 (Desktop)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.rightTag1Text || ''}
                  onChange={(e) => handleChange('rightTag1Text', e.target.value)}
                  placeholder="e.g. 2-Day Delivery"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <select
                  value={formData.rightTag1Icon || 'truck'}
                  onChange={(e) => handleChange('rightTag1Icon', e.target.value as any)}
                  className="w-28 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="truck">🚚 Truck</option>
                  <option value="shield">🛡️ Shield</option>
                  <option value="check">✅ Check</option>
                  <option value="clock">⏱️ Clock</option>
                  <option value="star">⭐ Star</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            {/* Right Tag 2 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Right Trust Tag 2 (Desktop)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.rightTag2Text || ''}
                  onChange={(e) => handleChange('rightTag2Text', e.target.value)}
                  placeholder="e.g. 30-Day Guarantee"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <select
                  value={formData.rightTag2Icon || 'shield'}
                  onChange={(e) => handleChange('rightTag2Icon', e.target.value as any)}
                  className="w-28 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="shield">🛡️ Shield</option>
                  <option value="truck">🚚 Truck</option>
                  <option value="check">✅ Check</option>
                  <option value="clock">⏱️ Clock</option>
                  <option value="star">⭐ Star</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Color & Theme Styling Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Color Themes & Visual Styling</h3>
          </div>

          {/* Quick Theme Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Theme Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => handleApplyPreset('dark')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  formData.themePreset === 'dark' ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/20' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <div className="w-full h-4 rounded-md bg-slate-900 border border-slate-700 mb-2 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                </div>
                <p className="text-xs font-bold text-white">Midnight Slate</p>
                <p className="text-[10px] text-slate-400">Default Dark</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('amber')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  formData.themePreset === 'amber' ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/20' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <div className="w-full h-4 rounded-md bg-amber-900 border border-amber-700 mb-2 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-yellow-300"></span>
                </div>
                <p className="text-xs font-bold text-white">Golden Amber</p>
                <p className="text-[10px] text-slate-400">Warm Luxury</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('emerald')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  formData.themePreset === 'emerald' ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/20' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <div className="w-full h-4 rounded-md bg-emerald-950 border border-emerald-800 mb-2 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs font-bold text-white">Emerald Forest</p>
                <p className="text-[10px] text-slate-400">Fresh Green</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('indigo')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  formData.themePreset === 'indigo' ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/20' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <div className="w-full h-4 rounded-md bg-indigo-950 border border-indigo-800 mb-2 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-300"></span>
                </div>
                <p className="text-xs font-bold text-white">Royal Indigo</p>
                <p className="text-[10px] text-slate-400">Deep Blue</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('crimson')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  formData.themePreset === 'crimson' ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/20' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <div className="w-full h-4 rounded-md bg-rose-950 border border-rose-800 mb-2 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                </div>
                <p className="text-xs font-bold text-white">Ruby Crimson</p>
                <p className="text-[10px] text-slate-400">Urgent Sale</p>
              </button>
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Background Color</label>
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                <input
                  type="color"
                  value={formData.customBgColor || '#0f172a'}
                  onChange={(e) => {
                    handleChange('customBgColor', e.target.value);
                    handleChange('themePreset', 'custom');
                  }}
                  className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={formData.customBgColor || '#0f172a'}
                  onChange={(e) => {
                    handleChange('customBgColor', e.target.value);
                    handleChange('themePreset', 'custom');
                  }}
                  className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Main Text Color</label>
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                <input
                  type="color"
                  value={formData.customTextColor || '#f8fafc'}
                  onChange={(e) => {
                    handleChange('customTextColor', e.target.value);
                    handleChange('themePreset', 'custom');
                  }}
                  className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={formData.customTextColor || '#f8fafc'}
                  onChange={(e) => {
                    handleChange('customTextColor', e.target.value);
                    handleChange('themePreset', 'custom');
                  }}
                  className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Badge & Accent Color</label>
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                <input
                  type="color"
                  value={formData.customAccentColor || '#fcd34d'}
                  onChange={(e) => {
                    handleChange('customAccentColor', e.target.value);
                    handleChange('themePreset', 'custom');
                  }}
                  className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={formData.customAccentColor || '#fcd34d'}
                  onChange={(e) => {
                    handleChange('customAccentColor', e.target.value);
                    handleChange('themePreset', 'custom');
                  }}
                  className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Save Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {savedNotice ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> {savedNotice}
              </span>
            ) : (
              <span>Changes will immediately reflect in both preview and the live storefront header.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-800 cursor-pointer"
            >
              Reset to Default
            </button>
            <AdminSaveButton
              type="submit"
              saveState={saveState}
              idleText="Save & Deploy Notification Bar"
              savingText="Deploying to Storefront..."
              savedText="Deployed & Live in Storefront!"
              idleIcon={<Check className="w-4 h-4" />}
              size="lg"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
