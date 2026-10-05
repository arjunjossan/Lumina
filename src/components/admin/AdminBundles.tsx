import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { BundleConfig, ProductBundleOverride } from '../../types';
import { AdminSaveButton } from './AdminSaveButton';
import { 
  Layers, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  HelpCircle, 
  Sliders, 
  Percent, 
  Search, 
  RotateCcw, 
  Sparkles,
  Package,
  Check,
  ChevronDown,
  Tag
} from 'lucide-react';

export const AdminBundles: React.FC = () => {
  const { products = [], bundleConfig, updateBundleConfig } = useStore();

  // Local form state initialized from store bundleConfig
  const [formData, setFormData] = useState<BundleConfig>(bundleConfig);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeSubTab, setActiveSubTab] = useState<'global' | 'per_product'>('global');

  // Product-specific bundle state
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [productSearch, setProductSearch] = useState('');

  // Selected product
  const selectedProduct = useMemo(() => {
    const list = products || [];
    return list.find(p => p.id === selectedProductId) || list[0];
  }, [products, selectedProductId]);

  // Current bundle override for selected product
  const currentOverride: ProductBundleOverride = useMemo(() => {
    if (!selectedProduct) return { enabled: true, customRules: false };
    return formData.productOverrides?.[selectedProduct.id] || {
      enabled: true,
      customRules: false,
      tier2Quantity: formData.tier2Quantity,
      tier2DiscountPercent: formData.tier2DiscountPercent,
      tier2Badge: formData.tier2Badge,
      tier3Quantity: formData.tier3Quantity,
      tier3DiscountPercent: formData.tier3DiscountPercent,
      tier3Badge: formData.tier3Badge
    };
  }, [formData, selectedProduct]);

  // Filtered products list for dropdown
  const filteredProducts = useMemo(() => {
    const list = products || [];
    if (!productSearch.trim()) return list;
    const q = productSearch.toLowerCase();
    return list.filter(p => (p.title || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
  }, [products, productSearch]);

  // Products with custom bundle overrides
  const overriddenProductIds = useMemo(() => {
    const overrides = formData.productOverrides || {};
    return Object.keys(overrides).filter(id => overrides[id]?.customRules || overrides[id]?.enabled === false);
  }, [formData.productOverrides]);

  // Handle saving all bundle settings
  const handleSave = async () => {
    setSaveState('saving');
    try {
      await updateBundleConfig(formData);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (e) {
      console.error('Failed to save bundle config:', e);
      setSaveState('idle');
    }
  };

  // Update a field in the selected product's bundle override
  const handleProductOverrideChange = (field: keyof ProductBundleOverride, value: any) => {
    if (!selectedProduct) return;
    const existing = formData.productOverrides?.[selectedProduct.id] || {
      enabled: true,
      customRules: true,
      tier2Quantity: formData.tier2Quantity,
      tier2DiscountPercent: formData.tier2DiscountPercent,
      tier2Badge: formData.tier2Badge,
      tier3Quantity: formData.tier3Quantity,
      tier3DiscountPercent: formData.tier3DiscountPercent,
      tier3Badge: formData.tier3Badge
    };

    const updatedOverride: ProductBundleOverride = {
      ...existing,
      [field]: value
    };

    const nextOverrides = {
      ...(formData.productOverrides || {}),
      [selectedProduct.id]: updatedOverride
    };

    setFormData(prev => ({
      ...prev,
      productOverrides: nextOverrides
    }));
  };

  // Toggle custom rules for selected product
  const handleToggleProductCustomRules = (customRules: boolean) => {
    if (!selectedProduct) return;
    handleProductOverrideChange('customRules', customRules);
    if (customRules) {
      handleProductOverrideChange('enabled', true);
    }
  };

  // Reset product override back to store defaults
  const handleResetProductOverride = (productId: string) => {
    const nextOverrides = { ...(formData.productOverrides || {}) };
    delete nextOverrides[productId];
    setFormData(prev => ({
      ...prev,
      productOverrides: nextOverrides
    }));
  };

  // Preset discount appliers for global settings
  const applyGlobalPreset = (t2: number, t3: number) => {
    setFormData(prev => ({
      ...prev,
      tier2DiscountPercent: t2,
      tier3DiscountPercent: t3,
      tier2Badge: `MOST POPULAR — SAVE ${t2}%`,
      tier3Badge: `BEST VALUE — SAVE ${t3}%`
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Layers className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Bundle & Volume Discount Controls</h1>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Multi-Pack Deals
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure tiered volume discounts ("Buy 2 Save X%, Buy 3 Save Y%") globally or customize discounts per product.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AdminSaveButton
              onClick={handleSave}
              saveState={saveState}
              idleText="Save All Changes"
              savingText="Saving Bundles..."
              savedText="Saved to Database!"
              idleIcon={<Save className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'global'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Store Default Bundle Config</span>
          </button>

          <button
            onClick={() => setActiveSubTab('per_product')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'per_product'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Individual Product Bundle Discounts</span>
            {overriddenProductIds.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeSubTab === 'per_product' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {overriddenProductIds.length} Custom
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SUBTAB 1: GLOBAL STORE BUNDLE CONFIG */}
      {activeSubTab === 'global' && (
        <div className="space-y-6">
          {/* Master Enable Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Enable Bundle & Save Extra Globally</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  When enabled, displays 1-Pack, 2-Pack, and 3-Pack selectors on product detail pages.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Discount Strategy Presets</h4>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => applyGlobalPreset(15, 25)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Standard (15% / 25% OFF)
              </button>
              <button
                type="button"
                onClick={() => applyGlobalPreset(20, 35)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Aggressive Volume (20% / 35% OFF)
              </button>
              <button
                type="button"
                onClick={() => applyGlobalPreset(25, 45)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Flash Clearance (25% / 45% OFF)
              </button>
            </div>
          </div>

          {/* Tier 2 and Tier 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier 2 (Multi-Pack) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">2</span>
                  <h3 className="font-extrabold text-white text-base">Tier 2: Multi-Pack Bundle</h3>
                </div>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  {formData.tier2DiscountPercent}% Instant Discount
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Buy Quantity</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={formData.tier2Quantity}
                      onChange={(e) => setFormData({ ...formData, tier2Quantity: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Discount % OFF</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={formData.tier2DiscountPercent}
                        onChange={(e) => setFormData({ ...formData, tier2DiscountPercent: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Promotional Badge Text</label>
                  <input
                    type="text"
                    value={formData.tier2Badge}
                    onChange={(e) => setFormData({ ...formData, tier2Badge: e.target.value })}
                    placeholder="MOST POPULAR — SAVE 15%"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Tier 3 (Family / Gift Pack) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">3</span>
                  <h3 className="font-extrabold text-white text-base">Tier 3: Family / Mega Pack</h3>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  {formData.tier3DiscountPercent}% Instant Discount
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Buy Quantity</label>
                    <input
                      type="number"
                      min="3"
                      max="20"
                      value={formData.tier3Quantity}
                      onChange={(e) => setFormData({ ...formData, tier3Quantity: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Discount % OFF</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={formData.tier3DiscountPercent}
                        onChange={(e) => setFormData({ ...formData, tier3DiscountPercent: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Promotional Badge Text</label>
                  <input
                    type="text"
                    value={formData.tier3Badge}
                    onChange={(e) => setFormData({ ...formData, tier3Badge: e.target.value })}
                    placeholder="BEST VALUE — SAVE 25%"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar for Global Tab */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">
              Bundle tiers and volume discount percentages are saved directly to the database.
            </p>
            <AdminSaveButton
              onClick={handleSave}
              saveState={saveState}
              idleText="Save All Changes"
              savingText="Saving Bundles..."
              savedText="Saved to Database!"
              idleIcon={<Save className="w-4 h-4" />}
            />
          </div>
        </div>
      )}

      {/* SUBTAB 2: INDIVIDUAL PRODUCT BUNDLE DISCOUNTS */}
      {activeSubTab === 'per_product' && (
        <div className="space-y-6">
          {/* Product Selection Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Select Product to Modify Bundle Discounts Individually</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any available product from the dropdown list to adjust bundle discount percentages specifically for that product.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Dropdown list of available products */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                Available Products on Website ({products.length})
              </label>
              <div className="relative">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm font-bold appearance-none focus:outline-none focus:border-amber-500 pr-10 cursor-pointer"
                >
                  {filteredProducts.map((p) => {
                    const hasCustom = formData.productOverrides?.[p.id]?.customRules;
                    const isDisabled = formData.productOverrides?.[p.id]?.enabled === false;
                    return (
                      <option key={p.id} value={p.id}>
                        {isDisabled ? '🚫 [BUNDLE OFF] ' : hasCustom ? '⭐ [CUSTOM BUNDLE] ' : ''}{p.title} (₹${p.price.toFixed(2)}) — SKU: {p.sku}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Active Selected Product Banner */}
            {selectedProduct && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                    alt={selectedProduct.title}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm">{selectedProduct.title}</h4>
                      {currentOverride.customRules ? (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Custom Bundle Active
                        </span>
                      ) : currentOverride.enabled === false ? (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Bundles Disabled
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Using Store Default Bundles
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Base Unit Price: <strong className="text-white">₹{selectedProduct.price.toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Category: <strong className="text-slate-300">{selectedProduct.category}</strong></span>
                      <span>•</span>
                      <span>SKU: <strong className="text-slate-300">{selectedProduct.sku}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bundle Status & Custom Tiers Toggle */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-200">
                      {currentOverride.customRules ? 'Custom Discounts Active' : 'Customize Discounts'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentOverride.customRules || false}
                        onChange={(e) => handleToggleProductCustomRules(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* If Custom Rules are enabled for this product */}
          {selectedProduct && currentOverride.customRules ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>Custom Bundle Discount Rates for "{selectedProduct.title}"</span>
                </h4>
                <button
                  onClick={() => handleResetProductOverride(selectedProduct.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Store Defaults</span>
                </button>
              </div>

              {/* Live Customer Pricing Simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">1 Unit (Standard)</span>
                  <span className="text-base font-black text-white">₹{selectedProduct.price.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Regular retail price</p>
                </div>

                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      {currentOverride.tier2Quantity ?? formData.tier2Quantity} Units (Tier 2)
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-300">
                      {currentOverride.tier2DiscountPercent ?? formData.tier2DiscountPercent}% OFF
                    </span>
                  </div>
                  {(() => {
                    const q = currentOverride.tier2Quantity ?? formData.tier2Quantity;
                    const d = currentOverride.tier2DiscountPercent ?? formData.tier2DiscountPercent;
                    const full = selectedProduct.price * q;
                    const discounted = full * (1 - d / 100);
                    return (
                      <div>
                        <span className="text-base font-black text-white">₹{discounted.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 line-through ml-2">₹{full.toFixed(2)}</span>
                        <p className="text-[10px] text-emerald-400 mt-0.5 font-bold">
                          Customer saves ₹{(full - discounted).toFixed(2)}!
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                      {currentOverride.tier3Quantity ?? formData.tier3Quantity} Units (Tier 3)
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-300">
                      {currentOverride.tier3DiscountPercent ?? formData.tier3DiscountPercent}% OFF
                    </span>
                  </div>
                  {(() => {
                    const q = currentOverride.tier3Quantity ?? formData.tier3Quantity;
                    const d = currentOverride.tier3DiscountPercent ?? formData.tier3DiscountPercent;
                    const full = selectedProduct.price * q;
                    const discounted = full * (1 - d / 100);
                    return (
                      <div>
                        <span className="text-base font-black text-white">₹{discounted.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 line-through ml-2">₹{full.toFixed(2)}</span>
                        <p className="text-[10px] text-emerald-400 mt-0.5 font-bold">
                          Customer saves ₹{(full - discounted).toFixed(2)}!
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Editing Form for Tier 2 and Tier 3 for this product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Tier 2 */}
                <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">2</span>
                      <h3 className="font-extrabold text-white text-base">Tier 2 for this Product</h3>
                    </div>
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {currentOverride.tier2DiscountPercent ?? formData.tier2DiscountPercent}% OFF
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Buy Quantity</label>
                        <input
                          type="number"
                          min="2"
                          max="10"
                          value={currentOverride.tier2Quantity ?? formData.tier2Quantity}
                          onChange={(e) => handleProductOverrideChange('tier2Quantity', Number(e.target.value))}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Discount % OFF</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={currentOverride.tier2DiscountPercent ?? formData.tier2DiscountPercent}
                            onChange={(e) => handleProductOverrideChange('tier2DiscountPercent', Number(e.target.value))}
                            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-slate-400 text-xs font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Badge Text for this Product</label>
                      <input
                        type="text"
                        value={currentOverride.tier2Badge ?? formData.tier2Badge}
                        onChange={(e) => handleProductOverrideChange('tier2Badge', e.target.value)}
                        placeholder="DUO DEAL — SAVE 20%"
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Tier 3 */}
                <div className="bg-slate-950 border border-emerald-500/30 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">3</span>
                      <h3 className="font-extrabold text-white text-base">Tier 3 for this Product</h3>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {currentOverride.tier3DiscountPercent ?? formData.tier3DiscountPercent}% OFF
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Buy Quantity</label>
                        <input
                          type="number"
                          min="3"
                          max="20"
                          value={currentOverride.tier3Quantity ?? formData.tier3Quantity}
                          onChange={(e) => handleProductOverrideChange('tier3Quantity', Number(e.target.value))}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Discount % OFF</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={currentOverride.tier3DiscountPercent ?? formData.tier3DiscountPercent}
                            onChange={(e) => handleProductOverrideChange('tier3DiscountPercent', Number(e.target.value))}
                            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-slate-400 text-xs font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Badge Text for this Product</label>
                      <input
                        type="text"
                        value={currentOverride.tier3Badge ?? formData.tier3Badge}
                        onChange={(e) => handleProductOverrideChange('tier3Badge', e.target.value)}
                        placeholder="MEGA PACK — SAVE 35%"
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-white text-sm">
                "{selectedProduct?.title}" is Currently Using Global Bundle Settings ({formData.tier2DiscountPercent}% / {formData.tier3DiscountPercent}% OFF)
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Toggle <strong>"Customize Discounts"</strong> in the banner above to specify custom bundle quantities, discounts, or badges tailored for this product.
              </p>
            </div>
          )}

          {/* Overview List of all products with custom bundle discounts */}
          {overriddenProductIds.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Products with Individual Bundle Rules ({overriddenProductIds.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overriddenProductIds.map(id => {
                  const prod = products.find(p => p.id === id);
                  const ovr = formData.productOverrides?.[id];
                  if (!prod || !ovr) return null;

                  return (
                    <div key={id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt={prod.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-xs line-clamp-1">{prod.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Tier 2: Buy {ovr.tier2Quantity ?? formData.tier2Quantity} (-{ovr.tier2DiscountPercent ?? formData.tier2DiscountPercent}%)
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Tier 3: Buy {ovr.tier3Quantity ?? formData.tier3Quantity} (-{ovr.tier3DiscountPercent ?? formData.tier3DiscountPercent}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedProductId(id);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title="Edit this product"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetProductOverride(id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title="Reset to store default"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Save Bar for Per-Product Tab */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">
              Product-level overrides and custom bundle rates will sync to active store sessions.
            </p>
            <AdminSaveButton
              onClick={handleSave}
              saveState={saveState}
              idleText="Save All Changes"
              savingText="Saving Bundles..."
              savedText="Saved to Database!"
              idleIcon={<Save className="w-4 h-4" />}
            />
          </div>
        </div>
      )}
    </div>
  );
};
