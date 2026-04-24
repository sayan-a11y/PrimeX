'use client';

import React from 'react';
import { Search, Calendar, Filter, Bell, User, ChevronDown } from 'lucide-react';

export const Topbar = () => {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0b0b0f]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff2e2e] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search analytics, users, videos..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff2e2e]/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-400 hover:text-white cursor-pointer transition-colors">
          <Calendar size={14} />
          <span>Last 30 Days</span>
          <ChevronDown size={14} />
        </div>

        <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-all">
          <Filter size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-[#ff2e2e] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff2e2e] rounded-full shadow-[0_0_8px_rgba(255,46,46,0.6)]" />
        </button>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-semibold text-white group-hover:text-[#ff2e2e] transition-colors">Admin Prime</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full border border-white/10 p-0.5 group-hover:border-[#ff2e2e]/50 transition-all">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
               <User size={20} className="text-gray-400" />
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
};
