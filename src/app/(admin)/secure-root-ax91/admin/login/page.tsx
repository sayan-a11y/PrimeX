'use client';

import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: formData.username,
          password: formData.password
        }),
      });

      const result = await res.json();

      if (result.success) {
        if (result.data.user.role !== 'admin') {
          setError('Access Denied: Admin role required.');
          setLoading(false);
          return;
        }

        // Set cookie
        document.cookie = `accessToken=${result.data.accessToken}; path=/; max-age=86400; SameSite=Strict`;
        router.push('/secure-root-ax91/admin');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center p-4 selection:bg-[#ff2e2e]/30 selection:text-white antialiased">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff2e2e]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff2e2e]/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff2e2e] to-transparent opacity-50" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,46,46,0.15)] group">
               <Shield size={32} className="text-[#ff2e2e] group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">PrimeX <span className="text-[#ff2e2e]">Secure</span></h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Admin Command Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center animate-shake">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Administrator ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff2e2e] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter admin username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff2e2e]/50 focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff2e2e] transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff2e2e]/50 focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-[#ff2e2e] transition-all cursor-pointer" />
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-wider">Trust this device</span>
              </label>
              <button type="button" className="text-[10px] font-bold text-[#ff2e2e] hover:text-[#ff2e2e]/80 transition-colors uppercase tracking-wider">Reset Credentials</button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#ff2e2e] hover:bg-[#ff2e2e]/90 text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(255,46,46,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="uppercase tracking-[0.1em]">Authorize Access</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center">
             <div className="flex gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Encrypted Tunnel Active</span>
             </div>
             <p className="text-[8px] text-gray-700 font-medium uppercase tracking-[0.3em] text-center">
                Strict Unauthorized Access Monitoring Enabled. <br/> Your IP address has been logged.
             </p>
          </div>
        </div>
        
        <p className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-8">
          &copy; 2026 PrimeX Infrastructure • Internal Use Only
        </p>
      </div>
    </div>
  );
}
