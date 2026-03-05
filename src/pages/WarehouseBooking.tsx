import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  PackageCheck, 
  List, 
  BarChart2, 
  FileBarChart, 
  Search, 
  Printer, 
  Eye, 
  Box, 
  Clock, 
  FileText, 
  ShieldCheck, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Loader2
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
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

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

const WarehouseBooking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'impact' | 'report'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState<any[]>([]);
  const [showReportPreview, setShowReportPreview] = useState(false); 

  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelData, setLabelData] = useState<any[]>([]);
  const [printFormat, setPrintFormat] = useState<'A6' | 'A4'>('A6');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const statuses = ['All', 'Reserved', 'In-Picking', 'Picked', 'Ready to Ship', 'Shipped'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setBookings([
        { id: 1, bookingId: 'BK-2026-001', soRef: 'SO-2026-001', date: '2026-01-10', customer: 'HomePro (Public Company)', sku: 'LD-001', productName: 'ราวตากผ้าสแตนเลส (รุ่นพับได้)', qty: 50, status: 'Reserved', location: 'WH-A-01' },
        { id: 2, bookingId: 'BK-2026-002', soRef: 'SO-2026-001', date: '2026-01-10', customer: 'HomePro (Public Company)', sku: 'LD-002', productName: 'ราวแขวนผ้าบาร์คู่ (ล้อเลื่อน)', qty: 30, status: 'In-Picking', location: 'WH-A-02' },
        { id: 3, bookingId: 'BK-2026-003', soRef: 'SO-2026-002', date: '2026-01-12', customer: 'Index Living Mall', sku: 'OF-001', productName: 'เก้าอี้จัดเลี้ยง (เบาะนวม)', qty: 100, status: 'Ready to Ship', location: 'WH-B-05' },
        { id: 4, bookingId: 'BK-2026-004', soRef: 'SO-2026-003', date: '2026-01-15', customer: 'Origin Condo Project', sku: 'BD-001', productName: 'ชุดเครื่องนอนครบเซ็ต', qty: 20, status: 'Picked', location: 'WH-C-10' },
        { id: 5, bookingId: 'BK-2026-005', soRef: 'SO-2026-004', date: '2026-01-16', customer: 'Siam Furniture Dealer', sku: 'LV-001', productName: 'โต๊ะญี่ปุ่นไม้สักทอง (60x60)', qty: 15, status: 'Shipped', location: 'WH-D-01' },
        { id: 6, bookingId: 'BK-2026-006', soRef: 'SO-2026-005', date: '2026-01-18', customer: 'SB Design Square', sku: 'GN-001', productName: 'ชั้นวางรองเท้า 4 ชั้น', qty: 200, status: 'Reserved', location: 'WH-A-03' },
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredBookings = useMemo(() => {
    let res = bookings;
    if (statusFilter !== 'All') res = res.filter(b => b.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(b => b.bookingId.toLowerCase().includes(q) || b.soRef.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q) || b.productName.toLowerCase().includes(q));
    }
    return res;
  }, [bookings, statusFilter, searchQuery]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;

  const closeModal = () => setShowModal(false);

  const stats = useMemo(() => ({
    totalReserved: bookings.reduce((sum, b) => sum + b.qty, 0),
    pendingPick: bookings.filter(b => b.status === 'Reserved').reduce((sum, b) => sum + b.qty, 0),
    activeOrders: new Set(bookings.map(b => b.soRef)).size,
    stockCoverage: 98
  }), [bookings]);

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Reserved': return 'bg-slate-50 text-slate-400 border-slate-200';
      case 'In-Picking': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Picked': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Ready to Ship': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Shipped': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-200';
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'All') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = paginatedBookings.map(b => b.id);
      setSelectedIds([...new Set([...selectedIds, ...currentIds])]);
    } else {
      const currentIds = paginatedBookings.map(b => b.id);
      setSelectedIds(selectedIds.filter(id => !currentIds.includes(id)));
    }
  };

  const openLabelModal = (items: any[]) => {
    setLabelData(items);
    setPrintFormat('A6');
    setShowLabelModal(true);
  };

  useEffect(() => {
    if (showLabelModal && labelData.length > 0) {
      setTimeout(() => {
        const itemsToRender = printFormat === 'A6' ? [labelData[0]] : labelData.slice(0, 4);
        itemsToRender.forEach((item, i) => {
          if (!item) return;
          const qrCanvas = document.getElementById(`qr-canvas-${i}`) as HTMLCanvasElement;
          if (qrCanvas) {
            QRCode.toCanvas(qrCanvas, JSON.stringify({id: item.bookingId, sku: item.sku}), { width: 80, margin: 0 });
          }
          const barcodeCanvas = document.getElementById(`barcode-canvas-${i}`);
          if (barcodeCanvas) {
            JsBarcode(barcodeCanvas, item.bookingId, {
              format: "CODE128",
              lineColor: "#000",
              width: 1.5,
              height: 50,
              displayValue: true,
              fontSize: 9,
              marginTop: 5
            });
          }
        });
      }, 200);
    }
  }, [showLabelModal, labelData, printFormat]);

  const generateReport = () => {
    if (!reportDateRange.start || !reportDateRange.end) {
      return Swal.fire('Error', 'Please select start and end dates', 'error');
    }
    const filtered = bookings.filter(b => b.date >= reportDateRange.start && b.date <= reportDateRange.end);
    setReportData(filtered);
    Swal.fire('Success', `Found ${filtered.length} records`, 'success');
  };

  const LabelContentA5 = ({ index, log }: any) => (
    <div className="w-[105mm] h-[148mm] bg-white p-4 border border-dashed border-slate-300 flex flex-col justify-between font-mono text-black">
      <div className="text-center border-b-2 border-slate-900 pb-2">
        <h4 className="font-black text-xl uppercase tracking-widest text-slate-900">BOOKING TAG</h4>
        <p className="text-[10px] text-slate-500 tracking-widest uppercase">Internal Document</p>
      </div>
      
      <div className="flex justify-between items-start my-3">
        <canvas id={`qr-canvas-${index}`}></canvas>
        <div className="text-right">
          <div className="text-xs font-black text-slate-400 uppercase">Reserved Qty</div>
          <h2 className="text-6xl font-black text-slate-900 leading-none">{log.qty}</h2>
          <span className="text-sm font-black text-slate-500">Units</span>
        </div>
      </div>

      <div className="text-right mb-4">
        <p className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{log.productName}</p>
        <p className="text-base font-black text-slate-500">{log.sku}</p>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-[12px] border-t border-dashed border-slate-300 pt-3 flex-1">
        <div className="col-span-2 flex justify-between items-center border-b border-slate-50 pb-1">
          <span className="font-black text-slate-400 uppercase">Customer:</span> 
          <span className="font-black text-sm text-slate-900 truncate max-w-[150px]">{log.customer}</span>
        </div>
        <div className="col-span-2 flex justify-between items-center border-b border-slate-50 pb-1">
          <span className="font-black text-slate-400 uppercase">Ref Doc:</span> 
          <span className="font-black text-sm">{log.soRef}</span>
        </div>
        <div className="col-span-2 flex justify-between items-center border-b border-slate-50 pb-1">
          <span className="font-black text-slate-400 uppercase">Booking ID:</span> 
          <span className="font-black text-sm">{log.bookingId}</span>
        </div>
        <div className="col-span-2 flex justify-between items-center border-b border-slate-50 pb-1 mt-1">
          <span className="font-black text-slate-400 uppercase">Loc:</span>
          <span className="font-black text-sm text-slate-900">{log.location || 'ZONE A'}</span>
        </div>
      </div>

      <div className="border-t border-slate-900 pt-2 flex justify-center">
        <svg id={`barcode-canvas-${index}`} className="w-full h-16"></svg>
      </div>
    </div>
  );

  const impactData = [
    { name: 'LD-001', reserved: 50, available: 100 },
    { name: 'LD-002', reserved: 30, available: 5 },
    { name: 'OF-001', reserved: 100, available: 20 },
    { name: 'BD-001', reserved: 20, available: 30 },
    { name: 'GN-001', reserved: 200, available: 50 },
  ];

  const statusDistribution = useMemo(() => {
    const counts: any = {};
    bookings.forEach(b => counts[b.status] = (counts[b.status] || 0) + 1);
    return Object.keys(counts).map(k => ({
      name: k,
      value: counts[k]
    }));
  }, [bookings]);

  const COLORS = ['#64748B', '#809BBF', '#D4AF37', '#EA580C', '#3F6212'];

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-midnight shadow-sm border border-slate-100 flex-shrink-0">
            <PackageCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none font-mono">
              PRODUCT <span className="text-luxuryGold">BOOKING</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Inventory Reservation & Allocation</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('list')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'list' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <List size={16}/> BOOKING LIST
          </button>
          <button onClick={() => setActiveTab('impact')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'impact' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <BarChart2 size={16}/> INVENTORY IMPACT
          </button>
          <button onClick={() => setActiveTab('report')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'report' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <FileBarChart size={16}/> REPORT
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {activeTab !== 'report' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
          <KPICard title="Reserved Units" val={stats.totalReserved} color="#809BBF" icon={Box} desc="Total Allocated Qty" />
          <KPICard title="Pending Pick" val={stats.pendingPick} color="#D4AF37" icon={Clock} desc="Wait for Picking" />
          <KPICard title="Active Orders" val={stats.activeOrders} color="#3A3659" icon={FileText} desc="SO with Reservations" />
          <KPICard title="Stock Coverage" val={stats.stockCoverage + '%'} color="#3F6212" icon={ShieldCheck} desc="Items Available in WH" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {activeTab === 'list' && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                {statuses.map(s => (
                  <button key={s} onClick={() => {setStatusFilter(s); setCurrentPage(1);}} 
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${statusFilter === s ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                    {s}
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{getStatusCount(s)}</span>
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
                    placeholder="Search Product / SO / Customer..." 
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
                  />
                </div>
                {selectedIds.length > 0 && (
                  <button onClick={() => openLabelModal(bookings.filter(b => selectedIds.includes(b.id)))} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-luxuryGold text-white hover:bg-luxuryGold/90 shadow-lg shadow-luxuryGold/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap animate-fade-in-up">
                    <Printer size={14} /> PRINT SELECTED ({selectedIds.length})
                  </button>
                )}
                <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <Printer size={14} /> PRINT ALL
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 w-10 text-center border-b border-slate-100">
                      <input type="checkbox" checked={paginatedBookings.length > 0 && paginatedBookings.every(b => selectedIds.includes(b.id))} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-luxuryGold focus:ring-luxuryGold" />
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Booking ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">SO Reference</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Reserved Qty</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedBookings.map(booking => (
                    <tr key={booking.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(booking.id) ? 'bg-luxuryGold/5' : ''}`}>
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" checked={selectedIds.includes(booking.id)} onChange={() => toggleSelection(booking.id)} className="w-4 h-4 rounded border-slate-300 text-luxuryGold focus:ring-luxuryGold" />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold uppercase">{booking.bookingId}</td>
                      <td className="px-6 py-4 font-mono text-xs font-black text-midnight uppercase">{booking.soRef}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{booking.date}</td>
                      <td className="px-6 py-4 text-xs font-black text-midnight uppercase truncate max-w-[200px]">{booking.customer}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-midnight uppercase">{booking.sku}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{booking.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">{booking.qty.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusClass(booking.status)}`}>{booking.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openLabelModal([booking])} className="p-2 text-slate-400 hover:text-luxuryGold transition-colors"><Printer size={14} /></button>
                          <button onClick={() => {setSelectedBooking(booking); setShowModal(true);}} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Eye size={14} /></button>
                        </div>
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

        {activeTab === 'impact' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[450px]">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <BarChart2 size={16} className="text-luxuryGold" /> Reserved vs Available Stock
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={impactData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '20px' }} />
                      <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#D4AF37" radius={[0, 0, 0, 0]} barSize={32} />
                      <Bar dataKey="available" name="Available" stackId="a" fill="#0F172A" radius={[10, 10, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xs font-black text-midnight uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <PieChart size={16} className="text-luxuryGold" /> Booking Status Distribution
                </h3>
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
                      />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="p-8 flex flex-col h-full space-y-8">
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-end gap-6 shadow-sm">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From Date</label>
                <input type="date" value={reportDateRange.start} onChange={(e) => setReportDateRange({...reportDateRange, start: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">To Date</label>
                <input type="date" value={reportDateRange.end} onChange={(e) => setReportDateRange({...reportDateRange, end: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
              </div>
              <button onClick={generateReport} className="px-8 py-3 bg-midnight text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-midnight/20 hover:bg-midnight/90 flex items-center gap-2">
                <Search size={14} /> Generate Report
              </button>
            </div>

            <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col shadow-sm">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-midnight text-xs uppercase tracking-widest">Report Result <span className="text-slate-400 font-bold ml-2">({reportData.length} records)</span></h3>
                <button onClick={() => setShowReportPreview(true)} disabled={reportData.length === 0} className="px-6 py-2.5 bg-white border border-slate-200 text-midnight rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 transition-all">
                  <Printer size={14} /> Export / Print PDF
                </button>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Booking ID</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">SO Ref</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Qty</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Location</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-black text-[10px] text-midnight uppercase">{row.bookingId}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{row.date}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-luxuryGold uppercase">{row.soRef}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-midnight uppercase">{row.productName}</td>
                        <td className="px-6 py-4 text-right font-black text-midnight text-[10px]">{row.qty.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400 uppercase">{row.location}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <Draggable handle=".modal-handle" cancel="button, input, select, textarea">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-luxuryGold"
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-luxuryGold">
                      <PackageCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">Booking Details</h3>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{selectedBooking?.bookingId}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30 space-y-6">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SO Reference</label>
                        <p className="text-sm font-mono font-black text-midnight uppercase">{selectedBooking?.soRef}</p>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</label>
                        <p className="text-sm font-black text-midnight uppercase">{selectedBooking?.customer}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Product</label>
                        <p className="text-sm font-black text-midnight uppercase">{selectedBooking?.sku} - {selectedBooking?.productName}</p>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reserved Qty</label>
                        <p className="text-xl font-mono font-black text-vividOrange">{selectedBooking?.qty} Units</p>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusClass(selectedBooking?.status)}`}>{selectedBooking?.status}</span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Warehouse Location</label>
                        <p className="text-sm font-mono font-black text-midnight uppercase">{selectedBooking?.location || 'Zone A-01'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                  <button onClick={() => openLabelModal([selectedBooking])} className="px-8 py-3 bg-luxuryGold text-white text-[10px] font-black rounded-2xl shadow-xl shadow-luxuryGold/20 hover:bg-luxuryGold/90 transition-all flex items-center gap-2 uppercase tracking-widest">
                    <Printer size={16} /> Print Label
                  </button>
                  <button onClick={closeModal} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Close</button>
                </div>
              </motion.div>
            </Draggable>
          </div>
        )}
      </AnimatePresence>

      {/* Print Label Modal */}
      <AnimatePresence>
        {showLabelModal && labelData.length > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLabelModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-luxuryGold"
            >
              <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black text-midnight uppercase tracking-tight">Print Label Preview</h3>
                <div className="flex gap-2">
                  <button onClick={() => setPrintFormat('A6')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border ${printFormat === 'A6' ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-400 border-slate-200'}`}>A6 (Single)</button>
                  <button onClick={() => setPrintFormat('A4')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border ${printFormat === 'A4' ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-400 border-slate-200'}`}>A4 (4-Up)</button>
                </div>
                <button onClick={() => setShowLabelModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-100 flex justify-center">
                <div id="printable-area" className="bg-white shadow-lg">
                  {printFormat === 'A6' ? (
                    <LabelContentA5 index={0} log={labelData[0]} />
                  ) : (
                    <div className="grid grid-cols-2 grid-rows-2 gap-4 p-4 w-[210mm] h-[297mm]">
                      {labelData.slice(0, 4).map((item, i) => (
                        <LabelContentA5 key={i} index={i} log={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 border-t bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowLabelModal(false)} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={() => window.print()} className="px-12 py-3 bg-luxuryGold text-white text-[10px] font-black rounded-2xl shadow-xl shadow-luxuryGold/20 hover:bg-luxuryGold/90 transition-all flex items-center gap-2 uppercase tracking-widest">
                  <Printer size={16} /> Print Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Report Preview Modal */}
      <AnimatePresence>
        {showReportPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportPreview(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-midnight"
            >
              <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black text-midnight uppercase tracking-tight">Report Preview (A4)</h3>
                <button onClick={() => setShowReportPreview(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-500 flex justify-center">
                <div id="printable-area" className="w-[210mm] min-h-[297mm] bg-white p-[20mm] shadow-2xl font-mono text-black">
                  <div className="flex justify-between items-center border-b-4 border-slate-900 pb-6 mb-8">
                    <div>
                      <h1 className="text-3xl font-black uppercase tracking-tighter">Booking Report</h1>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Thai Mungmee MES System</p>
                    </div>
                    <div className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <p>Date Range: {reportDateRange.start} to {reportDateRange.end}</p>
                      <p>Printed: {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-900">
                        <th className="py-3 uppercase">Booking ID</th>
                        <th className="py-3 uppercase">Date</th>
                        <th className="py-3 uppercase">Ref</th>
                        <th className="py-3 uppercase">Product</th>
                        <th className="py-3 text-right uppercase">Qty</th>
                        <th className="py-3 uppercase">Location</th>
                        <th className="py-3 uppercase text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-3 font-black uppercase">{row.bookingId}</td>
                          <td className="py-3">{row.date}</td>
                          <td className="py-3 font-black text-luxuryGold uppercase">{row.soRef}</td>
                          <td className="py-3 font-bold uppercase">{row.productName}</td>
                          <td className="py-3 text-right font-black">{row.qty.toLocaleString()}</td>
                          <td className="py-3 uppercase">{row.location}</td>
                          <td className="py-3 text-center uppercase font-bold">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-12 pt-6 border-t-4 border-slate-900 text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Grand Total Reserved</p>
                    <p className="text-3xl font-black tracking-tighter">{reportData.reduce((sum, r) => sum + r.qty, 0).toLocaleString()} <span className="text-sm text-slate-400 uppercase">Units</span></p>
                  </div>
                </div>
              </div>
              <div className="p-8 border-t bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowReportPreview(false)} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={() => window.print()} className="px-12 py-3 bg-midnight text-white text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-2 uppercase tracking-widest">
                  <Printer size={16} /> Print / Save as PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[20000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin text-midnight"><Loader2 size={64} /></div>
        </div>
      )}
    </div>
  );
};

export default WarehouseBooking;
