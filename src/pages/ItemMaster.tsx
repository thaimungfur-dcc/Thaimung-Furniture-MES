import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  List, 
  BarChart2, 
  Database, 
  Box, 
  Leaf, 
  PlusCircle, 
  Settings, 
  Search, 
  UploadCloud, 
  Plus, 
  Eye, 
  Pencil, 
  X as XIcon, 
  ChevronLeft, 
  ChevronRight,
  Save,
  AlertTriangle,
  Info,
  Layers,
  Tag,
  Boxes,
  Coins,
  MoreHorizontal,
  Link as LinkIcon,
  RotateCcw,
  CheckCircle,
  LifeBuoy,
  Key,
  TrendingUp
} from 'lucide-react';
import AspectModal from '../components/AspectModal';
import UploadModal from '../components/UploadModal';
import Swal from 'sweetalert2';
import { dbService } from '../services/dbService';

interface ItemMasterRecord {
  rowId: number;
  itemCode: string; // This will store the full display name or code
  itemId: string;   // The generated ID (e.g. FG-TBDN-001)
  itemName: string;
  itemType: string;
  category: string;
  catCode: string;
  subCategory: string;
  subCatCode: string;
  model: string;
  subModel: string;
  brand: string;
  baseUnit: string;
  altUnit: string;
  altConv: number;
  leadTime: number;
  moq: number;
  mpq: number;
  minStock: number;
  targetStock: number;
  safetyStock: number;
  shelfLife: number;
  lotPolicy: string;
  supplierId: string;
  stdCost: number;
  bomId: string;
  lotSize: number;
  prodRate: number;
  yieldRate: number;
  opRate: number;
  description: string;
  status: 'Active' | 'Inactive' | 'Discontinued';
  updatedAt: string;
  note?: string;
  imageLink?: string;
}

const ItemMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof ItemMasterRecord | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [items, setItems] = useState<ItemMasterRecord[]>([
    { 
      rowId: 1, itemId: 'FG-TBDN-001', itemCode: 'FG-TBDN-001 Dining Table Model A', itemName: 'Dining Table Model A', itemType: 'FG', 
      category: 'Table', catCode: 'TB', subCategory: 'Dining', subCatCode: 'DN', model: 'Model A', subModel: '', brand: 'CraftMate',
      baseUnit: 'Set', altUnit: '', altConv: 1, leadTime: 10, moq: 1, mpq: 1, minStock: 5, targetStock: 10, safetyStock: 5, shelfLife: 365, lotPolicy: 'FIFO',
      supplierId: '', stdCost: 580, bomId: 'BOM-001', lotSize: 1, prodRate: 5, yieldRate: 98, opRate: 1,
      status: 'Active', updatedAt: '2026-01-10', description: 'ราวตากผ้าสแตนเลส (รุ่นพับได้)' 
    },
  ]);

  const [groups, setGroups] = useState(['FG', 'RM', 'WIP', 'PM', 'SP', 'SC', 'RW']);
  const [namingRules, setNamingRules] = useState<Record<string, string>>({
    'FG': '[SubCat] รุ่น [Model] [SubModel] [Brand]®',
    'WI': '[SubModel] [Model] [SubCat]',
    'WO': '[SubModel] [Model] [SubCat]',
    'WB': '[SubModel] [Model] [SubCat]',
    'RM': '[SubCat] [Model] [SubModel]',
    'SC': '[SubCat] [Model] [SubModel]',
    'RW': '[SubCat] [Model] [SubModel]'
  });

  const [showSettings, setShowSettings] = useState(false);
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
      const data = await dbService.getItemMaster();
      if (data && data.length > 0) {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch item master:', error);
    }
  };
  const [activeModalSection, setActiveModalSection] = useState('basic');
  const [showGuide, setShowGuide] = useState(false);

  const [form, setForm] = useState<Partial<ItemMasterRecord>>({
    rowId: undefined,
    itemId: '',
    itemName: '',
    itemType: '',
    category: '',
    catCode: '',
    subCategory: '',
    subCatCode: '',
    model: '',
    subModel: '',
    brand: '',
    baseUnit: '',
    altUnit: '',
    altConv: 1,
    leadTime: 0,
    moq: 0,
    mpq: 0,
    minStock: 0,
    targetStock: 0,
    safetyStock: 0,
    shelfLife: 0,
    lotPolicy: '',
    supplierId: '',
    stdCost: 0,
    bomId: '',
    lotSize: 0,
    prodRate: 0,
    yieldRate: 100,
    opRate: 0,
    description: '',
    status: 'Active',
    note: '',
    imageLink: ''
  });

  const filteredItems = useMemo(() => {
    let res = [...items];
    if (activeGroup !== 'All') {
      res = res.filter(i => i.itemType === activeGroup);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(i => 
        i.itemCode.toLowerCase().includes(q) || 
        i.itemName.toLowerCase().includes(q) || 
        i.category.toLowerCase().includes(q)
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
        if (valA < (valB as any)) return sortOrder === 'asc' ? -1 : 1;
        if (valA > (valB as any)) return sortOrder === 'asc' ? 1 : -1;
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

  const fgCount = items.filter(i => i.itemType === 'FG').length;
  const rmCount = items.filter(i => i.itemType === 'RM').length;
  const newCount = items.filter(i => new Date(i.updatedAt).getMonth() === new Date().getMonth()).length;

  const generatedMastCode = ((form.catCode || '') + (form.subCatCode || '')).toUpperCase();
  
  const isDuplicate = useMemo(() => {
    if (!form.catCode || !form.subCatCode) return false;
    // For Item Master, itemCode is usually unique, but we check cat/sub codes if requested
    return false; 
  }, [form.catCode, form.subCatCode]);

  const isValid = form.itemName && form.itemType && form.category && form.catCode && form.catCode.length === 2 && form.subCategory && form.subCatCode && form.subCatCode.length === 2;

  const getTypeClass = (type: string) => {
    switch(type) {
      case 'FG': return 'bg-blue-100 text-blue-700 border-blue-200'; 
      case 'RM': return 'bg-emerald-100 text-emerald-700 border-emerald-200'; 
      case 'WIP': return 'bg-amber-100 text-amber-700 border-amber-200'; 
      case 'PM': return 'bg-slate-100 text-slate-700 border-slate-200'; 
      case 'SP': return 'bg-rose-100 text-rose-700 border-rose-200'; 
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSort = (key: keyof ItemMasterRecord) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const updateName = (currentForm: Partial<ItemMasterRecord>) => {
    const { itemType, subCategory, model, subModel, brand } = currentForm;
    if (!itemType) return currentForm.itemName || '';

    const rule = namingRules[itemType] || '[SubCat] [Model] [SubModel]';
    let name = rule
      .replace('[SubCat]', subCategory || '')
      .replace('[Model]', model ? `รุ่น ${model}` : '')
      .replace('[SubModel]', subModel || '')
      .replace('[Brand]', brand ? `${brand}` : '')
      .replace(/\s+/g, ' ')
      .trim();

    return name;
  };

  const generateItemId = (currentForm: Partial<ItemMasterRecord>) => {
    const { itemType, catCode, subCatCode } = currentForm;
    if (!itemType || !catCode || !subCatCode) return currentForm.itemId || '';

    const mastCode = (catCode + subCatCode).toUpperCase();
    const prefix = itemType === 'FG' ? `${mastCode}-` : `${itemType}-${mastCode}-`;
    
    // In a real app, this would call the server to get the next running number
    const runningNo = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return prefix + runningNo;
  };

  const handleFormFieldChange = (updates: Partial<ItemMasterRecord>) => {
    setForm(prev => {
      const next = { ...prev, ...updates };
      const newName = updateName(next);
      const newId = (updates.itemType || updates.catCode || updates.subCatCode) ? generateItemId(next) : next.itemId;
      return { 
        ...next, 
        itemName: newName, 
        itemId: newId || '',
        itemCode: `${newId} ${newName}`.trim()
      };
    });
  };

  const openModal = (item: ItemMasterRecord | null = null) => {
    if (item) {
      setForm({ ...item });
    } else {
      setForm({
        rowId: undefined,
        itemId: '',
        itemName: '',
        itemType: '',
        category: '',
        catCode: '',
        subCategory: '',
        subCatCode: '',
        model: '',
        subModel: '',
        brand: '',
        baseUnit: '',
        altUnit: '',
        altConv: 1,
        leadTime: 0,
        moq: 0,
        mpq: 0,
        minStock: 0,
        targetStock: 0,
        safetyStock: 0,
        shelfLife: 0,
        lotPolicy: '',
        supplierId: '',
        stdCost: 0,
        bomId: '',
        lotSize: 0,
        prodRate: 0,
        yieldRate: 100,
        opRate: 0,
        description: '',
        status: 'Active',
        note: '',
        imageLink: ''
      });
    }
    setActiveModalSection('basic');
    setShowModal(true);
  };

  const saveItem = async () => {
    if (!form.itemName || !form.itemType) return;
    
    const now = new Date().toISOString().split('T')[0];
    const itemData = { 
      ...(form as ItemMasterRecord), 
      updatedAt: now 
    };

    try {
      if (dbConnected) {
        await dbService.saveItem(itemData);
      }

      if (form.rowId) {
        setItems(prev => prev.map(i => i.rowId === form.rowId ? itemData : i));
      } else {
        const newId = items.length > 0 ? Math.max(...items.map(i => i.rowId)) + 1 : 1;
        const itemCode = form.itemCode || `${form.itemType}-${String(newId).padStart(4, '0')}`;
        setItems(prev => [{ ...itemData, rowId: newId, itemCode }, ...prev]);
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
      confirmButtonColor: '#BE123C', 
      confirmButtonText: 'Yes, delete it!' 
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(prev => prev.filter(i => i.rowId !== id));
        Swal.fire({ title: 'Deleted!', text: 'Item has been deleted.', icon: 'success' });
      }
    });
  };

  const handleUpload = (data: any[]) => {
    console.log('Uploaded Item Data:', data);
    Swal.fire({
      icon: 'success',
      title: 'Upload Successful',
      text: `Processed ${data.length} item records.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="bg-vistawhite w-full">
      {/* Header Section */}
      <div className="bg-vistawhite/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20 w-full">
        <div className="px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-midnight flex items-center justify-center text-white shadow-xl shadow-black/10 border border-white/20">
              <Package size={32} />
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl text-midnight tracking-tight whitespace-nowrap font-black uppercase leading-none">
                  <span className="font-light opacity-50">ITEM</span> <span className="font-semibold">MASTER</span>
                </h1>
                <p className="text-slate-500 text-xs mt-2">
                  <span className="uppercase tracking-widest font-black text-fireopal">THAI MUNGMEE MES</span> -- ทะเบียนสินค้าและวัตถุดิบ
                </p>
              </div>
              <button 
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm self-start md:self-center"
              >
                <Settings size={14} /> Naming Rules
              </button>
            </div>
          </div>
          
          {/* Main Tabs */}
          <div className="flex bg-slate-100 p-1 shadow-inner w-full md:w-fit flex-shrink-0 rounded-2xl overflow-hidden border border-slate-200">
            <button 
              onClick={() => setActiveTab('list')} 
              className={`px-8 py-3 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-widest rounded-xl ${activeTab === 'list' ? 'bg-midnight text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
            >
              <List size={16} /> ITEM LIST
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`px-8 py-3 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-widest rounded-xl ${activeTab === 'analytics' ? 'bg-midnight text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
            >
              <BarChart2 size={16} /> ANALYTICS
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-4 space-y-4 w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-fireopal/50 group relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-4 -right-4 transform rotate-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-[0.07] text-midnight">
              <Database size={100} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Items</div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-midnight">
                  <Database size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono font-extrabold text-2xl text-midnight leading-none mt-1">{items.length}</div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <TrendingUp size={12} /> +2%
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">Active SKU count</div>
              </div>
            </div>
          </div>

          {/* Finished Goods */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-fireopal/50 group relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-4 -right-4 transform rotate-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-[0.07] text-fireopal">
              <Box size={100} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Finished Goods</div>
                <div className="p-1.5 rounded-lg bg-rose-50 text-fireopal">
                  <Box size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono font-extrabold text-2xl text-midnight leading-none mt-1">{fgCount}</div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div className="h-full rounded-full bg-fireopal" style={{ width: `${(fgCount/items.length)*100}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400 font-medium truncate">Ready for sale</div>
              </div>
            </div>
          </div>

          {/* Raw Materials */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-midnight/50 group relative overflow-hidden flex flex-col">
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
                <div className="font-mono font-extrabold text-2xl text-midnight leading-none mt-1">{rmCount}</div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(rmCount/items.length)*100}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400 font-medium truncate">Production inputs</div>
              </div>
            </div>
          </div>

          {/* New Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-fireopal/50 group relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-4 -right-4 transform rotate-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-[0.07] text-fireopal">
              <PlusCircle size={100} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">New Items</div>
                <div className="p-1.5 rounded-lg bg-rose-50 text-fireopal">
                  <PlusCircle size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="font-mono font-extrabold text-2xl text-midnight leading-none mt-1">{newCount}</div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400 font-medium truncate">Added this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 flex flex-col overflow-hidden min-h-[600px]">
          {activeTab === 'list' ? (
            <>
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-white/50">
                    {groups.map(g => (
                      <button 
                        key={g} 
                        onClick={() => setActiveGroup(g)} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeGroup === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
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
                      placeholder="Search Item Code / Name..." 
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-fireopal bg-white/60 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2 uppercase tracking-wide"
                  >
                    <UploadCloud size={16} /> Upload
                  </button>
                  <button 
                    onClick={() => openModal()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-fireopal text-white hover:bg-fireopal/90 transition-all flex items-center gap-2 uppercase tracking-wide shadow-lg shadow-fireopal/20"
                  >
                    <Plus size={16} /> NEW ITEM
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th onClick={() => handleSort('itemCode')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-fireopal">Item Code</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Type</th>
                      <th onClick={() => handleSort('itemName')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-fireopal">Item Name</th>
                      <th onClick={() => handleSort('category')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-fireopal">Category</th>
                      <th onClick={() => handleSort('subCategory')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-fireopal">Sub Category</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Unit</th>
                      <th onClick={() => handleSort('stdCost')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right cursor-pointer hover:text-fireopal">Std. Cost</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedItems.map(item => (
                      <tr key={item.rowId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-3 font-mono font-bold text-xs text-fireopal">{item.itemCode}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getTypeClass(item.itemType)}`}>{item.itemType}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-midnight text-xs uppercase tracking-tight">{item.itemName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.category}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.subCategory}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-slate-100 rounded font-mono text-xs font-bold text-slate-500">{item.baseUnit}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-mono font-bold text-midnight">฿{item.stdCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-midnight transition-colors"><Eye size={14} /></button>
                            <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-fireopal transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => deleteItem(item.rowId)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><XIcon size={14} /></button>
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

      {/* Settings Modal (Naming Rules) */}
      <AspectModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Naming Rules Configuration"
        footer={
          <div className="px-6 py-3 bg-white/50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => setShowSettings(false)}
              className="px-6 py-1.5 bg-midnight text-white rounded-xl text-[10px] font-bold uppercase"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 italic">Define how item names are automatically generated for each group type.</p>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(namingRules).map(([group, rule]) => (
              <div key={group} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-midnight uppercase tracking-widest">{group} Group</span>
                </div>
                <input 
                  type="text" 
                  value={rule}
                  onChange={(e) => setNamingRules(prev => ({ ...prev, [group]: e.target.value }))}
                  className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-fireopal outline-none"
                />
                <p className="text-[10px] text-slate-400">Placeholders: [SubCat], [Model], [SubModel], [Brand]</p>
              </div>
            ))}
          </div>
        </div>
      </AspectModal>

      {/* Modal - SO Style */}
      <AspectModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={form.rowId ? 'Edit Item Record' : 'New Item Record'}
        footer={
          <div className="px-6 py-3 bg-white/50 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => openModal()}
              className="text-slate-400 hover:text-red-500 text-[10px] font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all uppercase tracking-wide"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-1.5 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-100 transition-all"
              >
                Close
              </button>
              <button 
                onClick={saveItem}
                className="px-6 py-1.5 bg-midnight text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-midnight/20 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Save size={14} /> Save Record
              </button>
            </div>
          </div>
        }
      >
        <div className="flex h-[600px] -m-8 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 flex flex-col p-4 gap-2">
            <button 
              onClick={() => setActiveModalSection('basic')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeModalSection === 'basic' ? 'bg-midnight text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <Info size={16} /> BASIC INFO
            </button>
            <button 
              onClick={() => setActiveModalSection('inventory')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeModalSection === 'inventory' ? 'bg-midnight text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <Boxes size={16} /> INVENTORY
            </button>
            <button 
              onClick={() => setActiveModalSection('production')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeModalSection === 'production' ? 'bg-midnight text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <Coins size={16} /> COST & PROD
            </button>
            <button 
              onClick={() => setActiveModalSection('others')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeModalSection === 'others' ? 'bg-midnight text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <MoreHorizontal size={16} /> OTHERS
            </button>

            <div className="mt-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <LifeBuoy size={14} className="text-honeygold" />
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Guide</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed">
                ID Structure: [Cat+Sub]-XXX for FG, [Type]-[Cat+Sub]-XXX for others.
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
            {activeModalSection === 'basic' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Basic Information</h3>
                  <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step 1 of 4</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Group Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {groups.filter(g => g !== 'All').map(g => (
                        <button 
                          key={g} 
                          onClick={() => handleFormFieldChange({ itemType: g })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${form.itemType === g ? 'bg-midnight text-white border-midnight shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-fireopal'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Auto Generated ID</label>
                    <div className="relative">
                      <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={form.itemId} 
                        readOnly 
                        className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Category Name *</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={form.category}
                        onChange={(e) => handleFormFieldChange({ category: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-rustleaf outline-none" 
                        placeholder="e.g. Table" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Category Code (2 chars) *</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={form.catCode}
                      onChange={(e) => handleFormFieldChange({ catCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-rustleaf outline-none font-mono font-bold text-center" 
                      placeholder="TB" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Sub Category *</label>
                    <input 
                      type="text" 
                      value={form.subCategory}
                      onChange={(e) => handleFormFieldChange({ subCategory: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-rustleaf outline-none" 
                      placeholder="e.g. Dining" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Sub Code (2 chars) *</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={form.subCatCode}
                      onChange={(e) => handleFormFieldChange({ subCatCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-rustleaf outline-none font-mono font-bold text-center" 
                      placeholder="DN" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Model</label>
                    <input 
                      type="text" 
                      value={form.model}
                      onChange={(e) => handleFormFieldChange({ model: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-rustleaf outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Sub Model</label>
                    <input 
                      type="text" 
                      value={form.subModel}
                      onChange={(e) => handleFormFieldChange({ subModel: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-rustleaf outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Brand</label>
                    <input 
                      type="text" 
                      value={form.brand}
                      onChange={(e) => handleFormFieldChange({ brand: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-rustleaf outline-none" 
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Item Name Preview</label>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Eye size={14} className="text-honeygold" />
                    {form.itemName || '...'}
                  </div>
                </div>
              </div>
            )}

            {activeModalSection === 'inventory' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Inventory Specifications</h3>
                  <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step 2 of 4</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Base Unit *</label>
                    <input 
                      type="text" 
                      value={form.baseUnit}
                      onChange={(e) => handleFormFieldChange({ baseUnit: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                      placeholder="e.g. Pcs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Alt Unit</label>
                    <input 
                      type="text" 
                      value={form.altUnit}
                      onChange={(e) => handleFormFieldChange({ altUnit: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Alt Conv.</label>
                    <input 
                      type="number" 
                      value={form.altConv}
                      onChange={(e) => handleFormFieldChange({ altConv: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Lead Time (Days)</label>
                    <input 
                      type="number" 
                      value={form.leadTime}
                      onChange={(e) => handleFormFieldChange({ leadTime: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">MOQ</label>
                    <input 
                      type="number" 
                      value={form.moq}
                      onChange={(e) => handleFormFieldChange({ moq: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">MPQ</label>
                    <input 
                      type="number" 
                      value={form.mpq}
                      onChange={(e) => handleFormFieldChange({ mpq: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Min Stock</label>
                    <input 
                      type="number" 
                      value={form.minStock}
                      onChange={(e) => handleFormFieldChange({ minStock: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Target Stock</label>
                    <input 
                      type="number" 
                      value={form.targetStock}
                      onChange={(e) => handleFormFieldChange({ targetStock: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Safety Stock</label>
                    <input 
                      type="number" 
                      value={form.safetyStock}
                      onChange={(e) => handleFormFieldChange({ safetyStock: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Shelf Life (Days)</label>
                    <input 
                      type="number" 
                      value={form.shelfLife}
                      onChange={(e) => handleFormFieldChange({ shelfLife: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Lot Policy</label>
                    <select 
                      value={form.lotPolicy}
                      onChange={(e) => handleFormFieldChange({ lotPolicy: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none"
                    >
                      <option value="">-- Select --</option>
                      <option value="FIFO">FIFO</option>
                      <option value="LIFO">LIFO</option>
                      <option value="FEFO">FEFO</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeModalSection === 'production' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Cost & Production</h3>
                  <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step 3 of 4</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Preferred Supplier</label>
                    <input 
                      type="text" 
                      value={form.supplierId}
                      onChange={(e) => handleFormFieldChange({ supplierId: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Std. Cost (฿)</label>
                    <input 
                      type="number" 
                      value={form.stdCost}
                      onChange={(e) => handleFormFieldChange({ stdCost: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none font-bold text-slate-900" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">BOM ID</label>
                    <input 
                      type="text" 
                      value={form.bomId}
                      onChange={(e) => handleFormFieldChange({ bomId: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Lot Size</label>
                    <input 
                      type="number" 
                      value={form.lotSize}
                      onChange={(e) => handleFormFieldChange({ lotSize: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Prod Rate</label>
                    <input 
                      type="number" 
                      value={form.prodRate}
                      onChange={(e) => handleFormFieldChange({ prodRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Yield Rate %</label>
                    <input 
                      type="number" 
                      value={form.yieldRate}
                      onChange={(e) => handleFormFieldChange({ yieldRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Op Rate</label>
                    <input 
                      type="number" 
                      value={form.opRate}
                      onChange={(e) => handleFormFieldChange({ opRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeModalSection === 'others' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Other Details</h3>
                  <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step 4 of 4</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Status</label>
                    <select 
                      value={form.status}
                      onChange={(e) => handleFormFieldChange({ status: e.target.value as any })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none font-bold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Discontinued">Discontinued</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Image Link</label>
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={form.imageLink}
                        onChange={(e) => handleFormFieldChange({ imageLink: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none" 
                        placeholder="https://..." 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Description</label>
                  <textarea 
                    rows={2}
                    value={form.description}
                    onChange={(e) => handleFormFieldChange({ description: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none resize-none" 
                    placeholder="General description..." 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Internal Note</label>
                  <textarea 
                    rows={3}
                    value={form.note}
                    onChange={(e) => handleFormFieldChange({ note: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none resize-none" 
                    placeholder="Internal notes..." 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </AspectModal>
      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        title="Upload Item Master"
        templateHeaders={['itemType', 'category', 'catCode', 'subCategory', 'subCatCode', 'model', 'subModel', 'brand', 'baseUnit', 'stdCost']}
        description="Bulk upload item records from CSV file."
      />
    </div>
  );
};

export default ItemMaster;
