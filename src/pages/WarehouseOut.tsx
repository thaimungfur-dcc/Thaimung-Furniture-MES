import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowDownToLine, 
  LayoutList, 
  Truck, 
  PackageMinus, 
  ArrowUpRight, 
  Factory, 
  CheckCircle, 
  Search, 
  UploadCloud, 
  PlusCircle, 
  FolderCheck, 
  Pencil, 
  X, 
  Trash2, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Eye,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

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

const WarehouseOut: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'delivery' | 'mrp'>('delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeWhTab, setActiveWhTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'SO' | 'MRP' | 'MANUAL'>('SO');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const warehouses = ['All', 'FG', 'RM', 'WIP', 'REWORK', 'SCRAP'];
  const outboundTypes = ['Sales Order', 'Transfer', 'Return to Vendor', 'Production Issue', 'Sample / Free Goods', 'Hold / Quarantine', 'Rework / Reprocess', 'Disposal / Scrap', 'POSM', 'Adjustment', 'Opening'];

  const [deliveryOrders, setDeliveryOrders] = useState<any[]>([
    { id: 1, soNo: 'SO-2026-001', refId: 'DEL-01', customer: 'HomePro', sku: 'LD-001', productName: 'ราวตากผ้าสแตนเลส', qty: 50, shipped: 20, date: '2026-01-20', status: 'Partial', location: 'Rama 2' },
    { id: 2, soNo: 'SO-2026-002', refId: 'DEL-02', customer: 'Index', sku: 'OF-001', productName: 'เก้าอี้จัดเลี้ยง', qty: 100, shipped: 0, date: '2026-01-22', status: 'Ready', location: 'Bangna' },
  ]);

  const [mrpOrders, setMrpOrders] = useState<any[]>([
    { id: 1, moNo: 'MO-2026-001', date: '2026-01-20', fgSku: 'LD-001', fgName: 'ราวตากผ้า', rmSku: 'RM-ST-01', rmName: 'ท่อสแตนเลส 1 นิ้ว', qty: 200, issued: 50, status: 'Partial' },
  ]);

  const [historyLogs, setHistoryLogs] = useState<any[]>([
    { id: 101, transId: 'GO260119-001', outType: 'Sales Order', refNo: 'SO-2026-001', date: '2026-01-19 14:00', sku: 'LD-001', itemName: 'ราวตากผ้าสแตนเลส', qty: 20, location: 'A-01-05', warehouseName: 'FG', lotNo: 'LOT-2601', status: 'Confirmed', by: 'Admin' },
  ]);

  const [form, setForm] = useState<any>({
    date: '', qty: 0, location: '', warehouseName: '', lotNo: '', remark: '', refNo: '', itemName: '', outType: '', manualItems: []
  });

  const stats = useMemo(() => ({
    todayOut: 50,
    pendingDelivery: deliveryOrders.filter(o => o.status !== 'Completed').length,
    pendingMRP: mrpOrders.filter(o => o.status !== 'Completed').length,
    completed: deliveryOrders.filter(o => o.status === 'Completed').length + mrpOrders.filter(o => o.status === 'Completed').length
  }), [deliveryOrders, mrpOrders]);

  const filteredLogs = useMemo(() => {
    let res = historyLogs;
    if (activeWhTab !== 'All') res = res.filter(l => l.warehouseName === activeWhTab);
    if (searchQuery && activeTab === 'all') {
      const q = searchQuery.toLowerCase();
      res = res.filter(l => l.transId.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q));
    }
    return res;
  }, [historyLogs, activeWhTab, searchQuery, activeTab]);

  const filteredDeliveryOrders = useMemo(() => {
    let res = deliveryOrders;
    if (statusFilter !== 'All') res = res.filter(o => o.status === statusFilter);
    if (searchQuery && activeTab === 'delivery') {
      const q = searchQuery.toLowerCase();
      res = res.filter(o => o.soNo.toLowerCase().includes(q) || o.sku.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
    }
    return res;
  }, [deliveryOrders, statusFilter, searchQuery, activeTab]);

  const filteredMRPOrders = useMemo(() => {
    let res = mrpOrders;
    if (statusFilter !== 'All') res = res.filter(o => o.status === statusFilter);
    if (searchQuery && activeTab === 'mrp') {
      const q = searchQuery.toLowerCase();
      res = res.filter(o => o.moNo.toLowerCase().includes(q) || o.rmSku.toLowerCase().includes(q));
    }
    return res;
  }, [mrpOrders, statusFilter, searchQuery, activeTab]);

  const openOutboundModal = (item: any, type: 'SO' | 'MRP' | 'MANUAL') => {
    setSelectedItem(item);
    setModalType(type);
    const now = new Date().toISOString().slice(0, 16);
    setForm({
      date: now,
      qty: item ? Math.max(0, item.qty - (item.shipped || item.issued)) : 0,
      location: '',
      warehouseName: type === 'SO' ? 'FG' : (type === 'MRP' ? 'RM' : ''),
      lotNo: '',
      remark: '',
      refNo: item ? (item.soNo || item.moNo) : '',
      itemName: item ? (item.productName || item.rmName) : '',
      outType: type === 'SO' ? 'Sales Order' : (type === 'MRP' ? 'Production Issue' : 'Sample / Free Goods'),
      manualItems: type === 'MANUAL' ? [{ sku: '', itemName: '', qty: 0, warehouseName: '', location: '', lotNo: '', remark: '' }] : []
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const submitOutbound = (complete = false) => {
    const transId = `GO${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000)}`;
    if (modalType === 'MANUAL') {
      const newLogs = form.manualItems.map((item: any, idx: number) => ({
        id: Date.now() + idx,
        transId,
        date: form.date.replace('T', ' '),
        outType: form.outType,
        refNo: form.refNo,
        sku: item.sku,
        itemName: item.itemName,
        qty: Number(item.qty),
        location: item.location,
        warehouseName: item.warehouseName,
        lotNo: item.lotNo,
        status: 'Confirmed',
        by: 'Admin'
      }));
      setHistoryLogs([...newLogs, ...historyLogs]);
    } else {
      if (modalType === 'SO') {
        setDeliveryOrders(deliveryOrders.map(o => {
          if (o.id === selectedItem.id) {
            const newShipped = o.shipped + Number(form.qty);
            return { ...o, shipped: newShipped, status: (complete || newShipped >= o.qty) ? 'Completed' : 'Partial' };
          }
          return o;
        }));
      } else if (modalType === 'MRP') {
        setMrpOrders(mrpOrders.map(o => {
          if (o.id === selectedItem.id) {
            const newIssued = o.issued + Number(form.qty);
            return { ...o, issued: newIssued, status: (complete || newIssued >= o.qty) ? 'Completed' : 'Partial' };
          }
          return o;
        }));
      }

      setHistoryLogs([{
        id: Date.now(),
        transId,
        date: form.date.replace('T', ' '),
        outType: form.outType,
        refNo: form.refNo,
        sku: selectedItem?.sku || selectedItem?.rmSku,
        itemName: selectedItem?.productName || selectedItem?.rmName,
        qty: Number(form.qty),
        location: form.location,
        warehouseName: form.warehouseName,
        lotNo: form.lotNo,
        status: 'Confirmed',
        by: 'Admin'
      }, ...historyLogs]);
    }
    Swal.fire({ icon: 'success', title: 'Outbound Recorded', timer: 1000, showConfirmButton: false });
    closeModal();
  };

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-midnight shadow-sm border border-slate-100 flex-shrink-0">
            <ArrowUpRight size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              WAREHOUSE <span className="text-luxuryGold">OUT</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Shipping & Material Issuance</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('all')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'all' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <LayoutList size={16}/> ALL OUTBOUND
          </button>
          <button onClick={() => setActiveTab('delivery')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'delivery' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <Truck size={16}/> DELIVERY LIST
          </button>
          <button onClick={() => setActiveTab('mrp')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'mrp' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <PackageMinus size={16}/> MRP LIST (RM)
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Outbound Today" val={stats.todayOut} color="#809BBF" icon={ArrowUpRight} desc="Total Units Issued" />
        <KPICard title="Pending Delivery" val={stats.pendingDelivery} color="#D4AF37" icon={Truck} desc="Wait for Shipping" />
        <KPICard title="Pending Production" val={stats.pendingMRP} color="#3A3659" icon={Factory} desc="RM to Issue" />
        <KPICard title="Completed Today" val={stats.completed} color="#3F6212" icon={CheckCircle} desc="Docs Closed" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
            {activeTab === 'all' ? (
              warehouses.map(wh => (
                <button key={wh} onClick={() => setActiveWhTab(wh)} 
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeWhTab === wh ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                  {wh}
                </button>
              ))
            ) : (
              ['All', 'Ready', 'Partial', 'Completed'].map(status => (
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
                placeholder="Search ID / SO / Item..." 
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
              />
            </div>
            <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
              <UploadCloud size={14} /> UPLOAD
            </button>
            <button onClick={() => openOutboundModal(null, 'MANUAL')} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-midnight text-white hover:bg-midnight/90 shadow-lg shadow-midnight/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
              <PlusCircle size={14} /> OUTBOUND
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {activeTab === 'all' ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">TRX ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ref. Doc</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Qty</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">WH / Loc</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-black text-midnight uppercase">{log.transId}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{log.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase border border-slate-200">{log.outType}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold uppercase">{log.refNo}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-midnight uppercase">{log.sku}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{log.itemName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-xs text-rose-600">-{log.qty.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-midnight uppercase">{log.warehouseName}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{log.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${log.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{log.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-midnight transition-colors"><Eye size={14} /></button>
                        <button className="p-2 text-slate-400 hover:text-luxuryGold transition-colors"><Printer size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'delivery' ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">SO No.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Due Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Order Qty</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Shipped</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Balance</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDeliveryOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold uppercase">{order.soNo}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{order.date}</td>
                    <td className="px-6 py-4 text-xs font-black text-midnight uppercase">{order.customer}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-midnight uppercase">{order.sku}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{order.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">{order.qty.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(order.shipped / order.qty) * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400">{order.shipped} / {order.qty}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-xs text-vividOrange">{(order.qty - order.shipped).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openOutboundModal(order, 'SO')} className="px-4 py-1.5 bg-midnight text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-midnight/90 transition-all flex items-center gap-2 mx-auto">
                        <Truck size={12} /> Ship
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">MO No.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Plan Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">For Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Material to Issue</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Required</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Issued</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Balance</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMRPOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-black text-deepPurple uppercase">{order.moNo}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-midnight uppercase">{order.fgSku}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{order.fgName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-midnight uppercase">{order.rmSku}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{order.rmName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">{order.qty.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(order.issued / order.qty) * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400">{order.issued} / {order.qty}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-xs text-vividOrange">{(order.qty - order.issued).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openOutboundModal(order, 'MRP')} className="px-4 py-1.5 bg-midnight text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-midnight/90 transition-all flex items-center gap-2 mx-auto">
                        <PackageMinus size={12} /> Issue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Outbound Modal */}
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
                className={`relative w-full ${modalType === 'MANUAL' ? 'max-w-6xl' : 'max-w-2xl'} h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-luxuryGold`}
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-luxuryGold">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">
                        {modalType === 'SO' ? 'Ship Delivery' : (modalType === 'MRP' ? 'Issue to Production' : 'Manual Outbound')}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                        {selectedItem ? <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Ref: {selectedItem.soNo || selectedItem.moNo}</span> : <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Direct Entry</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30 space-y-6">
                  {modalType !== 'MANUAL' && (
                    <div className="bg-white p-6 rounded-[2rem] border border-luxuryGold/20 shadow-sm flex justify-between items-center">
                      <div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Item Detail</div>
                        <div className="font-black text-midnight uppercase">{selectedItem?.sku || selectedItem?.rmSku}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{selectedItem?.productName || selectedItem?.rmName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Progress</div>
                        <div className="text-2xl font-mono font-black text-luxuryGold">
                          {selectedItem?.shipped || selectedItem?.issued} <span className="text-slate-300 text-sm font-sans font-bold">/ {selectedItem?.qty}</span>
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
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Outbound Type</label>
                        <select value={form.outType} onChange={e => setForm({...form, outType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" disabled={modalType !== 'MANUAL'}>
                          {outboundTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      {modalType === 'MANUAL' && (
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ref Document</label>
                          <input type="text" value={form.refNo} onChange={e => setForm({...form, refNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" placeholder="e.g. Req-001" />
                        </div>
                      )}
                    </div>

                    {modalType === 'MANUAL' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items List</h4>
                          <button onClick={() => setForm({...form, manualItems: [...form.manualItems, { sku: '', itemName: '', qty: 0, warehouseName: '', location: '', lotNo: '', remark: '' }]})} className="text-[10px] font-black text-luxuryGold uppercase tracking-widest flex items-center gap-1"><PlusCircle size={14} /> Add Item</button>
                        </div>
                        <div className="overflow-hidden border border-slate-100 rounded-2xl">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[9px] text-slate-400 uppercase font-black tracking-widest">
                              <tr>
                                <th className="p-4">Product (SKU / Name)</th>
                                <th className="p-4 text-right">Qty</th>
                                <th className="p-4">Warehouse</th>
                                <th className="p-4">Location</th>
                                <th className="p-4 text-center"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {form.manualItems.map((item: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                      <input type="text" value={item.sku} onChange={e => {
                                        const newItems = [...form.manualItems];
                                        newItems[idx].sku = e.target.value;
                                        setForm({...form, manualItems: newItems});
                                      }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight font-mono uppercase" placeholder="SKU" />
                                      <input type="text" value={item.itemName} onChange={e => {
                                        const newItems = [...form.manualItems];
                                        newItems[idx].itemName = e.target.value;
                                        setForm({...form, manualItems: newItems});
                                      }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase" placeholder="Item Name" />
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <input type="number" value={item.qty} onChange={e => {
                                      const newItems = [...form.manualItems];
                                      newItems[idx].qty = e.target.value;
                                      setForm({...form, manualItems: newItems});
                                    }} className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight text-right font-mono" />
                                  </td>
                                  <td className="p-4">
                                    <select value={item.warehouseName} onChange={e => {
                                      const newItems = [...form.manualItems];
                                      newItems[idx].warehouseName = e.target.value;
                                      setForm({...form, manualItems: newItems});
                                    }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight">
                                      <option value="">-- WH --</option>
                                      {warehouses.slice(1).map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                  </td>
                                  <td className="p-4">
                                    <input type="text" value={item.location} onChange={e => {
                                      const newItems = [...form.manualItems];
                                      newItems[idx].location = e.target.value;
                                      setForm({...form, manualItems: newItems});
                                    }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black text-midnight font-mono uppercase" placeholder="Loc" />
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
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue Quantity</label>
                            <input type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="w-full bg-slate-50 border border-luxuryGold rounded-xl px-4 py-3 text-xl font-black text-midnight text-right font-mono focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Warehouse / Location</label>
                            <div className="flex gap-2">
                              <select value={form.warehouseName} onChange={e => setForm({...form, warehouseName: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                                <option value="">-- WH --</option>
                                {warehouses.slice(1).map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono uppercase" placeholder="Loc" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Lot No.</label>
                            <input type="text" value={form.lotNo} onChange={e => setForm({...form, lotNo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono uppercase" placeholder="LOT-XXX" />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Remark</label>
                            <input type="text" value={form.remark} onChange={e => setForm({...form, remark: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" placeholder="Note..." />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                  <button onClick={closeModal} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  <button onClick={() => submitOutbound(false)} className="px-8 py-3 bg-white border border-luxuryGold text-luxuryGold hover:bg-luxuryGold/10 text-[10px] font-black rounded-2xl shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest">
                    <Save size={16} /> {modalType === 'MANUAL' ? 'Save All' : 'Save (Partial)'}
                  </button>
                  {modalType !== 'MANUAL' && (
                    <button onClick={() => submitOutbound(true)} className="px-12 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2 uppercase tracking-widest">
                      <CheckCircle size={16} /> Save & Complete
                    </button>
                  )}
                </div>
              </motion.div>
            </Draggable>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarehouseOut;
