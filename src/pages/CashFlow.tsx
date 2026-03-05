import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, 
  Landmark, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  List, 
  FileText, 
  ScrollText, 
  BarChart2, 
  Search, 
  Download, 
  Plus, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

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

const CashFlow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'report' | 'statement' | 'analysis'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [items, setItems] = useState<any[]>([]);
  const filters = ['All', 'CFO', 'CFI', 'CFF', 'Draft'];

  const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString();

  useEffect(() => {
    const rawData = [
      { id: 1, date: '2026-01-25', ref: 'INV-2026-001', description: 'รายได้จากการขายสินค้าชุดที่ 1', category: 'Sales', type: 'In', flowType: 'CFO', amount: 150000, status: 'Completed' },
      { id: 2, date: '2026-01-24', ref: 'PO-RM-005', description: 'จ่ายค่าเหล็กท่อสแตนเลส', category: 'Raw Materials', type: 'Out', flowType: 'CFO', amount: 80000, status: 'Completed' },
      { id: 3, date: '2026-01-23', ref: 'AST-MAC-01', description: 'ลงทุนซื้อเครื่องตัดเลเซอร์', category: 'Assets', type: 'Out', flowType: 'CFI', amount: 200000, status: 'Completed' },
      { id: 4, date: '2026-01-26', ref: 'PAY-WAGE-01', description: 'จ่ายค่าจ้างพนักงานรายวัน', category: 'Payroll', type: 'Out', flowType: 'CFO', amount: 5000, status: 'Draft' },
    ];
    
    let runningBalance = 500000;
    const sorted = [...rawData].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const processed = sorted.map(item => {
      if (item.status === 'Completed') {
        if(item.type === 'In') runningBalance += item.amount;
        else runningBalance -= item.amount;
      }
      return { ...item, balance: runningBalance };
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setItems(processed);
  }, []);

  const stats = useMemo(() => {
    const completed = items.filter(i => i.status === 'Completed');
    const calcNet = (type: string) => {
      return completed.filter(i => i.flowType === type).reduce((s, i) => s + (i.type === 'In' ? i.amount : -i.amount), 0);
    };
    const netCFO = calcNet('CFO');
    const netCFI = calcNet('CFI');
    const netCFF = calcNet('CFF');
    const beginBalance = 500000;
    return { 
      balance: beginBalance + netCFO + netCFI + netCFF, 
      beginBalance, 
      netCFO, 
      netCFI, 
      netCFF, 
      netFlow: netCFO + netCFI + netCFF 
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    let res = items;
    if (activeFilter !== 'All') {
      if(activeFilter === 'Draft') res = res.filter(i => i.status === 'Draft');
      else res = res.filter(i => i.flowType === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(i => i.ref.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return res;
  }, [items, activeFilter, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const handleApprovePay = (item: any) => {
    Swal.fire({ 
      title: 'Approve Payment?', 
      text: `Confirm payment for ${formatCurrency(item.amount)}`, 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#3F6212', 
      confirmButtonText: 'Approve & Pay' 
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(items.map(i => i.id === item.id ? { ...i, status: 'Completed' } : i));
        Swal.fire('Success', 'Transaction approved', 'success');
      }
    });
  };

  const analysisData = useMemo(() => {
    return [
      { name: 'Operating (CFO)', value: Math.abs(stats.netCFO), color: '#3F6212' },
      { name: 'Investing (CFI)', value: Math.abs(stats.netCFI), color: '#D4AF37' },
      { name: 'Financing (CFF)', value: Math.abs(stats.netCFF), color: '#3A3659' },
    ];
  }, [stats]);

  const trendData = useMemo(() => {
    return [...items].filter(i => i.status === 'Completed').reverse().map(i => ({
      date: i.date,
      balance: i.balance
    }));
  }, [items]);

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-midnight shadow-sm border border-slate-100 flex-shrink-0">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none font-mono">
              CASH <span className="text-luxuryGold">FLOW</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Financial Liquidity Management</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('transactions')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'transactions' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <List size={16}/> TRANSACTIONS
          </button>
          <button onClick={() => setActiveTab('report')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'report' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <FileText size={16}/> REPORT
          </button>
          <button onClick={() => setActiveTab('statement')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'statement' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <ScrollText size={16}/> STATEMENT
          </button>
          <button onClick={() => setActiveTab('analysis')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'analysis' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <BarChart2 size={16}/> ANALYSIS
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Cash Balance" val={formatCurrency(stats.balance)} color="#809BBF" icon={Landmark} desc="Ending Balance" />
        <KPICard title="Net CFO" val={formatCurrency(stats.netCFO)} color="#3F6212" icon={Activity} desc="Operating Flow" />
        <KPICard title="Net CFI" val={formatCurrency(stats.netCFI)} color="#D4AF37" icon={TrendingUp} desc="Investing Flow" />
        <KPICard title="Net CFF" val={formatCurrency(stats.netCFF)} color="#3A3659" icon={DollarSign} desc="Financing Flow" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {activeTab === 'transactions' && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                {filters.map(f => (
                  <button key={f} onClick={() => {setActiveFilter(f); setCurrentPage(1);}} 
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === f ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                    {f}
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeFilter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {f === 'All' ? items.length : (f === 'Draft' ? items.filter(i => i.status === 'Draft').length : items.filter(i => i.flowType === f).length)}
                    </span>
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
                    placeholder="Search Ref / Description..." 
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
                  />
                </div>
                <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <Download size={14} /> EXPORT
                </button>
                <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-midnight text-white hover:bg-midnight/90 shadow-lg shadow-midnight/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <Plus size={14} /> RECORD
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ref</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Inflow</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Outflow</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Balance</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 font-mono font-black text-xs text-luxuryGold uppercase">{item.ref}</td>
                      <td className="px-6 py-4 font-black text-midnight text-xs uppercase">{item.description}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${item.type === 'In' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{item.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-xs text-emerald-600">{item.type === 'In' ? formatCurrency(item.amount) : '-'}</td>
                      <td className="px-6 py-4 text-right font-mono font-black text-xs text-rose-600">{item.type === 'Out' ? formatCurrency(item.amount) : '-'}</td>
                      <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight bg-slate-50/30">{item.status === 'Completed' ? formatCurrency(item.balance) : '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status === 'Draft' ? (
                          <button onClick={() => handleApprovePay(item)} className="px-3 py-1 bg-luxuryGold text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm hover:bg-luxuryGold/90 transition-all">Approve</button>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Locked</span>
                        )}
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
                  <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
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
                  <BarChart2 size={16} className="text-luxuryGold" /> Cash Flow Structure
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysisData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analysisData.map((entry, index) => (
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
                  <TrendingUp size={16} className="text-luxuryGold" /> Cash Balance Trend
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} tickFormatter={(val) => `฿${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => formatCurrency(value)}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'report' || activeTab === 'statement') && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-100 flex justify-center">
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] flex flex-col gap-12 font-sans text-slate-800">
              <div className="flex justify-between items-start border-b-2 border-midnight pb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-midnight rounded-2xl flex items-center justify-center text-luxuryGold shadow-xl">
                    <Landmark size={40} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-midnight uppercase tracking-tight">THAI MUNGMEE CO., LTD.</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">123 Industrial Estate, Samut Sakhon 74000</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-black text-slate-300 uppercase tracking-[0.3em]">{activeTab === 'report' ? 'Monthly Report' : 'Statement of Cash Flows'}</h2>
                  <p className="text-sm font-mono font-black text-midnight mt-2">{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Beginning Balance</h4>
                  <p className="text-2xl font-black text-midnight font-mono">{formatCurrency(stats.beginBalance)}</p>
                </div>
                <div className="bg-midnight p-6 rounded-2xl border border-midnight shadow-xl">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ending Balance</h4>
                  <p className="text-2xl font-black text-luxuryGold font-mono">{formatCurrency(stats.balance)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-white bg-midnight px-4 py-2 rounded-lg uppercase tracking-widest">Transaction Summary</h3>
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-midnight">
                      <th className="py-3 text-left uppercase font-black tracking-widest">Date</th>
                      <th className="py-3 text-left uppercase font-black tracking-widest">Ref</th>
                      <th className="py-3 text-left uppercase font-black tracking-widest">Description</th>
                      <th className="py-3 text-right uppercase font-black tracking-widest">Inflow</th>
                      <th className="py-3 text-right uppercase font-black tracking-widest">Outflow</th>
                      <th className="py-3 text-right uppercase font-black tracking-widest">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => i.status === 'Completed').map(item => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3 font-mono text-slate-400">{item.date}</td>
                        <td className="py-3 font-mono font-black text-midnight">{item.ref}</td>
                        <td className="py-3 font-bold text-slate-600 uppercase">{item.description}</td>
                        <td className="py-3 text-right font-mono font-black text-emerald-600">{item.type === 'In' ? formatCurrency(item.amount) : ''}</td>
                        <td className="py-3 text-right font-mono font-black text-rose-600">{item.type === 'Out' ? formatCurrency(item.amount) : ''}</td>
                        <td className="py-3 text-right font-mono font-black text-midnight">{formatCurrency(item.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                <span>Printed on: {new Date().toLocaleString()}</span>
                <span>Authorized Signature: _______________________</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlow;
