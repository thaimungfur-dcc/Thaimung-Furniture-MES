import React, { useState, useMemo } from 'react';
import { 
  PieChart as PieChartIcon, 
  ShoppingCart, 
  Truck, 
  CheckCircle, 
  Coins, 
  TrendingUp, 
  BarChart2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart,
  Area
} from 'recharts';

// --- Shared Components ---
const KPICard = ({ title, val, color, icon: Icon, desc }: any) => (
  <div className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 relative overflow-hidden group h-full">
    <div className="absolute -right-6 -bottom-6 opacity-[0.05] transform rotate-12 group-hover:scale-110 group-hover:opacity-[0.1] transition-all duration-500 pointer-events-none z-0">
      <Icon size={140} style={{ color }} />
    </div>
    <div className="relative z-10 flex justify-between items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-90 truncate">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-4xl font-black tracking-tighter leading-none truncate" style={{ color }}>{val}</h4>
        </div>
        {desc && (
          <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-50">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">
              {desc}
            </p>
          </div>
        )}
      </div>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white" style={{ backgroundColor: color + '15' }}>
        <Icon size={28} style={{ color }} />
      </div>
    </div>
  </div>
);

const POAnalysis: React.FC = () => {
  const [period, setPeriod] = useState('This Month');
  const periods = ['This Week', 'This Month', 'This Quarter', 'This Year'];

  // Mock Data
  const poData = [
    { status: 'Sent', totalAmount: 8025, vendor: 'Thai Steel Co.' },
    { status: 'Completed', totalAmount: 535, vendor: 'Nut & Bolt Shop' },
    { status: 'Pending Approve', totalAmount: 5000, vendor: 'Office Supply Co.' },
    { status: 'Approved', totalAmount: 12000, vendor: 'Thai Steel Co.' },
    { status: 'Completed', totalAmount: 50000, vendor: 'Legacy Supplier' },
    { status: 'Sent', totalAmount: 25000, vendor: 'Global Raw Materials' },
    { status: 'Completed', totalAmount: 15000, vendor: 'Thai Steel Co.' },
  ];

  const stats = useMemo(() => {
    const total = poData.length;
    const pendingDelivery = poData.filter(p => ['Sent', 'Approved'].includes(p.status)).length;
    const totalSpend = poData.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const onTimeRate = 92; 

    return {
      total,
      pendingDelivery,
      onTimeRate,
      totalSpend
    };
  }, []);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    poData.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const vendorSpending = useMemo(() => {
    const spending: Record<string, number> = {};
    poData.forEach(p => { spending[p.vendor] = (spending[p.vendor] || 0) + p.totalAmount; });
    return Object.entries(spending).map(([name, amount]) => ({ name, amount }));
  }, []);

  const trendData = [
    { name: 'Week 1', amount: 45000 },
    { name: 'Week 2', amount: 32000 },
    { name: 'Week 3', amount: 58000 },
    { name: 'Week 4', amount: 25000 },
  ];

  const COLORS = ['#809BBF', '#3F6212', '#D4AF37', '#3A3659', '#EA580C'];

  const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString();

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-midnight shadow-sm border border-slate-100 flex-shrink-0">
            <PieChartIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              PO <span className="text-luxuryGold">ANALYSIS</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Purchase Order Analytics Dashboard</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          {periods.map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)} 
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${period === p ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Total Orders" val={stats.total} color="#809BBF" icon={ShoppingCart} desc="All POs Issued" />
        <KPICard title="Pending Delivery" val={stats.pendingDelivery} color="#D4AF37" icon={Truck} desc="Waiting for Goods" />
        <KPICard title="On-Time Rate" val={stats.onTimeRate + '%'} color="#3F6212" icon={CheckCircle} desc="Vendor Performance" />
        <KPICard title="Total Spend" val={formatCurrency(stats.totalSpend)} color="#3A3659" icon={Coins} desc="Net Value" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px] shrink-0">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em] flex items-center gap-2">
              <PieChartIcon size={16} className="text-luxuryGold" /> PO Status Distribution
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em] flex items-center gap-2">
              <BarChart2 size={16} className="text-luxuryGold" /> Top Vendors by Spend
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorSpending} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="amount" fill="#0F172A" radius={[0, 10, 10, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[350px]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp size={16} className="text-luxuryGold" /> Monthly Purchase Trend
          </h3>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmountPO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} tickFormatter={(val) => `฿${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="amount" stroke="#0F172A" strokeWidth={4} fillOpacity={1} fill="url(#colorAmountPO)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default POAnalysis;
