'use client';

import React, { useState } from 'react';
import { Clapperboard, Search, Filter, MoreVertical, Trash2, Heart, Share2, Play } from 'lucide-react';

const mockReels = [
  { id: '1', caption: 'Cyberpunk Vibes #neon #city', user: 'neon_rider', likes: '12K', shares: '1.2K', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=700&fit=crop' },
  { id: '2', caption: 'Dancing in the Dark', user: 'dance_pro', likes: '45K', shares: '8K', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=700&fit=crop' },
  { id: '3', caption: 'Tech Setup 2026', user: 'tech_minimal', likes: '8K', shares: '500', thumbnail: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&h=700&fit=crop' },
  { id: '4', caption: 'Nature Walk', user: 'wanderer', likes: '2K', shares: '100', thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=700&fit=crop' },
];

export default function AdminReels() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clapperboard size={24} className="text-[#ff2e2e]" />
            Reels Content
          </h2>
          <p className="text-gray-500 text-sm">Manage short-form video content and engagement trends.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all">Trending Reels</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mockReels.map((reel) => (
          <div key={reel.id} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#ff2e2e]/30 transition-all duration-500 relative">
            <div className="aspect-[9/16] relative overflow-hidden">
               <img src={reel.thumbnail} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
               
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-[#ff2e2e]/20 backdrop-blur-md border border-[#ff2e2e]/40 flex items-center justify-center">
                     <Play size={24} className="text-white fill-white ml-1" />
                  </div>
               </div>

               <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-bold text-white line-clamp-2">{reel.caption}</p>
                  <p className="text-[10px] text-[#ff2e2e] font-bold mt-1">@{reel.user}</p>
               </div>
            </div>
            
            <div className="p-4 flex items-center justify-between bg-white/[0.01]">
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                     <Heart size={12} className="text-[#ff2e2e]" />
                     <span>{reel.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                     <Share2 size={12} className="text-blue-500" />
                     <span>{reel.shares}</span>
                  </div>
               </div>
               <button className="p-1.5 text-gray-600 hover:text-[#ff2e2e] transition-colors">
                  <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
