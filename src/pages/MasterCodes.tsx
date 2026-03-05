import React, { useState, useMemo, useEffect } from 'react';
import { 
  QrCode, 
  List, 
  BarChart2, 
  Database, 
  Package, 
  Leaf, 
  PlusCircle, 
  Settings, 
  Search, 
  UploadCloud, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  CheckCircle,
  X,
  Layers,
  Tag,
  AlertOctagon,
  TrendingUp
} from 'lucide-react';
import AspectModal from '../components/AspectModal';
import UploadModal from '../components/UploadModal';
import Swal from 'sweetalert2';
import { dbService } from '../services/dbService';

interface MasterCodeItem {
  rowId: number;
  mastCode: string;
  groups: string[];
  category: string;
  catCode: string;
  subCategory: string;
  subCatCode: string;
  note: string;
  updatedAt: string;
  updatedBy: string;
}

const MasterCodes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof MasterCodeItem | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [items, setItems] = useState<MasterCodeItem[]>([
    { rowId: 1, mastCode: 'LDST', groups: ['FG'], category: 'Laundry', catCode: 'LD', subCategory: 'Steel', subCatCode: 'ST', note: 'ราวตากผ้าเหล็ก', updatedAt: '2025-10-25', updatedBy: 'admin@thaimung.com' },
    { rowId: 2, mastCode: 'LDTB', groups: ['FG'], category: 'Laundry', catCode: 'LD', subCategory: 'Table', subCatCode: 'TB', note: 'โต๊ะรีดผ้า', updatedAt: '2025-10-26', updatedBy: 'admin@thaimung.com' },
    { rowId: 3, mastCode: 'MTWD', groups: ['RM'], category: 'Material', catCode: 'MT', subCategory: 'Wood', subCatCode: 'WD', note: 'ไม้ยางพารา', updatedAt: '2025-10-27', updatedBy: 'pur@thaimung.com' },
    { rowId: 4, mastCode: 'MTPP', groups: ['RM'], category: 'Material', catCode: 'MT', subCategory: 'Pipe', subCatCode: 'PP', note: 'ท่อเหล็ก', updatedAt: '2025-10-27', updatedBy: 'pur@thaimung.com' },
    { rowId: 5, mastCode: 'PTWH', groups: ['SP'], category: 'Parts', catCode: 'PT', subCategory: 'Wheel', subCatCode: 'WH', note: 'ล้อเลื่อน', updatedAt: '2025-10-28', updatedBy: 'store@thaimung.com' },
    { rowId: 6, mastCode: 'PKBX', groups: ['PK'], category: 'Packaging', catCode: 'PK', subCategory: 'Box', subCatCode: 'BX', note: 'กล่องกระดาษลูกฟูก', updatedAt: '2025-11-01', updatedBy: 'admin@thaimung.com' },
  ]);

  const [groups, setGroups] = useState(['FG', 'RM', 'WIP', 'PK', 'SP', 'SC']);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    fetchData();
    checkDbStatus();
  }, []);

  const checkDbStatus = async () => {
    const status = await dbService.getStatus();
    setDbConnected(status.connected);
  };

  const fetchData = async () => {
    try {
      const data = await dbService.getMasterCodes();
      if (data && data.length > 0) {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch master codes:', error);
    }
  };
  const [newGroupName, setNewGroupName] = useState('');

  const [form, setForm] = useState<Partial<MasterCodeItem>>({
    rowId: undefined,
    groups: [],
    category: '',
    catCode: '',
    subCategory: '',
    subCatCode: '',
    note: ''
  });

  const filteredItems = useMemo(() => {
    let res = [...items];
    if (activeGroup !== 'All') {
      res = res.filter(i => i.groups.includes(activeGroup));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(i => 
        i.mastCode.toLowerCase().includes(q) || 
        i.category.toLowerCase().includes(q) || 
        i.subCategory.toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      res.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB as string).toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return res;
  }, [items, activeGroup, searchQuery, sortKey, sortOrder]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const fgCount = items.filter(i => i.groups.includes('FG')).length;
  const rmCount = items.filter(i => i.groups.includes('RM')).length;
  const newCount = items.filter(i => new Date(i.updatedAt).getMonth() === new Date().getMonth()).length;

  const generatedMastCode = ((form.catCode || '') + (form.subCatCode || '')).toUpperCase();
  
  const isDuplicate = useMemo(() => {
    if (!form.catCode || !form.subCatCode) return false;
    return items.some(i => i.mastCode === generatedMastCode && i.rowId !== form.rowId);
  }, [items, form.catCode, form.subCatCode, form.rowId, generatedMastCode]);

  const isValid = form.groups && form.groups.length > 0 && form.category && form.catCode && form.catCode.length === 2 && form.subCategory && form.subCatCode && form.subCatCode.length === 2;

  const getTypeClass = (type: string) => {
    switch(type) {
      case 'FG': return 'bg-blue-100 text-blue-700 border-blue-200'; 
      case 'RM': return 'bg-emerald-100 text-emerald-700 border-emerald-200'; 
      case 'WIP': return 'bg-amber-100 text-amber-700 border-amber-200'; 
      case 'PK': return 'bg-slate-100 text-slate-700 border-slate-200'; 
      case 'SP': return 'bg-rose-100 text-rose-700 border-rose-200'; 
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSort = (key: keyof MasterCodeItem) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const openModal = (item: MasterCodeItem | null = null) => {
    if (item) {
      setForm({ ...item });
    } else {
      setForm({
        rowId: undefined,
        groups: [],
        category: '',
        catCode: '',
        subCategory: '',
        subCatCode: '',
        note: ''
      });
    }
    setShowModal(true);
  };

  const saveItem = async () => {
    if (!isValid || isDuplicate) return;
    
    const now = new Date().toISOString().split('T')[0];
    const itemData = { 
      ...(form as MasterCodeItem), 
      mastCode: generatedMastCode, 
      updatedAt: now,
      updatedBy: 'Admin'
    };

    try {
      if (dbConnected) {
        await dbService.saveMasterCode(itemData);
      }

      if (form.rowId) {
        setItems(prev => prev.map(i => i.rowId === form.rowId ? itemData : i));
      } else {
        const newId = items.length > 0 ? Math.max(...items.map(i => i.rowId)) + 1 : 1;
        setItems(prev => [{ ...itemData, rowId: newId }, ...prev]);
      }
      setShowModal(false);
      Swal.fire({ icon: 'success', title: 'Saved Successfully', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', 'Failed to save to database', 'error');
    }
  };

  const deleteItem = (id: number) => {
    Swal.fire({ 
      title: 'Are you sure?', 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#B43B42', 
      confirmButtonText: 'Yes, delete it!' 
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(prev => prev.filter(i => i.rowId !== id));
        Swal.fire({ title: 'Deleted!', text: 'Code has been deleted.', icon: 'success' });
      }
    });
  };

  const handleUpload = (data: any[]) => {
    console.log('Uploaded Data:', data);
    // In a real app, you'd process this data and update state/backend
    Swal.fire({
      icon: 'success',
      title: 'Upload Successful',
      text: `Processed ${data.length} records.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="bg-vistawhite w-full">
      {/* Header Section */}
      <div className="bg-vistawhite/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20 w-full">
        <div className="px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fireopal to-midnight flex items-center justify-center text-white shadow-xl shadow-black/10 border border-white/20">
              <QrCode size={32} />
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl text-slate-900 tracking-tight whitespace-nowrap font-black uppercase leading-none">
                  <span className="font-light opacity-50">MASTER</span> <span className="font-semibold">CODE</span>
                </h1>
                <p className="text-slate-500 text-xs mt-2">
                  <span className="uppercase tracking-widest font-black text-fireopal">THAI MUNGMEE MES</span> -- ระบบจัดการรหัสสินค้าและวัตถุดิบ
                </p>
              </div>
              <button 
                onClick={() => setShowGroupModal(true)}
                className="px-4 py-2 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm self-start md:self-center"
              >
                <Settings size={14} /> Config Groups
              </button>
            </div>
          </div>
          
          {/* Main Tabs */}
          <div className="flex bg-midnight/5 p-1 shadow-inner w-full md:w-fit flex-shrink-0 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setActiveTab('list')} 
              className={`px-8 py-3 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-widest rounded-xl ${activeTab === 'list' ? 'bg-midnight text-white shadow-lg' : 'text-midnight/60 hover:bg-white/20'}`}
            >
              <List size={16} /> MASTER LIST
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`px-8 py-3 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-widest rounded-xl ${activeTab === 'analytics' ? 'bg-midnight text-white shadow-lg' : 'text-midnight/60 hover:bg-white/20'}`}
            >
              <BarChart2 size={16} /> ANALYTICS
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 space-y-6 w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D4AF37]/50 group relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-4 -right-4 transform rotate-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-[0.07] text-blue-600">
              <Database size={100} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Items</div>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Database size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono font-extrabold text-2xl text-slate-900 leading-none mt-1">{items.length}</div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#555934]">
                  <TrendingUp size={12} /> +5%
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">Since last month</div>
              </div>
            </div>
          </div>

          {/* Finished Goods */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-honeygold/50 group relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-4 -right-4 transform rotate-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-[0.07] text-honeygold">
              <Package size={100} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Finished Goods</div>
                <div className="p-1.5 rounded-lg bg-amber-50 text-honeygold">
                  <Package size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono font-extrabold text-2xl text-slate-900 leading-none mt-1">{fgCount}</div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div className="h-full rounded-full bg-honeygold" style={{ width: `${(fgCount/items.length)*100}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400 font-medium truncate">Active products in catalog</div>
              </div>
            </div>
          </div>

          {/* Raw Materials */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D4AF37]/50 group relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-4 -right-4 transform rotate-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-[0.07] text-emerald-600">
              <Leaf size={100} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Raw Materials</div>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Leaf size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono font-extrabold text-2xl text-slate-900 leading-none mt-1">{rmCount}</div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(rmCount/items.length)*100}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400 font-medium truncate">Sourced components</div>
              </div>
            </div>
          </div>

          {/* New This Month */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D4AF37]/50 group relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-4 -right-4 transform rotate-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-[0.07] text-indigo-600">
              <PlusCircle size={100} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">New This Month</div>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <PlusCircle size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono font-extrabold text-2xl text-slate-900 leading-none mt-1">{newCount}</div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400 font-medium truncate">Recently added master codes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-xl shadow-sm border border-white/60 flex flex-col overflow-hidden min-h-[600px]">
          {activeTab === 'list' ? (
            <>
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 border border-white/50">
                    {['All', ...groups].map(g => (
                      <button 
                        key={g} 
                        onClick={() => setActiveGroup(g)} 
                        className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${activeGroup === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full lg:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Code / Name..." 
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 focus:outline-none focus:border-fireopal bg-white/60 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-5 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2 uppercase tracking-wide"
                  >
                    <UploadCloud size={16} /> Upload
                  </button>
                  <button 
                    onClick={() => openModal()}
                    className="px-5 py-2.5 text-xs font-bold bg-fireopal text-white hover:bg-fireopal/90 transition-all flex items-center gap-2 uppercase tracking-wide shadow-lg shadow-fireopal/20"
                  >
                    <Plus size={16} /> NEW CODE
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th onClick={() => handleSort('mastCode')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-fireopal">Master Code</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Group</th>
                      <th onClick={() => handleSort('category')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-fireopal">Category</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Code</th>
                      <th onClick={() => handleSort('subCategory')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-fireopal">Sub Category</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Sub</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Updated</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedItems.map(item => (
                      <tr key={item.rowId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-3 font-mono font-bold text-xs text-fireopal">{item.mastCode}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {item.groups.map(g => (
                              <span key={g} className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getTypeClass(g)}`}>{g}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-700">{item.category}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-slate-100 rounded font-mono text-xs font-bold text-slate-500">{item.catCode}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-700">{item.subCategory}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-slate-100 rounded font-mono text-xs font-bold text-slate-500">{item.subCatCode}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 italic max-w-[200px] truncate">{item.note || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-[10px] font-bold text-slate-700">{item.updatedAt}</div>
                          <div className="text-[9px] text-slate-400">{item.updatedBy.split('@')[0]}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"><Eye size={14} /></button>
                            <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-fireopal transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => deleteItem(item.rowId)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Show</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-4">Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 italic">
              Analytics view coming soon...
            </div>
          )}
        </div>
      </div>

      {/* Group Management Modal */}
      <AspectModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Manage Group Types"
        footer={
          <div className="px-6 py-3 bg-white/50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => setShowGroupModal(false)}
              className="px-6 py-1.5 bg-midnight text-white rounded-xl text-[10px] font-bold uppercase"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value.toUpperCase())}
              placeholder="New Group Name (e.g. PK)"
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-fireopal outline-none"
            />
            <button 
              onClick={() => {
                if (newGroupName && !groups.includes(newGroupName)) {
                  setGroups([...groups, newGroupName]);
                  setNewGroupName('');
                }
              }}
              className="px-4 py-2 bg-fireopal text-white rounded-xl text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {groups.map(g => (
              <div key={g} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">{g}</span>
                <button 
                  onClick={() => {
                    if (groups.length > 1) {
                      setGroups(groups.filter(x => x !== g));
                    }
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </AspectModal>

      {/* Modal */}
      <AspectModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={form.rowId ? 'Edit Information' : 'New Information'}
        footer={
          <div className="px-6 py-3 bg-white/50 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => setForm({ rowId: undefined, groups: [], category: '', catCode: '', subCategory: '', subCatCode: '', note: '' })}
              className="text-slate-400 hover:text-red-500 text-[10px] font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all uppercase tracking-wide"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-1.5 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={saveItem}
                disabled={!isValid || isDuplicate}
                className={`px-6 py-1.5 bg-fireopal text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-fireopal/20 hover:shadow-xl transition-all flex items-center gap-2 ${(!isValid || isDuplicate) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <CheckCircle size={14} /> Save Data
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Groups */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Group Type *</label>
            <div className="flex flex-wrap gap-3">
              {groups.map(g => (
                <button 
                  key={g} 
                  onClick={() => {
                    const currentGroups = form.groups || [];
                    if (currentGroups.includes(g)) {
                      setForm({ ...form, groups: currentGroups.filter(x => x !== g) });
                    } else {
                      setForm({ ...form, groups: [...currentGroups, g] });
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${form.groups?.includes(g) ? 'bg-white text-slate-900 border-slate-200 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:border-fireopal'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.groups?.includes(g) ? 'border-fireopal' : 'border-slate-200'}`}>
                    {form.groups?.includes(g) && <div className="w-2 h-2 rounded-full bg-fireopal" />}
                  </div>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Category Name *</label>
              <div className="relative">
                <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Table..." 
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-fireopal shadow-sm" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-fireopal uppercase mb-2 tracking-widest">Code *</label>
              <input 
                type="text" 
                maxLength={2} 
                value={form.catCode}
                onChange={(e) => setForm({ ...form, catCode: e.target.value.toUpperCase() })}
                className="w-full text-center py-2.5 text-sm font-mono font-bold rounded-xl uppercase focus:outline-none border border-slate-200 focus:border-fireopal bg-white" 
                placeholder="XX" 
              />
            </div>
          </div>

          {/* Sub Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Sub Category *</label>
              <input 
                type="text" 
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                placeholder="e.g. Dining..." 
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-fireopal shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Sub Code *</label>
              <input 
                type="text" 
                maxLength={2} 
                value={form.subCatCode}
                onChange={(e) => setForm({ ...form, subCatCode: e.target.value.toUpperCase() })}
                className="w-full text-center py-2.5 text-sm font-mono font-bold rounded-xl uppercase focus:outline-none border border-slate-200 focus:border-fireopal bg-white" 
                placeholder="XX" 
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Note</label>
            <textarea 
              rows={3} 
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Additional details..." 
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-fireopal shadow-sm resize-none"
            />
          </div>

          {isDuplicate && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-medium animate-pulse">
              <AlertOctagon size={16} />
              <div>
                <span className="block uppercase font-bold tracking-wider text-[10px]">Duplicate Found</span>
                Code already exists: <b className="font-mono text-sm">{generatedMastCode}</b>
              </div>
            </div>
          )}

          {/* Preview Card */}
          <div className="absolute right-8 bottom-24 w-40 h-28 bg-portgore rounded-2xl shadow-2xl p-1 hidden md:block border border-white/10">
            <div className="h-full border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-honeygold opacity-10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
              <span className="text-[10px] text-honeygold uppercase tracking-[0.2em] font-bold mb-2 opacity-60">PREVIEW</span>
              <div className="text-2xl font-mono font-black text-white flex gap-1 z-10 tracking-tighter">
                <span>{form.catCode ? form.catCode.toUpperCase() : '__'}</span>
                <span className="text-honeygold">{form.subCatCode ? form.subCatCode.toUpperCase() : '__'}</span>
              </div>
              <div className="mt-2 w-8 h-1 bg-honeygold/30 rounded-full" />
            </div>
          </div>
        </div>
      </AspectModal>
      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        title="Upload Master Codes"
        templateHeaders={['groups', 'category', 'catCode', 'subCategory', 'subCatCode', 'note']}
        description="Bulk upload master codes from CSV file."
      />
    </div>
  );
};

export default MasterCodes;
