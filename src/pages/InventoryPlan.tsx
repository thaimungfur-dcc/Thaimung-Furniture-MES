import React, { useState, useMemo, useEffect } from 'react';
import { 
  Boxes, 
  Table, 
  BarChart2, 
  Search, 
  UploadCloud, 
  ChevronLeft, 
  ChevronRight,
  Box,
  CheckCircle2,
  ArrowDownToLine,
  AlertTriangle
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
  ComposedChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

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

const InventoryPlan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'analysis'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  
  const filters = ['All', 'Healthy', 'Low Stock', 'Critical', 'Out of Stock'];

  useEffect(() => {
    const products = [
      { id: 1, sku: 'LD-001', name: "ราวตากผ้าสแตนเลส (รุ่นพับได้)", img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=100&q=80', leadTime: 7, moq: 100, avgUsage: 12 },
      { id: 2, sku: 'LD-002', name: "ราวแขวนผ้าบาร์คู่ (ล้อเลื่อน)", img: 'https://images.unsplash.com/photo-1517163798167-0421e03317df?auto=format&fit=crop&w=100&q=80', leadTime: 7, moq: 50, avgUsage: 5 },
      { id: 3, sku: 'OF-001', name: "เก้าอี้จัดเลี้ยง (เบาะนวม)", img: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=100&q=80', leadTime: 14, moq: 200, avgUsage: 25 },
      { id: 4, sku: 'BD-001', name: "ชุดเครื่องนอนครบเซ็ต", img: 'https://images.unsplash.com/photo-1522771753035-4848235d3f3d?auto=format&fit=crop&w=100&q=80', leadTime: 30, moq: 50, avgUsage: 8 },
      { id: 5, sku: 'LV-001', name: "โต๊ะญี่ปุ่นไม้สักทอง", img: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=100&q=80', leadTime: 20, moq: 20, avgUsage: 2 },
      { id: 6, sku: 'GN-001', name: "ชั้นวางรองเท้า 4 ชั้น", img: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=100&q=80', leadTime: 5, moq: 300, avgUsage: 50 },
    ];

    const mockItems = products.map(p => {
      const onhand = Math.floor(Math.random() * 500); 
      const booking = Math.floor(Math.random() * 200);
      const available = onhand - booking;
      const planIn = Math.floor(Math.random() * 300);
      const planOut = Math.floor(Math.random() * 100);
      const estQty = available + planIn - planOut;
      const minPoint = Math.ceil(p.avgUsage * p.leadTime);
      
      let status = 'Healthy';
      if (onhand === 0) status = 'Out of Stock';
      else if (onhand < minPoint / 2) status = 'Critical';
      else if (onhand < minPoint) status = 'Low Stock';

      return { ...p, onhand, booking, available, planIn, planOut, estQty, minPoint, status };
    });
    setItems(mockItems);
  }, []);

  const filteredItems = useMemo(() => {
    let res = items;
    if (activeFilter !== 'All') res = res.filter(i => i.status === activeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(i => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    return res;
  }, [items, activeFilter, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const stats = useMemo(() => {
    return {
      totalOnhand: items.reduce((s, i) => s + i.onhand, 0).toLocaleString(),
      totalAvailable: items.reduce((s, i) => s + i.available, 0).toLocaleString(),
      planIn: items.reduce((s, i) => s + i.planIn, 0).toLocaleString(),
      lowStock: items.filter(i => ['Low Stock', 'Critical', 'Out of Stock'].includes(i.status)).length
    };
  }, [items]);

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Healthy': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Low Stock': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Critical': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Out of Stock': return 'bg-slate-900 text-white border-slate-800';
      default: return 'bg-slate-50 text-slate-400 border-slate-200';
    }
  };

  const getFilterCount = (filter: string) => {
    if (filter === 'All') return items.length;
    return items.filter(i => i.status === filter).length;
  };

  const distributionData = useMemo(() => {
    const counts: any = {};
    items.forEach(i => counts[i.status] = (counts[i.status] || 0) + 1);
    return Object.keys(counts).map(k => ({
      name: k,
      value: counts[k],
      color: k === 'Healthy' ? '#3F6212' : k === 'Low Stock' ? '#EA580C' : k === 'Critical' ? '#B43B42' : '#1F2937'
    }));
  }, [items]);

  const lowStockData = useMemo(() => {
    return items.filter(i => ['Low Stock', 'Critical'].includes(i.status))
      .sort((a,b) => (a.onhand/a.minPoint) - (b.onhand/b.minPoint))
      .slice(0, 5)
      .map(i => ({
        sku: i.sku,
        onhand: i.onhand,
        minPoint: i.minPoint
      }));
  }, [items]);

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-luxuryGold shadow-sm border border-slate-100 flex-shrink-0">
            <Boxes size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none font-mono">
              INVENTORY <span className="text-luxuryGold">PLANNING</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Stock Allocation & Replenishment</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('stock')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'stock' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Table size={16}/> STOCK PLAN
          </button>
          <button 
            onClick={() => setActiveTab('analysis')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'analysis' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <BarChart2 size={16}/> ANALYSIS
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Total Onhand" val={stats.totalOnhand} color="#809BBF" icon={Box} desc="Physical Stock" />
        <KPICard title="Available" val={stats.totalAvailable} color="#3F6212" icon={CheckCircle2} desc="Free to Sell" />
        <KPICard title="Incoming (Plan In)" val={stats.planIn} color="#3A3659" icon={ArrowDownToLine} desc="From Production" />
        <KPICard title="Low Stock Items" val={stats.lowStock} color="#B43B42" icon={AlertTriangle} desc="Need Replenishment" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {activeTab === 'stock' && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                {filters.map(f => (
                  <button key={f} onClick={() => {setActiveFilter(f); setCurrentPage(1);}} 
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === f ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                    {f}
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeFilter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{getFilterCount(f)}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-72">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} 
                    placeholder="Search SKU / Product Name..." 
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
                  />
                </div>
                <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <UploadCloud size={14} /> UPLOAD
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Onhand</th>
                    <th className="px-6 py-4 text-[10px] font-black text-rose-600 uppercase tracking-widest border-b border-slate-100 text-right">Booking</th>
                    <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 text-right">Available</th>
                    <th className="px-6 py-4 text-[10px] font-black text-midnight uppercase tracking-widest border-b border-slate-100 text-right">Plan In</th>
                    <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-slate-100 text-right">Plan Out</th>
                    <th className="px-6 py-4 text-[10px] font-black text-luxuryGold uppercase tracking-widest border-b border-slate-100 text-right">Est. Bal.</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Avg. Usage</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Min Point</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img src={item.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="font-black text-midnight text-xs font-mono uppercase">{item.sku}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-black text-slate-700">{item.onhand.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-black text-rose-600">{item.booking.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-right font-mono text-xs font-black ${item.available < 0 ? 'text-rose-700 bg-rose-50' : 'text-emerald-600'}`}>{item.available.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-black text-midnight bg-blue-50/30">{item.planIn.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-black text-rose-400 bg-rose-50/30">{item.planOut.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-black text-luxuryGold">{item.estQty.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.avgUsage}/day</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-midnight font-mono">{item.minPoint.toLocaleString()}</span>
                          <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">(LTD: {item.leadTime}d)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusClass(item.status)}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Show</span>
                <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"><ChevronLeft size={16} /></button>
                <span className="text-[10px] font-black text-midnight px-4 py-2 bg-white border border-slate-200 rounded-xl uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analysis' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[450px]">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <BarChart2 size={16} className="text-luxuryGold" /> Stock Status Distribution
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-500" /> Top 5 Low Stock Items
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={lowStockData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="sku" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '20px' }} />
                      <Bar dataKey="onhand" name="Onhand" fill="#B43B42" radius={[10, 10, 0, 0]} barSize={32} />
                      <Line type="monotone" dataKey="minPoint" name="Min Point" stroke="#64748B" strokeWidth={2} dot={{ r: 4, fill: '#64748B' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPlan;
