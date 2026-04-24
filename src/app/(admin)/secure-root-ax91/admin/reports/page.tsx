'use client';

import React from 'react';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MoreHorizontal,
  User,
  ExternalLink,
  Circle
} from 'lucide-react';

const mockReports = [
  { id: '#RP-1024', reporter: 'alex_smith', reported: 'spammer_99', type: 'User', reason: 'Harassment', date: '2026-04-23', status: 'Pending', severity: 'High' },
  { id: '#RP-1023', reporter: 'sara_k', reported: 'Video #V-402', type: 'Video', reason: 'Copyright Infringement', date: '2026-04-23', status: 'Reviewed', severity: 'Medium' },
  { id: '#RP-1022', reporter: 'john_doe', reported: 'Video #V-901', type: 'Video', reason: 'Inappropriate Content', date: '2026-04-22', status: 'Resolved', severity: 'High' },
  { id: '#RP-1021', reporter: 'mike_t', reported: 'User #U-112', type: 'User', reason: 'Bot Activity', date: '2026-04-22', status: 'Pending', severity: 'Low' },
];

export default function AdminReports() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Reports</h2>
          <p className="text-gray-500 text-sm">Handle user flags, copyright claims, and moderation reports.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">12 Critical</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-yellow-500" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">24 Warning</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Reporter / Target</th>
                <th className="px-6 py-4">Reason & Type</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockReports.map((report) => (
                <tr key={report.id} className="group/row hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white group-hover/row:text-[#ff2e2e] transition-colors">{report.id}</span>
                    <p className="text-[10px] text-gray-600 mt-1">{report.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-300">
                        <User size={12} className="text-gray-500" />
                        <span>By {report.reporter}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#ff2e2e]">
                        <AlertTriangle size={12} />
                        <span>Target: {report.reported}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 uppercase tracking-widest">{report.type}</span>
                    </div>
                    <p className="text-xs text-white mt-1.5 font-medium">{report.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                      report.severity === 'High' ? 'text-red-500' : 
                      report.severity === 'Medium' ? 'text-yellow-500' : 
                      'text-blue-500'
                    }`}>
                       <Circle size={6} className="fill-current" />
                       {report.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {report.status === 'Pending' && <Clock size={14} className="text-yellow-500" />}
                       {report.status === 'Reviewed' && <AlertTriangle size={14} className="text-blue-500" />}
                       {report.status === 'Resolved' && <CheckCircle size={14} className="text-green-500" />}
                       <span className="text-xs font-bold text-gray-400">{report.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="px-3 py-1.5 bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 text-[#ff2e2e] text-[10px] font-bold rounded-lg hover:bg-[#ff2e2e]/20 transition-all uppercase">Take Action</button>
                       <button className="p-2 text-gray-500 hover:text-white transition-colors">
                         <ExternalLink size={16} />
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
