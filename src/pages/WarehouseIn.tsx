import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowDownToLine, 
  History, 
  Hammer, 
  ShoppingBag, 
  FileBarChart, 
  Archive, 
  Clock, 
  Truck, 
  CalendarCheck, 
  Search, 
  UploadCloud, 
  Plus, 
  Settings, 
  Eye, 
  Printer, 
  MapPin, 
  CheckSquare, 
  CheckCircle, 
  X, 
  Save, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
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

const WarehouseIn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all_receive' | 'pending_jo' | 'pending_po' | 'report'>('all_receive');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showReportPreviewModal, setShowReportPreviewModal] = useState(false);
  
  const [receiveType, setReceiveType] = useState<'JO' | 'PO' | 'Manual'>('Manual');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [printLog, setPrintLog] = useState<any>(null);
  const [printFormat, setPrintFormat] = useState<'A5' | 'A4'>('A5');
  
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState<any[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [config, setConfig] = useState({
    warehouses: ['FG', 'RM', 'WIP', 'REWORK', 'SCRAP'],
    locations: ['A-01', 'A-02', 'B-01', 'B-02', 'RM-Z1'],
    sources: ['Production', 'Purchase', 'Return', 'Transfer', 'Adjustment', 'Consignment', 'Free Goods', 'Subcontract', 'Rework Return', 'POSM Return', 'Opening']
  });

  const [jobOrders, setJobOrders] = useState<any[]>([
    { id: 1, joNo: 'JO-2026-001', soRef: 'SO-2026-001', sku: 'LD-001', productName: 'ราวตากผ้าสแตนเลส', qty: 50, received: 20, dueDate: '2026-01-20', status: 'In Progress' },
    { id: 2, joNo: 'JO-2026-003', soRef: 'SO-2026-002', sku: 'OF-001', productName: 'เก้าอี้จัดเลี้ยง', qty: 100, received: 95, dueDate: '2026-01-25', status: 'In Progress' },
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([
    { id: 201, poNo: 'PO-2026-001', supplier: 'Thai Steel Co.', sku: 'RM-ST-001', productName: 'Steel Tube 1"', qty: 1000, received: 500, dueDate: '2026-01-25', status: 'In Progress' },
  ]);

  const [historyLogs, setHistoryLogs] = useState<any[]>([
    { id: 101, transId: 'GR260115-001', date: '2026-01-15 10:30', refNo: 'JO-2026-001', source: 'Production', sku: 'LD-001', productName: 'ราวตากผ้าสแตนเลส', wh: 'FG', location: 'A-01-05', qty: 20, unit: 'Set', lotNo: 'LOT-260115', mfg: '2026-01-14', exp: '-', remark: 'Batch 1', by: 'Staff A' },
  ]);

  const [form, setForm] = useState<any>({
    date: '', qty: 0, location: '', warehouse: 'FG', lotNo: '', mfg: '', exp: '',
    remark: '', manualSource: 'Return', manualRef: '', manualItems: []
  });

  const stats = useMemo(() => ({
    totalReceived: historyLogs.reduce((sum, log) => sum + log.qty, 0),
    pendingJobs: jobOrders.filter(j => j.status === 'In Progress').length,
    pendingPurchases: purchaseOrders.filter(p => p.status === 'In Progress').length,
    todayIn: 250
  }), [historyLogs, jobOrders, purchaseOrders]);

  const filteredLogs = useMemo(() => {
    let res = historyLogs;
    if (activeFilter !== 'All') res = res.filter(log => log.wh === activeFilter);
    if (searchQuery && activeTab === 'all_receive') {
      const q = searchQuery.toLowerCase();
      res = res.filter(log => (log.transId + log.refNo + log.sku + log.productName).toLowerCase().includes(q));
    }
    return res;
  }, [historyLogs, activeFilter, searchQuery, activeTab]);

  const currentList = activeTab === 'pending_jo' ? jobOrders : (activeTab === 'pending_po' ? purchaseOrders : []);
  const filteredList = useMemo(() => {
    let res = currentList;
    if (statusFilter !== 'All') res = res.filter(item => item.status === statusFilter);
    if (searchQuery && (activeTab === 'pending_jo' || activeTab === 'pending_po')) {
      const q = searchQuery.toLowerCase();
      res = res.filter(item => 
        (item.joNo || item.poNo || '').toLowerCase().includes(q) || 
        (item.productName || '').toLowerCase().includes(q) ||
        (item.sku || '').toLowerCase().includes(q)
      );
    }
    return res;
  }, [currentList, statusFilter, searchQuery, activeTab]);

  const openReceiveModal = (type: 'JO' | 'PO' | 'Manual', item: any = null) => {
    setReceiveType(type);
    setSelectedItem(item);
    const now = new Date().toISOString().slice(0, 16);
    setForm({
      date: now,
      qty: item ? Math.max(0, item.qty - item.received) : 1,
      warehouse: config.warehouses[0],
      location: '',
      lotNo: `LOT-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}`,
      mfg: '', exp: '',
      remark: '',
      manualSource: 'Return',
      manualRef: '',
      manualItems: type === 'Manual' ? [{ sku: '', qty: 1, location: '', lotNo: '', mfg: '', exp: '' }] : []
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const generateGRNumber = () => {
    const today = new Date();
    const prefix = `GR${String(today.getFullYear()).slice(-2)}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const existing = historyLogs.filter(l => l.transId.startsWith(prefix));
    let maxSeq = 0;
    existing.forEach(l => {
      const parts = l.transId.split('-');
      if (parts.length > 1) {
        const seq = parseInt(parts[1]);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
    return `${prefix}-${String(maxSeq + 1).padStart(3, '0')}`;
  };

  const submitReceive = (complete = false) => {
    if (receiveType === 'Manual') {
      const batchTransId = generateGRNumber();
      const newLogs = form.manualItems.map((item: any, idx: number) => ({
        id: Date.now() + idx,
        transId: batchTransId,
        date: form.date.replace('T', ' '),
        refNo: form.manualRef || 'MANUAL',
        source: form.manualSource,
        sku: item.sku,
        productName: 'Manual Item',
        wh: form.warehouse,
        qty: Number(item.qty),
        unit: 'Unit',
        lotNo: item.lotNo,
        mfg: item.mfg || '-', exp: item.exp || '-',
        location: item.location,
        remark: form.remark,
        by: 'Admin'
      }));
      setHistoryLogs([...newLogs, ...historyLogs]);
    } else {
      if (activeTab === 'pending_jo') {
        setJobOrders(jobOrders.map(jo => {
          if (jo.id === selectedItem.id) {
            const newRec = jo.received + Number(form.qty);
            return { ...jo, received: newRec, status: (complete || newRec >= jo.qty) ? 'Completed' : jo.status };
          }
          return jo;
        }));
      } else if (activeTab === 'pending_po') {
        setPurchaseOrders(purchaseOrders.map(po => {
          if (po.id === selectedItem.id) {
            const newRec = po.received + Number(form.qty);
            return { ...po, received: newRec, status: (complete || newRec >= po.qty) ? 'Completed' : po.status };
          }
          return po;
        }));
      }

      setHistoryLogs([{
        id: Date.now(),
        transId: generateGRNumber(),
        date: form.date.replace('T', ' '),
        refNo: receiveType === 'JO' ? selectedItem.joNo : selectedItem.poNo,
        source: receiveType === 'JO' ? 'Production' : 'Purchase',
        sku: selectedItem.sku,
        productName: selectedItem.productName,
        wh: form.warehouse,
        qty: Number(form.qty),
        unit: 'Unit',
        lotNo: form.lotNo,
        mfg: form.mfg || '-', exp: form.exp || '-',
        location: form.location,
        remark: form.remark,
        by: 'Admin'
      }, ...historyLogs]);
    }
    Swal.fire({ icon: 'success', title: 'Received Successfully', timer: 1000, showConfirmButton: false });
    closeModal();
  };

  const generateReport = () => {
    const { start, end } = reportDateRange;
    if (!start || !end) {
      Swal.fire('Error', 'Please select both start and end dates.', 'error');
      return;
    }
    const filtered = historyLogs.filter(log => {
      const logDate = log.date.split(' ')[0];
      return logDate >= start && logDate <= end;
    });
    setReportData(filtered);
    Swal.fire('Success', `Found ${filtered.length} records.`, 'success');
  };

  const viewDetail = (log: any) => {
    setEditingLog({...log});
    setShowDetailModal(true);
  };

  const printLabel = (log: any) => {
    setPrintLog(log);
    setPrintFormat('A5');
    setShowPrintModal(true);
  };

  useEffect(() => {
    if (showPrintModal && printLog) {
      setTimeout(() => {
        const count = printFormat === 'A5' ? 1 : 2;
        for (let i = 0; i < count; i++) {
          const qrCanvas = document.getElementById(`qr-canvas-${i}`) as HTMLCanvasElement;
          if (qrCanvas) {
            QRCode.toCanvas(qrCanvas, JSON.stringify({
              id: printLog.transId,
              sku: printLog.sku,
              qty: printLog.qty,
              lot: printLog.lotNo
            }), { width: 90, margin: 0 });
          }
          const barcodeCanvas = document.getElementById(`barcode-canvas-${i}`);
          if (barcodeCanvas) {
            JsBarcode(barcodeCanvas, printLog.transId, {
              format: "CODE128",
              lineColor: "#000",
              width: 1.5,
              height: 30,
              displayValue: true,
              fontSize: 9,
              marginTop: 5
            });
          }
        }
      }, 100);
    }
  }, [showPrintModal, printLog, printFormat]);

  const LabelContentA5 = ({ index, log }: any) => (
    <div className="w-[210mm] h-[148mm] bg-white p-[8mm] grid grid-cols-[1.1fr_0.9fr] gap-[8mm] border border-slate-200 font-mono text-black">
      <div className="flex flex-col border-r border-dashed border-slate-300 pr-[4mm]">
        <div className="text-center border-b border-slate-300 pb-1 mb-1">
          <h4 className="font-black text-xl uppercase tracking-widest text-slate-900">THAI MUNGMEE</h4>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">Goods Receipt Identification</p>
        </div>
        <div className="flex justify-between items-start my-1">
          <canvas id={`qr-canvas-${index}`}></canvas>
          <div className="text-right">
            <div className="text-xs font-black text-slate-400 uppercase">Quantity</div>
            <h2 className="text-5xl font-black text-slate-900 leading-none">{log.qty}</h2>
            <span className="text-lg font-black text-slate-500">{log.unit}</span>
          </div>
        </div>
        <div className="text-right mb-2">
          <p className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{log.productName}</p>
        </div>
        <div className="flex-1 flex flex-col justify-end space-y-1 pb-1">
          <div className="flex items-baseline border-b border-slate-50 pb-0.5">
            <span className="w-12 text-[11px] font-black text-slate-400 uppercase">SKU:</span>
            <span className="font-black text-slate-900 text-base">{log.sku}</span>
          </div>
          <div className="flex items-baseline border-b border-slate-50 pb-0.5">
            <span className="w-12 text-[11px] font-black text-slate-400 uppercase">LOT:</span>
            <span className="font-black text-slate-900 text-lg">{log.lotNo}</span>
          </div>
          <div className="flex items-baseline border-b border-slate-50 pb-0.5">
            <span className="w-12 text-[11px] font-black text-slate-400 uppercase">LOC:</span>
            <span className="font-black text-slate-900 text-xl">{log.wh}/{log.location}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-baseline border-b border-slate-50 pb-0.5">
              <span className="w-10 text-[11px] font-black text-slate-400 uppercase">MFG:</span>
              <span className="font-black text-slate-900">{log.mfg}</span>
            </div>
            <div className="flex items-baseline border-b border-slate-50 pb-0.5">
              <span className="w-10 text-[11px] font-black text-slate-400 uppercase">EXP:</span>
              <span className="font-black text-rose-600">{log.exp}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-dashed border-slate-300 pt-1 flex flex-col items-center">
          <svg id={`barcode-canvas-${index}`} className="w-full"></svg>
          <div className="text-[9px] text-slate-400 mt-1 uppercase">Ref: {log.refNo} | By: {log.by}</div>
        </div>
      </div>
      <div className="border-2 border-slate-900 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-slate-900 text-white p-1 text-center font-black text-[11px] uppercase tracking-widest">Partial Withdrawal Log</div>
        <table className="w-full text-[10px] border-collapse flex-1">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-900">
              <th className="p-1 border-r border-slate-900">DATE</th>
              <th className="p-1 border-r border-slate-900">QTY</th>
              <th className="p-1 border-r border-slate-900">WHO</th>
              <th className="p-1">BAL.</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="p-1 border-r border-slate-900 h-6"></td>
                <td className="p-1 border-r border-slate-900"></td>
                <td className="p-1 border-r border-slate-900"></td>
                <td className="p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-1 text-[8px] text-center text-slate-400 bg-slate-50 border-t border-slate-200">
          * Please update balance manually after picking
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-midnight shadow-sm border border-slate-100 flex-shrink-0">
            <ArrowDownToLine size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              WAREHOUSE <span className="text-luxuryGold">IN</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Goods Receipt & Inbound</p>
              <button onClick={() => setShowConfigModal(true)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-midnight transition-colors">
                <Settings size={12} /> Config
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('all_receive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'all_receive' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <History size={16}/> ALL RECEIVE
          </button>
          <button onClick={() => setActiveTab('pending_jo')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'pending_jo' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <Hammer size={16}/> PENDING JO
          </button>
          <button onClick={() => setActiveTab('pending_po')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'pending_po' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <ShoppingBag size={16}/> PENDING PO
          </button>
          <button onClick={() => setActiveTab('report')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'report' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <FileBarChart size={16}/> REPORT
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {activeTab !== 'report' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
          <KPICard title="Total Received" val={stats.totalReceived} color="#809BBF" icon={Archive} desc="All Time Items" />
          <KPICard title="Pending JOs" val={stats.pendingJobs} color="#D4AF37" icon={Clock} desc="Production Order" />
          <KPICard title="Pending POs" val={stats.pendingPurchases} color="#3A3659" icon={Truck} desc="Purchase Order" />
          <KPICard title="Today In" val={stats.todayIn} color="#3F6212" icon={CalendarCheck} desc="Items Today" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {activeTab === 'report' ? (
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
                <button onClick={() => setShowReportPreviewModal(true)} disabled={reportData.length === 0} className="px-6 py-2.5 bg-white border border-slate-200 text-midnight rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 transition-all">
                  <Printer size={14} /> Print / Export PDF
                </button>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                {reportData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <FileBarChart size={64} className="mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No data to display</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trans ID</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ref No</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Qty</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Source</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {reportData.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{row.date}</td>
                          <td className="px-6 py-4 font-mono font-black text-[10px] text-midnight uppercase">{row.transId}</td>
                          <td className="px-6 py-4 font-mono text-[10px] text-luxuryGold uppercase">{row.refNo}</td>
                          <td className="px-6 py-4 text-[10px] font-bold text-midnight uppercase">{row.productName}</td>
                          <td className="px-6 py-4 text-right font-black text-midnight text-[10px]">{row.qty.toLocaleString()}</td>
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{row.source}</td>
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{row.by}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                {activeTab === 'all_receive' ? (
                  ['All', ...config.warehouses].map(wh => (
                    <button key={wh} onClick={() => setActiveFilter(wh)} 
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === wh ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                      {wh}
                    </button>
                  ))
                ) : (
                  ['All', 'In Progress', 'Completed'].map(status => (
                    <button key={status} onClick={() => setStatusFilter(status)} 
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                      {status}
                    </button>
                  ))
                )}
              </div>
              
              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-72">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search Ref / Product..." 
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
                  />
                </div>
                <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <UploadCloud size={14} /> UPLOAD
                </button>
                <button onClick={() => openReceiveModal('Manual')} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-midnight text-white hover:bg-midnight/90 shadow-lg shadow-midnight/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <Plus size={14} /> NEW RECEIVE
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              {activeTab === 'all_receive' ? (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trans ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ref. Doc</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Source</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Qty</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">WH / Loc</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-black text-midnight uppercase">{log.transId}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">{log.date}</td>
                        <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold uppercase">{log.refNo}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase border border-slate-200">{log.source}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-midnight uppercase">{log.sku}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{log.productName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-xs text-emerald-600">+{log.qty.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-midnight uppercase">{log.wh}</span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">{log.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => viewDetail(log)} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Eye size={14} /></button>
                            <button onClick={() => printLabel(log)} className="p-2 text-slate-400 hover:text-luxuryGold transition-colors"><Printer size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ref Number</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Due Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Target Qty</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Received</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Balance</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold uppercase">{item.joNo || item.poNo}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-midnight uppercase">{item.sku}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">{item.dueDate}</td>
                        <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">{item.qty.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${(item.received / item.qty) * 100}%` }}></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-400">{item.received} / {item.qty}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-xs text-vividOrange">{(item.qty - item.received).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{item.status}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => openReceiveModal(activeTab === 'pending_jo' ? 'JO' : 'PO', item)} className="px-4 py-1.5 bg-midnight text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-midnight/90 transition-all flex items-center gap-2 mx-auto">
                            <ArrowDownToLine size={12} /> Receive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Receive Modal */}
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
                className={`relative w-full ${receiveType === 'Manual' ? 'max-w-5xl' : 'max-w-2xl'} h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-luxuryGold`}
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-luxuryGold">
                      <Archive size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">
                        {receiveType === 'Manual' ? 'Manual Receive' : `Receive from ${receiveType}`}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                        {selectedItem ? <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Ref: {selectedItem.joNo || selectedItem.poNo}</span> : <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Direct Entry</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30 space-y-6">
                  {receiveType !== 'Manual' && (
                    <div className="bg-white p-6 rounded-[2rem] border border-luxuryGold/20 shadow-sm flex justify-between items-center">
                      <div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Product</div>
                        <div className="font-black text-midnight uppercase">{selectedItem?.sku}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{selectedItem?.productName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Progress</div>
                        <div className="text-2xl font-mono font-black text-luxuryGold">
                          {selectedItem?.received} <span className="text-slate-300 text-sm font-sans font-bold">/ {selectedItem?.qty}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-50 pb-6">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Date / Time</label>
                        <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                      </div>
                      {receiveType === 'Manual' && (
                        <>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Warehouse</label>
                            <select value={form.warehouse} onChange={e => setForm({...form, warehouse: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                              {config.warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Source Type</label>
                            <select value={form.manualSource} onChange={e => setForm({...form, manualSource: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                              {config.sources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {receiveType === 'Manual' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items List</h4>
                          <button onClick={() => setForm({...form, manualItems: [...form.manualItems, { sku: '', qty: 1, location: '', lotNo: '', mfg: '', exp: '' }]})} className="text-[10px] font-black text-luxuryGold uppercase tracking-widest flex items-center gap-1"><Plus size={14} /> Add Item</button>
                        </div>
                        <div className="overflow-hidden border border-slate-100 rounded-2xl">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[9px] text-slate-400 uppercase font-black tracking-widest">
                              <tr>
                                <th className="p-4">SKU</th>
                                <th className="p-4 text-right">Qty</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Lot No.</th>
                                <th className="p-4 text-center"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {form.manualItems.map((item: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-4">
                                    <input type="text" value={item.sku} onChange={e => {
                                      const newItems = [...form.manualItems];
                                      newItems[idx].sku = e.target.value;
                                      setForm({...form, manualItems: newItems});
                                    }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight font-mono uppercase" placeholder="SKU" />
                                  </td>
                                  <td className="p-4">
                                    <input type="number" value={item.qty} onChange={e => {
                                      const newItems = [...form.manualItems];
                                      newItems[idx].qty = e.target.value;
                                      setForm({...form, manualItems: newItems});
                                    }} className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight text-right font-mono" />
                                  </td>
                                  <td className="p-4">
                                    <select value={item.location} onChange={e => {
                                      const newItems = [...form.manualItems];
                                      newItems[idx].location = e.target.value;
                                      setForm({...form, manualItems: newItems});
                                    }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight">
                                      <option value="">-- Loc --</option>
                                      {config.locations.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                  </td>
                                  <td className="p-4">
                                    <input type="text" value={item.lotNo} onChange={e => {
                                      const newItems = [...form.manualItems];
                                      newItems[idx].lotNo = e.target.value;
                                      setForm({...form, manualItems: newItems});
                                    }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight font-mono uppercase" placeholder="Lot No." />
                                  </td>
                                  <td className="p-4 text-center">
                                    <button onClick={() => setForm({...form, manualItems: form.manualItems.filter((_: any, i: number) => i !== idx)})} className="text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Receive Quantity</label>
                            <input type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="w-full bg-slate-50 border border-luxuryGold rounded-xl px-4 py-3 text-xl font-black text-midnight text-right font-mono focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Warehouse / Location</label>
                            <div className="flex gap-2">
                              <select value={form.warehouse} onChange={e => setForm({...form, warehouse: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                                {config.warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                              <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                                <option value="">-- Loc --</option>
                                {config.locations.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Lot No.</label>
                            <input type="text" value={form.lotNo} onChange={e => setForm({...form, lotNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono uppercase" placeholder="Auto-Generate" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">MFG Date</label>
                              <input type="date" value={form.mfg} onChange={e => setForm({...form, mfg: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">EXP Date</label>
                              <input type="date" value={form.exp} onChange={e => setForm({...form, exp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                  <button onClick={closeModal} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  <button onClick={() => submitReceive(false)} className="px-8 py-3 bg-white border border-luxuryGold text-luxuryGold hover:bg-luxuryGold/10 text-[10px] font-black rounded-2xl shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest">
                    <Save size={16} /> {receiveType === 'Manual' ? 'Save All' : 'Save (Partial)'}
                  </button>
                  {receiveType !== 'Manual' && (
                    <button onClick={() => submitReceive(true)} className="px-12 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2 uppercase tracking-widest">
                      <CheckCircle size={16} /> Complete
                    </button>
                  )}
                </div>
              </motion.div>
            </Draggable>
          </div>
        )}
      </AnimatePresence>

      {/* Print Modal */}
      <AnimatePresence>
        {showPrintModal && printLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintModal(false)}
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
                  <button onClick={() => setPrintFormat('A5')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border ${printFormat === 'A5' ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-400 border-slate-200'}`}>A5 (Split)</button>
                  <button onClick={() => setPrintFormat('A4')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border ${printFormat === 'A4' ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-400 border-slate-200'}`}>A4 (2-Up)</button>
                </div>
                <button onClick={() => setShowPrintModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-100 flex justify-center">
                <div id="printable-area" className="bg-white shadow-lg">
                  {printFormat === 'A5' ? (
                    <LabelContentA5 index={0} log={printLog} />
                  ) : (
                    <div className="flex flex-col gap-4">
                      <LabelContentA5 index={0} log={printLog} />
                      <div className="border-b border-dashed border-slate-300 w-full"></div>
                      <LabelContentA5 index={1} log={printLog} />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 border-t bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowPrintModal(false)} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={() => window.print()} className="px-12 py-3 bg-luxuryGold text-white text-[10px] font-black rounded-2xl shadow-xl shadow-luxuryGold/20 hover:bg-luxuryGold/90 transition-all flex items-center gap-2 uppercase tracking-widest">
                  <Printer size={16} /> Print Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarehouseIn;
