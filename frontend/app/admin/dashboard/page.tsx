"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight } from "lucide-react";

export default function DashboardIndex() {
  const stats = [
    { label: "Total Revenue", value: "₹2,85,400", change: "+12.5%", icon: DollarSign, color: "text-[#E5B94E]" },
    { label: "Active Orders", value: "124", change: "+8.2%", icon: ShoppingBag, color: "text-blue-400" },
    { label: "Total Customers", value: "1,842", change: "+15.3%", icon: Users, color: "text-green-400" },
    { label: "Conversion Rate", value: "3.2%", change: "+1.1%", icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-serif tracking-wide mb-2">Welcome back, Admin</h2>
        <p className="text-white/50 tracking-wide text-sm">Here is what's happening with your store today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="group relative bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 overflow-hidden hover:border-white/20 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-white/50 text-sm font-medium tracking-wider uppercase mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold font-serif tracking-wide">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Empty Chart State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 min-h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium tracking-wide">Revenue Overview</h3>
            <select className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-[#E5B94E]/50">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <TrendingUp className="w-10 h-10 text-white/20 mb-3" />
            <p className="text-white/40 text-sm">Chart integration pending.</p>
          </div>
        </motion.div>

        {/* Empty Recent Orders State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 min-h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium tracking-wide">Recent Orders</h3>
            <button className="text-[#E5B94E] text-sm hover:underline">View All</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <ShoppingBag className="w-10 h-10 text-white/20 mb-3" />
            <p className="text-white/40 text-sm">No recent orders found.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
