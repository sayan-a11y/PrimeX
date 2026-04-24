'use client';

import React from 'react';
import { MessageSquare, Search, Filter, Trash2, Ban, ShieldAlert, CheckCircle } from 'lucide-react';

const mockComments = [
  { id: '1', user: 'johndoe', video: 'Neon City', comment: 'This is absolutely stunning! Love the grading.', date: '2m ago', status: 'Approved' },
  { id: '2', user: 'spammer_x', video: 'DJ Mix', comment: 'Check out my profile for free coins!!!', date: '5m ago', status: 'Flagged' },
  { id: '3', user: 'cyber_k', video: 'Neon City', comment: 'Best edit of 2026 so far.', date: '12m ago', status: 'Approved' },
  { id: '4', user: 'hater_404', video: 'Tech Setup', comment: 'Terrible setup, waste of money.', date: '1h ago', status: 'Flagged' },
];

export default function AdminComments() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare size={24} className="text-[#ff2e2e]" />
            Comment Moderation
          </h2>
          <p className="text-gray-500 text-sm">Review, delete, or flag user interactions across the platform.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500/20 transition-all flex items-center gap-2">
              <ShieldAlert size={14} />
              Spam Detected (42)
           </button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
           <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" placeholder="Search comments..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#ff2e2e]/50" />
           </div>
           <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase">All</button>
              <button className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-500 transition-all uppercase">Flagged</button>
           </div>
        </div>

        <div className="divide-y divide-white/5">
           {mockComments.map((item) => (
             <div key={item.id} className="p-6 group hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:border-[#ff2e2e]/50 transition-colors">
                         {item.user[0].toUpperCase()}
                      </div>
                      <div>
                         <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white">@{item.user}</span>
                            <span className="text-[10px] text-gray-600 font-bold uppercase">on</span>
                            <span className="text-[10px] text-[#ff2e2e] font-bold uppercase underline cursor-pointer">{item.video}</span>
                            <span className="text-[9px] text-gray-700 font-bold uppercase ml-2">• {item.date}</span>
                         </div>
                         <p className="text-xs text-gray-400 mt-2 max-w-2xl leading-relaxed italic">"{item.comment}"</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-500 hover:text-green-500 transition-colors" title="Approve">
                         <CheckCircle size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                         <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-600 transition-colors" title="Ban User">
                         <Ban size={18} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
