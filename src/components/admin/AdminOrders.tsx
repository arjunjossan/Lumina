import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { OrderInvoiceModal } from './OrderInvoiceModal';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Eye, 
  Edit, 
  X, 
  Trash2, 
  CreditCard, 
  IndianRupee, 
  AlertCircle,
  Check,
  Printer,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderPaymentDetails, deleteOrder, showNotification } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('All');

  // Selected Order for Modal View / Edit
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [orderSaveState, setOrderSaveState] = useState<SaveButtonState>('idle');

  // Modal form states
  const [newStatus, setNewStatus] = useState<OrderStatus>('Processing');
  const [trackingNo, setTrackingNo] = useState('');
  const [carrier, setCarrier] = useState('USPS Priority Mail');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'Pending' | 'Paid' | 'Partially Paid' | 'Failed'>('Paid');
  const [newPaymentMethod, setNewPaymentMethod] = useState('PayOnline');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [codDue, setCodDue] = useState<number>(0);

  const openEditModal = (ord: Order) => {
    setActiveOrder(ord);
    setNewStatus(ord.status);
    setTrackingNo(ord.trackingNumber || `TRK-USPS-${Math.floor(100000 + Math.random() * 900000)}`);
    setCarrier(ord.carrier || 'USPS Priority Mail');
    setNewPaymentStatus(ord.paymentStatus || (ord.paymentMethod === 'COD' ? 'Pending' : 'Paid'));
    setNewPaymentMethod(ord.paymentMethod || 'PayOnline');
    setPaidAmount(ord.paidOnlineAmount ?? (ord.paymentMethod === 'COD' ? 0 : ord.total));
    setCodDue(ord.codDueAmount ?? (ord.paymentMethod === 'COD' ? ord.total : 0));
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setOrderSaveState('saving');

    // Update fulfillment status & tracking
    updateOrderStatus(activeOrder.id, newStatus, trackingNo, carrier);

    // Update payment details & remaining balance
    updateOrderPaymentDetails(activeOrder.id, {
      paymentStatus: newPaymentStatus,
      paidOnlineAmount: Number(paidAmount),
      codDueAmount: Number(codDue),
      paymentMethod: newPaymentMethod
    });

    setOrderSaveState('saved');
    showNotification(`✅ Order #${activeOrder.id} successfully updated!`);

    setTimeout(() => {
      setOrderSaveState('idle');
      setActiveOrder(null);
    }, 700);
  };

  // Helper to mark remaining COD balance as settled
  const handleSettleRemainingBalance = () => {
    if (!activeOrder) return;
    const totalOrder = activeOrder.total;
    setPaidAmount(totalOrder);
    setCodDue(0);
    setNewPaymentStatus('Paid');
    showNotification(`Remaining COD balance marked as collected/paid!`);
  };

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCollectedOnline = orders.reduce((sum, o) => sum + (o.paidOnlineAmount || (o.paymentMethod === 'PayOnline' ? o.total : 0)), 0);
  const totalRemainingCodDue = orders.reduce((sum, o) => sum + (o.codDueAmount || (o.paymentMethod === 'COD' ? o.total : 0)), 0);
  const partialOrdersCount = orders.filter(o => o.paymentMethod === 'PartialPayment' || o.paymentStatus === 'Partially Paid').length;

  const getPaymentBadge = (ord: Order) => {
    const method = (ord.paymentMethod || '').toLowerCase();
    const pStatus = ord.paymentStatus || (method === 'cod' ? 'Pending' : 'Paid');

    if (method.includes('partial') || pStatus === 'Partially Paid') {
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 font-black text-[10px] px-2 py-0.5 rounded-md border border-amber-500/30">
            <Layers className="w-3 h-3" />
            <span>PARTIAL PAYMENT</span>
          </span>
          <div className="text-[10px] font-mono">
            <span className="text-emerald-400">Paid: ₹{(ord.paidOnlineAmount || 0).toFixed(2)}</span>
            <span className="text-slate-500 mx-1">•</span>
            <span className="text-rose-400 font-bold">Due: ₹{(ord.codDueAmount || 0).toFixed(2)}</span>
          </div>
        </div>
      );
    }

    if (method.includes('online') || method === 'payonline' || pStatus === 'Paid') {
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/30">
            <CreditCard className="w-3 h-3" />
            <span>FULL PAYMENT (ONLINE)</span>
          </span>
          <div className="text-[10px] font-mono text-emerald-400">
            Paid: ₹{(ord.paidOnlineAmount || ord.total).toFixed(2)} (100%)
          </div>
        </div>
      );
    }

    // Default COD
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 font-black text-[10px] px-2 py-0.5 rounded-md border border-sky-500/30">
          <IndianRupee className="w-3 h-3" />
          <span>CASH ON DELIVERY (COD)</span>
        </span>
        <div className="text-[10px] font-mono text-amber-400">
          Balance Due: ₹{(ord.codDueAmount || ord.total).toFixed(2)}
        </div>
      </div>
    );
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    
    let matchesPayment = true;
    const method = (o.paymentMethod || '').toLowerCase();
    if (selectedPaymentFilter === 'Online') {
      matchesPayment = method.includes('online') || o.paymentStatus === 'Paid';
    } else if (selectedPaymentFilter === 'Partial') {
      matchesPayment = method.includes('partial') || o.paymentStatus === 'Partially Paid';
    } else if (selectedPaymentFilter === 'COD') {
      matchesPayment = method === 'cod' || (!method.includes('online') && !method.includes('partial'));
    }

    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesPayment && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Orders Revenue</span>
          <p className="text-2xl font-black text-white font-mono">₹{totalRevenue.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500">{orders.length} total customer orders</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Total Paid (Online Gateway)</span>
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">₹{totalCollectedOnline.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500">Collected securely upfront</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Remaining Balance (COD Due)</span>
          </span>
          <p className="text-2xl font-black text-amber-400 font-mono">₹{totalRemainingCodDue.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500">To collect upon courier delivery</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-500" />
            <span>Partial Payment Orders</span>
          </span>
          <p className="text-2xl font-black text-white font-mono">{partialOrdersCount}</p>
          <span className="text-[10px] text-slate-500">Split payment transactions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search Order ID, Customer, Tracking #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Payment Mode Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 shrink-0">Payment Mode:</span>
            {[
              { id: 'All', label: 'All Modes' },
              { id: 'Online', label: '💳 Full Online' },
              { id: 'Partial', label: '⚡ Partial (Split)' },
              { id: 'COD', label: '💵 COD' }
            ].map((pf) => (
              <button
                key={pf.id}
                onClick={() => setSelectedPaymentFilter(pf.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedPaymentFilter === pf.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fulfillment Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-900">
          <span className="text-xs font-bold text-slate-400 shrink-0">Fulfillment:</span>
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === st ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Transaction Mode & Balances</th>
                <th className="p-4">Order Total</th>
                <th className="p-4">Status & Tracking</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Order ID & Date */}
                    <td className="p-4">
                      <p className="font-bold text-white font-mono">{ord.id}</p>
                      <p className="text-[10px] text-slate-500">{new Date(ord.createdAt).toLocaleString()}</p>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-bold text-slate-200">{ord.customerName}</p>
                      <p className="text-[10px] text-slate-400">{ord.customerEmail}</p>
                    </td>

                    {/* Transaction Mode & Balance Status */}
                    <td className="p-4">
                      {getPaymentBadge(ord)}
                    </td>

                    {/* Total Amount */}
                    <td className="p-4">
                      <p className="font-black text-amber-400 font-mono text-sm">₹{ord.total.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500">{ord.items.reduce((s, i) => s + i.quantity, 0)} Items</p>
                    </td>

                    {/* Status & Tracking */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                          ord.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                          ord.status === 'Shipped' ? 'bg-sky-500/20 text-sky-400' :
                          ord.status === 'Processing' ? 'bg-amber-500/20 text-amber-400' :
                          ord.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {ord.status}
                        </span>
                        {ord.trackingNumber && (
                          <p className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            {ord.carrier?.split(' ')[0]}: {ord.trackingNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoiceOrder(ord)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 border border-slate-800 cursor-pointer shadow-xs hover:border-amber-500/50"
                          title="Print Customer Invoice & Receipt"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Print Invoice</span>
                        </button>
                        <button
                          onClick={() => openEditModal(ord)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 border border-slate-800 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Manage Purchase</span>
                        </button>
                        <button
                          onClick={() => setOrderToDelete(ord)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL PURCHASE & BALANCE MANAGEMENT MODAL */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-800 text-xs text-slate-200 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Complete Purchase Management</span>
                <h3 className="text-lg font-bold text-white font-serif">Order #{activeOrder.id}</h3>
                <p className="text-[11px] text-slate-400">Placed on {new Date(activeOrder.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(activeOrder)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Print Customer Receipt"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Invoice</span>
                </button>
                <button onClick={() => setActiveOrder(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <p className="font-bold text-amber-400">Customer Contact</p>
                <p className="text-white font-semibold">{activeOrder.customerName}</p>
                <p className="text-slate-400">{activeOrder.customerEmail}</p>
                <p className="text-slate-400">Phone: {activeOrder.shippingAddress.phone}</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <p className="font-bold text-amber-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delivery Address</span>
                </p>
                <p className="text-white">{activeOrder.shippingAddress.address}</p>
                <p className="text-slate-400">{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zipCode}</p>
              </div>
            </div>

            {/* Items Summary */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <p className="font-bold text-white uppercase text-[10px] tracking-wider">Ordered Items</p>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 truncate max-w-[280px]">{it.productTitle} x{it.quantity}</span>
                    <span className="font-mono font-bold text-amber-400">₹{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-5">
              {/* Payment Mode & Remaining Balance Control System */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Transaction Mode & Balance Settlement</span>
                  </span>
                  <span className="text-xs font-mono font-black text-amber-400">Total: ₹{activeOrder.total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Transaction Mode</label>
                    <select
                      value={newPaymentMethod}
                      onChange={(e) => {
                        const m = e.target.value;
                        setNewPaymentMethod(m);
                        if (m === 'PayOnline') {
                          setPaidAmount(activeOrder.total);
                          setCodDue(0);
                          setNewPaymentStatus('Paid');
                        } else if (m === 'COD') {
                          setPaidAmount(0);
                          setCodDue(activeOrder.total);
                          setNewPaymentStatus('Pending');
                        } else if (m === 'PartialPayment') {
                          const upfront = Math.round((activeOrder.total * 0.2) * 100) / 100;
                          setPaidAmount(upfront);
                          setCodDue(Math.round((activeOrder.total - upfront) * 100) / 100);
                          setNewPaymentStatus('Partially Paid');
                        }
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-amber-500 text-white font-bold"
                    >
                      <option value="PayOnline">Full Online Payment</option>
                      <option value="PartialPayment">Partial Payment (Split)</option>
                      <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Payment Status</label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-amber-500 text-white font-bold"
                    >
                      <option value="Paid">Paid (Full)</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Pending">Pending / Unpaid</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Online Paid (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPaidAmount(val);
                        setCodDue(Math.max(0, Math.round((activeOrder.total - val) * 100) / 100));
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-amber-500 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Remaining Balance (COD Due ₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={codDue}
                      onChange={(e) => setCodDue(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-amber-500 text-rose-400 font-mono font-bold"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleSettleRemainingBalance}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold p-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Remaining Balance as Collected</span>
                    </button>
                  </div>
                </div>

                {activeOrder.razorpayPaymentId && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    Gateway Reference ID: <strong className="text-slate-200">{activeOrder.razorpayPaymentId}</strong>
                  </p>
                )}
              </div>

              {/* Fulfillment & Tracking Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-white block mb-1">Fulfillment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 text-white font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-white block mb-1">Carrier Name</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-white block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono focus:border-amber-500 text-white"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const ord = activeOrder;
                    setActiveOrder(null);
                    setOrderToDelete(ord);
                  }}
                  className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Order</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveOrder(null)}
                    className="bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <AdminSaveButton
                    type="submit"
                    saveState={orderSaveState}
                    idleText="Save Order Changes"
                    savingText="Saving Changes..."
                    savedText="Changes Saved!"
                    idleIcon={<CheckCircle2 className="w-4 h-4" />}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ORDER CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Delete Order #{orderToDelete.id}?</h4>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete this customer order? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER INVOICE PRINT MODAL */}
      <OrderInvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
