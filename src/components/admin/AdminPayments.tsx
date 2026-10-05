import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentSettings } from '../../types';
import { AdminSaveButton } from './AdminSaveButton';
import { 
  CreditCard, 
  IndianRupee, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Percent, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const { paymentSettings, updatePaymentSettings } = useStore();

  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(paymentSettings);
  const [paymentSaveState, setPaymentSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [paymentMsg, setPaymentMsg] = useState('');

  useEffect(() => {
    if (paymentSettings) {
      setPaymentForm(paymentSettings);
    }
  }, [paymentSettings]);

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSaveState('saving');
    setPaymentMsg('');

    try {
      const success = await updatePaymentSettings(paymentForm);
      setPaymentSaveState('saved');
      setPaymentMsg(success ? 'Payment configuration saved to database successfully!' : 'Payment configuration saved locally.');
      setTimeout(() => {
        setPaymentSaveState('idle');
        setPaymentMsg('');
      }, 3500);
    } catch {
      setPaymentSaveState('idle');
      setPaymentMsg('Failed to update payment settings.');
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white font-serif">Mode of Payment & Checkout Settings</h2>
          </div>
          <p className="text-xs text-slate-400">
            Configure checkout payment modes (COD, Instant Online, Partial Advance Payment), incentive discounts, and gateway credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {paymentMsg && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{paymentMsg}</span>
            </span>
          )}
          <AdminSaveButton
            type="button"
            onClick={handleSavePaymentSettings}
            saveState={paymentSaveState}
            idleText="Save Payment Settings"
            savingText="Saving Settings..."
            savedText="Saved to Database!"
            variant="emerald"
            idleIcon={<Check className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Main Payment Settings Form */}
      <form onSubmit={handleSavePaymentSettings} className="space-y-6">
        {/* 3 Payment Modes Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Mode 1: Cash on Delivery (COD) */}
          <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
            paymentForm.codEnabled
              ? 'bg-slate-950 border-slate-700/80 shadow-lg shadow-emerald-950/10'
              : 'bg-slate-950/60 border-slate-800/80 opacity-75'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Cash on Delivery</h4>
                    <span className="text-[10px] text-slate-400">Pay cash or UPI at delivery</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.codEnabled}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, codEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <span>COD Instruction / Customer Notice</span>
                  <Info className="w-3 h-3 text-slate-500" />
                </label>
                <textarea
                  rows={3}
                  value={paymentForm.codNoticeMessage || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, codNoticeMessage: e.target.value }))}
                  placeholder="Cash on delivery is available for eligible products in your cart."
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Standard doorstep cash payment method</span>
            </div>
          </div>

          {/* Mode 2: Pay Online (Full Prepaid) */}
          <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
            paymentForm.payOnlineEnabled
              ? 'bg-slate-950 border-slate-700/80 shadow-lg shadow-amber-950/10'
              : 'bg-slate-950/60 border-slate-800/80 opacity-75'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Pay Online (Prepaid)</h4>
                    <span className="text-[10px] text-slate-400">Razorpay, UPI & Cards</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.payOnlineEnabled}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, payOnlineEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <span>Prepaid Instant Discount (%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={paymentForm.payOnlineDiscountPercent}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, payOnlineDiscountPercent: Number(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs pr-8 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <Percent className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Discount Promo Label</label>
                <input
                  type="text"
                  value={paymentForm.payOnlineDiscountLabel || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payOnlineDiscountLabel: e.target.value }))}
                  placeholder="5% Extra Instant Discount on Online Payment"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Incentivizes immediate prepaid conversion</span>
            </div>
          </div>

          {/* Mode 3: Partial Advance Payment */}
          <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
            paymentForm.partialPaymentEnabled
              ? 'bg-slate-950 border-slate-700/80 shadow-lg shadow-purple-950/10'
              : 'bg-slate-950/60 border-slate-800/80 opacity-75'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Partial Advance Payment</h4>
                    <span className="text-[10px] text-slate-400">Advance deposit + COD balance</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.partialPaymentEnabled}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, partialPaymentEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Upfront (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="95"
                      value={paymentForm.partialPaymentUpfrontPercent}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, partialPaymentUpfrontPercent: Number(e.target.value) || 20 }))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs pr-8 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={paymentForm.partialPaymentDiscountPercent}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, partialPaymentDiscountPercent: Number(e.target.value) || 0 }))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs pr-8 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Dramatically decreases fake orders & RTO rate</span>
            </div>
          </div>
        </div>

        {/* Razorpay Gateway API Credentials Card */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-serif">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Razorpay Gateway API Credentials</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Required for processing UPI, credit/debit cards, and net banking online.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-300 font-semibold">Test Sandbox Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentForm.razorpayTestMode}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, razorpayTestMode: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Razorpay Key ID</label>
              <input
                type="text"
                placeholder="rzp_test_..."
                value={paymentForm.razorpayKeyId || ''}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Razorpay Key Secret</label>
              <input
                type="password"
                placeholder="Secret key..."
                value={paymentForm.razorpayKeySecret || ''}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, razorpayKeySecret: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-[11px] text-amber-300/90">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Your API keys are stored securely. When Test Mode is active, simulated test transactions can be completed without debiting real bank accounts.
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Changes update immediately in the database and live checkout modal.
            </span>
            <AdminSaveButton
              type="submit"
              saveState={paymentSaveState}
              idleText="Save Payment Settings"
              savingText="Saving Settings..."
              savedText="Saved to Database!"
              variant="emerald"
              idleIcon={<Check className="w-4 h-4" />}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
