'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserMinus, 
  ShieldCheck, 
  Ban, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminUsers() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([
    { id: '1', username: 'sayan', email: 'sayan@example.com', role: 'admin', isBanned: false, createdAt: '2026-03-20' },
    { id: '2', username: 'johndoe', email: 'john@example.com', role: 'user', isBanned: false, createdAt: '2026-04-15' },
    { id: '3', username: 'spammer123', email: 'spam@spam.com', role: 'user', isBanned: true, createdAt: '2026-04-22' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-500 text-sm">Monitor, verify, and moderate users across the platform.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
             <Filter size={14} />
             Filter
           </button>
           <button className="px-4 py-2 bg-[#ff2e2e] text-white rounded-xl font-bold text-sm hover:bg-[#ff2e2e]/90 transition-all shadow-[0_4px_15px_rgba(255,46,46,0.3)]">
             Add New Admin
           </button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden relative group">
        <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by username or email..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#ff2e2e]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
             <span>Total: {users.length}</span>
             <span className="w-1 h-1 bg-white/10 rounded-full" />
             <span>Banned: {users.filter(u => u.isBanned).length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group/row hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-gray-400 group-hover/row:border-[#ff2e2e]/50 transition-colors">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover/row:text-[#ff2e2e] transition-colors">{user.username}</p>
                        <p className="text-[10px] text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">Banned</span>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'text-[#ff2e2e]' : 'text-gray-400'}`}>
                       {user.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-gray-500 hover:text-white transition-colors" title="View Profile">
                         <Eye size={16} />
                       </button>
                       <button className="p-2 text-gray-500 hover:text-[#ff2e2e] transition-colors" title={user.isBanned ? "Unban User" : "Ban User"}>
                         <Ban size={16} />
                       </button>
                       <button className="p-2 text-gray-500 hover:text-white transition-colors">
                         <MoreVertical size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
           <p className="text-xs text-gray-500 font-medium">Showing 1 to {users.length} of {users.length} users</p>
           <div className="flex items-center gap-2">
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                <ChevronLeft size={16} />
              </button>
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
