import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { RotateCcw, ShieldCheck, CheckCircle2, ArrowRight, Mail, HelpCircle, FileText } from 'lucide-react';

export const ReturnsPolicyPage: React.FC = () => {
  const { navigateTo, submitSupportInquiry, showNotification, customerUser, setCustomerPortalTab } = useStore();

  const [orderNumInput, setOrderNumInput] = useState('');
  const [emailInput, setEmailInput] = useState(customerUser?.email || '');
  const [reasonInput, setReasonInput] = useState('Unsatisfied with performance');
  const [commentsInput, setCommentsInput] = useState('');
  const [submittedReturn, setSubmittedReturn] = useState(false);

  React.useEffect(() => {
    if (customerUser?.email && !emailInput) {
      setEmailInput(customerUser.email);
    }
  }, [customerUser]);

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumInput.trim() || !emailInput.trim()) return;

    submitSupportInquiry({
      name: customerUser?.name || 'Customer Return Request',
      email: emailInput.trim(),
      category: 'Returns & Refunds',
      subject: `RETURN REQUEST for Order #${orderNumInput.trim()}`,
      orderNumber: orderNumInput.trim(),
      message: `Return Reason: ${reasonInput}\nAdditional Comments: ${commentsInput.trim() || 'None'}`
    });

    setSubmittedReturn(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Risk-Free Guarantee</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-white">
          30-Day Money Back & Returns Center
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          We want you to love every winning product you order from Lumina. If you are not 100% thrilled with your purchase for any reason, return it within 30 days for a full refund.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              const el = document.getElementById('return-form-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Online Return Request</span>
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Contact Support Agent</span>
          </button>
        </div>
      </div>

      {/* 4-Step Process */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-serif">How Returns Work (4 Easy Steps)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
            <h3 className="font-bold text-slate-900 text-sm">Submit Request</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your Order # and email in our return portal below.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
            <h3 className="font-bold text-slate-900 text-sm">Get Prepaid Label</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive a pre-paid printable shipping return label via email within 2 hours.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
            <h3 className="font-bold text-slate-900 text-sm">Drop Off Package</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Attach label to original package box and drop off at any local courier station.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">4</span>
            <h3 className="font-bold text-slate-900 text-sm">Instant Refund</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full refund credited back to original payment method within 24 hours of package arrival.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Return Request Portal */}
      <div id="return-form-section" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-500" />
            <span>Initiate Return or Replacement Ticket</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Directly sends your return authorization request to Lumina Admin support.</p>
        </div>

        {submittedReturn ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-3">
            <div className="flex items-center gap-3 text-emerald-700 font-bold text-base">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <span>Return Request Submitted to Support!</span>
            </div>
            <p className="text-xs leading-relaxed">
              Your return authorization ticket for Order <strong>#{orderNumInput}</strong> has been logged directly with our support admin team. Check your email (<strong>{emailInput}</strong>) or view the official response and return label instructions in your customer profile.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  setCustomerPortalTab('returns');
                  navigateTo('my-orders', undefined, 'returns');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Track Return Status in My Profile</span>
              </button>

              <button
                onClick={() => {
                  setSubmittedReturn(false);
                  setOrderNumInput('');
                  setCommentsInput('');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Submit Another Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReturnSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Order Reference Number *</label>
                <input
                  type="text"
                  placeholder="e.g. LUM-98214"
                  value={orderNumInput}
                  onChange={(e) => setOrderNumInput(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address on Order *</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Return *</label>
              <select
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="Unsatisfied with performance">Unsatisfied with performance</option>
                <option value="Defective or Damaged in transit">Defective or Damaged in transit</option>
                <option value="Received incorrect item or quantity">Received incorrect item or quantity</option>
                <option value="Ordered by mistake / No longer needed">Ordered by mistake / No longer needed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Additional Notes / Comments (Optional)</label>
              <textarea
                rows={3}
                placeholder="Let us know if you prefer a full refund or an immediate free replacement..."
                value={commentsInput}
                onChange={(e) => setCommentsInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Return Ticket to Admin</span>
            </button>
          </form>
        )}
      </div>

      {/* Return Policy FAQs */}
      <div className="bg-slate-900 text-slate-200 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base font-serif flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Return Eligibility & Terms</span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-400 list-disc pl-5 leading-relaxed">
          <li>Items must be returned within 30 days of package delivery date.</li>
          <li>Original accessories, cables, and packaging boxes must be included.</li>
          <li>In cases of defective or damaged goods, return shipping fees are 100% paid by Lumina.</li>
          <li>Refunding timeline is 1-3 business days depending on your bank once returned package is inspected.</li>
        </ul>
      </div>
    </div>
  );
};
