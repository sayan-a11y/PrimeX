'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Monitor,
  Smartphone
} from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
        <p className="text-gray-500 text-sm">In-depth insights into traffic, engagement, and revenue performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total Revenue', value: '$84,290', change: '+18.2%', trend: 'up', icon: DollarSign },
           { label: 'Avg. Watch Time', value: '12m 45s', change: '+2.4%', trend: 'up', icon: Clock },
           { label: 'Conversion Rate', value: '3.8%', change: '-0.5%', trend: 'down', icon: TrendingUp },
           { label: 'New Signups', value: '1,204', change: '+12.8%', trend: 'up', icon: Users },
         ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group hover:border-[#ff2e2e]/20 transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-[#ff2e2e]/10 rounded-lg">
                     <stat.icon size={20} className="text-[#ff2e2e]" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                     {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                     {stat.change}
                  </div>
               </div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
               <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-6">Traffic by Device</h4>
            <div className="space-y-6">
               {[
                 { label: 'Mobile', value: '64%', icon: Smartphone, color: 'bg-[#ff2e2e]' },
                 { label: 'Desktop', value: '28%', icon: Monitor, color: 'bg-white/40' },
                 { label: 'Other', value: '8%', icon: Globe, color: 'bg-white/10' },
               ].map((device, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2 text-gray-300">
                           <device.icon size={14} />
                           {device.label}
                        </div>
                        <span className="text-white">{device.value}</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${device.color} rounded-full`} style={{ width: device.value }} />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-6">Regional Performance</h4>
            <div className="space-y-4">
               {[
                 { country: 'United States', views: '1.2M', growth: '+12%' },
                 { country: 'India', views: '940K', growth: '+24%' },
                 { country: 'United Kingdom', views: '450K', growth: '+8%' },
                 { country: 'Germany', views: '320K', growth: '-2%' },
               ].map((region, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.02] hover:bg-white/[0.03] transition-colors">
                     <span className="text-xs font-bold text-gray-300">{region.country}</span>
                     <div className="text-right">
                        <p className="text-xs font-bold text-white">{region.views}</p>
                        <p className={`text-[10px] font-bold ${region.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{region.growth}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
