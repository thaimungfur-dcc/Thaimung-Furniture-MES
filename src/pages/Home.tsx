import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search,
  Bell,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  Box,
  Factory,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  ShoppingCart,
  Wallet,
  Truck,
  UserCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendVal, desc, subIcon: SubIcon }: any) => {
  const colorClasses: Record<string, string> = {
    fireopal: 'text-fireopal bg-fireopal/10',
    crimson: 'text-crimson bg-crimson/10',
    goldenrod: 'text-goldenrod bg-goldenrod/10',
    cadetblue: 'text-cadetblue bg-cadetblue/10',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-lavender bg-lavender/10',
    sage: 'text-muted-sage bg-muted-sage/10',
  };

  const activeColor = colorClasses[color] || 'text-slate-400 bg-slate-50';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group transition-all hover:shadow-md">
      <div className={`absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-700 ${activeColor.split(' ')[0]}`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</div>
          <div className={`p-2.5 rounded-xl transition-colors ${activeColor}`}>
            <Icon size={20} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <div className="text-4xl font-black text-slate-900 tracking-tight">{value}</div>
          {SubIcon && <SubIcon size={16} className="text-slate-300" />}
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
          <div className={`flex items-center gap-1 text-[10px] font-black ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {trendVal}
          </div>
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{desc}</div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const stats = [
    { title: 'TOTAL ORDERS', value: '156', icon: ShoppingCart, trend: 'up', trendVal: '+12%', desc: 'vs last month', color: 'fireopal' },
    { title: 'REVENUE', value: '฿1.2M', icon: Wallet, trend: 'up', trendVal: '+8%', desc: 'vs last month', color: 'crimson' },
    { title: 'PENDING SHIPMENTS', value: '24', icon: Truck, trend: 'down', trendVal: '-5%', desc: 'vs last week', color: 'goldenrod' },
    { title: 'ACTIVE CUSTOMERS', value: '842', icon: UserCircle, trend: 'up', trendVal: '+15', desc: 'new this week', color: 'cadetblue' },
  ];

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full">
      {/* Header Section - Refined */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search spec, lot number, NC, furniture type..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-fireopal/10 text-sm font-medium outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Live</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black text-midnight tracking-tighter uppercase leading-none">
              DASHBOARD <span className="text-fireopal">OVERVIEW</span>
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <p className="text-[10px] font-black text-fireopal uppercase tracking-[0.3em]">Furniture Production Hub</p>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <p className="text-[10px] font-black text-crimson uppercase tracking-[0.3em]">QA Standards Active</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-8 py-3 bg-white text-midnight rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-100 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Factory size={14} /> Factory Overview
            </button>
            <button className="px-8 py-3 bg-fireopal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-fireopal/20 hover:bg-fireopal/90 transition-all flex items-center gap-2">
              <AlertCircle size={14} /> Report NC
            </button>
          </div>
        </div>

        <div className="relative h-[320px] rounded-[3rem] overflow-hidden shadow-2xl group border border-white/20">
          <img 
            src="https://www.organizeit.com/cdn/shop/collections/organized-ironing-board.jpg?v=1693241902" 
            alt="Production Floor" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight/90 via-midnight/40 to-transparent" />
          <div className="absolute inset-0 p-16 flex flex-col justify-center max-w-2xl">
            <div className="w-1.5 h-16 bg-fireopal mb-8" />
            <h2 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.8]">
              Quality First, <br />Craftsmanship Always
            </h2>
            <p className="text-fireopal mt-8 text-xl font-medium italic leading-relaxed opacity-95">
              "Excellence is not an act, but a habit in every piece of furniture we build."
            </p>
            <div className="flex items-center gap-4 mt-8">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">ISO 9001 Certified</span>
              <span className="px-4 py-1.5 bg-fireopal/20 backdrop-blur-md border border-fireopal/30 rounded-full text-[10px] font-black text-fireopal uppercase tracking-widest">T-DCC Standards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Alert Section */}
      <div className="bg-white rounded-[2.5rem] border-l-[12px] border-fireopal p-8 shadow-sm flex flex-col md:flex-row items-center gap-10 relative overflow-hidden border border-slate-100">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fireopal/5 rounded-full -mr-40 -mt-40 blur-3xl" />
        <div className="w-16 h-16 bg-fireopal rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-fireopal/20">
          <Megaphone size={32} />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-midnight uppercase tracking-tight">Shift Handover Alert</h3>
            <span className="px-4 py-1.5 bg-fireopal text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">Urgent</span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            <span className="font-bold text-fireopal">Previous Shift Issue:</span> Edge banding machine on Line 2 reported intermittent heating issues. 
            <br />
            <span className="font-bold text-fireopal">Action Required:</span> Maintenance team scheduled for 10:00 AM. Monitor output quality every 30 mins.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported By</p>
          <p className="text-sm font-bold text-midnight mt-1">Night Shift Supervisor</p>
          <p className="text-[10px] font-mono font-bold text-fireopal mt-1">06:00 AM</p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-midnight flex items-center gap-3 uppercase tracking-tight">
              <ShoppingCart className="text-fireopal" size={24} /> Recent Orders
            </h3>
            <button className="text-[10px] font-black text-fireopal uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-2xl hover:bg-vistawhite transition-all border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-fireopal group-hover:text-white transition-all shadow-sm">
                    <Box size={24} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-midnight">Order #SO-2024-00{item}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Customer: Modern Home Co.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-midnight">฿12,500</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-midnight flex items-center gap-3 uppercase tracking-tight">
              <Activity className="text-cadetblue" size={24} /> System Status
            </h3>
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Database Connection</span>
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Stable</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">API Server</span>
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-goldenrod" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Cloud Storage</span>
              </div>
              <span className="text-xs font-black text-goldenrod uppercase tracking-widest">Syncing</span>
            </div>
            <div className="pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                <span>Storage Usage</span>
                <span>75%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-fireopal rounded-full shadow-[0_0_10px_rgba(227,98,74,0.4)]" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Boards (Restored) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-black text-midnight uppercase tracking-tight">Production Board</h4>
            <div className="w-10 h-10 rounded-xl bg-cadetblue/10 text-cadetblue flex items-center justify-center group-hover:bg-cadetblue group-hover:text-white transition-all">
              <Factory size={20} />
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Daily Target</span>
              <span className="text-sm font-black text-midnight">450 Units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Output</span>
              <span className="text-sm font-black text-cadetblue">382 Units</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-cadetblue rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-black text-midnight uppercase tracking-tight">Quality Board</h4>
            <div className="w-10 h-10 rounded-xl bg-muted-sage/10 text-muted-sage flex items-center justify-center group-hover:bg-muted-sage group-hover:text-white transition-all">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pass Rate</span>
              <span className="text-sm font-black text-midnight">98.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">NC Reported</span>
              <span className="text-sm font-black text-muted-sage">3 Issues</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-muted-sage rounded-full" style={{ width: '98%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-black text-midnight uppercase tracking-tight">Logistics Board</h4>
            <div className="w-10 h-10 rounded-xl bg-goldenrod/10 text-goldenrod flex items-center justify-center group-hover:bg-goldenrod group-hover:text-white transition-all">
              <Truck size={20} />
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">On-Time Delivery</span>
              <span className="text-sm font-black text-midnight">94.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">In Transit</span>
              <span className="text-sm font-black text-goldenrod">12 Shipments</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-goldenrod rounded-full" style={{ width: '94%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
