import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Headphones, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { submitSupportInquiry, navigateTo, customerUser, setCustomerPortalTab, isCustomerAuthenticated } = useStore();

  const [name, setName] = useState(customerUser?.name || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [category, setCategory] = useState<'General Question' | 'Order Tracking' | 'Returns & Refunds' | 'Shipping Issue' | 'Product Inquiry'>('General Question');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Auto-sync if customerUser changes
  React.useEffect(() => {
    if (customerUser) {
      if (!name && customerUser.name) setName(customerUser.name);
      if (!email && customerUser.email) setEmail(customerUser.email);
    }
  }, [customerUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    try {
      const createdInquiry = await submitSupportInquiry({
        name: name.trim(),
        email: email.trim(),
        category,
        orderNumber: orderNumber.trim() || undefined,
        subject: subject.trim(),
        message: message.trim()
      });

      setSubmittedTicketId(createdInquiry.id);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <Headphones className="w-3.5 h-3.5" />
          <span>24/7 VIP Customer Support</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-white">
          Contact Lumina Support Team
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Have a question about a winning product, order shipment, or return? Fill out the form below. Your query goes directly to our Admin Support Portal for swift response.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-sm font-serif border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Direct Contact Channels</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Email Assistance</p>
                  <p className="text-slate-500">support@lumina-store.com</p>
                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Average reply: &lt; 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Support Operating Hours</p>
                  <p className="text-slate-500">Monday – Sunday (24/7)</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">VIP Priority Handling</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Global Headquarters</p>
                  <p className="text-slate-500">Lumina E-Commerce Plaza, Suite 800<br />New York, NY 10001 USA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links box */}
          <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Self-Service Portals</h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => navigateTo('order-tracking')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>Package Tracking Portal</span>
                <span className="text-amber-400 font-bold">→</span>
              </button>
              
              <button
                onClick={() => navigateTo('returns-policy')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>Start Return Request</span>
                <span className="text-amber-400 font-bold">→</span>
              </button>

              <button
                onClick={() => navigateTo('faq')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>Read FAQ Knowledgebase</span>
                <span className="text-amber-400 font-bold">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span>Submit Support Inquiry directly to Admin</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Our support admin panel logs your query immediately for live review.</p>
          </div>

          {submittedTicketId ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-4">
              <div className="flex items-center gap-3 text-emerald-700 font-bold text-base">
                <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-600" />
                <span>Support Inquiry Submitted to Admin!</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Thank you <strong>{name}</strong>! Your inquiry message has been delivered directly to the Lumina Admin Control Center.
              </p>
              <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs space-y-1 font-mono">
                <p><span className="text-slate-500">Subject:</span> <strong>{subject}</strong></p>
                <p><span className="text-slate-500">Contact Email:</span> <strong>{email}</strong></p>
                <p><span className="text-slate-500">Category:</span> <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans font-bold text-[10px]">{category}</span></p>
              </div>
              <p className="text-xs text-slate-600">
                You can track this inquiry and see the store administrator's official reply under your account profile.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    setCustomerPortalTab('inquiries');
                    navigateTo('my-orders', undefined, 'inquiries');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>View in My Profile & Support Hub</span>
                </button>

                <button
                  onClick={() => {
                    setSubmittedTicketId(null);
                    setSubject('');
                    setMessage('');
                    setOrderNumber('');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Emily Watson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. emily@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Topic Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="General Question">General Question</option>
                    <option value="Order Tracking">Order Tracking</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                    <option value="Shipping Issue">Shipping Issue</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Order # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. LUM-98214"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Headline / Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding levitating speaker Bluetooth connection"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  placeholder="Describe your request in detail so our support admin can assist you swiftly..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to Admin Dashboard</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
