'use client';

import React, { useState } from 'react';
import { Lock, EyeOff, ShieldAlert, MoreVertical, Trash2, UserX, ExternalLink } from 'lucide-react';

const mockPrivate = [
  { id: '1', title: 'Exclusive Content #01', user: 'premium_model', type: 'Private', status: 'Flagged', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=225&fit=crop' },
  { id: '2', title: 'Private Vlog 2026', user: 'vip_access', type: 'Friends Only', status: 'Approved', thumbnail: 'https://images.unsplash.com/photo-1529139513466-a28d676f4543?w=400&h=225&fit=crop' },
  { id: '3', title: 'Behind the Scenes', user: 'creator_x', type: 'Private', status: 'Pending', thumbnail: 'https://images.unsplash.com/photo-1481326329074-85dec039ee51?w=400&h=225&fit=crop' },
];

export default function AdminPrivateContent() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Lock size={24} className="text-[#ff2e2e]" />
            Private & Sensitive Content
          </h2>
          <p className="text-gray-500 text-sm">Moderation area for private collections and 18+ content.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500/20 transition-all flex items-center gap-2">
              <ShieldAlert size={14} />
              Nudity/Violence AI Flags (12)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPrivate.map((item) => (
          <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden group hover:border-red-500/40 transition-all duration-300">
            <div className="aspect-video relative overflow-hidden bg-black">
               <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover blur-3xl opacity-40 group-hover:blur-md transition-all duration-700" />
               <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <EyeOff size={32} className="text-white/20 group-hover:text-red-500/50 transition-colors" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Sensitive Content</span>
               </div>
               <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-bold text-gray-300 uppercase tracking-widest">{item.type}</span>
               </div>
            </div>
            
            <div className="p-6 space-y-4">
               <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    Uploaded by <span className="text-red-500 font-bold">@{item.user}</span>
                  </p>
               </div>
               
               <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                     <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase">Verify</button>
                     <button className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-500/20 transition-all uppercase">Delete</button>
                  </div>
                  <div className="flex items-center gap-1">
                     <button className="p-2 text-gray-600 hover:text-white transition-colors" title="Ban User">
                        <UserX size={16} />
                     </button>
                     <button className="p-2 text-gray-600 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
