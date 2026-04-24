'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Radio, 
  Users, 
  Video, 
  Clapperboard, 
  Lock, 
  Flag, 
  Upload, 
  Tags, 
  MessageSquare, 
  Search, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  History, 
  Bell, 
  ShieldCheck,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/secure-root-ax91/admin' },
  { icon: Radio, label: 'Live Monitor', href: '/secure-root-ax91/admin/live', badge: 'LIVE' },
  { icon: Users, label: 'Users', href: '/secure-root-ax91/admin/users' },
  { icon: Video, label: 'All Videos', href: '/secure-root-ax91/admin/videos' },
  { icon: Clapperboard, label: 'Reels', href: '/secure-root-ax91/admin/reels' },
  { icon: Lock, label: 'Private (18+)', href: '/secure-root-ax91/admin/private' },
  { icon: Flag, label: 'Reports', href: '/secure-root-ax91/admin/reports', badgeCount: 12 },
  { icon: Upload, label: 'Upload Video', href: '/secure-root-ax91/admin/upload' },
  { icon: Tags, label: 'Categories', href: '/secure-root-ax91/admin/categories' },
  { icon: MessageSquare, label: 'Comments', href: '/secure-root-ax91/admin/comments' },
  { icon: Search, label: 'Chat Monitor', href: '/secure-root-ax91/admin/chat' },
  { icon: BarChart3, label: 'Analytics', href: '/secure-root-ax91/admin/analytics' },
  { icon: TrendingUp, label: 'Engagement', href: '/secure-root-ax91/admin/engagement' },
  { icon: DollarSign, label: 'Revenue', href: '/secure-root-ax91/admin/revenue' },
  { icon: Settings, label: 'Settings', href: '/secure-root-ax91/admin/settings' },
  { icon: History, label: 'Activity Logs', href: '/secure-root-ax91/admin/logs' },
  { icon: Bell, label: 'Notifications', href: '/secure-root-ax91/admin/notifications' },
  { icon: ShieldCheck, label: 'Admins', href: '/secure-root-ax91/admin/staff' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0b0b0f] border-r border-white/5 flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ff2e2e] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,46,46,0.4)]">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            PrimeX <span className="text-[#ff2e2e]">ADMIN</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-white/5 text-[#ff2e2e]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-[#ff2e2e]' : 'group-hover:text-[#ff2e2e]'} />
              <span className="text-sm font-medium">{item.label}</span>
              
              {item.badge && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ff2e2e] text-white animate-pulse">
                  {item.badge}
                </span>
              )}
              
              {item.badgeCount && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/10">
                  {item.badgeCount}
                </span>
              )}

              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ff2e2e] rounded-r-full shadow-[0_0_10px_rgba(255,46,46,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <button className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:text-[#ff2e2e] hover:bg-[#ff2e2e]/10 transition-all duration-300">
          <LogOut size={18} />
          <span className="text-sm font-semibold uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
