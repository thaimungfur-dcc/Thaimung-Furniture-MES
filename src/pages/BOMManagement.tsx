import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, 
  List, 
  Coins, 
  Box, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Search, 
  UploadCloud, 
  Plus, 
  Edit3, 
  X, 
  Save, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  CornerDownRight,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

import Draggable from 'react-draggable';

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

const BOMManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'costing'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [materialDb, setMaterialDb] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [bomItems, setBomItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<any>({ code: '', qty: 1, scrap: 0, type: '', unit: '', cost: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      
      const mockMaterials = [
        { code: 'MT-SS304-01', name: 'ท่อสแตนเลส 304 (1 นิ้ว)', type: 'RM', unit: 'M', cost: 150 },
        { code: 'MT-SS304-02', name: 'ท่อสแตนเลส 304 (0.5 นิ้ว)', type: 'RM', unit: 'M', cost: 80 },
        { code: 'PT-WHL-01', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', type: 'Part', unit: 'Pcs', cost: 45 },
        { code: 'PT-SCR-01', name: 'สกรูเกลียวปล่อย #8', type: 'Part', unit: 'Pcs', cost: 0.5 },
        { code: 'MT-WOOD-01', name: 'ไม้อัดยาง 15mm (เกรด A)', type: 'RM', unit: 'Sheet', cost: 450 },
        { code: 'FB-HEAT-01', name: 'ผ้าสะท้อนความร้อน (Silver)', type: 'RM', unit: 'Yard', cost: 120 },
        { code: 'WIP-FRAME-LD01', name: 'โครงราวตากผ้า (เชื่อมแล้ว)', type: 'WIP', unit: 'Set', cost: 450,
          subItems: [
            { code: 'MT-SS304-01', name: 'ท่อสแตนเลส 304 (1 นิ้ว)', type: 'RM', qty: 2.5, unit: 'M', cost: 150, scrap: 5 },
            { code: 'MT-SS304-02', name: 'ท่อสแตนเลส 304 (0.5 นิ้ว)', type: 'RM', qty: 4, unit: 'M', cost: 80, scrap: 5 }
          ]
        }
      ];

      const mockProducts = [
        { 
          id: 'LD-001', name: 'ราวตากผ้าสแตนเลส (รุ่นพับได้)', category: 'Laundry', subCategory: 'Steel', version: 'V.1.0', cost: 580.00, status: 'Active', 
          items: [
            { code: 'WIP-FRAME-LD01', name: 'โครงราวตากผ้า (เชื่อมแล้ว)', type: 'WIP', qty: 1, unit: 'Set', cost: 450, scrap: 0 },
            { code: 'PT-WHL-01', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', type: 'Part', qty: 4, unit: 'Pcs', cost: 45, scrap: 0 },
            { code: 'PT-SCR-01', name: 'สกรูเกลียวปล่อย #8', type: 'Part', qty: 12, unit: 'Pcs', cost: 0.5, scrap: 5 }
          ]
        },
        { id: 'LD-003', name: 'โต๊ะรีดผ้าแบบยืน (ปรับระดับ)', category: 'Laundry', subCategory: 'Ironing', version: 'V.2.0', cost: 320.00, status: 'Draft', items: [] }
      ];

      setMaterialDb(mockMaterials);
      setProducts(mockProducts);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let data = products;
    if (statusFilter !== 'All') data = data.filter(p => p.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p => (p.name + p.id).toLowerCase().includes(q));
    }
    return data;
  }, [products, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    activeBoms: products.filter(p => p.status === 'Active').length,
    reviewCount: products.filter(p => p.status === 'Review' || p.status === 'Draft').length,
    totalComponents: materialDb.length
  }), [products, materialDb]);

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Draft': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Review': return 'bg-goldenrod/10 text-goldenrod border-goldenrod/20';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const openBomModal = (product: any) => {
    if (product) {
      setSelectedProduct(JSON.parse(JSON.stringify(product)));
      setBomItems(JSON.parse(JSON.stringify(product.items || [])).map((i: any) => ({...i, level: 1, expanded: false})));
      setIsEditing(false);
    } else {
      setSelectedProduct({ id: 'NEW', name: 'New Product', category: 'General', version: 'V.1.0', status: 'Draft' });
      setBomItems([]);
      setIsEditing(true);
    }
    setShowModal(true);
  };

  const calculateTotalCost = () => {
    return bomItems.reduce((sum, item) => {
      if (item.level === 1) return sum + (item.qty * item.cost * (1 + (item.scrap || 0) / 100));
      return sum;
    }, 0);
  };

  const handleSave = () => {
    Swal.fire({
      title: 'Save BOM?',
      text: 'Are you sure you want to save these changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0B1120'
    }).then(r => {
      if (r.isConfirmed) {
        Swal.fire('Success', 'BOM structure saved successfully', 'success');
        setIsEditing(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-fireopal shadow-sm border border-slate-100 flex-shrink-0">
            <Layers size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              BOM <span className="text-fireopal">MANAGEMENT</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Bill of Materials & Product Structure</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'list' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <List size={16}/> PRODUCT LIST
          </button>
          <button 
            onClick={() => setActiveTab('costing')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'costing' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Coins size={16}/> COST ANALYSIS
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Total Products" val={stats.totalProducts} color="#6094A3" icon={Box} desc="Finished Goods" />
        <KPICard title="Active BOMs" val={stats.activeBoms} color="#919D85" icon={CheckCircle} desc="Production Ready" />
        <KPICard title="Pending Review" val={stats.reviewCount} color="#DB9E32" icon={Clock} desc="Draft / Review" />
        <KPICard title="Total Components" val={stats.totalComponents} color="#8E88A3" icon={Cpu} desc="Unique Materials" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {activeTab === 'list' && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                {['All', 'Active', 'Review', 'Draft'].map(status => (
                  <button key={status} onClick={() => setStatusFilter(status)} 
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                    {status}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search Product Code / Name..." 
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-fireopal bg-white transition-colors font-medium" 
                  />
                </div>
                <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <UploadCloud size={14} /> UPLOAD
                </button>
                <button onClick={() => openBomModal(null)} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-fireopal text-white hover:bg-fireopal/90 shadow-lg shadow-fireopal/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                  <Plus size={14} /> NEW BOM
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product (SKU / Name)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category / Sub</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Version</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Std. Cost</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-fireopal font-mono">{product.id}</span>
                          <span className="text-[10px] text-midnight font-black uppercase">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{product.category}</span>
                          <span className="text-[10px] text-midnight font-black uppercase">{product.subCategory || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-xs text-midnight">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{product.version}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">฿{product.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusClass(product.status)}`}>{product.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openBomModal(product)}
                          className="px-4 py-1.5 rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-midnight hover:text-white hover:border-midnight transition-all flex items-center gap-2 mx-auto"
                        >
                          <Edit3 size={12} /> Manage BOM
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'costing' && (
          <div className="p-8 flex flex-col items-center justify-center text-slate-300 space-y-4 h-full">
            <Coins size={64} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-widest">Costing analysis module coming soon</p>
          </div>
        )}
      </div>

      {/* BOM Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <Draggable handle=".modal-handle">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-fireopal"
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-white"><Layers size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">{selectedProduct?.name}</h3>
                      <p className="text-fireopal font-black uppercase tracking-widest text-[9px] mt-1">CODE: {selectedProduct?.id} | VERSION: {selectedProduct?.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mr-8">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Total Cost</p>
                      <p className="text-2xl font-black text-emerald-600 font-mono">฿{calculateTotalCost().toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                  </div>
                </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar p-8 bg-vistawhite/30">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">#</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Material / Component</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Unit</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Cost/Unit</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Scrap %</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Cost</th>
                        {isEditing && <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bomItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2" style={{ paddingLeft: (item.level - 1) * 1.5 + 'rem' }}>
                              {item.level > 1 && <CornerDownRight size={12} className="text-slate-300" />}
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-midnight uppercase">{item.name}</span>
                                <span className="text-[9px] font-mono font-bold text-fireopal">{item.code}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase border ${item.type === 'WIP' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{item.type}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isEditing && item.level === 1 ? (
                              <input type="number" value={item.qty} className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-black text-right" />
                            ) : (
                              <span className="text-xs font-black text-midnight font-mono">{item.qty}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">{item.unit}</td>
                          <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">{item.cost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-black text-fireopal">{item.scrap > 0 ? item.scrap + '%' : '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">
                            {(item.qty * item.cost * (1 + (item.scrap || 0)/100)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          {isEditing && (
                            <td className="px-6 py-4 text-center">
                              {item.level === 1 && <button className="p-2 text-slate-300 hover:text-fireopal transition-colors"><Trash2 size={14} /></button>}
                            </td>
                          )}
                        </tr>
                      ))}
                      {isEditing && (
                        <tr className="bg-fireopal/5">
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4">
                            <select className="w-full bg-white border border-fireopal/20 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-fireopal">
                              <option>+ Add Material / WIP...</option>
                              {materialDb.map(m => <option key={m.code}>{m.code} - {m.name}</option>)}
                            </select>
                          </td>
                          <td colSpan={6}></td>
                          <td className="px-6 py-4 text-center">
                            <button className="px-4 py-2 bg-midnight text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Add</button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center shrink-0">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${isEditing ? 'bg-fireopal text-white border-fireopal shadow-lg shadow-fireopal/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-white'}`}
                >
                  {isEditing ? <Check size={16} /> : <Edit3 size={16} />} {isEditing ? 'Lock Structure' : 'Edit Structure'}
                </button>
                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  {isEditing && (
                    <button onClick={handleSave} className="px-12 py-3 bg-midnight text-white text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-3 uppercase tracking-widest">
                      <Save size={16} /> Save BOM
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </Draggable>
        </div>
      )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[200] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-midnight animate-spin" />
        </div>
      )}
    </div>
  );
};

export default BOMManagement;
