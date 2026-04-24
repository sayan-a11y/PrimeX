'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, User, Clock, Trash2, Ban, Lock } from 'lucide-react';

const mockMessages = [
  { id: '1', from: 'alex_12', to: 'sarah_m', msg: 'Hey, did you see the new video?', time: 'Just now', suspicious: false },
  { id: '2', from: 'bot_001', to: 'user_99', msg: 'Win free crypto at link.com/win', time: '2m ago', suspicious: true },
  { id: '3', from: 'mike_t', to: 'admin_help', msg: 'I can\'t upload my 4K video.', time: '5m ago', suspicious: false },
];

export default function AdminChatMonitor() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Lock size={24} className="text-[#ff2e2e]" />
            Encrypted Chat Monitor
          </h2>
          <p className="text-gray-500 text-sm">Review flagged messages and monitor for bot activity or spam.</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff2e2e] animate-ping" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scanning active channels...</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
               <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                     <ShieldAlert size={16} className="text-[#ff2e2e]" />
                     Flagged Interactions
                  </h3>
                  <button className="text-[10px] font-bold text-[#ff2e2e] uppercase tracking-widest hover:underline">Clear All Resolved</button>
               </div>
               
               <div className="divide-y divide-white/5">
                  {mockMessages.map((chat) => (
                    <div key={chat.id} className={`p-6 hover:bg-white/[0.02] transition-colors ${chat.suspicious ? 'bg-[#ff2e2e]/5' : ''}`}>
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                             <div className="flex items-center -space-x-2">
                                <div className="w-7 h-7 rounded-full bg-white/10 border border-[#0b0b0f] flex items-center justify-center text-[10px] font-bold text-white">A</div>
                                <div className="w-7 h-7 rounded-full bg-[#ff2e2e]/20 border border-[#0b0b0f] flex items-center justify-center text-[10px] font-bold text-[#ff2e2e]">S</div>
                             </div>
                             <p className="text-xs font-bold text-white">
                                <span className="hover:text-[#ff2e2e] cursor-pointer">@{chat.from}</span>
                                <span className="mx-2 text-gray-600">→</span>
                                <span className="hover:text-[#ff2e2e] cursor-pointer">@{chat.to}</span>
                             </p>
                          </div>
                          <span className="text-[9px] font-bold text-gray-600 uppercase">{chat.time}</span>
                       </div>
                       <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                          <p className="text-xs text-gray-300 italic">"{chat.msg}"</p>
                       </div>
                       
                       <div className="flex items-center justify-end gap-3 mt-4">
                          <button className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 hover:text-white transition-colors uppercase">
                             <Trash2 size={12} /> Resolve
                          </button>
                          <button className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 hover:text-red-500 transition-colors uppercase">
                             <Ban size={12} /> Ban Bot
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
               <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Security Heuristics</h4>
               <div className="space-y-6">
                  {[
                    { label: 'Spam Probability', value: '12%', status: 'Low' },
                    { label: 'Phishing Detection', value: '4%', status: 'Low' },
                    { label: 'Toxic Keywords', value: '28%', status: 'Medium' },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase">
                          <span className="text-gray-400">{stat.label}</span>
                          <span className={stat.status === 'Low' ? 'text-green-500' : 'text-yellow-500'}>{stat.value}</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.status === 'Low' ? 'bg-green-500' : 'bg-yellow-500'} opacity-50`} style={{ width: stat.value }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-[#ff2e2e]/10 to-transparent border border-[#ff2e2e]/20 rounded-[32px] p-8">
               <h4 className="text-sm font-bold text-white mb-4">Quick Alert</h4>
               <p className="text-xs text-gray-500 leading-relaxed mb-6">Broadcast a security warning to all active chat channels.</p>
               <button className="w-full py-3 bg-[#ff2e2e] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_4px_15px_rgba(255,46,46,0.3)]">Push Global Warning</button>
            </div>
         </div>
      </div>
    </div>
  );
}
