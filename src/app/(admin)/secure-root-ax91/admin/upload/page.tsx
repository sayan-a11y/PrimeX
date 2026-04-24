'use client';

import React, { useState } from 'react';
import { Upload, Cloud, ShieldCheck, Info, FileVideo, Image as ImageIcon } from 'lucide-react';

export default function AdminUpload() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 flex items-center justify-center">
            <Upload size={24} className="text-[#ff2e2e]" />
          </div>
          Admin Content Portal
        </h2>
        <p className="text-gray-500 mt-2">Upload official PrimeX trailers, announcements, or featured content directly to the system.</p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-[40px] p-16 transition-all duration-500 flex flex-col items-center justify-center gap-6 group overflow-hidden ${
          dragActive ? 'border-[#ff2e2e] bg-[#ff2e2e]/5' : 'border-white/10 hover:border-white/20'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff2e2e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
           <Cloud size={40} className="text-gray-500 group-hover:text-[#ff2e2e] transition-colors" />
           <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#ff2e2e] flex items-center justify-center shadow-[0_0_20px_#ff2e2e] border-4 border-[#0b0b0f]">
              <Upload size={14} className="text-white" />
           </div>
        </div>
        
        <div className="text-center space-y-2 relative">
           <h3 className="text-xl font-bold text-white">Drag & Drop Master Video</h3>
           <p className="text-sm text-gray-500">Supports .MP4, .MOV, .WebM (Max 2GB per file)</p>
        </div>
        
        <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] relative">Select From Server</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2">
               <Info size={16} className="text-[#ff2e2e]" />
               Metadata Configuration
            </h4>
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Video Title</label>
                  <input type="text" placeholder="Enter featured title..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff2e2e]/50" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff2e2e]/50 appearance-none">
                     <option>Announcement</option>
                     <option>Featured Trailer</option>
                     <option>System Update</option>
                  </select>
               </div>
            </div>
         </div>

         <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
               <h4 className="font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-500" />
                  Security & Distribution
               </h4>
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Push to App Store</span>
                  <div className="w-10 h-5 bg-[#ff2e2e] rounded-full relative">
                     <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
               </div>
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Notify All Users</span>
                  <div className="w-10 h-5 bg-white/10 rounded-full relative">
                     <div className="absolute left-1 top-1 w-3 h-3 bg-gray-500 rounded-full" />
                  </div>
               </div>
            </div>
            
            <button className="w-full py-4 bg-[#ff2e2e] text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(255,46,46,0.3)] transition-all hover:translate-y-[-2px] active:scale-[0.98] uppercase tracking-[0.2em]">Initialize Deployment</button>
         </div>
      </div>
    </div>
  );
}
