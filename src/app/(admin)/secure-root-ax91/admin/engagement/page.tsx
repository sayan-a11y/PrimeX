'use client';

import React from 'react';
import { TrendingUp, Users, Heart, MessageCircle, Share2, Activity, ArrowUpRight } from 'lucide-react';

export default function AdminEngagement() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-white flex items-center gap-4">
           <Activity size={32} className="text-[#ff2e2e]" />
           Engagement Pulse
        </h2>
        <p className="text-gray-500 mt-2">Deep dive into how users are interacting with your content ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Avg. Session', value: '18m 42s', icon: Activity, color: 'text-blue-500' },
           { label: 'Retention Rate', value: '74.2%', icon: Users, color: 'text-green-500' },
           { label: 'Interactions', value: '1.2M', icon: Heart, color: 'text-[#ff2e2e]' },
           { label: 'Viral Coeff.', value: '1.8x', icon: Share2, color: 'text-purple-500' },
         ].map((stat, i) => (
           <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] group hover:border-[#ff2e2e]/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-white">Daily Interaction Volume</h3>
               <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                     <div className="w-2 h-2 rounded-full bg-[#ff2e2e]" /> Likes
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                     <div className="w-2 h-2 rounded-full bg-white/40" /> Comments
                  </div>
               </div>
            </div>
            
            <div className="h-72 w-full flex items-end gap-3 px-2">
               {Array.from({ length: 15 }).map((_, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                    <div className="w-full bg-[#ff2e2e]/10 rounded-t-lg relative group-hover/bar:bg-[#ff2e2e]/20 transition-all" style={{ height: `${40 + Math.random() * 50}%` }}>
                       <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap text-[8px] font-bold text-[#ff2e2e]">{Math.floor(Math.random() * 100)}K</div>
                    </div>
                    <div className="w-full bg-white/5 rounded-t-lg relative" style={{ height: `${20 + Math.random() * 30}%` }} />
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between">
            <div>
               <h3 className="text-lg font-bold text-white mb-6">Top Performers</h3>
               <div className="space-y-6">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                             <img src={`https://images.unsplash.com/photo-${1550000000000 + i}?w=50&h=50&fit=crop`} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white group-hover:text-[#ff2e2e] transition-colors">Video Title #{i + 1}</p>
                             <p className="text-[10px] text-gray-500 font-bold uppercase">Engagement: 98%</p>
                          </div>
                       </div>
                       <ArrowUpRight size={18} className="text-gray-700 group-hover:text-[#ff2e2e] transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
            
            <button className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-[#ff2e2e]/10 hover:border-[#ff2e2e]/30 transition-all">Export Detailed Audit</button>
         </div>
      </div>
    </div>
  );
}
