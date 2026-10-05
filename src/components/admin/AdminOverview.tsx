import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  IndianRupee, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { products, orders, setAdminTab } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const lowStockProducts = products.filter((p) => p.stock <= 10);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+24.5% vs last month</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{orders.length}</p>
          <p className="text-[11px] text-amber-400 font-semibold">All customer orders</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">₹{avgOrderValue.toFixed(2)}</p>
          <p className="text-[11px] text-sky-400 font-semibold">High bundle conversion</p>
        </div>

        {/* Active Products */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{products.length}</p>
          <p className="text-[11px] text-purple-400 font-semibold">
            {products.filter((p) => p.isWinningProduct).length} Winning Products Flagged
          </p>
        </div>

      </div>

      {/* Revenue Trend Visualizer */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-serif">Weekly Revenue Performance</h3>
            <p className="text-xs text-slate-400">Sales velocity across winning products catalog</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            High Velocity
          </span>
        </div>

        {/* Simple Bar Chart SVG Representation */}
        <div className="h-40 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 pb-2">
          {[
            { day: 'Mon', val: 420 },
            { day: 'Tue', val: 680 },
            { day: 'Wed', val: 510 },
            { day: 'Thu', val: 940 },
            { day: 'Fri', val: 1280 },
            { day: 'Sat', val: 1650 },
            { day: 'Sun', val: 1420 }
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full bg-slate-800 rounded-t-xl overflow-hidden h-32 flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-orange-400 transition-all duration-500" 
                  style={{ height: `${(bar.val / 1650) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Warnings & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-serif">Recent Customer Orders</h3>
            <button 
              onClick={() => setAdminTab('orders')} 
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/60">
                    <td className="py-3 font-bold text-white">{ord.id}</td>
                    <td className="py-3 text-slate-300">{ord.customerName}</td>
                    <td className="py-3 font-bold text-amber-400">₹{ord.total.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                        ord.status === 'Shipped' ? 'bg-sky-500/20 text-sky-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Alerts</span>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <img src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <span className="text-xs font-bold text-white truncate">{p.title}</span>
                  </div>
                  <span className="bg-rose-500/20 text-rose-300 font-black text-xs px-2.5 py-1 rounded-lg shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">All products are well stocked above threshold.</p>
          )}
        </div>

      </div>
    </div>
  );
};
