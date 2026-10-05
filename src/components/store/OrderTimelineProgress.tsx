import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderTimelineProgressProps {
  order: Order;
  className?: string;
}

export const OrderTimelineProgress: React.FC<OrderTimelineProgressProps> = ({ order, className = '' }) => {
  const [showDetailedLog, setShowDetailedLog] = useState(false);

  // Map order status to numeric step index (1: Confirmed, 2: Shipped, 3: In Transit, 4: Delivered)
  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Processing':
        return 1; // Order confirmed, being prepared
      case 'Shipped':
        // If carrier tracking number is present and status is Shipped, it can be Shipped (2) or In Transit (3)
        return order.trackingNumber ? 3 : 2;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStepIndex(order.status);

  // Format dates for milestones
  const orderDate = new Date(order.createdAt);
  const formattedOrderDate = isNaN(orderDate.getTime()) 
    ? 'Recently Placed' 
    : orderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedOrderTime = isNaN(orderDate.getTime()) 
    ? '' 
    : orderDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  // Estimated or completed delivery date
  const deliveryDateDisplay = order.estimatedDelivery || '3-5 Business Days';

  const steps = [
    {
      id: 1,
      title: 'Confirmed',
      subtitle: 'Order Placed & Verified',
      icon: CheckCircle2,
      timestamp: `${formattedOrderDate} ${formattedOrderTime}`,
      location: 'Central Order Processing',
      description: 'Payment verified and inventory allocated from warehouse.',
      completed: currentStep >= 1,
      active: currentStep === 1,
    },
    {
      id: 2,
      title: 'Shipped',
      subtitle: 'Handed to Courier Partner',
      icon: Package,
      timestamp: currentStep >= 2 ? `${formattedOrderDate}` : 'Pending Dispatch',
      location: order.carrier ? `${order.carrier} Hub` : 'Fulfillment Center',
      description: 'Package boxed, weighed, and handover scan completed.',
      completed: currentStep >= 2,
      active: currentStep === 2,
    },
    {
      id: 3,
      title: 'In Transit',
      subtitle: 'En Route to Destination',
      icon: Truck,
      timestamp: currentStep >= 3 ? 'Active Route' : 'Awaiting Linehaul',
      location: order.trackingNumber ? `Waybill: ${order.trackingNumber}` : 'Transit Hub',
      description: `Package moving through regional sorting network toward ${order.shippingAddress?.city || 'destination'}.`,
      completed: currentStep >= 3,
      active: currentStep === 3,
    },
    {
      id: 4,
      title: 'Delivered',
      subtitle: 'Safely Arrived',
      icon: MapPin,
      timestamp: currentStep >= 4 ? 'Delivered' : `Estimated ${deliveryDateDisplay}`,
      location: `${order.shippingAddress?.city || 'Local Delivery'}, ${order.shippingAddress?.state || ''}`,
      description: order.status === 'Delivered'
        ? 'Package delivered and signed at recipient address.'
        : 'Out for final delivery with courier driver.',
      completed: currentStep >= 4,
      active: currentStep === 4,
    },
  ];

  // Percentage for the continuous progress bar
  const progressPercentage = 
    currentStep === 1 ? 12 :
    currentStep === 2 ? 40 :
    currentStep === 3 ? 75 : 100;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6 ${className}`}>
      
      {/* Top Header & Delivery Estimation Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
              Shipment Status
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-700">Order #{order.id}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 font-serif mt-1">
            {order.status === 'Delivered' 
              ? 'Package Delivered Successfully' 
              : order.status === 'Shipped' 
                ? 'Package In Transit to Your Address' 
                : 'Order Confirmed & Processing'}
          </h3>
        </div>

        <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {order.status === 'Delivered' ? 'Delivery Completed' : 'Estimated Arrival'}
            </p>
            <p className="text-xs font-black text-slate-900">
              {order.status === 'Delivered' ? 'Delivered' : deliveryDateDisplay}
            </p>
          </div>
        </div>
      </div>

      {/* Main Responsive Step-by-Step Progress Timeline */}
      <div className="py-2">
        {/* Horizontal Desktop/Tablet Timeline */}
        <div className="hidden sm:block">
          <div className="relative mb-8">
            {/* Background Track Line */}
            <div className="absolute top-5 left-8 right-8 h-1.5 bg-slate-100 rounded-full -z-0" />
            
            {/* Active Filled Progress Line */}
            <div 
              className="absolute top-5 left-8 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-700 -z-0"
              style={{ width: `calc(${progressPercentage}% - 3rem)` }}
            />

            {/* Steps Row */}
            <div className="grid grid-cols-4 relative z-10">
              {steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="text-center flex flex-col items-center">
                    {/* Circle Node */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                      step.completed 
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                    } ${step.active ? 'ring-4 ring-amber-100 scale-110' : ''}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>

                    {/* Step Title & Details */}
                    <div className="mt-3 space-y-0.5">
                      <p className={`text-xs font-black uppercase tracking-wider ${
                        step.completed ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {step.subtitle}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {step.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="block sm:hidden space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="relative flex items-start gap-3">
                  {/* Step Pin on Line */}
                  <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                    step.completed
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-100'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  } ${step.active ? 'ring-4 ring-amber-200' : ''}`}>
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-black uppercase tracking-wider ${
                        step.completed ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {step.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {step.subtitle}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Step Highlight Banner */}
      <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-black text-slate-900">
              Current Milestone: {steps[currentStep - 1]?.title || 'Confirmed'}
            </p>
            <p className="text-slate-600 text-[11px]">
              {steps[currentStep - 1]?.description || 'Order processing in warehouse.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetailedLog(prev => !prev)}
          className="text-amber-700 hover:text-amber-800 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>{showDetailedLog ? 'Hide Checkpoints' : 'View Checkpoint Log'}</span>
          {showDetailedLog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Checkpoints Log / Audit Trail */}
      {showDetailedLog && (
        <div className="pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Full Courier Scan Audit Trail</span>
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              Verified by {order.carrier || 'Courier Gateway'}
            </span>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            {steps.filter(s => s.completed).reverse().map((s, idx) => (
              <div key={idx} className="flex items-start justify-between gap-4 pb-2.5 border-b border-slate-200/60 last:border-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{s.title}: {s.subtitle}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 pl-5">{s.description}</p>
                  <p className="text-[10px] text-slate-400 pl-5">Location: {s.location}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">
                  {s.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
