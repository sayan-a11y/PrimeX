'use client';

import React, { useState } from 'react';
import { 
  Video, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Flag, 
  Eye, 
  Play,
  Clock,
  ShieldAlert
} from 'lucide-react';

const mockVideos = [
  { id: '1', title: 'Neon Night Cityscape', user: 'cyberpunk_fan', views: '1.2M', date: '2026-04-10', thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=225&fit=crop', status: 'Approved' },
  { id: '2', title: 'Deep Tech House Mix 2026', user: 'dj_prime', views: '450K', date: '2026-04-12', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop', status: 'Pending' },
  { id: '3', title: 'Unboxing the Future Phone', user: 'tech_guru', views: '890K', date: '2026-04-15', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=225&fit=crop', status: 'Flagged' },
  { id: '4', title: 'Gaming Session: PrimeX Arena', user: 'gamer_pro', views: '2.1M', date: '2026-04-18', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop', status: 'Approved' },
];

export default function AdminVideos() {
  const [videos] = useState(mockVideos);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Video Moderation</h2>
          <p className="text-gray-500 text-sm">Review, flag, and manage video content on the platform.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 text-[#ff2e2e] rounded-xl font-bold text-sm hover:bg-[#ff2e2e]/20 transition-all flex items-center gap-2">
             <ShieldAlert size={14} />
             Review Queue (5)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#ff2e2e]/30 transition-all duration-300">
            <div className="aspect-video relative overflow-hidden">
               <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#ff2e2e] flex items-center justify-center shadow-[0_0_20px_#ff2e2e]">
                     <Play size={20} className="text-white ml-1" fill="white" />
                  </div>
               </div>
               <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    video.status === 'Approved' ? 'bg-green-500/20 border-green-500/30 text-green-500' : 
                    video.status === 'Flagged' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 
                    'bg-yellow-500/20 border-yellow-500/30 text-yellow-500'
                  }`}>
                    {video.status}
                  </span>
               </div>
            </div>
            
            <div className="p-4 space-y-3">
               <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#ff2e2e] transition-colors">{video.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    Uploaded by <span className="text-gray-300 font-bold">{video.user}</span>
                  </p>
               </div>
               
               <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Eye size={12} />
                        <span>{video.views}</span>
                     </div>
                     <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock size={12} />
                        <span>{video.date}</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                     <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
                        <Flag size={14} />
                     </button>
                     <button className="p-1.5 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                     </button>
                     <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
                        <MoreVertical size={14} />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
         <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em]">Load More Content</button>
      </div>
    </div>
  );
}
