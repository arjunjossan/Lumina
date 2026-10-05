import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { PromoCode } from '../../types';
import { AdminSaveButton } from './AdminSaveButton';
import { 
  Tag, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Sparkles, 
  Dices, 
  Globe, 
  Target, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ChevronDown, 
  Layers, 
  Edit3, 
  X 
} from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { 
    products = [], 
    promos = [], 
    promoCodes: ctxPromoCodes, 
    addPromoCode, 
    updatePromoCode,
    togglePromoCode, 
    deletePromoCode, 
    saveAllPromosToDb 
  } = useStore();

  const promoCodes = (promos && promos.length > 0) ? promos : (ctxPromoCodes || []);
  const formRef = useRef<HTMLDivElement>(null);

  // Coupon Generator Form State
  const [scope, setScope] = useState<'universal' | 'product'>('universal');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [productSearch, setProductSearch] = useState('');
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<string>('15');
  const [minSpend, setMinSpend] = useState<string>('');
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // UI feedback states
  const [addState, setAddState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveAllState, setSaveAllState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter & Search in coupon list
  const [listFilter, setListFilter] = useState<'all' | 'universal' | 'product' | 'active'>('all');
  const [listSearch, setListSearch] = useState('');

  // Selected product for product-scoped coupons
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || (products.length > 0 ? products[0] : null);
  }, [products, selectedProductId]);

  // Filtered products for dropdown search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, productSearch]);

  // Check if current typed code already exists
  const existingMatchedPromo = useMemo(() => {
    const clean = code.trim().toUpperCase();
    if (!clean) return null;
    return promoCodes.find(p => p.code === clean);
  }, [code, promoCodes]);

  const isEditingExisting = Boolean(editingCode || existingMatchedPromo);

  // Generate random promo code helper
  const handleGenerateRandomCode = () => {
    const prefixes = scope === 'universal' ? ['STORE', 'VIP', 'FLASH', 'SAVE', 'LUMINA', 'SPECIAL'] : ['PROD', 'DEAL', 'EXCLUSIVE', 'BONUS'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const discount = discountPercent ? discountPercent : '20';
    setCode(`${randomPrefix}${discount}-${randomNum}`);
    setEditingCode(null);
  };

  // Start editing an existing coupon from the list
  const handleStartEdit = (p: PromoCode) => {
    setEditingCode(p.code);
    setCode(p.code);
    setDiscountPercent(String(p.discountPercent));
    setMinSpend(p.minSpend ? String(p.minSpend) : '');
    if (p.productId) {
      setScope('product');
      setSelectedProductId(p.productId);
    } else {
      setScope('universal');
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCode(null);
    setCode('');
    setMinSpend('');
    setDiscountPercent('15');
  };

  // Submit create or update coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const discount = Number(discountPercent);
    if (isNaN(discount) || discount <= 0) return;

    setAddState('saving');

    const couponData: Partial<PromoCode> & { code: string; discountPercent: number } = {
      code: code.trim().toUpperCase(),
      discountPercent: discount,
      minSpend: minSpend ? Number(minSpend) : undefined,
      productId: scope === 'product' && selectedProduct ? selectedProduct.id : undefined,
      productTitle: scope === 'product' && selectedProduct ? selectedProduct.title : undefined
    };

    try {
      await addPromoCode(couponData);
      setAddState('saved');
      setEditingCode(null);
      setCode('');
      setMinSpend('');
      setTimeout(() => setAddState('idle'), 2500);
    } catch (err) {
      console.error('Failed to save coupon:', err);
      setAddState('idle');
    }
  };

  // Save all to database
  const handleSaveAll = async () => {
    setSaveAllState('saving');
    try {
      await saveAllPromosToDb();
      setSaveAllState('saved');
      setTimeout(() => setSaveAllState('idle'), 2500);
    } catch (e) {
      console.error('Failed to sync promos:', e);
      setSaveAllState('idle');
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (c: string) => {
    try {
      navigator.clipboard.writeText(c);
      setCopiedCode(c);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  // Filter coupons for display
  const filteredCoupons = useMemo(() => {
    return (promoCodes || []).filter(p => {
      // Scope filter
      if (listFilter === 'universal' && p.productId) return false;
      if (listFilter === 'product' && !p.productId) return false;
      if (listFilter === 'active' && !p.active) return false;

      // Search filter
      if (listSearch.trim()) {
        const q = listSearch.toLowerCase();
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesProduct = p.productTitle?.toLowerCase().includes(q);
        return matchesCode || matchesProduct;
      }
      return true;
    });
  }, [promoCodes, listFilter, listSearch]);

  const universalCount = (promoCodes || []).filter(p => !p.productId).length;
  const productCount = (promoCodes || []).filter(p => !!p.productId).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Tag className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Promo & Coupon Code Generator</h1>
                <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Discounts Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Create universal store-wide promo codes or generate individual coupon codes targeted to specific products.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AdminSaveButton
              onClick={handleSaveAll}
              saveState={saveAllState}
              idleText="Save All to Database"
              savingText="Syncing to Database..."
              savedText="All Codes Saved to Database!"
              variant="purple"
              idleIcon={<Save className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Coupon Generator / Editor Card */}
      <div ref={formRef} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                {isEditingExisting ? (
                  <>
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Edit Existing Coupon Code</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-purple-400" />
                    <span>Create New Promo / Coupon Code</span>
                  </>
                )}
              </h3>

              {isEditingExisting && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>Modifying: {editingCode || code}</span>
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="hover:text-white cursor-pointer ml-1"
                    title="Cancel edit"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditingExisting 
                ? 'Editing discount percentage or product target will update the existing code in the database.' 
                : 'Choose between a universal code applicable store-wide or an individual coupon valid only for a specific product.'}
            </p>
          </div>

          {/* Scope Selector: Universal vs Product-Specific */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setScope('universal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                scope === 'universal'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Universal (Store-Wide)</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('product')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                scope === 'product'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Product-Specific</span>
            </button>
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          {/* If Product-Specific, show Product Selector */}
          {scope === 'product' && (
            <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <span>Select Target Product for this Coupon</span>
                </label>
                <div className="relative w-full sm:w-56">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold appearance-none focus:outline-none focus:border-purple-500 pr-10 cursor-pointer"
                >
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (₹${p.price.toFixed(2)}) — SKU: {p.sku}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                    alt={selectedProduct.title}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">{selectedProduct.title}</span>
                    <span className="text-slate-400 text-[11px]">
                      Regular Price: ₹{selectedProduct.price.toFixed(2)} • This code will only apply when this item is in the user's cart.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Fields: Code, Discount %, Min Spend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Coupon Code Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300">Coupon Code *</label>
                <button
                  type="button"
                  onClick={handleGenerateRandomCode}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Dices className="w-3 h-3" />
                  <span>Generate Code</span>
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={scope === 'universal' ? 'e.g. SAVE20' : 'e.g. VIPHEADPHONES'}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold text-xs uppercase focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Discount Percentage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300">Discount Percentage *</label>
                <div className="flex items-center gap-1">
                  {['10', '15', '20', '25', '50'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        discountPercent === d ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="20"
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                />
                <span className="text-slate-400 text-xs font-bold">%</span>
              </div>
            </div>

            {/* Minimum Spend */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Min Spend (₹ Optional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  placeholder="0 (No minimum)"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            {isEditingExisting ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Editing</span>
              </button>
            ) : <div />}

            <AdminSaveButton
              type="submit"
              saveState={addState}
              idleText={isEditingExisting ? `Update Coupon "${editingCode || code}"` : `Create ${scope === 'universal' ? 'Universal' : 'Product-Specific'} Coupon`}
              savingText={isEditingExisting ? 'Updating Coupon...' : 'Saving Coupon...'}
              savedText={isEditingExisting ? 'Coupon Updated in Database!' : 'Coupon Created & Saved!'}
              variant={isEditingExisting ? 'amber' : 'purple'}
              idleIcon={isEditingExisting ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            />
          </div>
        </form>
      </div>

      {/* Coupons Directory List */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Active & Configured Coupons ({promoCodes.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit discount %, toggle availability, copy code, or delete coupons.
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setListFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  listFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({promoCodes.length})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('universal')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  listFilter === 'universal' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Universal ({universalCount})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('product')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  listFilter === 'product' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Product-Specific ({productCount})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search codes..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="w-36 sm:w-44 pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        {filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredCoupons.map((p) => {
              const targetProd = p.productId ? products.find(prod => prod.id === p.productId) : null;
              const isCopied = copiedCode === p.code;
              const isCurrentBeingEdited = editingCode === p.code;

              return (
                <div
                  key={p.code}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrentBeingEdited
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                      : p.active
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                      : 'bg-slate-900/40 border-slate-850 opacity-60'
                  }`}
                >
                  <div>
                    {/* Badge header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {p.productId ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>Product-Specific</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span>Universal (Store-Wide)</span>
                        </span>
                      )}

                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {p.discountPercent}% OFF
                      </span>
                    </div>

                    {/* Code Display with Copy Button */}
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 my-2">
                      <span className="font-mono font-black text-white text-sm tracking-wider">{p.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(p.code)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                        title="Copy coupon code"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Target Product (if any) */}
                    {p.productId && (
                      <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center gap-2 mb-2">
                        {targetProd?.images[0] && (
                          <img
                            src={targetProd.images[0]}
                            alt={p.productTitle || targetProd.title}
                            className="w-7 h-7 rounded-md object-cover shrink-0"
                          />
                        )}
                        <div className="text-[11px] truncate">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Only Valid For:</span>
                          <span className="text-white font-semibold truncate block">
                            {p.productTitle || targetProd?.title || 'Selected Product'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Minimum spend */}
                    <p className="text-[11px] text-slate-400">
                      {p.minSpend ? (
                        <span>Min spend required: <strong className="text-slate-300">${p.minSpend}</strong></span>
                      ) : (
                        <span>No minimum order spend</span>
                      )}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePromoCode(p.code)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                          p.active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {p.active ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
                        title="Edit coupon settings"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => deletePromoCode(p.code)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-2xl text-center">
            <p className="text-xs text-slate-400">No coupons match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
