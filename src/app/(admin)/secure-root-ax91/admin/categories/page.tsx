'use client';

import React from 'react';
import { Tags, Plus, Search, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

const mockCategories = [
  { id: '1', name: 'Cyberpunk', slug: 'cyberpunk', count: 124, status: 'Active' },
  { id: '2', name: 'Minimalist', slug: 'minimalist', count: 86, status: 'Active' },
  { id: '3', name: 'Electronic Music', slug: 'electronic-music', count: 215, status: 'Active' },
  { id: '4', name: 'Gaming', slug: 'gaming', count: 342, status: 'Active' },
  { id: '5', name: 'Future Tech', slug: 'future-tech', count: 92, status: 'Active' },
];

export default function AdminCategories() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Tags size={24} className="text-[#ff2e2e]" />
            Content Categories
          </h2>
          <p className="text-gray-500 text-sm">Organize and manage platform-wide content taxonomies.</p>
        </div>
        <button className="px-5 py-2 bg-[#ff2e2e] text-white rounded-xl font-bold text-sm hover:bg-[#ff2e2e]/90 transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(255,46,46,0.3)]">
          <Plus size={18} />
          Create Category
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden relative group">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#ff2e2e]/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                <th className="px-8 py-5">Category Name</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5">Content Count</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockCategories.map((cat) => (
                <tr key={cat.id} className="group/row hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5 font-bold text-white group-hover/row:text-[#ff2e2e] transition-colors">{cat.name}</td>
                  <td className="px-8 py-5 text-xs text-gray-500">/{cat.slug}</td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-300">{cat.count} items</td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">{cat.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover/row:opacity-100 transition-opacity">
                       <button className="p-2 text-gray-400 hover:text-white transition-colors">
                         <Edit2 size={16} />
                       </button>
                       <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                         <Trash2 size={16} />
                       </button>
                       <button className="p-2 text-gray-400 hover:text-white transition-colors">
                         <MoreHorizontal size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
