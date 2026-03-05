import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Line 
} from 'recharts';
import { 
  Armchair, 
  FileStack, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Activity, 
  Search, 
  ChevronDown, 
  Check, 
  Package, 
  Tags,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

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

const CustomMultiSelect = ({ options, selected, onChange, placeholder, label }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  const filteredOptions = options.filter((o: any) => o.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleOption = (value: string) => {
    selected.includes(value) 
      ? onChange(selected.filter((item: string) => item !== value)) 
      : onChange([...selected, value]);
  };

  const handleSelectAll = () => {
    if (filteredOptions.length === 0) return;
    const filteredValues = filteredOptions.map((o: any) => o.value);
    const allFilteredSelected = filteredValues.every((v: string) => selected.includes(v));
    if (allFilteredSelected) {
      onChange(selected.filter((s: string) => !filteredValues.includes(s)));
    } else {
      const newSelected = [...selected];
      filteredValues.forEach((v: string) => { if (!newSelected.includes(v)) newSelected.push(v); });
      onChange(newSelected);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">{label}</label>}
      <div 
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs cursor-pointer flex justify-between items-center shadow-sm hover:border-fireopal transition-colors h-[42px]" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate font-bold ${selected.length === 0 ? 'text-slate-400' : 'text-midnight'}`}>
          {selected.length === 0 ? placeholder : selected.length === options.length ? `All Selected (${options.length})` : `${selected.length} items selected`}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </div>
      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-64 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 left-0 min-w-[280px]">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-fireopal font-bold" 
                placeholder="Search item..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                autoFocus 
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-2 bg-white">
            <div className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer text-[10px] font-black text-fireopal border-b border-slate-50 flex items-center gap-3 uppercase tracking-widest" onClick={handleSelectAll}>
              <div className={`w-4 h-4 rounded-lg border flex items-center justify-center transition-all ${filteredOptions.every((o: any) => selected.includes(o.value)) && filteredOptions.length > 0 ? 'bg-fireopal border-fireopal' : 'border-slate-300'}`}>
                {filteredOptions.every((o: any) => selected.includes(o.value)) && filteredOptions.length > 0 && <Check size={10} className="text-white" />}
              </div> 
              Select All {searchTerm ? '(Filtered)' : ''}
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option: any) => (
                <div key={option.value} className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer text-[10px] font-bold flex items-center gap-3 text-midnight uppercase tracking-tight" onClick={() => toggleOption(option.value)}>
                  <div className={`w-4 h-4 rounded-lg border flex items-center justify-center transition-all ${selected.includes(option.value) ? 'bg-midnight border-midnight' : 'border-slate-300'}`}>
                    {selected.includes(option.value) && <Check size={10} className="text-white" />}
                  </div>
                  <span className="truncate">{option.label}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest italic">No items found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Data Logic ---
const WAREHOUSE_TYPES = ['FG-01 (Main)', 'FG-02 (Overflow)', 'FG-03 (Export)'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const QUARTERS = [{ value: 1, label: 'Q1 (Jan - Mar)' }, { value: 2, label: 'Q2 (Apr - Jun)' }, { value: 3, label: 'Q3 (Jul - Sep)' }, { value: 4, label: 'Q4 (Oct - Dec)' }];
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const generateMockDB = () => {
  const itemDB = [
    { sku: 'FG-TBDN-001', name: 'Dining Table Model A', unit: 'PCS', shelfLife: 365, category: 'Table', group: 'FG' },
    { sku: 'FG-CHDN-002', name: 'Dining Chair Wood', unit: 'PCS', shelfLife: 365, category: 'Chair', group: 'FG' },
    { sku: 'FG-BEDQ-003', name: 'Queen Size Bed Frame', unit: 'PCS', shelfLife: 365, category: 'Bed', group: 'FG' },
    { sku: 'FG-RAIL-004', name: 'Curtain Rail 2M', unit: 'PCS', shelfLife: 365, category: 'Rail', group: 'FG' },
    { sku: 'FG-IRON-005', name: 'Iron Board Premium', unit: 'PCS', shelfLife: 365, category: 'Iron Board', group: 'FG' },
    { sku: 'FG-DNST-006', name: 'Dining Set (Table+4Chairs)', unit: 'Set', shelfLife: 365, category: 'Dining', group: 'FG' },
    { sku: 'FG-SOFA-007', name: 'L-Shape Sofa Fabric', unit: 'Set', shelfLife: 365, category: 'Sofa', group: 'FG' },
    { sku: 'FG-CBNT-008', name: 'TV Cabinet 1.5M', unit: 'PCS', shelfLife: 365, category: 'Cabinet', group: 'FG' }
  ];
  const locDB = ['WH-FG-A01', 'WH-FG-A02', 'WH-FG-B01', 'WH-FG-C05'];
  
  const trxDB = Array.from({ length: 2500 }, (_, i) => { 
    const isIn = i % 2 === 0;
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 1460)); 
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const runNum = (1000 + i).toString().padStart(4, '0');
    const numItems = Math.floor(Math.random() * 2) + 1;
    const lineItems = [];
    let totalQty = 0;

    for (let j = 0; j < numItems; j++) {
      const itemIdx = Math.floor(Math.random() * itemDB.length);
      const qty = Math.floor(Math.random() * 20) + 5; 
      totalQty += qty;
      lineItems.push({
        sku: itemDB[itemIdx].sku, name: itemDB[itemIdx].name, qty: qty, unit: itemDB[itemIdx].unit, 
        lot: `FG${yy}${mm}${dd}-${j}`, location: locDB[j % locDB.length], 
        category: itemDB[itemIdx].category, group: itemDB[itemIdx].group
      });
    }
    return {
      id: `${isIn ? 'GR' : 'GO'}${yy}${mm}${dd}-${runNum}`, direction: isIn ? 'IN' : 'OUT', wh: WAREHOUSE_TYPES[i % 3],
      date: d.toISOString(), status: 'Completed', totalItems: totalQty, items: lineItems,
      inOutType: isIn ? 'Production' : 'Sales Order'
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { items: itemDB, transactions: trxDB };
};

const FGAnalytics: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisMode, setAnalysisMode] = useState<'item' | 'category'>('category'); 
  const [timeScale, setTimeScale] = useState<'daily' | 'weekly' | 'monthly'>('daily'); 
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);

  useEffect(() => {
    const data = generateMockDB();
    setTransactions(data.transactions);
    setItems(data.items);
    setIsLoading(false);
  }, []);

  const itemOptions = useMemo(() => items.map(i => ({ value: i.sku, label: `${i.sku} - ${i.name}` })), [items]);
  const categoryOptions = useMemo(() => {
    const cats = new Set(items.map(i => i.category));
    return Array.from(cats).map(c => ({ value: c, label: c }));
  }, [items]);

  useEffect(() => {
    if (!isLoading) {
      if (analysisMode === 'item' && selectedIds.length === 0 && itemOptions.length > 0) setSelectedIds(itemOptions.map(o => o.value));
      else if (analysisMode === 'category' && selectedIds.length === 0 && categoryOptions.length > 0) setSelectedIds(categoryOptions.map(o => o.value));
    }
  }, [analysisMode, itemOptions, categoryOptions, isLoading]);

  const stats = useMemo(() => {
    let filteredTrx = transactions.filter(t => {
      const tDate = new Date(t.date);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth();
      if (timeScale === 'daily') return tYear === selectedYear && tMonth === selectedMonth;
      else if (timeScale === 'weekly') return tYear === selectedYear && (Math.floor(tMonth / 3) + 1) === selectedQuarter;
      else return tYear === selectedYear;
    });
    let totalIn = 0, totalOut = 0;
    filteredTrx.forEach(t => {
      const qty = t.items.reduce((sum: number, i: any) => sum + parseInt(i.qty), 0);
      if (t.direction === 'IN') totalIn += qty; else totalOut += qty;
    });
    return { totalDocs: filteredTrx.length, totalIn, totalOut };
  }, [transactions, timeScale, selectedYear, selectedMonth, selectedQuarter]);

  const chartData = useMemo(() => {
    const dataMap = new Map();
    if (timeScale === 'daily') {
      const days = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      for (let d = 1; d <= days; d++) { const s = d.toString().padStart(2, '0'); dataMap.set(s, { date: s, IN: 0, OUT: 0, prevIN: 0, prevOUT: 0 }); }
    } else if (timeScale === 'weekly') {
      const sm = (selectedQuarter - 1) * 3, em = sm + 2;
      let c = new Date(selectedYear, sm, 1);
      while (c <= new Date(selectedYear, em + 1, 0)) {
        const d = new Date(Date.UTC(c.getFullYear(), c.getMonth(), c.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const wn = Math.ceil((((d.getTime() - new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).getTime()) / 86400000) + 1) / 7);
        const k = `W${wn}`; if (!dataMap.has(k)) dataMap.set(k, { date: k, IN: 0, OUT: 0, prevIN: 0, prevOUT: 0 });
        c.setDate(c.getDate() + 1);
      }
    } else { MONTH_NAMES.forEach(m => dataMap.set(m, { date: m, IN: 0, OUT: 0, prevIN: 0, prevOUT: 0 })); }

    transactions.forEach(trx => {
      const tDate = new Date(trx.date);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth();
      let key, isCur = false, isPrev = false;

      if (timeScale === 'daily') {
        if (tMonth === selectedMonth) {
          if (tYear === selectedYear) isCur = true;
          if (tYear === selectedYear - 1) isPrev = true;
          key = tDate.getDate().toString().padStart(2, '0');
        }
      } else if (timeScale === 'weekly') {
        const q = Math.floor(tMonth / 3) + 1;
        if (q === selectedQuarter) {
          if (tYear === selectedYear) isCur = true;
          if (tYear === selectedYear - 1) isPrev = true;
          const d = new Date(Date.UTC(tYear, tMonth, tDate.getDate()));
          d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
          key = `W${Math.ceil((((d.getTime() - new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).getTime()) / 86400000) + 1) / 7)}`;
        }
      } else {
        if (tYear === selectedYear) isCur = true;
        if (tYear === selectedYear - 1) isPrev = true;
        key = MONTH_NAMES[tMonth];
      }

      if ((isCur || isPrev) && dataMap.has(key)) {
        const ent = dataMap.get(key);
        trx.items.forEach((item: any) => {
          if (analysisMode === 'item' ? selectedIds.includes(item.sku) : selectedIds.includes(item.category)) {
            const q = parseInt(item.qty);
            if (isCur) { if (trx.direction === 'IN') ent.IN += q; else ent.OUT += q; }
            else if (isPrev) { if (trx.direction === 'IN') ent.prevIN += q; else ent.prevOUT += q; }
          }
        });
      }
    });
    return Array.from(dataMap.values()).sort((a, b) => {
      if (timeScale === 'monthly') return MONTH_NAMES.indexOf(a.date) - MONTH_NAMES.indexOf(b.date);
      if (timeScale === 'weekly') return (parseInt(a.date.replace(/\D/g, '')) || 0) - (parseInt(b.date.replace(/\D/g, '')) || 0);
      return parseInt(a.date) - parseInt(b.date);
    });
  }, [transactions, analysisMode, timeScale, selectedIds, selectedYear, selectedMonth, selectedQuarter]);

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-vistawhite"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fireopal"></div></div>;

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-fireopal shadow-sm border border-slate-100 flex-shrink-0">
            <Armchair size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              FG <span className="text-fireopal">ANALYTICS</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Finished Goods Transaction Dashboard</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => { setAnalysisMode('item'); setSelectedIds([]); }} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${analysisMode === 'item' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Package size={16}/> By SKU
          </button>
          <button 
            onClick={() => { setAnalysisMode('category'); setSelectedIds([]); }} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${analysisMode === 'category' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Tags size={16}/> By Category
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="FG Transactions" val={stats.totalDocs} color="#6094A3" icon={FileStack} desc="Docs in Period" />
        <KPICard title="Produced (IN)" val={stats.totalIn.toLocaleString()} color="#919D85" icon={ArrowDownLeft} desc="FG Received" />
        <KPICard title="Sold (OUT)" val={stats.totalOut.toLocaleString()} color="#E3624A" icon={ArrowUpRight} desc="FG Shipped" />
        <KPICard title="Net Stock Change" val={(stats.totalIn - stats.totalOut).toLocaleString()} color="#DB9E32" icon={Activity} desc="Current Balance" />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row items-end gap-6 mb-10 border-b border-slate-50 pb-8 relative z-50">
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Scale</span>
            <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
              {(['daily', 'weekly', 'monthly'] as const).map(scale => (
                <button 
                  key={scale} 
                  onClick={() => setTimeScale(scale)} 
                  className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${timeScale === scale ? 'bg-white text-fireopal shadow-sm' : 'text-slate-500 hover:text-midnight'}`}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-2 w-28 shrink-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Year</span>
              <div className="relative">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black text-midnight focus:outline-none focus:border-fireopal shadow-sm h-[42px] appearance-none cursor-pointer uppercase tracking-widest"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            {timeScale === 'daily' && (
              <div className="flex flex-col gap-2 w-36 shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Month</span>
                <div className="relative">
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(Number(e.target.value))} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black text-midnight focus:outline-none focus:border-fireopal shadow-sm h-[42px] appearance-none cursor-pointer uppercase tracking-widest"
                  >
                    {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
            {timeScale === 'weekly' && (
              <div className="flex flex-col gap-2 w-44 shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quarter</span>
                <div className="relative">
                  <select 
                    value={selectedQuarter} 
                    onChange={(e) => setSelectedQuarter(Number(e.target.value))} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black text-midnight focus:outline-none focus:border-fireopal shadow-sm h-[42px] appearance-none cursor-pointer uppercase tracking-widest"
                  >
                    {QUARTERS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-grow w-full lg:w-auto min-w-[300px]">
            <CustomMultiSelect 
              options={analysisMode === 'item' ? itemOptions : categoryOptions} 
              selected={selectedIds} 
              onChange={setSelectedIds} 
              placeholder={analysisMode === 'item' ? "Select FG Items..." : "Select FG Categories..."}
              label={analysisMode === 'item' ? 'Select FG Items' : 'Select FG Categories'}
            />
          </div>
        </div>

        <div className="w-full h-[500px] relative z-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#919D85" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#919D85" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E3624A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E3624A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }} 
                itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} 
                labelStyle={{ color: '#94A3B8', marginBottom: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '40px' }} 
                formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
              />
              <Area 
                name="Inbound (Production)" 
                type="monotone" 
                dataKey="IN" 
                stroke="#919D85" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorIn)" 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
              <Area 
                name="Outbound (Sales)" 
                type="monotone" 
                dataKey="OUT" 
                stroke="#E3624A" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorOut)" 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
              <Line 
                name="Prev Year IN" 
                type="monotone" 
                dataKey="prevIN" 
                stroke="#919D85" 
                strokeWidth={2} 
                strokeDasharray="8 8" 
                dot={false} 
                strokeOpacity={0.4} 
              />
              <Line 
                name="Prev Year OUT" 
                type="monotone" 
                dataKey="prevOUT" 
                stroke="#E3624A" 
                strokeWidth={2} 
                strokeDasharray="8 8" 
                dot={false} 
                strokeOpacity={0.4} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FGAnalytics;
