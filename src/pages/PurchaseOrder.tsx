import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  CheckSquare, 
  Coins, 
  Kanban, 
  ClipboardList, 
  List, 
  Search, 
  FileClock, 
  FilePen, 
  X, 
  Check, 
  Printer, 
  Stamp, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
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

const PurchaseOrder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'pending' | 'list'>('kanban');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'generate' | 'approve' | 'edit'>('generate');
  const [selectedPR, setSelectedPR] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [poForm, setPoForm] = useState<any>({
    poNumber: '',
    vendor: '',
    vendorAddress: '',
    paymentTerm: 'Credit 30 Days',
    deliveryDate: '',
    remarks: '',
    items: []
  });

  const [pendingPRs, setPendingPRs] = useState<any[]>([
    { id: 'PR-2601-002', date: '2026-01-16', requester: 'Wipa', department: 'Warehouse', totalAmount: 9000, items: [{code: 'PT-WHL-001', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', qty: 200, price: 45}] },
    { id: 'PR-2601-005', date: '2026-01-20', requester: 'Chai', department: 'Production', totalAmount: 40000, items: [{code: 'RM-MT-002', name: 'ท่อสแตนเลส 304 (0.5 นิ้ว)', qty: 500, price: 80}] }
  ]);

  const [poList, setPoList] = useState<any[]>([
    { id: 1, poNumber: 'PO-2026-001', date: '2026-01-18', vendor: 'Thai Steel Co.', prRef: 'PR-2601-001', grandTotal: 8025, status: 'Sent', items: [{code: 'RM-MT-001', name: 'ท่อสแตนเลส', qty: 50, price: 150}], paymentTerm: 'Credit 30 Days', deliveryDate: '2026-01-25', remarks: 'Urgent delivery required' },
    { id: 2, poNumber: 'PO-2026-002', date: '2026-01-19', vendor: 'Nut & Bolt Shop', prRef: 'PR-2601-003', grandTotal: 535, status: 'Completed', items: [{code: 'PT-SCR-001', name: 'สกรู', qty: 1000, price: 0.5}], paymentTerm: 'Cash', deliveryDate: '2026-01-20', remarks: '-' },
    { id: 3, poNumber: 'PO-2026-003', date: '2026-01-22', vendor: 'Office Supply Co.', prRef: 'PR-2601-004', grandTotal: 5000, status: 'Pending Approve', items: [{code: 'OF-001', name: 'เก้าอี้', qty: 10, price: 450}], paymentTerm: 'Credit 30 Days', deliveryDate: '2026-01-30', remarks: '-' },
    { id: 4, poNumber: 'PO-2026-004', date: '2026-01-23', vendor: 'Thai Steel Co.', prRef: 'PR-2601-006', grandTotal: 12000, status: 'Approved', items: [{code: 'RM-MT-002', name: 'ท่อสแตนเลส 0.5', qty: 150, price: 80}], paymentTerm: 'Credit 60 Days', deliveryDate: '2026-02-05', remarks: 'Deliver to warehouse 2' },
    { id: 5, poNumber: 'PO-2025-010', date: '2025-12-01', vendor: 'Legacy Supplier', prRef: 'PR-2512-001', grandTotal: 50000, status: 'Completed', items: [], paymentTerm: 'Credit 30 Days', deliveryDate: '2025-12-10', remarks: 'Year end stock' } 
  ]);

  const totalSpend = useMemo(() => poList.reduce((acc, p) => acc + p.grandTotal, 0), [poList]);

  const filteredPOList = useMemo(() => {
    let list = poList;
    if(filterStatus !== 'All') list = list.filter(p => p.status === filterStatus);
    if(searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.poNumber.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q));
    }
    return list;
  }, [poList, filterStatus, searchQuery]);

  const paginatedPOList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPOList.slice(start, start + itemsPerPage);
  }, [filteredPOList, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPOList.length / itemsPerPage) || 1;

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-200'; 
      case 'Pending Approve': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Partial': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getBoardItems = (status: string) => {
    return poList.filter(p => p.status === status);
  };

  const getStatusCount = (status: string) => status === 'All' ? poList.length : poList.filter(p => p.status === status).length;

  const openGenerateModal = (pr: any) => {
    setModalType('generate');
    setSelectedPR(pr);
    setPoForm({
      poNumber: '',
      vendor: '',
      vendorAddress: '',
      paymentTerm: 'Credit 30 Days',
      deliveryDate: '',
      remarks: '',
      items: JSON.parse(JSON.stringify(pr.items))
    });
    setShowModal(true);
  };

  const openModal = (type: any, po: any) => {
    setModalType(type);
    setSelectedPR(po);
    setPoForm({
      poNumber: po.poNumber,
      vendor: po.vendor,
      vendorAddress: po.vendorAddress || '',
      paymentTerm: po.paymentTerm || 'Credit 30 Days',
      deliveryDate: po.deliveryDate || '',
      remarks: po.remarks || '',
      items: JSON.parse(JSON.stringify(po.items || []))
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const calculateSubtotal = () => poForm.items.reduce((sum: number, i: any) => sum + (i.qty * i.price), 0);
  const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString();

  const confirmGeneratePO = () => {
    if(!poForm.vendor) return Swal.fire('Error', 'Please enter Vendor Name', 'error');
    
    if(poForm.poNumber) {
      const idx = poList.findIndex(p => p.poNumber === poForm.poNumber);
      if(idx !== -1) {
        const updatedPO = {
          ...poList[idx],
          vendor: poForm.vendor,
          vendorAddress: poForm.vendorAddress,
          paymentTerm: poForm.paymentTerm,
          deliveryDate: poForm.deliveryDate,
          remarks: poForm.remarks,
          items: poForm.items,
          grandTotal: calculateSubtotal() * 1.07,
          subTotal: calculateSubtotal(),
          vat: calculateSubtotal() * 0.07,
        };
        const newList = [...poList];
        newList[idx] = updatedPO;
        setPoList(newList);
        Swal.fire({ icon: 'success', title: 'PO Updated', timer: 1500, showConfirmButton: false });
      }
    } else {
      const newPO = {
        id: Date.now(),
        poNumber: `PO-${new Date().getFullYear()}-${String(poList.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().slice(0, 10),
        vendor: poForm.vendor,
        vendorAddress: poForm.vendorAddress,
        prRef: selectedPR.id,
        paymentTerm: poForm.paymentTerm,
        deliveryDate: poForm.deliveryDate || '-',
        remarks: poForm.remarks || '-',
        items: poForm.items,
        grandTotal: calculateSubtotal() * 1.07,
        subTotal: calculateSubtotal(),
        vat: calculateSubtotal() * 0.07,
        status: 'Pending Approve' 
      };
      setPoList([newPO, ...poList]);
      setPendingPRs(pendingPRs.filter(p => p.id !== selectedPR.id));
      Swal.fire({ icon: 'success', title: 'PO Generated', text: `PO Number: ${newPO.poNumber}`, confirmButtonColor: '#0F172A' });
    }
    closeModal();
  };
  
  const confirmApprove = (po: any) => {
    Swal.fire({
      title: 'Approve PO?',
      text: `Approve ${po.poNumber} for ${formatCurrency(po.grandTotal)}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3F6212',
      confirmButtonText: 'Yes, Approve'
    }).then((r) => {
      if(r.isConfirmed) {
        setPoList(poList.map(p => p.id === po.id ? { ...p, status: 'Approved' } : p));
        closeModal();
        Swal.fire('Updated', `Status changed to Approved`, 'success');
      }
    });
  };

  const printPO = (po: any) => {
    Swal.fire('Print Preview', `Generating PDF for ${po.poNumber}...`, 'info');
  };

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-midnight shadow-sm border border-slate-100 flex-shrink-0">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              PURCHASE <span className="text-luxuryGold">ORDER</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Vendor Order Management System</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('kanban')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'kanban' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Kanban size={16}/> BOARD
          </button>
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'pending' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <ClipboardList size={16}/> PENDING PR
          </button>
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'list' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <List size={16}/> PO LIST
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="PR to Process" val={pendingPRs.length} color="#D4AF37" icon={FileClock} desc="Wait for PO" />
        <KPICard title="Open POs" val={poList.filter(p=>['Pending Approve', 'Approved', 'Sent'].includes(p.status)).length} color="#809BBF" icon={Truck} desc="In Process" />
        <KPICard title="Completed" val={poList.filter(p=>p.status==='Completed').length} color="#3F6212" icon={CheckSquare} desc="Received All" />
        <KPICard title="Total Spend" val={formatCurrency(totalSpend)} color="#3A3659" icon={Coins} desc="Current Month" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {activeTab === 'kanban' && (
          <div className="flex-1 overflow-x-auto custom-scrollbar p-6 bg-slate-50/30">
            <div className="flex gap-6 h-full min-w-max">
              {/* Column 1: Ready to PO */}
              <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 border border-slate-200/60">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h4 className="font-black text-midnight text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> รอสร้างใบสั่งซื้อ (PR Approved)</h4>
                  <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">{pendingPRs.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {pendingPRs.map(pr => (
                    <div key={pr.id} className="bg-white p-5 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group" onClick={() => openGenerateModal(pr)}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{pr.id}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{pr.date}</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs font-black text-midnight uppercase">{pr.department}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Req: {pr.requester}</div>
                      </div>
                      <div className="border-t border-slate-50 pt-3 flex justify-between items-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pr.items.length} Items</div>
                        <span className="text-xs font-black text-midnight font-mono">{formatCurrency(pr.totalAmount)}</span>
                      </div>
                      <button className="w-full mt-4 bg-midnight text-white text-[9px] py-2 rounded-xl font-black uppercase tracking-widest hover:bg-midnight/90 transition-all">Generate PO</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Pending Approve */}
              <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 border border-slate-200/60">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h4 className="font-black text-midnight text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> รออนุมัติ (Pending Approval)</h4>
                  <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">{getBoardItems('Pending Approve').length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {getBoardItems('Pending Approve').map(po => (
                    <div key={po.poNumber} className="bg-white p-5 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group" onClick={() => openModal('approve', po)}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] font-black text-midnight bg-slate-100 px-2 py-0.5 rounded uppercase">{po.poNumber}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{po.date}</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs font-black text-midnight uppercase truncate">{po.vendor}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Ref: {po.prRef}</div>
                      </div>
                      <div className="border-t border-slate-50 pt-3 flex justify-between items-center">
                        <span className="text-xs font-black text-midnight font-mono">{formatCurrency(po.grandTotal)}</span>
                        <button className="bg-blue-500 text-white text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                          <Stamp size={12} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Approved */}
              <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 border border-slate-200/60">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h4 className="font-black text-midnight text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> อนุมัติแล้ว (Approved)</h4>
                  <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">{getBoardItems('Approved').length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {getBoardItems('Approved').map(po => (
                    <div key={po.poNumber} className="bg-white p-5 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group" onClick={() => printPO(po)}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{po.poNumber}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{po.date}</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs font-black text-midnight uppercase">{po.vendor}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Ref: {po.prRef}</div>
                      </div>
                      <div className="border-t border-slate-50 pt-3 flex justify-between items-center">
                        <span className="text-xs font-black text-midnight font-mono">{formatCurrency(po.grandTotal)}</span>
                        <div className="flex items-center gap-1 text-emerald-500 text-[9px] font-black uppercase tracking-widest"><CheckCircle size={12} /> Ready to Send</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">PR No.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Department</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Requester</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Items</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Est. Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {pendingPRs.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-black text-midnight">{pr.id}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono">{pr.date}</td>
                    <td className="px-6 py-4 font-black text-midnight uppercase">{pr.department}</td>
                    <td className="px-6 py-4 font-bold text-slate-400 uppercase">{pr.requester}</td>
                    <td className="px-6 py-4 text-center font-mono font-black">{pr.items.length}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-midnight">{formatCurrency(pr.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openGenerateModal(pr)} className="px-4 py-1.5 bg-midnight text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-midnight/90 transition-all">Create PO</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'list' && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="relative flex-1 xl:w-72">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search PO Number..." 
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                {['All', 'Sent', 'Pending Approve', 'Approved', 'Completed'].map(status => (
                  <button key={status} onClick={() => setFilterStatus(status)} 
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${filterStatus === status ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                    {status}
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${filterStatus === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{getStatusCount(status)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">PO Number</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Vendor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ref PR</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {paginatedPOList.map(po => (
                    <tr key={po.poNumber} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-midnight">{po.poNumber}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{po.date}</td>
                      <td className="px-6 py-4 font-black text-midnight uppercase">{po.vendor}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono">{po.prRef}</td>
                      <td className="px-6 py-4 text-right font-mono font-black text-midnight">{formatCurrency(po.grandTotal)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusClass(po.status)}`}>{po.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => printPO(po)} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Printer size={14} /></button>
                          <button onClick={() => openModal('edit', po)} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Eye size={14} /></button>
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
                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-luxuryGold">
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
      </div>

      {/* Generate PO Modal */}
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
                className="relative w-full max-w-4xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-luxuryGold"
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-luxuryGold"><FilePen size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">
                        {poForm.poNumber ? 'Edit Purchase Order' : (modalType === 'approve' ? 'Approve Purchase Order' : 'Generate Purchase Order')}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                        {poForm.poNumber ? <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">PO: {poForm.poNumber}</span> : <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">From PR: {selectedPR?.id}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30 space-y-6">
                  {/* Vendor Info */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-4">Vendor Information</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendor Name</label>
                        <input value={poForm.vendor} onChange={e => setPoForm({...poForm, vendor: e.target.value})} readOnly={modalType==='approve'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" placeholder="Enter Vendor Name" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Term</label>
                        <select value={poForm.paymentTerm} onChange={e => setPoForm({...poForm, paymentTerm: e.target.value})} disabled={modalType==='approve'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                          <option>Credit 30 Days</option><option>Credit 60 Days</option><option>Cash</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                        <input value={poForm.vendorAddress} onChange={e => setPoForm({...poForm, vendorAddress: e.target.value})} readOnly={modalType==='approve'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" placeholder="Vendor Address" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Date</label>
                        <input type="date" value={poForm.deliveryDate} onChange={e => setPoForm({...poForm, deliveryDate: e.target.value})} readOnly={modalType==='approve'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks</label>
                        <input value={poForm.remarks} onChange={e => setPoForm({...poForm, remarks: e.target.value})} readOnly={modalType==='approve'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" placeholder="Optional notes..." />
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-4">Order Items</h4>
                    <div className="overflow-hidden border border-slate-100 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[9px] text-slate-400 uppercase font-black tracking-widest">
                          <tr>
                            <th className="p-4">Code</th>
                            <th className="p-4">Name</th>
                            <th className="p-4 text-right">Qty</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs">
                          {poForm.items.map((item: any) => (
                            <tr key={item.code} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-mono font-black text-midnight">{item.code}</td>
                              <td className="p-4 text-slate-500 font-bold uppercase">{item.name}</td>
                              <td className="p-4 text-right font-mono font-black text-midnight">{item.qty}</td>
                              <td className="p-4 text-right">
                                <input 
                                  type="number" 
                                  value={item.price} 
                                  onChange={e => {
                                    const newItems = [...poForm.items];
                                    const idx = newItems.findIndex(i => i.code === item.code);
                                    newItems[idx].price = Number(e.target.value);
                                    setPoForm({...poForm, items: newItems});
                                  }}
                                  readOnly={modalType==='approve'} 
                                  className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" 
                                />
                              </td>
                              <td className="p-4 text-right font-mono font-black text-midnight">{(item.qty * item.price).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50/50">
                          <tr>
                            <td colSpan={4} className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</td>
                            <td className="p-4 text-right font-mono font-black text-midnight">{formatCurrency(calculateSubtotal())}</td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">VAT (7%)</td>
                            <td className="p-4 text-right font-mono font-black text-midnight">{formatCurrency(calculateSubtotal() * 0.07)}</td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</td>
                            <td className="p-4 text-right font-mono font-black text-xl text-midnight">{formatCurrency(calculateSubtotal() * 1.07)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center shrink-0">
                  <button onClick={closeModal} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  
                  <div className="flex gap-3">
                    {modalType === 'approve' ? (
                      <button onClick={() => confirmApprove(selectedPR)} className="px-12 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-3 uppercase tracking-widest">
                        <Stamp size={16} /> Approve PO
                      </button>
                    ) : (
                      <button onClick={confirmGeneratePO} className="px-12 py-3 bg-midnight text-white text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-3 uppercase tracking-widest">
                        <Check size={16} /> {poForm.poNumber ? 'Update PO' : 'Generate PO'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Draggable>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseOrder;
