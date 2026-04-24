import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color = '#ff2e2e' }) => {
  return (
    <div className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/10" />
      
      <div className="relative p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
            <Icon size={20} className="text-gray-400 group-hover:text-[#ff2e2e] transition-colors" />
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend === 'up' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {trend === 'up' ? '+' : ''}{change}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-[#ff2e2e] transition-colors tracking-tight">{value}</h3>
        </div>

        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#ff2e2e] opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity rounded-full" />
      </div>
    </div>
  );
};
