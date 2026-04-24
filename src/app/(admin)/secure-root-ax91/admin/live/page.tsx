'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Users, Eye, MapPin, Activity, ShieldAlert } from 'lucide-react';

export default function LiveMonitor() {
  const [liveCount, setLiveCount] = useState(458);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Radio size={28} className="text-[#ff2e2e] animate-pulse" />
            Live Platform Monitor
          </h2>
          <p className="text-gray-500 mt-1">Real-time tracking of active sessions and stream health.</p>
        </div>
        <div className="px-6 py-3 bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 rounded-2xl flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-[#ff2e2e] uppercase tracking-widest">Active Now</span>
              <span className="text-2xl font-black text-white">{liveCount}</span>
           </div>
           <div className="w-10 h-10 rounded-full border-2 border-[#ff2e2e] border-t-transparent animate-spin" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Activity size={20} className="text-[#ff2e2e]" />
                 Real-time Traffic Burst
              </h3>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Updating every 3s</span>
           </div>
           
           <div className="h-64 w-full flex items-end gap-1 px-2 relative">
               {Array.from({ length: 40 }).map((_, i) => {
                 const h = 20 + Math.random() * 80;
                 return (
                   <div key={i} className="flex-1 bg-[#ff2e2e]/20 rounded-t-sm animate-in slide-in-from-bottom duration-500 transition-all hover:bg-[#ff2e2e]/40" style={{ height: `${h}%` }}>
                      <div className="w-full h-[2px] bg-[#ff2e2e] shadow-[0_0_8px_#ff2e2e]" />
                   </div>
                 );
               })}
           </div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6">
           <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Active Stream Nodes</h3>
           {[
             { city: 'Mumbai, IN', load: '64%', status: 'Stable' },
             { city: 'London, UK', load: '28%', status: 'Stable' },
             { city: 'New York, US', load: '82%', status: 'High Load' },
             { city: 'Tokyo, JP', load: '12%', status: 'Stable' },
           ].map((node, i) => (
             <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-[#ff2e2e]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-[#ff2e2e]" />
                      <span className="text-sm font-bold text-white">{node.city}</span>
                   </div>
                   <span className={`text-[10px] font-bold uppercase ${node.status === 'Stable' ? 'text-green-500' : 'text-red-500'}`}>{node.status}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-[#ff2e2e] shadow-[0_0_10px_#ff2e2e]" style={{ width: node.load }} />
                </div>
             </div>
           ))}
        </div>
      </div>
      
      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 overflow-hidden">
         <h3 className="text-lg font-bold text-white mb-6">Recent Connection Logs</h3>
         <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                       <p className="text-sm font-bold text-white group-hover:text-[#ff2e2e] transition-colors">Session #AUTH-{1000 + i}</p>
                       <p className="text-[10px] text-gray-500">IP: 192.168.{i}.{Math.floor(Math.random() * 255)} • Browser: Chrome/Windows</p>
                    </div>
                 </div>
                 <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{Math.floor(Math.random() * 60)}s ago</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
