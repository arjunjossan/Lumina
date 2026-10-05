import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreBrandingConfig } from '../../types';
import { DEFAULT_STORE_BRANDING } from '../../context/StoreContext';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Flame, 
  Star, 
  Package, 
  Store, 
  Zap, 
  Crown, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  Sliders, 
  Type, 
  Palette, 
  Eye, 
  Trash2, 
  ExternalLink, 
  Laptop, 
  Smartphone,
  Database
} from 'lucide-react';

export const AdminLogo: React.FC = () => {
  const { storeBranding, updateStoreBranding, supabaseStatus, adminTheme, navigateTo } = useStore();
  
  // Local editable form state
  const [form, setForm] = useState<StoreBrandingConfig>({ ...storeBranding });
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLight = adminTheme === 'light';

  // Handle local form field update
  const handleChange = <K extends keyof StoreBrandingConfig>(field: K, value: StoreBrandingConfig[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  // Handle manual image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP, or GIF).');
      return;
    }

    // Limit to reasonable size for base64 storage (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('Image is larger than 3MB. Please choose an optimized logo image under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setForm(prev => ({
          ...prev,
          logoType: 'custom_image',
          logoImageUrl: dataUrl
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setForm(prev => ({
          ...prev,
          logoType: 'custom_image',
          logoImageUrl: dataUrl
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save to database & store
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateStoreBranding(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save branding:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    if (confirm('Reset store logo, name, and subtitle styling to default LUMINA branding?')) {
      setForm({ ...DEFAULT_STORE_BRANDING });
      updateStoreBranding(DEFAULT_STORE_BRANDING);
    }
  };

  // Render preview icon
  const renderPreviewIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame': return <Flame className="w-5 h-5 fill-white/20" />;
      case 'star': return <Star className="w-5 h-5 fill-white/20" />;
      case 'package': return <Package className="w-5 h-5 fill-white/20" />;
      case 'store': return <Store className="w-5 h-5 fill-white/20" />;
      case 'zap': return <Zap className="w-5 h-5 fill-white/20" />;
      case 'crown': return <Crown className="w-5 h-5 fill-white/20" />;
      default: return <Sparkles className="w-5 h-5 fill-white/20" />;
    }
  };

  const getLetterSpacingClass = (spacing: string) => {
    switch (spacing) {
      case 'tight': return '-0.025em';
      case 'wide': return '0.08em';
      case 'wider': return '0.15em';
      case 'widest': return '0.25em';
      default: return 'normal';
    }
  };

  const getFontWeightVal = (weight: string) => {
    switch (weight) {
      case 'black': return 900;
      case 'extrabold': return 800;
      case 'bold': return 700;
      case 'semibold': return 600;
      case 'medium': return 500;
      default: return 400;
    }
  };

  const getRoundedClass = (rounded: string) => {
    switch (rounded) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-xs';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case '2xl': return 'rounded-2xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-xl';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* LIVE HEADER PREVIEW CARD */}
      <div className={`p-6 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/80 border-slate-700/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Live Real-Time Header Preview</h3>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                previewDevice === 'desktop' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                previewDevice === 'mobile' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>

        {/* Mockup Container */}
        <div className="mt-6 p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/60 rounded-xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 overflow-x-auto">
          <div className={`bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 transition-all ${
            previewDevice === 'mobile' ? 'w-[360px]' : 'w-full max-w-3xl'
          } p-4 flex items-center justify-between gap-4`}>
            
            {/* Live Logo + Brand Name button mockup */}
            <div className="flex items-center gap-3">
              {form.logoType === 'custom_image' && form.logoImageUrl ? (
                <div 
                  className="flex items-center justify-center overflow-hidden transition-transform"
                  style={{ height: `${form.logoHeight || 40}px` }}
                >
                  <img
                    src={form.logoImageUrl}
                    alt={form.storeName}
                    className={`max-h-full object-contain ${getRoundedClass(form.logoRounded)}`}
                    style={{ height: `${form.logoHeight || 40}px` }}
                  />
                </div>
              ) : (
                <div 
                  className={`w-10 h-10 ${getRoundedClass(form.logoRounded)} bg-gradient-to-tr ${form.logoGradient} flex items-center justify-center text-white shadow-md shadow-orange-500/20`}
                >
                  {renderPreviewIcon(form.logoIcon)}
                </div>
              )}

              <div>
                <span
                  className={`block leading-tight font-${
                    form.storeNameFont === 'serif' ? 'serif' : form.storeNameFont === 'mono' ? 'mono' : 'sans'
                  }`}
                  style={{
                    fontSize: `${form.storeNameSize || 24}px`,
                    color: form.storeNameColor || '#0f172a',
                    fontWeight: getFontWeightVal(form.storeNameWeight)
                  }}
                >
                  {form.storeName || 'LUMINA'}
                </span>
                <span
                  className="block leading-none mt-0.5"
                  style={{
                    fontSize: `${form.subtitleFontSize || 10}px`,
                    color: form.subtitleColor || '#d97706',
                    fontWeight: getFontWeightVal(form.subtitleFontWeight),
                    letterSpacing: getLetterSpacingClass(form.subtitleLetterSpacing),
                    fontStyle: form.subtitleStyle === 'italic' ? 'italic' : 'normal',
                    textTransform: (form.subtitleTransform as any) || 'uppercase'
                  }}
                >
                  {form.subtitle || 'WINNING PRODUCTS'}
                </span>
              </div>
            </div>

            {/* Fake Navbar actions to complete visual illusion */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-600">Search products...</span>
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">🛒 0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 1: LOGO UPLOAD & GRAPHIC */}
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/80 border-slate-700/80'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
            <Upload className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold">1. Logo Graphic / Upload</h3>
          </div>

          {/* Logo Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Logo Representation Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('logoType', 'custom_image')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.logoType === 'custom_image'
                    ? 'border-amber-500 bg-amber-500/10 font-bold'
                    : isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Custom Image Logo</span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Upload your own PNG, SVG, or JPG
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleChange('logoType', 'icon')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.logoType === 'icon'
                    ? 'border-amber-500 bg-amber-500/10 font-bold'
                    : isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Vector Brand Icon</span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Gradient badge with vector symbol
                </p>
              </button>
            </div>
          </div>

          {/* Custom Image Upload Zone */}
          {form.logoType === 'custom_image' ? (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider">
                Upload Logo Image Manually
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  isLight 
                    ? 'border-slate-300 hover:border-amber-500 bg-slate-50/50' 
                    : 'border-slate-700 hover:border-amber-500 bg-slate-900/40'
                }`}
              >
                {form.logoImageUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img 
                      src={form.logoImageUrl} 
                      alt="Uploaded Logo" 
                      className="max-h-20 max-w-full object-contain p-1 border rounded-lg bg-white shadow-xs" 
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Logo Loaded
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange('logoImageUrl', '');
                        }}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Click or drag a new image to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold">Click to browse or drag & drop logo</span>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Supports PNG, JPG, SVG, WebP (Transparent background recommended)
                    </p>
                  </div>
                )}
              </div>

              {/* Or enter Direct Image URL */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">
                  Or enter hosted image URL:
                </label>
                <input
                  type="text"
                  placeholder="https://your-domain.com/logo.png"
                  value={form.logoImageUrl}
                  onChange={(e) => handleChange('logoImageUrl', e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900' 
                      : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              {/* Logo Height Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold uppercase mb-1">
                  <span>Logo Height</span>
                  <span className="text-amber-500">{form.logoHeight || 40}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={form.logoHeight || 40}
                  onChange={(e) => handleChange('logoHeight', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Logo Corner Radius */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Logo Corner Radius
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'sm', 'md', 'xl', 'full'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleChange('logoRounded', r)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize ${
                        form.logoRounded === r 
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' 
                          : isLight ? 'border-slate-200 text-slate-600' : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      {r === 'full' ? 'Circle' : r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Vector Icon Configuration */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-2">
                  Select Brand Symbol
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sparkles', label: 'Sparkles', icon: <Sparkles className="w-4 h-4" /> },
                    { id: 'flame', label: 'Flame', icon: <Flame className="w-4 h-4" /> },
                    { id: 'star', label: 'Star', icon: <Star className="w-4 h-4" /> },
                    { id: 'package', label: 'Package', icon: <Package className="w-4 h-4" /> },
                    { id: 'store', label: 'Store', icon: <Store className="w-4 h-4" /> },
                    { id: 'zap', label: 'Zap', icon: <Zap className="w-4 h-4" /> },
                    { id: 'crown', label: 'Crown', icon: <Crown className="w-4 h-4" /> },
                    { id: 'shield', label: 'Shield', icon: <ShieldCheck className="w-4 h-4" /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleChange('logoIcon', item.id as any)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-colors ${
                        form.logoIcon === item.id 
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' 
                          : isLight ? 'border-slate-200 text-slate-700' : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      {item.icon}
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2">
                  Gradient Color Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Amber Flame', gradient: 'from-amber-500 via-orange-500 to-red-500' },
                    { label: 'Sunset Glow', gradient: 'from-pink-500 via-rose-500 to-amber-500' },
                    { label: 'Emerald Mint', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
                    { label: 'Electric Blue', gradient: 'from-blue-500 via-indigo-500 to-purple-600' },
                    { label: 'Royal Violet', gradient: 'from-purple-500 via-fuchsia-500 to-pink-500' },
                    { label: 'Midnight Slate', gradient: 'from-slate-700 via-slate-800 to-slate-950' }
                  ].map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => handleChange('logoGradient', g.gradient)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left ${
                        form.logoGradient === g.gradient 
                          ? 'border-amber-500 bg-amber-500/10 font-bold' 
                          : isLight ? 'border-slate-200' : 'border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md bg-gradient-to-tr ${g.gradient}`} />
                      <span className="text-xs">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: STORE NAME TYPOGRAPHY */}
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/80 border-slate-700/80'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
            <Type className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold">2. Store Name Configuration</h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Store Brand Name
            </label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="e.g. LUMINA"
              className={`w-full px-4 py-2.5 rounded-xl border text-base font-bold tracking-tight ${
                isLight 
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white' 
                  : 'bg-slate-900 border-slate-700 text-slate-100 focus:bg-slate-950'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Font Family
              </label>
              <select
                value={form.storeNameFont}
                onChange={(e) => handleChange('storeNameFont', e.target.value as any)}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
                }`}
              >
                <option value="serif">Classic Serif (Elegant)</option>
                <option value="sans">Modern Sans (Clean)</option>
                <option value="mono">Tech Monospace</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Font Weight
              </label>
              <select
                value={form.storeNameWeight}
                onChange={(e) => handleChange('storeNameWeight', e.target.value as any)}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
                }`}
              >
                <option value="normal">Normal (400)</option>
                <option value="semibold">Semi-Bold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="black">Black / Extra Bold (900)</option>
              </select>
            </div>
          </div>

          {/* Store Name Size */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold uppercase mb-1">
              <span>Store Name Font Size</span>
              <span className="text-amber-500">{form.storeNameSize || 24}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="44"
              value={form.storeNameSize || 24}
              onChange={(e) => handleChange('storeNameSize', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Store Name Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Store Name Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.storeNameColor}
                onChange={(e) => handleChange('storeNameColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-1"
              />
              <input
                type="text"
                value={form.storeNameColor}
                onChange={(e) => handleChange('storeNameColor', e.target.value)}
                className={`w-32 px-3 py-1.5 text-xs rounded-xl border font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
                }`}
              />
              <div className="flex items-center gap-1.5">
                {['#0f172a', '#1e293b', '#ffffff', '#f59e0b', '#2563eb', '#10b981', '#dc2626'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleChange('storeNameColor', col)}
                    className="w-6 h-6 rounded-full border border-slate-400/40 shadow-xs"
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SUBTITLE LINE STYLING, SIZING & SPACING */}
      <div className={`p-6 rounded-2xl border space-y-6 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/80 border-slate-700/80'
      }`}>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
          <Sliders className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-bold">3. Subtitle Line Styling & Sizing ("sing" & typography)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subtitle Text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Subtitle Text Line
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="e.g. WINNING PRODUCTS"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                isLight 
                  ? 'bg-slate-50 border-slate-200 text-slate-900' 
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}
            />
          </div>

          {/* Subtitle Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Subtitle Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.subtitleColor}
                onChange={(e) => handleChange('subtitleColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-1"
              />
              <input
                type="text"
                value={form.subtitleColor}
                onChange={(e) => handleChange('subtitleColor', e.target.value)}
                className={`w-28 px-3 py-1.5 text-xs rounded-xl border font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
                }`}
              />
              <div className="flex items-center gap-1.5">
                {['#d97706', '#f59e0b', '#2563eb', '#10b981', '#64748b', '#dc2626', '#7c3aed'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleChange('subtitleColor', col)}
                    className="w-6 h-6 rounded-full border border-slate-400/40 shadow-xs"
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subtitle Font Size */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold uppercase mb-1">
              <span>Font Size</span>
              <span className="text-amber-500">{form.subtitleFontSize || 10}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="20"
              value={form.subtitleFontSize || 10}
              onChange={(e) => handleChange('subtitleFontSize', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Letter Spacing / Tracking */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Letter Spacing ("Sing")
            </label>
            <select
              value={form.subtitleLetterSpacing}
              onChange={(e) => handleChange('subtitleLetterSpacing', e.target.value as any)}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <option value="tight">Tight (-0.025em)</option>
              <option value="normal">Normal (0)</option>
              <option value="wide">Wide (0.08em)</option>
              <option value="wider">Wider (0.15em)</option>
              <option value="widest">Extra Widest (0.25em)</option>
            </select>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Font Weight
            </label>
            <select
              value={form.subtitleFontWeight}
              onChange={(e) => handleChange('subtitleFontWeight', e.target.value as any)}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <option value="normal">Normal (400)</option>
              <option value="medium">Medium (500)</option>
              <option value="semibold">Semi-Bold (600)</option>
              <option value="bold">Bold (700)</option>
              <option value="extrabold">Extra Bold (800)</option>
            </select>
          </div>

          {/* Font Style & Transform */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Style & Capitalization
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('subtitleStyle', form.subtitleStyle === 'italic' ? 'normal' : 'italic')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  form.subtitleStyle === 'italic' 
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                    : isLight ? 'border-slate-200 text-slate-600' : 'border-slate-700 text-slate-400'
                }`}
              >
                Italic
              </button>

              <select
                value={form.subtitleTransform}
                onChange={(e) => handleChange('subtitleTransform', e.target.value as any)}
                className={`flex-1 px-2 py-1.5 text-xs rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
                }`}
              >
                <option value="uppercase">UPPERCASE</option>
                <option value="capitalize">Capitalize</option>
                <option value="lowercase">lowercase</option>
                <option value="none">Normal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/80 border-slate-700/80'
      }`}>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${supabaseStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-slate-400">
            {supabaseStatus.connected ? 'Connected to live Supabase backend' : 'Saving locally (syncs when Supabase is reached)'}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleReset}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-100' : 'border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Reset to Default
          </button>

          <AdminSaveButton
            type="button"
            onClick={handleSave}
            saveState={saveSuccess ? 'saved' : isSaving ? 'saving' : 'idle'}
            idleText="Save & Apply Branding"
            savingText="Saving to Database..."
            savedText="Saved & Applied!"
            idleIcon={<Database className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};
