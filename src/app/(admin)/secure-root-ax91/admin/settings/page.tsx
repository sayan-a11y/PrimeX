'use client';

import React from 'react';
import { Settings, Shield, Globe, Bell, Database, Save, ChevronRight } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Settings size={24} className="text-gray-400" />
             </div>
             System Settings
          </h2>
          <p className="text-gray-500 mt-2">Configure core platform behaviors, security protocols, and global variables.</p>
        </div>
        <button className="px-8 py-3 bg-[#ff2e2e] text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(255,46,46,0.3)] transition-all flex items-center gap-3 hover:translate-y-[-2px] uppercase tracking-widest text-xs">
           <Save size={16} />
           Commit Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-2">
            {[
              { label: 'General Configuration', icon: Settings, active: true },
              { label: 'Security & Access', icon: Shield, active: false },
              { label: 'Regional & Localization', icon: Globe, active: false },
              { label: 'Notification Triggers', icon: Bell, active: false },
              { label: 'Database & Storage', icon: Database, active: false },
            ].map((tab, i) => (
               <button key={i} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                 tab.active ? 'bg-[#ff2e2e]/10 border-[#ff2e2e]/20 text-[#ff2e2e]' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/5 hover:text-white'
               }`}>
                  <div className="flex items-center gap-4">
                     <tab.icon size={18} />
                     <span className="text-sm font-bold">{tab.label}</span>
                  </div>
                  <ChevronRight size={16} className={tab.active ? 'opacity-100' : 'opacity-0'} />
               </button>
            ))}
         </div>

         <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[40px] p-10 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff2e2e]/5 blur-3xl rounded-full" />
            
            <section className="space-y-6">
               <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] border-b border-white/5 pb-4">General Platform Branding</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Platform Name</label>
                     <input type="text" defaultValue="PrimeX" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff2e2e]/50" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Support Email</label>
                     <input type="text" defaultValue="ops@primex.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff2e2e]/50" />
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] border-b border-white/5 pb-4">Content Moderation Defaults</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#ff2e2e]/20 transition-all">
                     <div>
                        <p className="text-sm font-bold text-white">AI Auto-Moderaion</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Automatically flag sensitive content using Vision AI.</p>
                     </div>
                     <div className="w-12 h-6 bg-[#ff2e2e] rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(255,46,46,0.3)]">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#ff2e2e]/20 transition-all">
                     <div>
                        <p className="text-sm font-bold text-white">Public Registration</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Allow new users to sign up without invitation.</p>
                     </div>
                     <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-gray-600 rounded-full" />
                     </div>
                  </div>
               </div>
            </section>

            <div className="pt-6">
               <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                     <Shield size={16} className="text-yellow-500" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Security Warning</p>
                     <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Changes to these settings may affect system stability. Ensure you have authorized these modifications with the senior infrastructure team.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
