import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingSettings } from '../../types';
import { AdminSaveButton } from './AdminSaveButton';
import { 
  Truck, 
  IndianRupee, 
  Sparkles, 
  Check, 
  Sliders, 
  Clock, 
  Gift 
} from 'lucide-react';

export const AdminShipping: React.FC = () => {
  const { shippingSettings, updateShippingSettings, showNotification } = useStore();

  const [form, setForm] = useState<ShippingSettings>(shippingSettings);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (shippingSettings) {
      setForm(shippingSettings);
    }
  }, [shippingSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState('saving');
    setSaveMessage('');

    try {
      const success = await updateShippingSettings(form);
      setSaveState('saved');
      setSaveMessage(success ? 'Shipping charges saved to database successfully!' : 'Shipping charges updated locally.');
      setTimeout(() => {
        setSaveState('idle');
        setSaveMessage('');
      }, 3500);
    } catch {
      setSaveState('idle');
      setSaveMessage('Failed to update shipping settings.');
    }
  };

  const applyPreset = (fee: number, threshold: number, label: string) => {
    setForm(prev => ({
      ...prev,
      standardFee: fee,
      freeShippingThreshold: threshold,
      freeDeliveryLabel: label
    }));
    showNotification(`Applied preset: ₹${fee} standard fee / Free over ₹${threshold}`);
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Top Header Card */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Truck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Shipping & Delivery Charges</h1>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Bill and adjust your fixed delivery charges, set the free delivery cart limit, and automatically sync to checkout calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${form.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[11px] font-medium text-slate-300">
              {form.enabled ? `Standard ₹${form.standardFee} • Free over ₹${form.freeShippingThreshold}` : 'Shipping Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Delivery Billing Rules
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set the exact delivery charge and cart limit for free shipping.
              </p>
            </div>

            {/* Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              <span className="ml-3 text-xs font-semibold text-slate-300">
                {form.enabled ? 'Shipping Active' : 'Shipping Off (All Free)'}
              </span>
            </label>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Setup Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => applyPreset(99, 999, 'Free Express Delivery')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  form.standardFee === 99 && form.freeShippingThreshold === 999
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Your Default</div>
                <div className="text-xs font-extrabold text-white mt-0.5">₹99 Fee / Free &gt; ₹999</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Standard e-commerce setting</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(149, 1499, 'Free VIP Express Delivery')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  form.standardFee === 149 && form.freeShippingThreshold === 1499
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">High Margin</div>
                <div className="text-xs font-extrabold text-white mt-0.5">₹149 Fee / Free &gt; ₹1,499</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Boosts average cart value</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(49, 799, 'Free Standard Delivery')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  form.standardFee === 49 && form.freeShippingThreshold === 799
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Low Threshold</div>
                <div className="text-xs font-extrabold text-white mt-0.5">₹49 Fee / Free &gt; ₹799</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Encourages fast checkout</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(0, 0, '100% Free Shipping on All Orders')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  form.standardFee === 0 && form.freeShippingThreshold === 0
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Promotional</div>
                <div className="text-xs font-extrabold text-white mt-0.5">₹0 Fee Everywhere</div>
                <div className="text-[10px] text-slate-400 mt-0.5">100% Free Shipping storewide</div>
              </button>
            </div>
          </div>

          {/* Two Core Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* 1. Standard Delivery Charge */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  Standard Delivery Charge (₹)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fixed Fee
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The fixed fee charged to customers when their cart items total is below the free delivery limit.
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  ₹
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.standardFee}
                  onChange={(e) => setForm(prev => ({ ...prev, standardFee: Math.max(0, Number(e.target.value) || 0) }))}
                  className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  placeholder="99"
                />
              </div>
              <div className="text-[11px] text-slate-400">
                Current: Customers pay <strong className="text-white">₹{form.standardFee}</strong> if order is under ₹{form.freeShippingThreshold}.
              </div>
            </div>

            {/* 2. Free Delivery Order Value Limit */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  Free Delivery Limit (₹)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Threshold
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When a customer's cart reaches or exceeds this total, delivery becomes automatically <strong className="text-white">100% FREE</strong>.
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  ₹
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.freeShippingThreshold}
                  onChange={(e) => setForm(prev => ({ ...prev, freeShippingThreshold: Math.max(0, Number(e.target.value) || 0) }))}
                  className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  placeholder="999"
                />
              </div>
              <div className="text-[11px] text-slate-400">
                Current: Orders of <strong className="text-white">₹{form.freeShippingThreshold} or more</strong> get Free Delivery.
              </div>
            </div>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Estimated Delivery Timeframe (Displayed at Checkout)
              </label>
              <input
                type="text"
                value={form.estimatedDeliveryDays || ''}
                onChange={(e) => setForm(prev => ({ ...prev, estimatedDeliveryDays: e.target.value }))}
                placeholder="2–4 Business Days"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Free Shipping Badge Label
              </label>
              <input
                type="text"
                value={form.freeDeliveryLabel || ''}
                onChange={(e) => setForm(prev => ({ ...prev, freeDeliveryLabel: e.target.value }))}
                placeholder="Free Express Delivery"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Action / Save Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {saveMessage || 'Updates are instantly reflected in Cart, Checkout, and Drawer calculations.'}
            </span>
            <AdminSaveButton
              type="submit"
              saveState={saveState}
              idleText="Save Shipping Charges"
              savingText="Saving to Database..."
              savedText="Saved to Supabase!"
              variant="emerald"
              idleIcon={<Check className="w-4 h-4" />}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
