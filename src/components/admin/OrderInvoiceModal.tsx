import React from 'react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  CreditCard, 
  Phone, 
  Mail, 
  ShieldCheck,
  Package,
  Calendar,
  Sparkles
} from 'lucide-react';

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, onClose }) => {
  const { storeBranding } = useStore();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const customerName = order.customerName || order.shippingAddress?.fullName || 'Customer';
  const customerEmail = order.customerEmail || order.shippingAddress?.email || '';
  const customerPhone = order.shippingAddress?.phone || '';
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const invoiceNumber = `INV-${order.id.replace('#', '')}`;

  const paymentStatus = order.paymentStatus || (order.paymentMethod === 'COD' ? 'Pending' : 'Paid');
  const paidOnline = order.paidOnlineAmount ?? (order.paymentMethod === 'COD' ? 0 : order.total);
  const codDue = order.codDueAmount ?? (order.paymentMethod === 'COD' ? order.total : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:static print:bg-white print:backdrop-blur-none">
      {/* Modal Container */}
      <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full">
        
        {/* Action Header Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Order Receipt & Invoice Preview</h3>
              <p className="text-[11px] text-slate-400">Order #{order.id} • Ready for high-resolution printing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet Body */}
        <div id="printable-invoice" className="p-6 sm:p-10 bg-white text-slate-900 font-sans space-y-8">
          
          {/* Top Brand Header & Invoice Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-black text-sm">
                  ⚡
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                  {storeBranding?.storeName || 'LUMINA'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {storeBranding?.subtitle || 'Verified Unique Winning Products & Innovations'}
              </p>
              <p className="text-xs text-slate-400">
                Official E-Commerce Store • support@luminastore.com
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-block bg-slate-100 text-slate-900 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider mb-1">
                Customer Invoice
              </div>
              <p className="text-sm font-mono font-bold text-slate-900">{invoiceNumber}</p>
              <p className="text-xs text-slate-500 flex items-center sm:justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Issued: {formattedDate}</span>
              </p>
              <div className="pt-1 flex items-center sm:justify-end gap-2 text-xs">
                <span className="font-semibold text-slate-500">Order Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                  order.status === 'Shipped' ? 'bg-sky-100 text-sky-800' :
                  order.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                  order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping / Payment Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Shipped & Billed To */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Billed & Shipped To</span>
              </p>
              <div className="space-y-0.5 text-slate-800">
                <p className="text-sm font-bold text-slate-950">{customerName}</p>
                <p className="text-slate-600">{order.shippingAddress?.address}</p>
                <p className="text-slate-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </p>
                <p className="text-slate-600">{order.shippingAddress?.country || 'United States'}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-slate-500 text-[11px]">
                {customerEmail && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{customerEmail}</span>
                  </p>
                )}
                {customerPhone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{customerPhone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Payment & Fulfillment Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>Payment & Shipping Method</span>
              </p>
              
              <div className="space-y-1 text-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold text-slate-900">{order.paymentMethod || 'Credit / Debit Card (Online)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>

                {/* Breakdown for Partial or COD */}
                {(order.paymentMethod === 'PartialPayment' || paymentStatus === 'Partially Paid' || order.paymentMethod === 'COD') && (
                  <div className="pt-1.5 mt-1 border-t border-slate-200/80 space-y-0.5 text-[11px]">
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Online Paid Advance:</span>
                      <span className="font-bold">₹{paidOnline.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-800 font-bold">
                      <span>Due on Delivery (COD):</span>
                      <span>₹{codDue.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Carrier & Tracking */}
              <div className="pt-2 border-t border-slate-200/60 text-slate-600 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-sky-500" />
                    <span>Shipping Carrier:</span>
                  </span>
                  <span className="font-semibold text-slate-800">{order.carrier || 'USPS Priority Express'}</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Tracking #:</span>
                    <span className="font-bold text-slate-900">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Order Line Items Table */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-600">
              Purchased Items Summary
            </p>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {order.items.map((item, index) => {
                    const lineTotal = item.lineTotal ?? (item.price * item.quantity);
                    return (
                      <tr key={index} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.productTitle}</p>
                          {item.bundleDiscount && item.bundleDiscount > 0 ? (
                            <p className="text-[10px] text-emerald-600 font-semibold">
                              Bundle Discount: -{item.bundleDiscount}% OFF
                            </p>
                          ) : null}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">₹{item.price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {item.bundleDiscount && item.bundleDiscount > 0 && lineTotal < (item.price * item.quantity) && (
                            <span className="text-[10px] text-slate-400 line-through block font-normal">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          )}
                          <span>₹{lineTotal.toFixed(2)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Summary (Subtotal, Discounts, Total) */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="space-y-2 max-w-sm text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Lumina 30-Day Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All products are carefully inspected and verified for quality. If you experience any issues or have questions regarding this delivery, please reach out with your Order ID.
              </p>
            </div>

            <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{(order.subtotal ?? (order.total + (order.discount || 0) - (order.shippingFee || 0))).toFixed(2)}</span>
              </div>

              {/* Itemized Discount Breakdown */}
              {(() => {
                const bundleDiscount = typeof order.bundleDiscountAmount === 'number'
                  ? order.bundleDiscountAmount
                  : (order.items || []).reduce((sum, item) => {
                      if (item.bundleDiscount && item.bundleDiscount > 0) {
                        const orig = item.price * item.quantity;
                        const line = item.lineTotal ?? orig;
                        return sum + Math.max(0, orig - line);
                      }
                      return sum;
                    }, 0);

                const promoDiscount = typeof order.promoDiscountAmount === 'number'
                  ? order.promoDiscountAmount
                  : (order.promoCode && order.discount > 0 && bundleDiscount === 0 ? order.discount : 0);

                const paymentDiscount = typeof order.paymentDiscountAmount === 'number'
                  ? order.paymentDiscountAmount
                  : 0;

                const hasGranularDiscounts = bundleDiscount > 0 || promoDiscount > 0 || paymentDiscount > 0;
                const leftoverGenericDiscount = !hasGranularDiscounts && (order.discount || 0) > 0 ? order.discount : 0;

                return (
                  <>
                    {bundleDiscount > 0 && (
                      <div className="flex justify-between text-amber-700 font-semibold">
                        <span className="flex items-center gap-1">
                          <span>Bundle Volume Discount:</span>
                        </span>
                        <span className="font-mono">-₹{bundleDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>
                          Coupon Code Discount {order.promoCode ? `(${order.promoCode})` : ''}:
                        </span>
                        <span className="font-mono">-₹{promoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {paymentDiscount > 0 && (
                      <div className="flex justify-between text-blue-700 font-semibold">
                        <span>
                          {order.paymentMethod === 'PayOnline'
                            ? 'Prepaid Online Discount:'
                            : order.paymentMethod === 'PartialPayment'
                            ? 'Partial Pay Discount:'
                            : 'Payment Mode Discount:'}
                        </span>
                        <span className="font-mono">-₹{paymentDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {leftoverGenericDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Savings / Discount Applied:</span>
                        <span className="font-mono">-₹{leftoverGenericDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {order.promoCode && promoDiscount === 0 && !hasGranularDiscounts && (
                      <div className="flex justify-between text-emerald-700 text-[11px]">
                        <span>Promo Code ({order.promoCode}):</span>
                        <span>Applied</span>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Shipping & Delivery Charges:</span>
                </span>
                <span className="font-semibold">
                  {order.shippingFee === 0 || !order.shippingFee ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      FREE Delivery (₹0.00)
                    </span>
                  ) : (
                    <span className="text-slate-900 font-mono">
                      ₹{order.shippingFee.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-950">
                <span className="text-sm">Grand Total:</span>
                <span className="text-lg font-mono text-slate-900">₹{order.total.toFixed(2)}</span>
              </div>

              {/* Status footer for balance */}
              {(order.paymentMethod === 'PartialPayment' || paymentStatus === 'Partially Paid' || order.paymentMethod === 'COD') && (
                <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Amount Paid:</span>
                    <span>₹{paidOnline.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Balance Due Upon Delivery:</span>
                    <span>₹{codDue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Receipt Note */}
          <div className="pt-6 border-t border-slate-200 text-center space-y-1 text-xs text-slate-400">
            <p className="font-semibold text-slate-600">Thank you for ordering with {storeBranding?.storeName || 'Lumina'}!</p>
            <p className="text-[11px]">This is an official computer-generated receipt. Keep this invoice for your warranty and record keeping.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
