"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

// --- MOCK DATA ---
const mockOrders = [
  { id: "#ORD-001", customer: "Priya Sharma", date: "Today, 10:42 AM", total: "₹4,200", status: "processing" },
  { id: "#ORD-002", customer: "Anjali Desai", date: "Today, 09:15 AM", total: "₹1,850", status: "completed" },
  { id: "#ORD-003", customer: "Rohan Kapoor", date: "Yesterday, 04:30 PM", total: "₹9,999", status: "completed" },
  { id: "#ORD-004", customer: "Sneha Reddy", date: "Yesterday, 02:10 PM", total: "₹3,400", status: "pending" },
  { id: "#ORD-005", customer: "Vikram Singh", date: "Oct 24, 11:20 AM", total: "₹12,500", status: "processing" },
];

const mockInventoryAlerts = [
  { id: "1", product: "Divine Lakshmi Heritage Jhumkas", sku: "JHM-LAK-01", stock: 2, status: "critical" },
  { id: "2", product: "Navya One Gram Gold Short Necklace", sku: "NCK-NVY-04", stock: 5, status: "low" },
  { id: "3", product: "Pushpa Floral Kemp Bangles", sku: "BNG-PSH-02", stock: 4, status: "low" },
];
// -----------------

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Completed</span>;
    case "processing":
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200"><Clock className="w-3 h-3"/> Processing</span>;
    case "pending":
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><AlertTriangle className="w-3 h-3"/> Pending</span>;
    default:
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
  }
}

function RecentOrdersTable({ orders }: { orders: typeof mockOrders }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3 rounded-tr-lg">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order, idx) => (
            <motion.tr 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (idx * 0.05) }}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-4 py-4 font-medium text-slate-900">{order.id}</td>
              <td className="px-4 py-4">{order.customer}</td>
              <td className="px-4 py-4 text-slate-500">{order.date}</td>
              <td className="px-4 py-4 font-semibold text-slate-900">{order.total}</td>
              <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryAlertsList({ alerts }: { alerts: typeof mockInventoryAlerts }) {
  return (
    <div className="flex flex-col gap-3">
      {alerts.map((item, idx) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + (idx * 0.05) }}
          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.product}</p>
            <p className="text-xs text-slate-500 font-medium">SKU: {item.sku}</p>
          </div>
          <div className={`flex flex-col items-end`}>
            <span className={`text-lg font-bold ${item.status === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
              {item.stock}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Left</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function DashboardIndex() {
  const stats = [
    { label: "Total Revenue", value: "₹2,85,400", change: "+12.5%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Active Orders", value: "124", change: "+8.2%", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Customers", value: "1,842", change: "+15.3%", icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Conversion Rate", value: "3.2%", change: "+1.1%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back, Admin</h2>
        <p className="text-slate-500 font-medium tracking-wide text-sm">Here is what&apos;s happening with your store today.</p>
      </div>

      {/* Metrics Grid - White Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="group relative bg-white/70 border border-white backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} border border-white shadow-sm flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-1">{stat.label}</h3>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="lg:col-span-2 bg-white/70 border border-white backdrop-blur-xl shadow-sm rounded-2xl p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Orders</h3>
            <button className="text-sm font-semibold text-[#E5B94E] hover:text-[#d4a83b] transition-colors">View All</button>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1">
            <RecentOrdersTable orders={mockOrders} />
          </div>
        </motion.div>

        {/* Inventory Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 border border-white backdrop-blur-xl shadow-sm rounded-2xl p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Inventory Alerts</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200">3 Action Required</span>
          </div>
          <div className="flex-1">
             <InventoryAlertsList alerts={mockInventoryAlerts} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
