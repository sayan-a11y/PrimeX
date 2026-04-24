'use client';

import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Wallet, ArrowUpRight, BarChart3, Download } from 'lucide-react';

export default function AdminRevenue() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 flex items-center justify-center">
                <DollarSign size={24} className="text-[#ff2e2e]" />
             </div>
             Revenue Insights
          </h2>
          <p className="text-gray-500 mt-2">Monitor financial health, subscription growths, and transaction history.</p>
        </div>
        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 hover:text-white flex items-center gap-3 transition-all">
           <Download size={16} />
           Payout Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 relative overflow-hidden">
               <div className="flex items-center justify-between mb-12">
                  <div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Balance</p>
                     <h3 className="text-4xl font-black text-white mt-1">$452,890.00</h3>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] flex items-center justify-end gap-1">
                        <TrendingUp size={12} /> +24%
                     </p>
                     <p className="text-xs text-gray-500 mt-1">vs last month</p>
                  </div>
               </div>
               
               <div className="h-64 w-full flex items-end gap-2 px-2">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const h = 30 + Math.random() * 70;
                    return (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#ff2e2e]/5 to-[#ff2e2e]/30 rounded-t-lg group relative" style={{ height: `${h}%` }}>
                         <div className="absolute inset-0 bg-[#ff2e2e] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg shadow-[0_0_15px_#ff2e2e]" />
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <CreditCard size={20} className="text-blue-500" />
                     </div>
                     <span className="text-[10px] font-black text-gray-600 uppercase">Subscriptions</span>
                  </div>
                  <h4 className="text-2xl font-black text-white">$124.5K</h4>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[65%]" />
                  </div>
               </div>
               <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="p-3 bg-purple-500/10 rounded-2xl">
                        <Wallet size={20} className="text-purple-500" />
                     </div>
                     <span className="text-[10px] font-black text-gray-600 uppercase">Ad Revenue</span>
                  </div>
                  <h4 className="text-2xl font-black text-white">$89.2K</h4>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 w-[42%]" />
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8">
            <h3 className="text-lg font-bold text-white mb-8">Recent Transactions</h3>
            <div className="space-y-8">
               {[1, 2, 3, 4, 5, 6].map((_, i) => (
                 <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:border-[#ff2e2e]/50 transition-colors">
                          TR
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white group-hover:text-[#ff2e2e] transition-colors">User Payout</p>
                          <p className="text-[10px] text-gray-600 font-bold uppercase">ID: #PX-{1000 + i}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-white">-$420.00</p>
                       <p className="text-[9px] text-gray-700 font-bold uppercase">Completed</p>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full py-4 mt-12 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all">View All History</button>
         </div>
      </div>
    </div>
  );
}
