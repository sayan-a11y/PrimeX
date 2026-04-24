'use client';

import React from 'react';
import { Bell, Search, Filter, Trash2, Send, ShieldAlert, CheckCircle, Info } from 'lucide-react';

const mockNotifications = [
  { id: '1', title: 'System Security Alert', msg: 'Multiple failed login attempts from IP 192.168.1.45', type: 'Critical', date: '5m ago' },
  { id: '2', title: 'New Creator Request', msg: 'User @alex_pro has applied for creator status.', type: 'Info', date: '20m ago' },
  { id: '3', title: 'Payout Processed', msg: 'Monthly payout for 12 creators has been completed.', type: 'Success', date: '1h ago' },
  { id: '4', title: 'Storage Capacity', msg: 'Main S3 bucket is reaching 85% capacity.', type: 'Warning', date: '4h ago' },
];

export default function AdminNotifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell size={24} className="text-[#ff2e2e]" />
            System Notifications
          </h2>
          <p className="text-gray-500 text-sm">Stay updated with automated system alerts and administrative tasks.</p>
        </div>
        <button className="px-5 py-2 bg-[#ff2e2e] text-white rounded-xl font-bold text-sm hover:bg-[#ff2e2e]/90 transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(255,46,46,0.3)]">
           <Send size={18} />
           Broadcast
        </button>
      </div>

      <div className="space-y-4">
         {mockNotifications.map((note) => (
           <div key={note.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-all relative overflow-hidden">
              <div className="flex gap-6">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                   note.type === 'Critical' ? 'bg-red-500/10 text-red-500' :
                   note.type === 'Success' ? 'bg-green-500/10 text-green-500' :
                   note.type === 'Warning' ? 'bg-yellow-500/10 text-yellow-500' :
                   'bg-blue-500/10 text-blue-500'
                 }`}>
                    {note.type === 'Critical' && <ShieldAlert size={24} />}
                    {note.type === 'Success' && <CheckCircle size={24} />}
                    {note.type === 'Warning' && <ShieldAlert size={24} />}
                    {note.type === 'Info' && <Info size={24} />}
                 </div>
                 
                 <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                       <h3 className="font-bold text-white text-base group-hover:text-[#ff2e2e] transition-colors">{note.title}</h3>
                       <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{note.date}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{note.msg}</p>
                 </div>
                 
                 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                       <CheckCircle size={16} />
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                       <Trash2 size={16} />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
