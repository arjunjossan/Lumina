import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Package, ArrowRight, Truck, Mail } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { lastPlacedOrder, navigateTo } = useStore();

  if (!lastPlacedOrder) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-600">No order placed yet.</p>
        <button onClick={() => navigateTo('home')} className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-xl">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-12 text-center space-y-6">
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment Confirmed & Order Placed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Thank You for Your Purchase, {lastPlacedOrder.customerName}!
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Order Confirmation <strong>#{lastPlacedOrder.id}</strong> has been sent to <strong>{lastPlacedOrder.customerEmail}</strong>.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <p className="text-slate-400 font-semibold">Order ID:</p>
                <p className="font-bold text-slate-900">{lastPlacedOrder.id}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold">Order Status:</p>
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  {lastPlacedOrder.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-700">Ordered Products:</p>
              {lastPlacedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span className="text-slate-800 font-medium truncate max-w-xs">{item.productTitle} (x{item.quantity})</span>
                  <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Actual Price):</span>
                <span className="font-mono font-semibold">
                  ₹{(lastPlacedOrder.subtotal ?? (lastPlacedOrder.total + (lastPlacedOrder.discount || 0) - (lastPlacedOrder.shippingFee || 0))).toFixed(2)}
                </span>
              </div>

              {/* Itemized Discounts */}
              {(() => {
                const bundleDiscount = typeof lastPlacedOrder.bundleDiscountAmount === 'number'
                  ? lastPlacedOrder.bundleDiscountAmount
                  : (lastPlacedOrder.items || []).reduce((sum, item) => {
                      if (item.bundleDiscount && item.bundleDiscount > 0) {
                        const orig = item.price * item.quantity;
                        const line = item.lineTotal ?? orig;
                        return sum + Math.max(0, orig - line);
                      }
                      return sum;
                    }, 0);

                const promoDiscount = typeof lastPlacedOrder.promoDiscountAmount === 'number'
                  ? lastPlacedOrder.promoDiscountAmount
                  : (lastPlacedOrder.promoCode && lastPlacedOrder.discount > 0 && bundleDiscount === 0 ? lastPlacedOrder.discount : 0);

                const paymentDiscount = typeof lastPlacedOrder.paymentDiscountAmount === 'number'
                  ? lastPlacedOrder.paymentDiscountAmount
                  : 0;

                const hasGranular = bundleDiscount > 0 || promoDiscount > 0 || paymentDiscount > 0;
                const leftoverGeneric = !hasGranular && (lastPlacedOrder.discount || 0) > 0 ? lastPlacedOrder.discount : 0;

                return (
                  <>
                    {bundleDiscount > 0 && (
                      <div className="flex justify-between text-amber-700 font-semibold">
                        <span>Bundle Volume Discount:</span>
                        <span className="font-mono">-₹{bundleDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon Discount {lastPlacedOrder.promoCode ? `(${lastPlacedOrder.promoCode})` : ''}:</span>
                        <span className="font-mono">-₹{promoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {paymentDiscount > 0 && (
                      <div className="flex justify-between text-blue-700 font-semibold">
                        <span>
                          {lastPlacedOrder.paymentMethod === 'PayOnline'
                            ? 'Prepaid Online Discount:'
                            : lastPlacedOrder.paymentMethod === 'PartialPayment'
                            ? 'Partial Split Pay Discount:'
                            : 'Payment Mode Discount:'}
                        </span>
                        <span className="font-mono">-₹{paymentDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {leftoverGeneric > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Discount Applied:</span>
                        <span className="font-mono">-₹{leftoverGeneric.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Delivery Charges (Free vs Paid) */}
              <div className="flex justify-between items-center text-slate-700">
                <span>Shipping & Delivery Charges:</span>
                <span>
                  {lastPlacedOrder.shippingFee === 0 || !lastPlacedOrder.shippingFee ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      FREE Delivery (₹0.00)
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-slate-900">
                      ₹{lastPlacedOrder.shippingFee.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between font-black text-slate-950 pt-2 border-t border-dashed border-slate-200 text-sm">
                <span>Grand Total:</span>
                <span className="text-amber-600 font-mono text-base">₹{lastPlacedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 mt-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Payment Summary
              </p>
              
              <div className="grid grid-cols-2 gap-y-2 text-[11px] text-slate-600">
                <div>Payment Method:</div>
                <div className="font-bold text-slate-900 text-right">
                  {lastPlacedOrder.paymentMethod === 'COD' && 'Cash on Delivery (COD)'}
                  {lastPlacedOrder.paymentMethod === 'PayOnline' && 'Paid Online (100%)'}
                  {lastPlacedOrder.paymentMethod === 'PartialPayment' && 'Partial Online + COD'}
                </div>

                <div>Payment Status:</div>
                <div className="text-right">
                  <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    lastPlacedOrder.paymentStatus === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : lastPlacedOrder.paymentStatus === 'Partially Paid'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {lastPlacedOrder.paymentStatus || 'Pending'}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-100">Paid Online Now:</div>
                <div className="pt-1.5 border-t border-slate-100 font-black text-slate-900 text-right">
                  ₹{(lastPlacedOrder.paidOnlineAmount || 0).toFixed(2)}
                </div>

                <div>Due on Delivery (COD):</div>
                <div className={`font-black text-right ${
                  (lastPlacedOrder.codDueAmount || 0) > 0 ? 'text-amber-600 font-black' : 'text-slate-500'
                }`}>
                  ₹{(lastPlacedOrder.codDueAmount || 0).toFixed(2)}
                </div>
              </div>

              {lastPlacedOrder.paymentMethod === 'COD' && (
                <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 font-medium">
                  💡 Please keep exactly <strong>₹{(lastPlacedOrder.codDueAmount || 0).toFixed(2)}</strong> ready in cash when our delivery executive arrives.
                </p>
              )}

              {lastPlacedOrder.paymentMethod === 'PartialPayment' && (
                <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100 font-medium">
                  💡 Upfront partial payment of <strong>₹{(lastPlacedOrder.paidOnlineAmount || 0).toFixed(2)}</strong> has been successfully captured. The balance of <strong>₹{(lastPlacedOrder.codDueAmount || 0).toFixed(2)}</strong> is payable in cash on delivery.
                </p>
              )}

              {lastPlacedOrder.paymentMethod === 'PayOnline' && (
                <p className="text-[10px] text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 font-medium">
                  🎉 Full payment received online! You will not have to pay anything at the time of delivery.
                </p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Delivery Address:</p>
              <p className="font-semibold text-slate-900">{lastPlacedOrder.shippingAddress.fullName}</p>
              <p>{lastPlacedOrder.shippingAddress.address}, {lastPlacedOrder.shippingAddress.city}, {lastPlacedOrder.shippingAddress.state} {lastPlacedOrder.shippingAddress.zipCode}</p>
              <p>Phone: {lastPlacedOrder.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigateTo('order-tracking')}
              className="w-full sm:w-auto bg-slate-900 text-white text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Track Live Package Status</span>
            </button>

            <button
              onClick={() => navigateTo('home')}
              className="w-full sm:w-auto bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
