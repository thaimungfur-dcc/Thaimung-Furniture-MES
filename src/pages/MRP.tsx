import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  LayoutDashboard, 
  ListTree, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  FilePlus, 
  Search, 
  RefreshCw, 
  ShoppingCart, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  ArrowRight
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

const MRP: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Shortage');
  const [loading, setLoading] = useState(false);
  const [showPrModal, setShowPrModal] = useState(false);
  const [prItem, setPrItem] = useState<any>({});

  const [planData, setPlanData] = useState<any[]>([]);
  const [jobOrders, setJobOrders] = useState<any[]>([]);

  const filters = ['All', 'Shortage', 'Sufficient'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const mockJOs = [
      { id: 1, joNo: 'JO-2026-001', sku: 'LD-001', productName: 'ราวตากผ้าสแตนเลส (รุ่นพับได้)', qty: 50, status: 'In Progress' },
      { id: 2, joNo: 'JO-2026-002', sku: 'LD-002', productName: 'ราวแขวนผ้าบาร์คู่ (ล้อเลื่อน)', qty: 30, status: 'Planned' },
      { id: 3, joNo: 'JO-2026-003', sku: 'OF-001', productName: 'เก้าอี้จัดเลี้ยง (เบาะนวม)', qty: 100, status: 'Planned' }
    ];

    const mockBoms: any = {
      'LD-001': [
        { code: 'MT-SS304-01', name: 'ท่อสแตนเลส 304 (1 นิ้ว)', qty: 2.5, unit: 'M', type: 'RM' },
        { code: 'PT-WHL-01', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', qty: 4, unit: 'Pcs', type: 'Part' },
        { code: 'PT-SCR-01', name: 'สกรูเกลียวปล่อย #8', qty: 12, unit: 'Pcs', type: 'Part' }
      ],
      'LD-002': [
        { code: 'MT-SS304-01', name: 'ท่อสแตนเลส 304 (1 นิ้ว)', qty: 1.5, unit: 'M', type: 'RM' },
        { code: 'MT-SS304-02', name: 'ท่อสแตนเลส 304 (0.5 นิ้ว)', qty: 2, unit: 'M', type: 'RM' },
        { code: 'PT-WHL-01', name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', qty: 4, unit: 'Pcs', type: 'Part' }
      ],
      'OF-001': [
        { code: 'MT-SS304-01', name: 'ท่อสแตนเลส 304 (1 นิ้ว)', qty: 3, unit: 'M', type: 'RM' },
        { code: 'FB-HEAT-01', name: 'ผ้าสะท้อนความร้อน (Silver)', qty: 0.5, unit: 'Yard', type: 'RM' }
      ]
    };

    const mockInventory: any = {
      'MT-SS304-01': { onHand: 150, allocated: 0, name: 'ท่อสแตนเลส 304 (1 นิ้ว)', unit: 'M', type: 'RM' },
      'MT-SS304-02': { onHand: 200, allocated: 0, name: 'ท่อสแตนเลส 304 (0.5 นิ้ว)', unit: 'M', type: 'RM' },
      'PT-WHL-01': { onHand: 50, allocated: 10, name: 'ล้อเลื่อนยูรีเทน 2 นิ้ว', unit: 'Pcs', type: 'Part' },
      'PT-SCR-01': { onHand: 2000, allocated: 0, name: 'สกรูเกลียวปล่อย #8', unit: 'Pcs', type: 'Part' },
      'FB-HEAT-01': { onHand: 0, allocated: 0, name: 'ผ้าสะท้อนความร้อน (Silver)', unit: 'Yard', type: 'RM' }
    };

    const requirements: any = {};
    mockJOs.forEach(jo => {
      const bom = mockBoms[jo.sku];
      if (bom) {
        bom.forEach((item: any) => {
          if (!requirements[item.code]) {
            requirements[item.code] = {
              code: item.code,
              name: item.name,
              type: item.type,
              unit: item.unit,
              required: 0,
              allocated: 0,
              onHand: 0,
              balance: 0
            };
          }
          requirements[item.code].required += (item.qty * jo.qty);
        });
      }
    });

    const result = Object.values(requirements).map((req: any) => {
      const stock = mockInventory[req.code] || { onHand: 0, allocated: 0 };
      req.allocated = stock.allocated;
      req.onHand = stock.onHand;
      const available = req.onHand - req.allocated;
      req.balance = available - req.required; 
      return req;
    });

    setPlanData(result);
    setJobOrders(mockJOs.map(jo => ({ ...jo, materials: mockBoms[jo.sku] })));
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    let data = planData;
    if (activeFilter === 'Shortage') data = data.filter(i => i.balance < 0);
    if (activeFilter === 'Sufficient') data = data.filter(i => i.balance >= 0);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(i => i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    return data;
  }, [planData, activeFilter, searchQuery]);

  const stats = useMemo(() => ({
    totalItems: planData.length,
    sufficient: planData.filter(i => i.balance >= 0).length,
    shortage: planData.filter(i => i.balance < 0).length,
    pendingPR: 0
  }), [planData]);

  const handleRecalculate = () => {
    Swal.fire({
      title: 'Recalculating...',
      didOpen: () => Swal.showLoading(),
      timer: 1500
    }).then(() => fetchData());
  };

  const handleCreatePR = (item: any) => {
    setPrItem({ ...item, requestQty: Math.abs(item.balance) });
    setShowPrModal(true);
  };

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-fireopal shadow-sm border border-slate-100 flex-shrink-0">
            <Calculator size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              MATERIAL <span className="text-fireopal">PLANNING</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Material Requirement Planning (MRP)</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('summary')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'summary' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <LayoutDashboard size={16}/> SUMMARY
          </button>
          <button 
            onClick={() => setActiveTab('details')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'details' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <ListTree size={16}/> BOM BREAKDOWN
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Total Items Required" val={stats.totalItems} color="#6094A3" icon={Boxes} desc="Unique Materials" />
        <KPICard title="Stock Sufficient" val={stats.sufficient} color="#919D85" icon={CheckCircle2} desc="Ready for Production" />
        <KPICard title="Shortage Items" val={stats.shortage} color="#E3624A" icon={AlertTriangle} desc="Action Required" />
        <KPICard title="Pending PR" val={stats.pendingPR} color="#8E88A3" icon={FilePlus} desc="Wait for Purchasing" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
            {filters.map(filter => (
              <button key={filter} onClick={() => setActiveFilter(filter)} 
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                {filter}
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
                placeholder="Search Material Code / Name..." 
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-fireopal bg-white transition-colors font-medium" 
              />
            </div>
            <button onClick={handleRecalculate} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
              <RefreshCw size={14} /> RECALCULATE
            </button>
            {stats.shortage > 0 && (
              <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-fireopal text-white hover:bg-fireopal/90 shadow-lg shadow-fireopal/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap animate-pulse">
                <ShoppingCart size={14} /> CREATE BULK PR
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {activeTab === 'summary' ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Material (SKU / Name)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Required</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Allocated</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">On Hand</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Balance</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map(item => (
                  <tr key={item.code} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-fireopal font-mono">{item.code}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded border border-slate-200 uppercase">{item.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-xs text-midnight">{item.required.toLocaleString()} <span className="text-[9px] font-bold text-slate-400">{item.unit}</span></td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">{item.allocated.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-xs text-emerald-600">{item.onHand.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-black text-xs ${item.balance < 0 ? 'text-fireopal' : 'text-emerald-600'}`}>{item.balance.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${item.balance < 0 ? 'bg-fireopal/10 text-fireopal border-fireopal/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                        {item.balance < 0 ? 'Shortage' : 'Sufficient'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.balance < 0 ? (
                        <button onClick={() => handleCreatePR(item)} className="px-3 py-1 bg-fireopal text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-fireopal/90 transition-all">PR</button>
                      ) : (
                        <span className="text-slate-200">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 space-y-6">
              {jobOrders.map(jo => (
                <div key={jo.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-midnight text-white text-[10px] font-black rounded-lg uppercase tracking-widest">{jo.joNo}</span>
                      <h4 className="text-sm font-black text-midnight uppercase tracking-tight">{jo.productName} ({jo.sku})</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty to Produce: <span className="text-fireopal">{jo.qty}</span></p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="text-slate-400 uppercase tracking-widest font-black">
                          <th className="pb-3">Material</th>
                          <th className="pb-3 text-right">Per Unit</th>
                          <th className="pb-3 text-right">Total Need</th>
                          <th className="pb-3 text-center">Stock Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {jo.materials.map((mat: any) => (
                          <tr key={mat.code} className="group">
                            <td className="py-3">
                              <div className="flex flex-col">
                                <span className="font-black text-midnight uppercase">{mat.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">{mat.code}</span>
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono font-bold">{mat.qty}</td>
                            <td className="py-3 text-right font-mono font-black text-midnight">{(mat.qty * jo.qty).toLocaleString()} {mat.unit}</td>
                            <td className="py-3 text-center">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">OK</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PR Modal */}
      <AnimatePresence>
        {showPrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <Draggable handle=".modal-handle">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-fireopal"
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-fireopal/10 flex items-center justify-center rounded-2xl shadow-sm text-fireopal"><FilePlus size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">Create PR</h3>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mt-1">Purchase Request for Shortage</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPrModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
                
                <div className="p-8 space-y-6 bg-vistawhite/30">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Material</p>
                        <p className="text-sm font-black text-midnight uppercase">{prItem.name}</p>
                        <p className="text-[10px] font-mono font-bold text-fireopal">{prItem.code}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Shortage Qty</label>
                        <input disabled value={Math.abs(prItem.balance)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-fireopal" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Request Qty</label>
                        <input 
                          type="number" 
                          value={prItem.requestQty} 
                          onChange={(e) => setPrItem({ ...prItem, requestQty: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white border border-fireopal rounded-xl px-4 py-2.5 text-xs font-black text-midnight outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t bg-slate-50/50 flex justify-end gap-4 shrink-0">
                  <button onClick={() => setShowPrModal(false)} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  <button 
                    onClick={() => {
                      setShowPrModal(false);
                      Swal.fire('Success', 'Purchase Request created successfully', 'success');
                    }} 
                    className="px-10 py-3 bg-midnight text-white text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-3 uppercase tracking-widest"
                  >
                    Confirm Request
                  </button>
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

export default MRP;
