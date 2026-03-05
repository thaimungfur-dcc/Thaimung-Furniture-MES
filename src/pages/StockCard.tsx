import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  LayoutDashboard, 
  Search, 
  X, 
  Printer, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  BarChart3,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
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

const StockCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'card' | 'dashboard'>('card');
  const [itemSearchText, setItemSearchText] = useState('');
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const items = [
    { id: 'LD-001', name: 'ราวตากผ้าสแตนเลส (รุ่นพับได้)', unit: 'Sets', category: 'Laundry', subCategory: 'Steel' },
    { id: 'OF-001', name: 'เก้าอี้จัดเลี้ยง (เบาะนวม)', unit: 'Pcs', category: 'Office', subCategory: 'Furniture' },
    { id: 'GN-001', name: 'ชั้นวางรองเท้า 4 ชั้น', unit: 'Pcs', category: 'General', subCategory: 'Storage' },
    { id: 'RM-ST-01', name: 'ท่อสแตนเลส 1 นิ้ว', unit: 'Meters', category: 'RM', subCategory: 'Steel' },
    { id: 'PK-BOX-01', name: 'กล่องกระดาษ Size L', unit: 'Pcs', category: 'Packaging', subCategory: 'Paper' }
  ];

  const [movements, setMovements] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsItemDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    if (!itemSearchText) return items;
    const q = itemSearchText.toLowerCase();
    return items.filter(i => (i.id + i.name).toLowerCase().includes(q));
  }, [itemSearchText]);

  const selectedItemDetails = useMemo(() => 
    items.find(i => i.id === selectedItemId) || { name: '-', unit: '-', category: '-', subCategory: '-' },
  [selectedItemId]);

  const currentBalance = useMemo(() => movements[0]?.balance || 0, [movements]);
  const availableLots = useMemo(() => Array.from(new Set(movements.map(m => m.lot))).sort(), [movements]);
  
  const filteredMovements = useMemo(() => 
    selectedLotId ? movements.filter(m => m.lot === selectedLotId) : movements,
  [movements, selectedLotId]);

  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovements.slice(start, start + itemsPerPage);
  }, [filteredMovements, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage) || 1;

  const handleItemSelect = (item: any) => {
    setSelectedItemId(item.id);
    setCurrentPage(1);
    setItemSearchText(`${item.id}: ${item.name}`);
    setIsItemDropdownOpen(false);
    // Mock movements
    setMovements([
      { date: '2026-01-20 14:00', type: 'OUT', docId: 'DO-2601-002', ref: 'SO-2026-005', lot: 'LOT-A', in: 0, out: 50, balance: 450, loc: 'A-01' },
      { date: '2026-01-10 16:00', type: 'IN', docId: 'GR-2601-001', ref: 'JO-2025-099', lot: 'LOT-A', in: 500, out: 0, balance: 500, loc: 'A-01' },
    ]);
  };

  const handleClearSearch = () => {
    setItemSearchText('');
    setSelectedItemId('');
    setMovements([]);
  };

  const trendData = [
    { name: 'Jul', in: 300, out: 250 },
    { name: 'Aug', in: 450, out: 380 },
    { name: 'Sep', in: 400, out: 410 },
    { name: 'Oct', in: 500, out: 350 },
    { name: 'Nov', in: 480, out: 420 },
    { name: 'Dec', in: 600, out: 550 },
    { name: 'Jan', in: 750, out: 610 },
  ];

  const popularityData = [
    { id: 'LD-001', value: 124, color: '#D4AF37' },
    { id: 'RM-ST-01', value: 98, color: '#0F172A' },
    { id: 'OF-001', value: 86, color: '#64748B' },
    { id: 'PK-BOX-01', value: 75, color: '#809BBF' },
    { id: 'GN-001', value: 42, color: '#3A3659' },
  ];

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-luxuryGold shadow-sm border border-slate-100 flex-shrink-0">
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none font-mono">
              STOCK <span className="text-luxuryGold">CARD</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Inventory Movement Ledger</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('card')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'card' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <FileText size={16}/> STOCK CARD
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <LayoutDashboard size={16}/> DASHBOARD
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8">
        {activeTab === 'card' && (
          <>
            {/* Search & Item Info */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative z-30 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-5 relative" ref={dropdownRef}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item Code / Name</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={itemSearchText} 
                        onChange={(e) => {
                          setItemSearchText(e.target.value);
                          setIsItemDropdownOpen(true);
                        }}
                        onFocus={() => setIsItemDropdownOpen(true)}
                        placeholder="Type to search..." 
                        className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white text-midnight font-mono"
                      />
                      {itemSearchText && (
                        <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isItemDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 mt-2 p-2 custom-scrollbar"
                        >
                          {filteredItems.map(item => (
                            <div key={item.id} onClick={() => handleItemSelect(item)} className="p-4 hover:bg-slate-50 cursor-pointer rounded-xl transition-colors flex flex-col gap-1">
                              <span className="font-black text-midnight font-mono text-xs uppercase">{item.id}</span>
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                            </div>
                          ))}
                          {filteredItems.length === 0 && <div className="p-4 text-center text-xs text-slate-400 font-bold uppercase">No items found</div>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lot No.</label>
                    <select 
                      value={selectedLotId} 
                      onChange={(e) => setSelectedLotId(e.target.value)}
                      disabled={!selectedItemId} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold disabled:bg-slate-50 disabled:text-slate-300"
                    >
                      <option value="">-- All Lots --</option>
                      {availableLots.map(lot => <option key={lot} value={lot}>{lot}</option>)}
                    </select>
                  </div>
                  
                  <div className="md:col-span-4 flex justify-end">
                    <button className="px-8 py-3 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest">
                      <Printer size={16} /> Print Card
                    </button>
                  </div>
                </div>
              </div>
              
              {selectedItemId && (
                <div className="px-8 py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform rotate-12 pointer-events-none">
                    <Package size={160} className="text-luxuryGold" />
                  </div>
                  <div className="relative z-10 flex flex-col">
                    <span className="text-[9px] text-luxuryGold uppercase font-black tracking-[0.3em] mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-luxuryGold animate-pulse"></div> Selected Item
                    </span>
                    <h2 className="text-2xl font-black text-midnight flex flex-wrap items-baseline gap-3 uppercase tracking-tight">
                      <span className="font-mono text-luxuryGold">{selectedItemId}</span>
                      <span className="text-slate-400 font-light">/</span>
                      <span>{selectedItemDetails.name}</span>
                    </h2>
                  </div>
                  
                  <div className="relative z-10 flex flex-wrap items-center gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 shadow-sm w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Current Balance</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-midnight text-4xl font-mono leading-none">{currentBalance.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedItemDetails.unit}</span>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Category</span>
                      <span className="font-black text-midnight uppercase tracking-tight text-base">{selectedItemDetails.category}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Movement Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[400px]">
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Type</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Doc ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ref</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Lot No</th>
                      <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 text-right">In</th>
                      <th className="px-6 py-4 text-[10px] font-black text-rose-600 uppercase tracking-widest border-b border-slate-100 text-right">Out</th>
                      <th className="px-6 py-4 text-[10px] font-black text-midnight uppercase tracking-widest border-b border-slate-100 text-right">Balance</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedMovements.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-20 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
                          {selectedItemId ? 'No movements found' : 'Select an item to view history'}
                        </td>
                      </tr>
                    ) : (
                      paginatedMovements.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{m.date}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${m.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                              {m.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-black text-midnight uppercase">{m.docId}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400 uppercase">{m.ref}</td>
                          <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold uppercase">{m.lot}</td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-black text-emerald-600">
                            {m.in > 0 ? '+' + m.in.toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-black text-rose-600">
                            {m.out > 0 ? '-' + m.out.toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-black text-midnight bg-slate-50/30">{m.balance.toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400 uppercase">{m.loc}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center gap-4 bg-slate-50/30 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Show</span>
                  <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none">
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"><ChevronLeft size={16} /></button>
                  <span className="text-[10px] font-black text-midnight px-4 py-2 bg-white border border-slate-200 rounded-xl uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Movement Trend */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[450px] flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp size={20} className="text-luxuryGold" />
                  <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em]">Monthly Stock Movement Trend</h3>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '20px' }} />
                      <Line type="monotone" dataKey="in" name="Stock In" stroke="#3F6212" strokeWidth={4} dot={{ r: 4, fill: '#3F6212' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="out" name="Stock Out" stroke="#B43B42" strokeWidth={4} dot={{ r: 4, fill: '#B43B42' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Most Active Items */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[450px] flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <BarChart3 size={20} className="text-luxuryGold" />
                  <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em]">Top 5 Most Active Items</h3>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularityData} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" name="Total Transactions" radius={[0, 10, 10, 0]} barSize={24}>
                        {popularityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                  <ArrowDownLeft size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Received (MTD)</p>
                  <p className="text-2xl font-black text-midnight font-mono">1,250 <span className="text-xs font-bold text-slate-300 uppercase ml-1">Units</span></p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                  <ArrowUpRight size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Issued (MTD)</p>
                  <p className="text-2xl font-black text-midnight font-mono">840 <span className="text-xs font-bold text-slate-300 uppercase ml-1">Units</span></p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                  <RefreshCw size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inventory Turnover</p>
                  <p className="text-2xl font-black text-midnight font-mono">4.2x <span className="text-xs font-bold text-slate-300 uppercase ml-1">Annual</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
