'use client';

import React from 'react';
import { ShieldCheck, Plus, Search, MoreVertical, Edit2, ShieldAlert, UserMinus } from 'lucide-react';

const mockStaff = [
  { id: '1', name: 'Super Admin', role: 'Owner', email: 'owner@primex.com', status: 'Online' },
  { id: '2', name: 'Sayan D.', role: 'Moderator', email: 'sayan@primex.com', status: 'Away' },
  { id: '3', name: 'Alex Miller', role: 'Support', email: 'alex@primex.com', status: 'Offline' },
];

export default function AdminStaff() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#ff2e2e]" />
            Administrative Staff
          </h2>
          <p className="text-gray-500 text-sm">Manage team members, roles, and access permissions.</p>
        </div>
        <button className="px-5 py-2 bg-[#ff2e2e] text-white rounded-xl font-bold text-sm hover:bg-[#ff2e2e]/90 transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(255,46,46,0.3)]">
           <Plus size={18} />
           Invite Staff
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden group">
         <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                <th className="px-8 py-5">Staff Member</th>
                <th className="px-8 py-5">Role & Clearance</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockStaff.map((staff) => (
                <tr key={staff.id} className="group/row hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 group-hover/row:border-[#ff2e2e]/50 transition-colors">
                           {staff.name[0]}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white">{staff.name}</p>
                           <p className="text-[10px] text-gray-500">{staff.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className={`px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider ${
                       staff.role === 'Owner' ? 'text-[#ff2e2e]' : 'text-gray-400'
                     }`}>{staff.role}</span>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          staff.status === 'Online' ? 'bg-green-500' :
                          staff.status === 'Away' ? 'bg-yellow-500' :
                          'bg-gray-600'
                        }`} />
                        <span className="text-xs font-bold text-gray-400">{staff.status}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <div className="flex items-center justify-end gap-2 opacity-40 group-hover/row:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit Permissions">
                           <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Revoke Access">
                           <UserMinus size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                           <MoreVertical size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
      </div>
      
      <div className="p-8 bg-[#ff2e2e]/5 border border-[#ff2e2e]/10 rounded-[32px] flex items-center gap-6">
         <div className="p-4 bg-[#ff2e2e]/10 rounded-2xl">
            <ShieldAlert size={32} className="text-[#ff2e2e]" />
         </div>
         <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Security Protocol Alpha</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Staff members with 'Owner' clearance can modify platform source code and financial settings. Ensure 2FA is mandatory for all administrative accounts.</p>
         </div>
      </div>
    </div>
  );
}
