import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { 
  Sparkles, 
  Tag, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle2, 
  Percent, 
  ShoppingBag, 
  Check,
  Flame,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const AdminPromoPopup: React.FC = () => {
  const { promoPopupConfig, updatePromoPopupConfig, products, showNotification } = useStore();

  const [formData, setFormData] = useState({
    enabled: promoPopupConfig.enabled,
    title: promoPopupConfig.title || 'FLASH SALE & EXCLUSIVE DROP',
    subtitle: promoPopupConfig.subtitle || 'Claim an instant 20% OFF on our featured winning product for a limited time.',
    badgeText: promoPopupConfig.badgeText || '🔥 LIMITED TIME FLASH OFFER',
    promoCode: promoPopupConfig.promoCode || 'FLASH20',
    discountPercent: promoPopupConfig.discountPercent || 20,
    discountValueText: promoPopupConfig.discountValueText || 'Save 20% Instantly + Free Express Shipping',
    buttonText: promoPopupConfig.buttonText || 'Claim 20% OFF & View Deal',
    imageUrl: promoPopupConfig.imageUrl || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    delaySeconds: promoPopupConfig.delaySeconds ?? 2,
    featuredProductId: promoPopupConfig.featuredProductId || (promoPopupConfig.featuredProductIds?.[0] || 'prod-001')
  });

  // Keep form in sync if promoPopupConfig is loaded or updated asynchronously from database
  useEffect(() => {
    setFormData({
      enabled: promoPopupConfig.enabled,
      title: promoPopupConfig.title || 'FLASH SALE & EXCLUSIVE DROP',
      subtitle: promoPopupConfig.subtitle || 'Claim an instant 20% OFF on our featured winning product for a limited time.',
      badgeText: promoPopupConfig.badgeText || '🔥 LIMITED TIME FLASH OFFER',
      promoCode: promoPopupConfig.promoCode || 'FLASH20',
      discountPercent: promoPopupConfig.discountPercent || 20,
      discountValueText: promoPopupConfig.discountValueText || `Save ${promoPopupConfig.discountPercent || 20}% Instantly + Free Express Shipping`,
      buttonText: promoPopupConfig.buttonText || 'Claim 20% OFF & View Deal',
      imageUrl: promoPopupConfig.imageUrl || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      delaySeconds: promoPopupConfig.delaySeconds ?? 2,
      featuredProductId: promoPopupConfig.featuredProductId || (promoPopupConfig.featuredProductIds?.[0] || 'prod-001')
    });
  }, [promoPopupConfig]);

  const [saveState, setSaveState] = useState<SaveButtonState>('idle');
  const [productSearch, setProductSearch] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveState('idle');
  };

  const selectedProduct = products.find((p) => p.id === formData.featuredProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState('saving');

    try {
      const cleanCode = (formData.promoCode || 'FLASH20').trim().toUpperCase();
      
      // Save strictly to promo popup config in database (isolated from general promo codes table)
      await updatePromoPopupConfig({
        ...formData,
        promoCode: cleanCode,
        featuredProductId: formData.featuredProductId,
        featuredProductIds: [formData.featuredProductId]
      });

      // Small visual transition delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 300));
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3500);
    } catch (err) {
      setSaveState('idle');
      showNotification('Notice: Settings saved locally!');
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Conversion Flash Sale Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white font-serif">Visitor Flash Sale & Coupon Control</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure the 1-product high-impact Flash Sale popup. When a user clicks "Claim", it automatically applies this coupon code and navigates straight to the featured product page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.enabled} 
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-3 text-xs font-bold text-slate-200">
              {formData.enabled ? 'Popup Active (Live)' : 'Popup Disabled'}
            </span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Configuration Form */}
        <div className="lg:col-span-2 space-y-6 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif flex items-center gap-2 border-b border-slate-800 pb-3">
            <Tag className="w-4 h-4 text-amber-400" />
            <span>Coupon & Popup Messaging Control</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Coupon Code</label>
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                placeholder="e.g. FLASH20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Discount Percentage (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={formData.discountPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleChange('discountPercent', val);
                    handleChange('discountValueText', `Save ${val}% Instantly + Free Shipping`);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors pl-8 font-bold"
                  required
                />
                <Percent className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Trigger Delay (Seconds)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={formData.delaySeconds}
                  onChange={(e) => handleChange('delaySeconds', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors pl-8"
                />
                <Clock className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Top Badge Text</label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => handleChange('badgeText', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. 🔥 LIMITED TIME FLASH OFFER"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Modal Heading Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-serif"
                placeholder="e.g. FLASH SALE & EXCLUSIVE DROP"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Subtitle Description</label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
              placeholder="Enter subtitle description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Call-to-Action Button Label</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => handleChange('buttonText', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Claim 20% OFF & View Deal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Banner Image URL</span>
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Single Product Selection Requirement */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Select Single Featured Sale Product (1 Product Only)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Click any product below to set as the active flash sale feature.</p>
              </div>
              <input 
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const isSelected = formData.featuredProductId === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleChange('featuredProductId', prod.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/50' 
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-slate-700">
                      <img src={prod.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-amber-400 uppercase">{prod.category}</span>
                        {isSelected && <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 rounded">Active</span>}
                      </div>
                      <h5 className="text-xs font-bold truncate text-white">{prod.title}</h5>
                      <p className="text-xs text-amber-400 font-black">₹{prod.price.toFixed(2)}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                      isSelected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <AdminSaveButton
              type="submit"
              saveState={saveState}
              idleText="Save & Sync Flash Sale Popup"
              savingText="Saving & Syncing..."
              savedText="Saved & Synced to Database!"
              idleIcon={<CheckCircle2 className="w-4 h-4" />}
              size="lg"
            />
          </div>
        </div>

        {/* Right Col: Live Preview */}
        <div className="space-y-6">
          {/* Live Modal Preview */}
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Modal Preview</span>
            </h3>

            <div className="bg-slate-950 rounded-2xl border border-amber-500/30 overflow-hidden shadow-2xl relative text-left">
              {formData.imageUrl?.trim() && (
                <div className="h-28 relative overflow-hidden bg-slate-900">
                  <img src={formData.imageUrl.trim()} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  <span className="absolute bottom-2 left-3 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    {formData.badgeText}
                  </span>
                </div>
              )}

              <div className="p-4 space-y-3">
                <h4 className="text-sm font-black text-white font-serif leading-snug">{formData.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{formData.subtitle}</p>

                {/* Featured Product */}
                {selectedProduct && (
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      <img src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-bold text-white truncate">{selectedProduct.title}</h5>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-amber-400 font-mono">
                          ₹{(selectedProduct.price * (1 - (formData.discountPercent || 20) / 100)).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 line-through">
                          ₹{selectedProduct.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Promo Code Box */}
                <div className="bg-slate-900 border border-amber-500/30 p-2 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase">Promo Code</span>
                    <span className="font-mono text-xs font-black text-amber-400">{formData.promoCode}</span>
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                    {formData.discountPercent}% OFF
                  </span>
                </div>

                <div className="w-full bg-amber-500 text-slate-950 font-black text-[11px] py-2 rounded-xl text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <span>{formData.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
