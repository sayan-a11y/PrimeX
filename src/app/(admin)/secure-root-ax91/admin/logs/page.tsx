'use client';

import React from 'react';
import { History, Search, Filter, Terminal, User, ShieldAlert, CheckCircle } from 'lucide-react';

const mockLogs = [
  { id: '1', admin: 'super_admin', action: 'Banned User', target: 'spammer_99', date: '2026-04-24 13:45', ip: '192.168.1.1', status: 'Success' },
  { id: '2', admin: 'staff_1', action: 'Deleted Video', target: '#V-802', date: '2026-04-24 13:30', ip: '10.0.0.12', status: 'Success' },
  { id: '3', admin: 'system', action: 'Cache Purge', target: 'Global', date: '2026-04-24 13:15', ip: 'Internal', status: 'Warning' },
  { id: '4', admin: 'super_admin', action: 'Modified Settings', target: 'Security', date: '2026-04-24 12:50', ip: '192.168.1.1', status: 'Success' },
  { id: '5', admin: 'staff_2', action: 'Flagged Comment', target: '#C-452', date: '2026-04-24 12:30', ip: '172.16.0.4', status: 'Success' },
];

export default function AdminLogs() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <History size={24} className="text-[#ff2e2e]" />
            Audit & Activity Logs
          </h2>
          <p className="text-gray-500 text-sm">Trace every administrative action performed across the Command Center.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2">
              <Terminal size={14} />
              SSH Console
           </button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
           <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" placeholder="Search by admin or action..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#ff2e2e]/50" />
           </div>
           <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              <span>Retention: 90 Days</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                <th className="px-8 py-5">Administrator</th>
                <th className="px-8 py-5">Action Performed</th>
                <th className="px-8 py-5">Target Instance</th>
                <th className="px-8 py-5">Timestamp & IP</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                           <User size={14} className="text-gray-400 group-hover:text-[#ff2e2e] transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-[#ff2e2e] transition-colors">{log.admin}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-xs text-gray-300 font-medium">{log.action}</td>
                  <td className="px-8 py-5">
                     <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-[#ff2e2e] uppercase tracking-wider">{log.target}</span>
                  </td>
                  <td className="px-8 py-5">
                     <p className="text-xs text-white font-medium">{log.date}</p>
                     <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">{log.ip}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                       log.status === 'Success' ? 'text-green-500' : 'text-yellow-500'
                     }`}>
                        {log.status === 'Success' ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
                        {log.status}
                     </span>
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
