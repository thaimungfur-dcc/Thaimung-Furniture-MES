import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Palette, 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Save, 
  Settings, 
  ArrowLeft, 
  ImagePlus,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';

const FabricDesign: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false); 
  const [showHelp, setShowHelp] = useState(false); 
  
  const [patterns, setPatterns] = useState<any[]>([
    { id: 1, code: 'PTN-2026-001', name: 'Royal Flora Gold', category: 'Jacquard', composition: '100% Polyester', width: '58"', weight: '250 gsm', colors: ['#D4AF37', '#0F172A'], tags: 'Luxury, 2026', status: 'Active', image: 'https://images.unsplash.com/photo-1523413363574-8b03a320c131?auto=format&fit=crop&q=80&w=300' },
    { id: 2, code: 'PTN-2026-002', name: 'Minimalist Grid', category: 'Printed', composition: '100% Cotton', width: '44"', weight: '180 gsm', colors: ['#FFFFFF', '#000000'], tags: 'Modern, Minimal', status: 'Active', image: 'https://images.unsplash.com/photo-1598300056393-8dd33ec14450?auto=format&fit=crop&q=80&w=300' },
    { id: 3, code: 'PTN-2026-003', name: 'Deep Ocean Velvet', category: 'Solid', composition: 'Polyester Velvet', width: '60"', weight: '320 gsm', colors: ['#1e3a8a'], tags: 'Velvet, Premium', status: 'Active', image: 'https://images.unsplash.com/photo-1617142168341-9877b027ce80?auto=format&fit=crop&q=80&w=300' },
  ]);

  const [fabricCategories, setFabricCategories] = useState(['Jacquard', 'Printed', 'Solid', 'Knitted', 'Embroidered']);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<any>({
    id: null, code: '', name: '', category: 'Jacquard', 
    composition: '', width: '', weight: '', 
    colors: [], tags: '', image: null, status: 'Active'
  });

  const standardCompositions = ['100% Cotton', '100% Polyester', '65% Poly / 35% Cotton', 'Silk Blend'];

  const filteredPatterns = useMemo(() => {
    let res = patterns;
    if (categoryFilter !== 'All') res = res.filter(p => p.category === categoryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(p => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.tags.toLowerCase().includes(q));
    }
    return res;
  }, [patterns, categoryFilter, searchQuery]);

  const openModal = (pattern: any = null) => {
    setIsConfigMode(false); 
    if (pattern) {
      setIsEditing(true);
      setForm({ ...pattern });
    } else {
      setIsEditing(false);
      setForm({
        id: null, code: 'AUTO-GEN', name: '', category: fabricCategories[0] || '', 
        composition: '', width: '', weight: '', 
        colors: ['#000000'], tags: '', image: null, status: 'Active'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev: any) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const savePattern = () => {
    if (!form.name || !form.category) return Swal.fire('Error', 'Please fill required fields', 'error');
    if (isEditing) {
      setPatterns(patterns.map(p => p.id === form.id ? form : p));
    } else {
      const newId = Date.now();
      const newCode = `PTN-2026-${String(patterns.length + 1).padStart(3, '0')}`;
      setPatterns([{ ...form, id: newId, code: newCode }, ...patterns]);
    }
    closeModal();
    Swal.fire({ icon: 'success', title: 'Saved', timer: 1000, showConfirmButton: false });
  };

  const deletePattern = (id: number) => {
    Swal.fire({ title: 'Delete Pattern?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#BE123C' }).then(r => {
      if(r.isConfirmed) {
        setPatterns(patterns.filter(p => p.id !== id));
        Swal.fire('Deleted', '', 'success');
      }
    });
  };

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-luxuryGold shadow-sm border border-slate-100 flex-shrink-0">
            <Palette size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none font-mono">
              FABRIC <span className="text-luxuryGold">DESIGN</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Standard Fabric Pattern Database</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100 items-center">
          <button onClick={() => setViewMode('grid')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'grid' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <LayoutGrid size={16}/> GRID
          </button>
          <button onClick={() => setViewMode('list')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'list' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <List size={16}/> LIST
          </button>
          <div className="w-px h-6 bg-slate-300 mx-2"></div>
          <button onClick={() => setShowHelp(!showHelp)} className={`p-2.5 rounded-xl transition-all ${showHelp ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        {/* Toolbar Filter */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
            <button onClick={() => setCategoryFilter('All')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${categoryFilter === 'All' ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
              All
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${categoryFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{patterns.length}</span>
            </button>
            {fabricCategories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${categoryFilter === cat ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                {cat}
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${categoryFilter === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{patterns.filter(p => p.category === cat).length}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-72">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Design..." className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" />
            </div>
            <button onClick={() => openModal()} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-midnight text-white hover:bg-midnight/90 shadow-lg shadow-midnight/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
              <Plus size={14} /> ADD DESIGN
            </button>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredPatterns.map(p => (
                <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group relative">
                  <div className="h-56 w-full bg-slate-50 relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <ImageIcon size={64} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => openModal(p)} className="bg-white/90 p-2 rounded-xl hover:bg-white text-midnight shadow-lg backdrop-blur-md"><Pencil size={14} /></button>
                      <button onClick={() => deletePattern(p.id)} className="bg-white/90 p-2 rounded-xl hover:bg-white text-rose-500 shadow-lg backdrop-blur-md"><Trash2 size={14} /></button>
                    </div>
                    <span className="absolute bottom-4 left-4 bg-midnight/60 text-white text-[10px] px-3 py-1 rounded-lg font-black font-mono backdrop-blur-md uppercase tracking-widest">{p.code}</span>
                    <span className={`absolute top-4 left-4 text-[9px] px-3 py-1 rounded-lg font-black uppercase shadow-lg backdrop-blur-md border ${p.status === 'Active' ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200' : 'bg-slate-50/80 text-slate-500 border-slate-200'}`}>{p.status}</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-black text-midnight text-sm uppercase truncate tracking-tight">{p.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{p.category} • {p.composition}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.colors && p.colors.map((c: string, i: number) => (
                        <span key={i} className="w-4 h-4 rounded-full border border-black/5 shadow-inner" style={{ backgroundColor: c }}></span>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>W: {p.width}</span>
                      <span>{p.weight}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Preview</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Code</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Specs</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatterns.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        {p.image && <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-xs text-luxuryGold uppercase">{p.code}</td>
                    <td className="px-6 py-4 font-black text-midnight text-sm uppercase">{p.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold uppercase">{p.category}</td>
                    <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.width} / {p.weight}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => deletePattern(p.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Design Modal */}
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
            <Draggable handle=".modal-handle">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-luxuryGold"
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-luxuryGold">
                      <Palette size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">
                        {isConfigMode ? 'Manage Categories' : (isEditing ? 'Edit Design' : 'New Design')}
                      </h3>
                      {!isConfigMode && <p className="text-luxuryGold font-black uppercase tracking-widest text-[10px] mt-1">{form.code || 'AUTO-GEN'}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setIsConfigMode(!isConfigMode)} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isConfigMode ? 'bg-luxuryGold text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {isConfigMode ? <ArrowLeft size={14} /> : <Settings size={14} />} {isConfigMode ? 'Back' : 'Config'}
                    </button>
                    <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30">
                  {isConfigMode ? (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 max-w-2xl mx-auto shadow-sm space-y-6">
                      <h4 className="text-[10px] font-black text-midnight uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Fabric Categories</h4>
                      <div className="flex gap-3">
                        <input value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" placeholder="New category..." />
                        <button onClick={() => {
                          if(newCategoryInput && !fabricCategories.includes(newCategoryInput)){
                            setFabricCategories([...fabricCategories, newCategoryInput]);
                            setNewCategoryInput('');
                          }
                        }} className="bg-midnight text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">ADD</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {fabricCategories.map(cat => (
                          <div key={cat} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-midnight border border-slate-200 uppercase tracking-widest">
                            <span>{cat}</span>
                            <button onClick={() => setFabricCategories(fabricCategories.filter(c => c !== cat))} className="text-slate-400 hover:text-rose-500"><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      <div className="md:col-span-4 space-y-6">
                        <div className="aspect-square bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group hover:border-luxuryGold transition-all cursor-pointer shadow-inner" onClick={() => fileInputRef.current?.click()}>
                          {form.image ? (
                            <img src={form.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="text-center text-slate-300">
                              <ImagePlus size={48} className="mx-auto mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest block">Upload Image</span>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Color Palette</label>
                          <div className="flex flex-wrap gap-2">
                            {form.colors.map((c: string, i: number) => (
                              <div key={i} className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-200">
                                <input type="color" value={c} onChange={(e) => {
                                  const newColors = [...form.colors];
                                  newColors[i] = e.target.value;
                                  setForm({...form, colors: newColors});
                                }} className="w-6 h-6 rounded-full border-none cursor-pointer p-0 overflow-hidden" />
                                <button onClick={() => setForm({...form, colors: form.colors.filter((_: any, idx: number) => idx !== i)})} className="text-slate-400 hover:text-rose-500 pr-1"><X size={10} /></button>
                              </div>
                            ))}
                            <button onClick={() => setForm({...form, colors: [...form.colors, '#000000']})} className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-midnight hover:border-midnight transition-all"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-6">
                          <div className="col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pattern Name <span className="text-rose-500">*</span></label>
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-midnight focus:outline-none focus:border-luxuryGold uppercase" placeholder="e.g. Royal Flora Gold" />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold uppercase">
                              {fabricCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Composition</label>
                            <input list="comp-list" value={form.composition} onChange={e => setForm({...form, composition: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold uppercase" placeholder="e.g. 100% Cotton" />
                            <datalist id="comp-list">{standardCompositions.map(c => <option key={c} value={c} />)}</datalist>
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Width (Inch)</label>
                            <input value={form.width} onChange={e => setForm({...form, width: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono" placeholder='e.g. 58"' />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Weight (GSM)</label>
                            <input value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono" placeholder="e.g. 250 gsm" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tags</label>
                            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold uppercase" placeholder="Spring, Floral, 2026..." />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold uppercase">
                              <option value="Active">Active</option>
                              <option value="In Development">In Development</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                  <button onClick={closeModal} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  {!isConfigMode && (
                    <button onClick={savePattern} className="px-12 py-3 bg-midnight text-luxuryGold text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-2 uppercase tracking-widest">
                      <Save size={16} /> Save Design
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

export default FabricDesign;
