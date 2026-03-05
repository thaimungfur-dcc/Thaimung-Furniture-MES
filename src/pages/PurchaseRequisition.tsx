import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Search, 
  Clock, 
  CheckCircle, 
  Plus, 
  UploadCloud, 
  Kanban, 
  List, 
  Pencil, 
  FolderCheck, 
  Stamp, 
  Printer, 
  Eye, 
  X, 
  Save, 
  Trash2, 
  History,
  User,
  ChevronLeft,
  ChevronRight,
  FilePlus
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

const PurchaseRequisition: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'log'>('kanban');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'verify' | 'approve' | 'view'>('view');
  
  const mockItems = [
    { code: 'RM-MT-001', name: 'ท่อสแตนเลส 304 (1 นิ้ว)', price: 150 },
    { code: 'RM-MT-002', name: 'ท่อสแตนเลส 304 (0.5 นิ้ว)', price: 80 },
    { code: 'PT-WHL-001', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', price: 45 },
    { code: 'PT-SCR-001', name: 'สกรูเกลียวปล่อย #8', price: 0.5 },
    { code: 'RM-WD-005', name: 'ไม้อัดยาง 15mm (เกรด A)', price: 450 }
  ];

  const [prData, setPrData] = useState<any[]>([
    { 
        id: 'PR-2601-001', date: '2026-01-15', requester: 'Somchai', department: 'Production', urgency: 'Normal', status: 'Pending Verify', 
        items: [{code: 'RM-MT-001', name: 'ท่อสแตนเลส 304 (1 นิ้ว)', qty: 50, price: 150}], totalAmount: 7500, 
        history: [{date: '2026-01-15 09:00', user: 'Somchai', action: 'Created', note: 'Initial Request for Lot A'}] 
    },
    { 
        id: 'PR-2601-002', date: '2026-01-16', requester: 'Wipa', department: 'Warehouse', urgency: 'Urgent', status: 'Approved', 
        items: [{code: 'PT-WHL-001', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', qty: 200, price: 45}], totalAmount: 9000, 
        history: [
            {date: '2026-01-16 10:00', user: 'Wipa', action: 'Created', note: 'Stock critical low'}, 
            {date: '2026-01-16 11:00', user: 'Purchaser', action: 'Verified', note: 'Vendor confirmed stock'}, 
            {date: '2026-01-16 14:00', user: 'Manager', action: 'Approved', note: 'Proceed immediately'}
        ] 
    },
    { 
        id: 'PR-2601-003', date: '2026-01-18', requester: 'Nop', department: 'Maintenance', urgency: 'Normal', status: 'Pending Approve', 
        items: [{code: 'PT-SCR-001', name: 'สกรูเกลียวปล่อย #8', qty: 1000, price: 0.5}], totalAmount: 500, 
        history: [
            {date: '2026-01-18 09:00', user: 'Nop', action: 'Created', note: 'Monthly maintenance'}, 
            {date: '2026-01-18 10:30', user: 'Purchaser', action: 'Verified', note: 'Price matched contract'}
        ] 
    },
    {
        id: 'PR-2601-004', date: '2026-01-19', requester: 'Suda', department: 'Office', urgency: 'Normal', status: 'Revise',
        items: [{code: 'RM-WD-005', name: 'ไม้อัดยาง 15mm (เกรด A)', qty: 20, price: 450}], totalAmount: 9000,
        history: [
            {date: '2026-01-19 08:30', user: 'Suda', action: 'Created', note: 'New office tables'},
            {date: '2026-01-19 09:00', user: 'Purchaser', action: 'Revise', note: 'Please check spec again, Grade A is out of stock.'}
        ]
    },
    {
        id: 'PR-2601-005', date: '2026-01-20', requester: 'Chai', department: 'Production', urgency: 'Critical', status: 'Rejected',
        items: [{code: 'RM-MT-002', name: 'ท่อสแตนเลส 304 (0.5 นิ้ว)', qty: 500, price: 80}], totalAmount: 40000,
        history: [
            {date: '2026-01-20 10:00', user: 'Chai', action: 'Created', note: 'Urgent project'},
            {date: '2026-01-20 10:15', user: 'Purchaser', action: 'Verified', note: 'High value'},
            {date: '2026-01-20 11:00', user: 'Manager', action: 'Rejected', note: 'Over budget limits for this quarter.'}
        ]
    },
    {
        id: 'PR-2601-006', date: '2026-01-21', requester: 'Somchai', department: 'Production', urgency: 'Normal', status: 'Cancelled',
        items: [{code: 'PT-WHL-001', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', qty: 50, price: 45}], totalAmount: 2250,
        history: [
            {date: '2026-01-21 09:00', user: 'Somchai', action: 'Created', note: ''},
            {date: '2026-01-21 09:30', user: 'Somchai', action: 'Cancelled', note: 'Duplicate entry'}
        ]
    }
  ]);

  const [formData, setFormData] = useState<any>({ id: '', date: '', department: '', requester: '', urgency: 'Normal', items: [], history: [] });
  const [itemInput, setItemInput] = useState({ code: '', qty: 1 });

  const stats = useMemo(() => ({
    total: prData.length,
    pendingVerify: prData.filter(p => p.status === 'Pending Verify').length,
    pendingApprove: prData.filter(p => p.status === 'Pending Approve').length,
    approved: prData.filter(p => p.status === 'Approved').length
  }), [prData]);

  const filteredData = useMemo(() => {
    let data = prData;
    if (filterStatus !== 'All') data = data.filter(p => p.status === filterStatus);
    if (searchQuery) data = data.filter(p => p.id.toLowerCase().includes(searchQuery.toLowerCase()));
    return data;
  }, [prData, filterStatus, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const getStatusCount = (s: string) => {
    if (s === 'All') return prData.length;
    return prData.filter(p => p.status === s).length;
  };

  const getStatusBadgeClass = (s: string) => {
    switch(s) {
      case 'Pending Verify': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Pending Approve': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Revise': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Cancelled': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getUrgencyClass = (u: string) => {
    switch(u) {
      case 'Critical': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Urgent': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getBoardItems = (status: string) => {
    return prData.filter(p => p.status === status);
  };

  const getLastNote = (pr: any) => {
    if (pr.history && pr.history.length > 0) return pr.history[pr.history.length - 1].note || '-';
    return '-';
  };

  const openModal = (mode: any, pr: any = null) => {
    setModalMode(mode);
    if (mode === 'create') {
      setFormData({ 
        id: `PR-${Math.floor(Math.random() * 10000)}`, 
        date: new Date().toISOString().split('T')[0], 
        department: 'Production', requester: 'Admin', urgency: 'Normal', items: [],
        history: [], status: 'Pending Verify'
      });
    } else {
      setFormData(JSON.parse(JSON.stringify(pr)));
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const addItem = () => {
    const item = mockItems.find(i => i.code === itemInput.code);
    if (item) {
      setFormData({
        ...formData,
        items: [...formData.items, { ...item, qty: itemInput.qty }]
      });
      setItemInput({ code: '', qty: 1 });
    }
  };

  const removeItem = (idx: number) => {
    const newItems = [...formData.items];
    newItems.splice(idx, 1);
    setFormData({ ...formData, items: newItems });
  };

  const savePR = () => {
    const total = formData.items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0);
    const newLog = {
      date: new Date().toLocaleString(),
      user: 'Admin',
      action: 'Created',
      note: 'New PR Request'
    };
    
    if (modalMode === 'edit') {
      setPrData(prData.map(p => p.id === formData.id ? { ...formData, totalAmount: total, status: 'Pending Verify', history: [...(formData.history || []), { ...newLog, action: 'Edited', note: 'Modified Details' }] } : p));
    } else {
      setPrData([{ ...formData, status: 'Pending Verify', totalAmount: total, history: [newLog] }, ...prData]);
    }
    
    closeModal();
    Swal.fire({ icon: 'success', title: 'Success', text: 'PR Saved Successfully', timer: 1500, showConfirmButton: false });
  };

  const updateStatus = async (status: string) => {
    let note = '';
    if (['Revise', 'Cancelled', 'Rejected'].includes(status)) {
      const { value: text } = await Swal.fire({
        input: 'textarea',
        inputLabel: 'Reason / Note (Required)',
        inputPlaceholder: `Please enter reason for ${status}...`,
        showCancelButton: true,
        confirmButtonColor: '#0F172A',
        inputValidator: (value) => {
          if (!value) return 'You need to write something!';
        }
      });
      if (!text) return;
      note = text;
    }

    setPrData(prData.map(p => {
      if (p.id === formData.id) {
        const userRole = modalMode === 'verify' ? 'Purchaser' : (modalMode === 'approve' ? 'Manager' : 'User');
        const newLog = {
          date: new Date().toLocaleString(),
          user: userRole,
          action: status,
          note: note
        };
        return { ...p, status, history: [...(p.history || []), newLog] };
      }
      return p;
    }));
    
    closeModal();
    Swal.fire({ icon: 'success', title: 'Updated', text: `Status updated to ${status}`, timer: 1500, showConfirmButton: false });
  };

  const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString();

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-luxuryGold shadow-sm border border-slate-100 flex-shrink-0">
            <ShoppingCart size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              PURCHASE <span className="text-luxuryGold">REQUISITION</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Material & Equipment Request System</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('kanban')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'kanban' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Kanban size={16}/> BOARD VIEW
          </button>
          <button 
            onClick={() => setActiveTab('log')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'log' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <List size={16}/> PR LIST
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Total PR" val={stats.total} color="#809BBF" icon={FileText} desc="All Records" />
        <KPICard title="Pending Verify" val={stats.pendingVerify} color="#D4AF37" icon={Search} desc="Purchaser Review" />
        <KPICard title="Pending Approve" val={stats.pendingApprove} color="#3A3659" icon={Clock} desc="Manager Approval" />
        <KPICard title="Approved" val={stats.approved} color="#3F6212" icon={CheckCircle} desc="Ready for PO" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {activeTab === 'log' && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                {['All', 'Pending Verify', 'Pending Approve', 'Revise', 'Approved', 'Rejected', 'Cancelled'].map(status => (
                  <button key={status} onClick={() => setFilterStatus(status)} 
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${filterStatus === status ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                    {status}
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${filterStatus === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{getStatusCount(status)}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-72">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search PR ID..." 
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
                  />
                </div>
                <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <UploadCloud size={14} /> IMPORT
                </button>
                <button onClick={() => openModal('create')} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-midnight text-white hover:bg-midnight/90 shadow-lg shadow-midnight/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <Plus size={14} /> CREATE PR
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">PR ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Dept / Requester</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Items</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Urgency</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedData.map(pr => (
                    <tr key={pr.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold">{pr.id}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">{pr.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-midnight uppercase">{pr.department}</span>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><User size={10} /> {pr.requester}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-xs text-midnight">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{pr.items.length} List</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">{formatCurrency(pr.totalAmount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getUrgencyClass(pr.urgency)}`}>{pr.urgency}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusBadgeClass(pr.status)}`}>{pr.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {pr.status === 'Pending Verify' && (
                            <>
                              <button onClick={() => openModal('edit', pr)} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Pencil size={14} /></button>
                              <button onClick={() => openModal('verify', pr)} className="p-2 text-amber-500 hover:text-amber-600 transition-colors"><FolderCheck size={14} /></button>
                            </>
                          )}
                          {pr.status === 'Pending Approve' && (
                            <button onClick={() => openModal('approve', pr)} className="p-2 text-blue-500 hover:text-blue-600 transition-colors"><Stamp size={14} /></button>
                          )}
                          {pr.status === 'Approved' && (
                            <button className="p-2 text-slate-400 hover:text-midnight transition-colors"><Printer size={14} /></button>
                          )}
                          {['Revise', 'Cancelled', 'Rejected'].includes(pr.status) && (
                            <button onClick={() => openModal('view', pr)} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Eye size={14} /></button>
                          )}
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

        {activeTab === 'kanban' && (
          <div className="flex-1 overflow-x-auto custom-scrollbar p-6 bg-slate-50/30">
            <div className="flex gap-6 h-full min-w-max">
              {/* Column 1: Pending Verify */}
              <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 border border-slate-200/60">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h4 className="font-black text-midnight text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> รอตรวจสอบ (Pending Verify)</h4>
                  <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">{getBoardItems('Pending Verify').length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {getBoardItems('Pending Verify').map(pr => (
                    <div key={pr.id} className="bg-white p-5 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group relative" onClick={() => openModal('verify', pr)}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">{pr.id}</span>
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Revise */}
              <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 border border-slate-200/60">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h4 className="font-black text-midnight text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div> ส่งคืนแก้ไข (Revise)</h4>
                  <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">{getBoardItems('Revise').length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {getBoardItems('Revise').map(pr => (
                    <div key={pr.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-orange-400 hover:shadow-md transition-all cursor-pointer group" onClick={() => openModal('edit', pr)}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">{pr.id}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{pr.date}</span>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs font-black text-midnight uppercase">{pr.department}</div>
                        <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl mt-2 italic line-clamp-2 font-medium">Note: {getLastNote(pr)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Pending Approve */}
              <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 border border-slate-200/60">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h4 className="font-black text-midnight text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> รออนุมัติ (Pending Approve)</h4>
                  <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">{getBoardItems('Pending Approve').length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {getBoardItems('Pending Approve').map(pr => (
                    <div key={pr.id} className="bg-white p-5 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group" onClick={() => openModal('approve', pr)}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{pr.id}</span>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${pr.urgency === 'Critical' ? 'bg-rose-500 animate-pulse' : (pr.urgency === 'Urgent' ? 'bg-orange-400' : 'bg-emerald-400')}`}></span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{pr.urgency}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs font-black text-midnight uppercase">{pr.department}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Req: {pr.requester}</div>
                      </div>
                      <div className="border-t border-slate-50 pt-3 flex justify-between items-center">
                        <span className="text-xs font-black text-midnight font-mono">{formatCurrency(pr.totalAmount)}</span>
                        <button className="bg-blue-500 text-white text-[9px] px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                          <Stamp size={12} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 4: Approved */}
              <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 border border-slate-200/60">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h4 className="font-black text-midnight text-[11px] uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> อนุมัติแล้ว (Approved)</h4>
                  <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200">{getBoardItems('Approved').length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                  {getBoardItems('Approved').map(pr => (
                    <div key={pr.id} className="bg-white p-5 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{pr.id}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{pr.date}</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs font-black text-midnight uppercase">{pr.department}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Req: {pr.requester}</div>
                      </div>
                      <div className="border-t border-slate-50 pt-3 flex justify-between items-center">
                        <span className="text-xs font-black text-midnight font-mono">{formatCurrency(pr.totalAmount)}</span>
                        <div className="flex items-center gap-1 text-emerald-500 text-[9px] font-black uppercase tracking-widest"><CheckCircle size={12} /> Ready for PO</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PR Editor Modal */}
      <AnimatePresence>
        {modalOpen && (
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
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-luxuryGold"><FilePlus size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">
                        {modalMode === 'create' ? 'Create New PR' : (modalMode === 'edit' ? 'Edit PR' : (modalMode === 'verify' ? 'Verify PR' : (modalMode === 'approve' ? 'Approve PR' : 'View PR')))}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">PR ID: {formData.id}</span>
                        <span className={`px-2 py-0.5 rounded border ${getStatusBadgeClass(formData.status)}`}>{formData.status}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30 space-y-6">
                  {/* General Info */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-4">General Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} readOnly={!['create', 'edit'].includes(modalMode)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</label>
                        <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} disabled={!['create', 'edit'].includes(modalMode)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                          <option>Production</option><option>Warehouse</option><option>Office</option><option>Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Requester</label>
                        <input type="text" value={formData.requester} onChange={e => setFormData({...formData, requester: e.target.value})} readOnly={!['create', 'edit'].includes(modalMode)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgency</label>
                        <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} disabled={!['create', 'edit'].includes(modalMode)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                          <option>Normal</option><option>Urgent</option><option>Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Items Table */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-4">Requested Items</h4>
                    {['create', 'edit'].includes(modalMode) && (
                      <div className="flex gap-3 mb-6 items-end">
                        <div className="flex-1">
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Item</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" value={itemInput.code} onChange={e => setItemInput({...itemInput, code: e.target.value})}>
                            <option value="">-- Choose RM / Part --</option>
                            {mockItems.map(i => <option key={i.code} value={i.code}>{i.code} - {i.name}</option>)}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Qty</label>
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight text-center focus:outline-none focus:border-luxuryGold" value={itemInput.qty} onChange={e => setItemInput({...itemInput, qty: Number(e.target.value)})} />
                        </div>
                        <button onClick={addItem} className="bg-midnight text-luxuryGold px-6 py-2.5 rounded-xl font-black text-[10px] shadow-md hover:bg-midnight/90 uppercase tracking-widest transition-all">Add Item</button>
                      </div>
                    )}
                    
                    <div className="overflow-hidden border border-slate-100 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[9px] text-slate-400 uppercase font-black tracking-widest">
                          <tr>
                            <th className="p-4">Code</th>
                            <th className="p-4">Item Name</th>
                            <th className="p-4 text-right">Qty</th>
                            <th className="p-4 text-right">Est. Price</th>
                            <th className="p-4 text-right">Total</th>
                            {['create', 'edit'].includes(modalMode) && <th className="p-4 text-center"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs">
                          {formData.items.map((i: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-mono font-black text-midnight">{i.code}</td>
                              <td className="p-4 text-slate-500 font-bold uppercase">{i.name}</td>
                              <td className="p-4 text-right font-mono font-black text-midnight">{i.qty}</td>
                              <td className="p-4 text-right font-mono text-slate-400">{i.price.toLocaleString()}</td>
                              <td className="p-4 text-right font-mono font-black text-midnight">{(i.qty * i.price).toLocaleString()}</td>
                              {['create', 'edit'].includes(modalMode) && (
                                <td className="p-4 text-center">
                                  <button onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={14} /></button>
                                </td>
                              )}
                            </tr>
                          ))}
                          {formData.items.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-12 text-slate-300 italic text-[10px] font-black uppercase tracking-widest">No items added yet.</td></tr>
                          )}
                        </tbody>
                        {formData.items.length > 0 && (
                          <tfoot className="bg-slate-50/50">
                            <tr>
                              <td colSpan={4} className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Total Amount</td>
                              <td className="p-4 text-right font-mono font-black text-lg text-midnight">{formatCurrency(formData.items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0))}</td>
                              {['create', 'edit'].includes(modalMode) && <td></td>}
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>

                  {/* History Log */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-4 flex items-center gap-2">
                      <History size={14} className="text-luxuryGold" /> History Log
                    </h4>
                    <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-4">
                      {formData.history && formData.history.length > 0 ? (
                        formData.history.map((log: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start text-xs border-b border-dashed border-slate-100 pb-4 last:border-0">
                            <div className="space-y-1">
                              <div className="font-black text-midnight flex items-center gap-2 uppercase tracking-tight">
                                <span className={`w-2 h-2 rounded-full ${log.action.includes('Approved') ? 'bg-emerald-500' : (log.action.includes('Rejected') || log.action.includes('Cancelled') ? 'bg-rose-500' : (log.action.includes('Revise') ? 'bg-orange-500' : 'bg-blue-500'))}`}></span>
                                {log.action}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">by {log.user}</div>
                              {log.note && <div className="text-[10px] text-slate-500 italic mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">"{log.note}"</div>}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono font-bold text-right">{log.date}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-300 italic text-[10px] font-black uppercase tracking-widest py-4">No history available.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center shrink-0">
                  <button onClick={closeModal} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  
                  <div className="flex gap-3">
                    {['create', 'edit'].includes(modalMode) && (
                      <>
                        {modalMode === 'edit' && <button onClick={() => updateStatus('Cancelled')} className="px-8 py-3 bg-white text-rose-500 border border-slate-200 hover:bg-rose-50 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest">Cancel PR</button>}
                        <button onClick={savePR} className="px-12 py-3 bg-midnight text-white text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-3 uppercase tracking-widest">
                          <Save size={16} /> Submit PR
                        </button>
                      </>
                    )}
                    
                    {modalMode === 'verify' && (
                      <>
                        <button onClick={() => updateStatus('Revise')} className="px-8 py-3 bg-white text-orange-600 border border-slate-200 hover:bg-orange-50 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest">Revise</button>
                        <button onClick={() => updateStatus('Cancelled')} className="px-8 py-3 bg-white text-rose-500 border border-slate-200 hover:bg-rose-50 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest">Cancel</button>
                        <button onClick={() => updateStatus('Pending Approve')} className="px-12 py-3 bg-luxuryGold text-white text-[10px] font-black rounded-2xl shadow-xl shadow-luxuryGold/20 hover:bg-luxuryGold/90 transition-all flex items-center gap-3 uppercase tracking-widest">
                          <FolderCheck size={16} /> Verify PR
                        </button>
                      </>
                    )}
                    
                    {modalMode === 'approve' && (
                      <>
                        <button onClick={() => updateStatus('Revise')} className="px-8 py-3 bg-white text-orange-600 border border-slate-200 hover:bg-orange-50 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest">Revise</button>
                        <button onClick={() => updateStatus('Rejected')} className="px-8 py-3 bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest">Reject</button>
                        <button onClick={() => updateStatus('Approved')} className="px-12 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-3 uppercase tracking-widest">
                          <Stamp size={16} /> Approve PR
                        </button>
                      </>
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

export default PurchaseRequisition;
