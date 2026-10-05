import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Truck, Clock, Globe, ShieldCheck, ArrowRight, PackageSearch, HelpCircle, Mail } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  const { navigateTo, shippingSettings } = useStore();
  const fee = shippingSettings?.standardFee ?? 49;
  const threshold = shippingSettings?.freeShippingThreshold ?? 999;
  const timeframe = shippingSettings?.estimatedDeliveryDays || '2–4 Business Days';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5" />
          <span>Worldwide Express Delivery</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-white">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          At Lumina, we process and dispatch every order with express speed. All parcels feature end-to-end door-to-door tracking and protective air-cushioned packaging.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigateTo('order-tracking')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Track Your Active Package</span>
          </button>
          
          <button
            onClick={() => navigateTo('contact')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Shipping Support Team</span>
          </button>
        </div>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Rapid 24-Hour Fulfillment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Orders placed before 2:00 PM EST are dispatched the same day. Tracking codes are issued via email within 12 hours.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Free Express Shipping Over ₹{threshold}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All cart totals over ₹{threshold} automatically unlock free priority express delivery. Standard fee is ₹{fee} on orders below ₹{threshold}.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Global Carrier Network</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We partner directly with FedEx Express, DHL Worldwide, and USPS Priority for guaranteed safe arrival.
          </p>
        </div>
      </div>

      {/* Detailed Delivery Timelines Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 font-serif">Estimated Shipping Delivery Windows</h2>
          <p className="text-xs text-slate-500 mt-1">Delivery timelines calculated from the day of order dispatch.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Destination Region</th>
                <th className="py-3 px-4">Standard Delivery</th>
                <th className="py-3 px-4">Express Priority Air</th>
                <th className="py-3 px-4">Shipping Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">Standard Express Delivery (Storewide)</td>
                <td className="py-3.5 px-4">{timeframe}</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">Priority Dispatched</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-emerald-600">FREE</span> over ₹{threshold} (₹{fee} under ₹{threshold})
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">VIP Priority Air Delivery</td>
                <td className="py-3.5 px-4">1 – 3 Business Days</td>
                <td className="py-3.5 px-4 text-emerald-600 font-bold">Same-Day Dispatch</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-emerald-600">FREE</span> over ₹{threshold} (₹{fee} under ₹{threshold})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Customs, Duties & Taxes</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All prices on Lumina include all applicable sales tax and customs duties for North America and EU orders. No hidden fees or surprise clearance charges upon delivery.
          </p>
        </div>

        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Lost or Stolen Packages</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every shipment includes complimentary Lumina Transit Guarantee. If your package is marked lost by the carrier or delayed past 14 days, we reship a brand-new unit immediately at zero cost.
          </p>
        </div>
      </div>
    </div>
  );
};
