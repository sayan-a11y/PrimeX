'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Video, 
  Eye, 
  Database, 
  TrendingUp, 
  MoreHorizontal,
  Circle,
  Play,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Upload,
  Send,
  Trash2,
  ExternalLink,
  History,
  Activity,
  Layers,
  Cpu,
  Monitor
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Mock Data
const viewsData = [
  { name: '15 Apr', views: 4000 },
  { name: '16 Apr', views: 3000 },
  { name: '17 Apr', views: 5000 },
  { name: '18 Apr', views: 2780 },
  { name: '19 Apr', views: 1890 },
  { name: '20 Apr', views: 2390 },
  { name: '21 Apr', views: 3490 },
  { name: '22 Apr', views: 4490 },
  { name: '23 Apr', views: 6590 },
  { name: '24 Apr', views: 8000 },
];

const uploadData = [
  { name: 'Mon', uploads: 45 },
  { name: 'Tue', uploads: 52 },
  { name: 'Wed', uploads: 48 },
  { name: 'Thu', uploads: 61 },
  { name: 'Fri', uploads: 55 },
  { name: 'Sat', uploads: 67 },
  { name: 'Sun', uploads: 70 },
];

const liveActivity = [
  { user: 'Sayan D.', activity: 'Watching Reel', time: 'Just now', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop' },
  { user: 'Alex M.', activity: 'Watching Video', time: '2m ago', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop' },
  { user: 'Sarah K.', activity: 'Watching Reel', time: '5m ago', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop' },
  { user: 'John Doe', activity: 'Watching Video', time: '8m ago', img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop' },
  { user: 'Mike T.', activity: 'Watching Reel', time: '12m ago', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop' },
];

const liveUsers = [
  { user: 'Sayan D.', activity: 'Reel', content: 'Cyberpunk Vibes', time: '2m ago', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop' },
  { user: 'Alex M.', activity: 'Video', content: 'DJ Mix 2026', time: '4m ago', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop' },
  { user: 'Sarah K.', activity: 'Reel', content: 'Neon Dreams', time: '7m ago', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
];

const topVideos = [
  { rank: 1, title: 'Neon Night Cityscape', user: 'cyber_fan', views: '1.2M', thumb: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=60&h=40&fit=crop' },
  { rank: 2, title: 'Deep Tech House', user: 'dj_prime', views: '980K', thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=60&h=40&fit=crop' },
  { rank: 3, title: 'Future Phone Unbox', user: 'tech_guru', views: '840K', thumb: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=60&h=40&fit=crop' },
  { rank: 4, title: 'Gaming: PrimeX Arena', user: 'gamer_pro', views: '720K', thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=60&h=40&fit=crop' },
  { rank: 5, title: 'Minimalist Setup', user: 'minimal_v', views: '650K', thumb: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=60&h=40&fit=crop' },
];

const recentReports = [
  { id: '#RP-1024', type: 'Video', reason: 'Copyright', by: 'alex_smith', content: 'Neon City', time: '5m ago', status: 'Pending' },
  { id: '#RP-1023', type: 'User', reason: 'Harassment', by: 'sara_k', content: 'user_99', time: '12m ago', status: 'Pending' },
  { id: '#RP-1022', type: 'Comment', reason: 'Spam', by: 'john_d', content: 'Free coins!', time: '1h ago', status: 'Pending' },
];

export default function AdminDashboard() {
  const [activeUsersCount, setActiveUsersCount] = useState(458);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsersCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 selection:bg-[#ff2e2e]/30">
      
      {/* 1. TOP SECTION (5 STATS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users - Red */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-[#ff2e2e]/30 transition-all shadow-xl shadow-black/40">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff2e2e]/5 blur-2xl group-hover:bg-[#ff2e2e]/10 transition-all" />
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Users</p>
                 <h3 className="text-2xl font-black text-white mt-1">1,284</h3>
                 <p className="text-[9px] font-bold text-green-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight size={10} /> 12% Growth
                 </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,46,46,0.2)]">
                 <Users size={18} className="text-[#ff2e2e]" />
              </div>
           </div>
        </div>

        {/* Active Users - Purple */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-xl shadow-black/40">
           <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl group-hover:bg-purple-500/10 transition-all" />
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Users</p>
                 <h3 className="text-2xl font-black text-white mt-1">{activeUsersCount}</h3>
                 <p className="text-[9px] font-bold text-green-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight size={10} /> 5.2% Growth
                 </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                 <UserCheck size={18} className="text-purple-500" />
              </div>
           </div>
        </div>

        {/* Total Videos - Blue */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl shadow-black/40">
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all" />
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Videos</p>
                 <h3 className="text-2xl font-black text-white mt-1">8,492</h3>
                 <p className="text-[9px] font-bold text-green-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight size={10} /> 8.4% Growth
                 </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                 <Video size={18} className="text-blue-500" />
              </div>
           </div>
        </div>

        {/* Total Views - Yellow */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-yellow-500/30 transition-all shadow-xl shadow-black/40">
           <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-2xl group-hover:bg-yellow-500/10 transition-all" />
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Views</p>
                 <h3 className="text-2xl font-black text-white mt-1">2.4M</h3>
                 <p className="text-[9px] font-bold text-green-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight size={10} /> 24% Growth
                 </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                 <Eye size={18} className="text-yellow-500" />
              </div>
           </div>
        </div>

        {/* Storage Used - Green */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-all shadow-xl shadow-black/40">
           <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl group-hover:bg-green-500/10 transition-all" />
           <div className="flex justify-between items-start">
              <div className="w-full">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Storage Used</p>
                 <h3 className="text-2xl font-black text-white mt-1">1.2 TB</h3>
                 <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[65%] shadow-[0_0_8px_#22c55e]" />
                 </div>
                 <p className="text-[8px] font-bold text-gray-500 mt-2 uppercase tracking-tighter">65% of 2 TB Capacity</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)] shrink-0">
                 <Database size={18} className="text-green-500" />
              </div>
           </div>
        </div>
      </div>

      {/* 2. MAIN GRID (70/30) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT SIDE (70%) */}
        <div className="lg:col-span-7 space-y-6">
           {/* Views Overview (Line Chart) */}
           <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 relative group shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#ff2e2e]" />
                    Views Overview
                 </h3>
                 <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none hover:border-[#ff2e2e]/50 transition-all appearance-none cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                 </select>
              </div>
              
              <div className="h-72 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsData}>
                       <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ff2e2e" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ff2e2e" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                       <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                          dy={10}
                       />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                       />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #ffffff10', borderRadius: '16px' }}
                          itemStyle={{ color: '#ff2e2e', fontSize: '12px', fontWeight: 'bold' }}
                       />
                       <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#ff2e2e" 
                          strokeWidth={4} 
                          dot={{ r: 4, fill: '#ff2e2e', strokeWidth: 2, stroke: '#111827' }}
                          activeDot={{ r: 8, stroke: '#ff2e2e', strokeWidth: 2, fill: '#111827' }}
                          animationDuration={2000}
                       />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Upload Overview (Bar Chart) */}
           <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 group shadow-2xl">
              <h3 className="font-bold text-white flex items-center gap-2 mb-8">
                 <Layers size={18} className="text-[#ff2e2e]" />
                 Upload Overview
              </h3>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={uploadData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                       <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                          dy={10}
                       />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                       />
                       <Tooltip 
                          cursor={{ fill: 'rgba(255,46,46,0.05)' }}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #ffffff10', borderRadius: '16px' }}
                       />
                       <Bar dataKey="uploads" radius={[4, 4, 0, 0]} barSize={32} animationDuration={2000}>
                          {uploadData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 6 ? '#ff2e2e' : '#ff2e2e40'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* RIGHT SIDE (30%) */}
        <div className="lg:col-span-3">
           <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 h-full flex flex-col shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-[#ff2e2e]" />
                    Live Activity Feed
                 </h3>
                 <div className="w-2 h-2 bg-[#ff2e2e] rounded-full animate-ping shadow-[0_0_10px_#ff2e2e]" />
              </div>
              
              <div className="flex-1 space-y-8 relative">
                 {liveActivity.map((activity, i) => (
                   <div key={i} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-3">
                         <div className="relative">
                            <img src={activity.img} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover/item:border-[#ff2e2e]/50 transition-all" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ff2e2e] border-2 border-[#111827] rounded-full" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white group-hover/item:text-[#ff2e2e] transition-colors">{activity.user}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{activity.activity}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{activity.time}</span>
                   </div>
                 ))}
                 
                 <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none" />
              </div>
              
              <button className="w-full mt-6 py-3 border border-[#ff2e2e]/30 text-[#ff2e2e] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#ff2e2e] hover:text-white transition-all shadow-[0_0_20px_rgba(255,46,46,0.1)]">
                 View All Live Activity
              </button>
           </div>
        </div>
      </div>

      {/* 3. LOWER SECTION (3 COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* A. Live Users Table */}
         <div className="bg-[#111827] border border-white/5 rounded-[32px] p-6 shadow-2xl">
            <h3 className="font-bold text-white text-sm mb-6 flex items-center gap-2">
               <Circle size={8} className="text-[#ff2e2e] fill-[#ff2e2e] animate-pulse" />
               Live Users
            </h3>
            <div className="space-y-4">
               {liveUsers.map((user, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-3">
                       <img src={user.img} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                       <div>
                          <p className="text-xs font-bold text-white">{user.user}</p>
                          <p className="text-[9px] text-gray-500">{user.activity}: {user.content}</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#ff2e2e] uppercase">{user.time}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* B. Top Performing Videos */}
         <div className="bg-[#111827] border border-white/5 rounded-[32px] p-6 shadow-2xl">
            <h3 className="font-bold text-white text-sm mb-6 uppercase tracking-[0.2em] text-gray-500">Top Videos (24H)</h3>
            <div className="space-y-4">
               {topVideos.map((video) => (
                 <div key={video.rank} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-black text-gray-700 w-4">{video.rank}</span>
                       <img src={video.thumb} alt="" className="w-12 h-8 rounded-lg object-cover border border-white/5 group-hover:border-[#ff2e2e]/50 transition-all" />
                       <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#ff2e2e] transition-colors line-clamp-1">{video.title}</p>
                          <p className="text-[9px] text-gray-600 font-bold uppercase">@{video.user}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-white ml-2">{video.views}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* C. System Overview */}
         <div className="bg-[#111827] border border-white/5 rounded-[32px] p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-4 left-6">
               <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Monitor size={16} className="text-[#ff2e2e]" />
                  System Health
               </h3>
            </div>
            
            <div className="flex items-center gap-8 w-full mt-4">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 * (1 - 0.73)} className="text-[#ff2e2e] drop-shadow-[0_0_8px_#ff2e2e]" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                     <span className="text-3xl font-black text-white">73%</span>
                     <span className="text-[8px] font-black text-gray-500 uppercase">Operational</span>
                  </div>
               </div>
               
               <div className="flex-1 space-y-3">
                  {[
                    { label: 'CPU Usage', val: '24.2%', icon: Cpu },
                    { label: 'Memory', val: '4.8 GB', icon: Layers },
                    { label: 'Disk', val: '65%', icon: Database },
                    { label: 'Network', val: '4.2 MB/s', icon: Activity },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-[9px] font-bold text-gray-500 uppercase">{s.label}</span>
                       <span className="text-[10px] font-black text-white">{s.val}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* 4. BOTTOM SECTION (2 COLUMN) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* A. Recent Reports Table (75%) */}
         <div className="lg:col-span-3 bg-[#111827] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
               <h3 className="font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={18} className="text-[#ff2e2e]" />
                  Recent Reports
               </h3>
               <button className="text-[10px] font-black text-[#ff2e2e] uppercase tracking-widest hover:underline">View All Tickets</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                        <th className="px-8 py-4">ID</th>
                        <th className="px-8 py-4">Type</th>
                        <th className="px-8 py-4">Reason</th>
                        <th className="px-8 py-4">Reported By</th>
                        <th className="px-8 py-4">Content</th>
                        <th className="px-8 py-4">Time</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {recentReports.map((report) => (
                       <tr key={report.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5 text-[10px] font-black text-[#ff2e2e]">{report.id}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{report.type}</td>
                          <td className="px-8 py-5 text-[11px] font-medium text-white">{report.reason}</td>
                          <td className="px-8 py-5 text-[11px] font-bold text-gray-500">@{report.by}</td>
                          <td className="px-8 py-5 text-[11px] font-bold text-white underline cursor-pointer hover:text-[#ff2e2e] transition-colors">{report.content}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-600">{report.time}</td>
                          <td className="px-8 py-5">
                             <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-widest">{report.status}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button className="p-1.5 text-gray-500 hover:text-white transition-colors"><Eye size={14} /></button>
                                <button className="p-1.5 text-gray-500 hover:text-green-500 transition-colors"><CheckCircle size={14} /></button>
                                <button className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* B. Quick Actions (25%) */}
         <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#111827] border border-white/5 rounded-[40px] p-8 h-full flex flex-col justify-between shadow-2xl">
               <h3 className="font-bold text-white text-sm uppercase tracking-[0.2em] mb-6">Tactical Ops</h3>
               <div className="grid grid-cols-1 gap-3">
                  <button className="flex items-center justify-between p-4 bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 rounded-2xl group hover:bg-[#ff2e2e] transition-all duration-300">
                     <div className="flex items-center gap-3">
                        <Upload size={18} className="text-[#ff2e2e] group-hover:text-white" />
                        <span className="text-[10px] font-black text-[#ff2e2e] group-hover:text-white uppercase tracking-widest">Upload Video</span>
                     </div>
                     <ArrowUpRight size={14} className="text-[#ff2e2e] group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                  <button className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl group hover:bg-purple-500 transition-all duration-300">
                     <div className="flex items-center gap-3">
                        <Send size={18} className="text-purple-500 group-hover:text-white" />
                        <span className="text-[10px] font-black text-purple-500 group-hover:text-white uppercase tracking-widest">Broadcast</span>
                     </div>
                     <ArrowUpRight size={14} className="text-purple-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                  <button className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl group hover:bg-yellow-500 transition-all duration-300">
                     <div className="flex items-center gap-3">
                        <History size={18} className="text-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-500 group-hover:text-white uppercase tracking-widest">Clear Cache</span>
                     </div>
                     <ArrowUpRight size={14} className="text-yellow-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                  <button className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl group hover:bg-blue-500 transition-all duration-300">
                     <div className="flex items-center gap-3">
                        <Activity size={18} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 group-hover:text-white uppercase tracking-widest">System Logs</span>
                     </div>
                     <ArrowUpRight size={14} className="text-blue-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
               </div>
            </div>
         </div>
      </div>

      <style jsx>{`
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}

// Helper components missing from the file
function CheckCircle({ size, className }: { size: number, className?: string }) {
  return <Circle size={size} className={className} />;
}
