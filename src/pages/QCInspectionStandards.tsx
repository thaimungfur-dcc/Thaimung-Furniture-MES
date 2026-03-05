import React, { useState, useMemo, useRef } from 'react';
import { 
  ClipboardCheck, 
  LayoutGrid, 
  List, 
  ArrowLeft, 
  Search, 
  Copy, 
  ArrowRight, 
  ChevronRight, 
  Ruler, 
  Settings, 
  Minus, 
  Plus, 
  Maximize, 
  Flame, 
  Activity, 
  PaintBucket, 
  Package, 
  Image as ImageIcon, 
  Pencil, 
  Trash2, 
  Wrench, 
  PlusCircle, 
  X, 
  Save, 
  Upload, 
  ImagePlus,
  Shirt,
  Server,
  LayoutTemplate,
  Armchair,
  Layers,
  GlassWater,
  RockingChair,
  BedDouble
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  status: string;
  image: string;
  dimensionImage: string | null;
}

interface Standard {
  id: number;
  productId: number;
  process: string;
  point: string;
  criteria: string;
  tolerance: string;
  method: string;
  tool: string;
  image: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  type: string;
}

const QCInspectionStandards: React.FC = () => {
  // --- State ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [appState, setAppState] = useState<'categories' | 'items' | 'detail'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [activeDetailTab, setActiveDetailTab] = useState<string>('dimensions');
  
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFit, setIsFit] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [categorySteps, setCategorySteps] = useState<Record<string, string[]>>({
    'Laundry': ['Welding', 'Bending', 'Coating', 'Assembly', 'Packaging'],
    'Ironing': ['Welding', 'Bending', 'Coating', 'Cutting & Sewing', 'Upholstery', 'Assembly', 'Packaging'],
    'Furniture': ['Welding', 'Bending', 'Coating', 'Assembly', 'Packaging'],
    'General': ['Welding', 'Bending', 'Coating', 'Assembly', 'Packaging']
  });
  const [configCategory, setConfigCategory] = useState('Laundry');
  const [newProcessName, setNewProcessName] = useState('');

  const mainCategories: Category[] = [
    { id: 'clothes_rack', name: 'ราวตากผ้า', icon: Shirt, type: 'Laundry' },
    { id: 'ironing_board', name: 'โต๊ะรีดผ้า', icon: Server, type: 'Ironing' }, 
    { id: 'table', name: 'โต๊ะ', icon: LayoutTemplate, type: 'Furniture' },
    { id: 'chair', name: 'เก้าอี้', icon: Armchair, type: 'Furniture' },
    { id: 'shelf', name: 'ชั้นวาง', icon: Layers, type: 'Furniture' },
    { id: 'water_bar', name: 'ชั้นบาร์น้ำ', icon: GlassWater, type: 'Furniture' },
    { id: 'cradle', name: 'เปล', icon: RockingChair, type: 'Furniture' }, 
    { id: 'extra_bed', name: 'เตียงเสริม', icon: BedDouble, type: 'Furniture' },
  ];

  const [products, setProducts] = useState<Product[]>([
    { id: 1, code: 'CR-A01', name: 'ราว A มินิ ตะแกรง 2 ชั้น', category: 'clothes_rack', status: 'Active', image: 'https://picsum.photos/seed/rack1/400/300', dimensionImage: null },
    { 
      id: 2, 
      code: 'CR-U01', 
      name: 'ราว U ตะแกรง 2 ชั้น', 
      category: 'clothes_rack', 
      status: 'Active', 
      image: 'https://picsum.photos/seed/rack2/400/300', 
      dimensionImage: 'https://picsum.photos/seed/dim1/800/600' 
    },
    { id: 3, code: 'CR-AD01', name: 'ราว A คู่', category: 'clothes_rack', status: 'Active', image: 'https://picsum.photos/seed/rack3/400/300', dimensionImage: null },
    { 
      id: 10, 
      code: 'IB-SIT01', 
      name: 'โต๊ะรีดผ้านั่งรีดขาหนีบ', 
      category: 'ironing_board', 
      status: 'Active', 
      image: 'https://picsum.photos/seed/iron1/400/300', 
      dimensionImage: 'https://picsum.photos/seed/dim2/800/600' 
    },
    { id: 11, code: 'IB-STD03', name: 'โต๊ะรีดผ้า 3 ระดับ', category: 'ironing_board', status: 'Active', image: 'https://picsum.photos/seed/iron2/400/300', dimensionImage: null },
  ]);

  const [standards, setStandards] = useState<Standard[]>([
    { id: 201, productId: 2, process: 'Welding', point: 'ข้อต่อมุมฉากฐานล้อ', criteria: 'เชื่อมพอกเต็ม 2 ด้าน แข็งแรง', tolerance: 'ความนูน 1-2mm', method: 'Visual', tool: 'Weld Gauge', image: 'https://picsum.photos/seed/weld1/400/300' },
    { id: 202, productId: 2, process: 'Welding', point: 'หูยึดราวแขวน', criteria: 'เชื่อมติดกับเสาหลัก รอยเชื่อมเรียบ', tolerance: 'ระยะห่าง +/- 1mm', method: 'Jig Check', tool: 'Check Jig', image: null },
    { id: 101, productId: 10, process: 'Welding', point: 'จุดเชื่อมขาโต๊ะ', criteria: 'รอยเชื่อมเต็มรอบ ไม่ตามด', tolerance: 'ห้ามมีรูพรุน > 0.5mm', method: 'Visual', tool: '-', image: 'https://picsum.photos/seed/weld2/400/300' },
  ]);

  const [form, setForm] = useState<Standard>({
    id: 0, productId: 0, process: '', point: '', criteria: '', tolerance: '', method: '', tool: '', image: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dimensionFileInputRef = useRef<HTMLInputElement>(null);

  // --- Computed ---
  const currentSteps = useMemo(() => {
    if (!selectedProduct) return [];
    const catInfo = mainCategories.find(c => c.id === selectedProduct.category);
    if (catInfo) {
      return categorySteps[catInfo.type] || categorySteps['General'];
    }
    return categorySteps['General'];
  }, [selectedProduct, categorySteps]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory.id);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const filteredStandards = useMemo(() => {
    if (!selectedProduct) return [];
    return standards.filter(std => 
      std.productId === selectedProduct.id && 
      std.process === activeDetailTab
    );
  }, [standards, selectedProduct, activeDetailTab]);

  // --- Handlers ---
  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setAppState('items');
    setSearchQuery('');
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setAppState('detail');
    setActiveDetailTab('dimensions'); 
    setZoomLevel(100);
    setIsFit(true);
  };

  const goBack = () => {
    if (appState === 'detail') {
      setAppState('items');
      setSelectedProduct(null);
    } else if (appState === 'items') {
      setAppState('categories');
      setSelectedCategory(null);
      setSearchQuery('');
    }
  };

  const zoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setIsFit(false); setZoomLevel(prev => Math.min(prev + 25, 300)); };
  const zoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setIsFit(false); setZoomLevel(prev => Math.max(prev - 25, 25)); };
  const resetZoom = (e: React.MouseEvent) => { e.stopPropagation(); setIsFit(true); setZoomLevel(100); };

  const openModal = (std: Standard | null = null) => {
    const initialProcess = activeDetailTab === 'dimensions' ? currentSteps[0] : activeDetailTab;
    if (std) {
      setIsEditing(true);
      setForm({ ...std });
    } else {
      setIsEditing(false);
      setForm({
        id: Date.now(), productId: selectedProduct?.id || 0, process: initialProcess, 
        point: '', criteria: '', tolerance: '', method: 'Visual Inspection', tool: '', image: null
      });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDimensionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedProducts = products.map(p => 
          p.id === selectedProduct.id ? { ...p, dimensionImage: reader.result as string } : p
        );
        setProducts(updatedProducts);
        setSelectedProduct({ ...selectedProduct, dimensionImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveStandard = () => {
    if (!form.point || !form.criteria) return Swal.fire('Error', 'Please fill required fields', 'error');
    const newStandards = [...standards];
    if (isEditing) {
      const idx = newStandards.findIndex(s => s.id === form.id);
      if (idx !== -1) newStandards[idx] = form;
    } else {
      newStandards.push(form);
    }
    setStandards(newStandards);
    closeModal();
    Swal.fire({ icon: 'success', title: 'Saved', timer: 1000, showConfirmButton: false });
  };

  const deleteStandard = (id: number) => {
    Swal.fire({
      title: 'Delete Standard?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#E3624A'
    }).then(r => {
      if(r.isConfirmed) {
        setStandards(prev => prev.filter(s => s.id !== id));
        Swal.fire('Deleted', '', 'success');
      }
    });
  };

  const duplicateProduct = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    Swal.fire({
      title: 'Duplicate Product?',
      text: `Create a copy of "${product.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#DB9E32',
      confirmButtonText: 'Yes, Copy'
    }).then((result) => {
      if (result.isConfirmed) {
        const newId = Date.now();
        const newProduct = {
          ...product,
          id: newId,
          name: product.name + ' (Copy)',
          code: product.code + '-CP',
          status: 'In Development'
        };
        const productStandards = standards.filter(s => s.productId === product.id);
        const newStandards = productStandards.map(s => ({
          ...s,
          id: Date.now() + Math.random(),
          productId: newId
        }));
        setProducts([newProduct, ...products]);
        setStandards([...standards, ...newStandards]);
        Swal.fire('Duplicated!', 'Product and specifications have been copied.', 'success');
      }
    });
  };

  const openConfigModal = () => {
    if(selectedProduct) {
      let mapCat = 'General';
      const catInfo = mainCategories.find(c => c.id === selectedProduct.category);
      if (catInfo) mapCat = catInfo.type;
      setConfigCategory(mapCat);
    }
    setShowConfigModal(true);
  }

  const addProcess = () => {
    if(newProcessName && categorySteps[configCategory]) {
      if (!categorySteps[configCategory].includes(newProcessName)) {
        setCategorySteps(prev => ({
          ...prev,
          [configCategory]: [...prev[configCategory], newProcessName]
        }));
        setNewProcessName('');
      }
    }
  };

  const removeProcess = (proc: string) => {
    if(categorySteps[configCategory]) {
       setCategorySteps(prev => ({
        ...prev,
        [configCategory]: prev[configCategory].filter(p => p !== proc)
      }));
      if(activeDetailTab === proc && selectedProduct) {
        setActiveDetailTab('dimensions');
      }
    }
  };

  return (
    <div className="flex-grow w-full h-full flex flex-col p-8 bg-vistawhite overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-midnight text-white shadow-lg border border-white/20">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl text-midnight tracking-tight font-black uppercase">QC INSPECTION STANDARDS</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">มาตรฐานการตรวจสอบคุณภาพสินค้า (STD)</p>
          </div>
        </div>
        
        {appState === 'items' && (
          <div className="flex bg-midnight/5 p-1 border border-slate-200 shadow-inner rounded-xl overflow-hidden items-center">
            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-[10px] font-black tracking-widest transition-all flex items-center gap-2 uppercase ${viewMode === 'grid' ? 'bg-midnight text-white shadow-md rounded-lg' : 'text-midnight/60 hover:bg-white/20'}`}>
              <LayoutGrid size={14} /> GRID
            </button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-[10px] font-black tracking-widest transition-all flex items-center gap-2 uppercase ${viewMode === 'list' ? 'bg-midnight text-white shadow-md rounded-lg' : 'text-midnight/60 hover:bg-white/20'}`}>
              <List size={14} /> LIST
            </button>
          </div>
        )}
      </div>

      {/* 1. Category Selection View */}
      {appState === 'categories' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <h2 className="text-sm font-black text-midnight mb-6 border-l-4 border-fireopal pl-3 uppercase tracking-widest">Select Product Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mainCategories.map(cat => (
              <div key={cat.id} onClick={() => selectCategory(cat)} className="group bg-white rounded-3xl border border-slate-100 p-8 flex flex-col items-center justify-center h-48 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-fireopal/30">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-fireopal/10 group-hover:scale-110">
                  <cat.icon size={32} className="text-slate-400 transition-colors group-hover:text-fireopal" />
                </div>
                <h3 className="font-black text-midnight text-lg uppercase tracking-tight">{cat.name}</h3>
                <div className="mt-1 text-[10px] text-slate-400 font-mono uppercase tracking-widest">{cat.id.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 2. Items List View */}
      {appState === 'items' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-6">
            <button onClick={goBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-midnight hover:border-midnight transition shadow-sm">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-black text-midnight uppercase tracking-tight">
              {selectedCategory?.name} 
              <span className="text-xs font-bold text-slate-400 ml-3 tracking-widest">({filteredProducts.length} items)</span>
            </h2>
            <div className="ml-auto relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search product..." className="w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-fireopal bg-white shadow-sm font-mono" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
                {filteredProducts.map(product => (
                  <div key={product.id} onClick={() => selectProduct(product)} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-fireopal/30">
                    <div className="h-48 bg-slate-50 relative overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute top-3 left-3 bg-midnight/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-mono font-bold tracking-widest">{product.code}</div>
                      
                      <button onClick={(e) => duplicateProduct(e, product)} className="absolute top-3 right-3 bg-white/90 p-2 rounded-xl text-midnight opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-fireopal hover:text-white" title="Duplicate Spec">
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-black text-midnight text-sm truncate uppercase tracking-tight">{product.name}</h3>
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${product.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{product.status}</span>
                        <button className="text-fireopal hover:text-midnight transition text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">QC Detail <ArrowRight size={12}/></button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-20 text-slate-400 italic font-bold">No products found in this category.</div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Image</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Code</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => selectProduct(product)}>
                        <td className="px-6 py-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                            <img src={product.image} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono font-black text-fireopal text-xs">{product.code}</td>
                        <td className="px-6 py-3 font-black text-midnight text-xs uppercase tracking-tight">{product.name}</td>
                        <td className="px-6 py-3">
                          <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${product.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{product.status}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={(e) => duplicateProduct(e, product)} className="p-2 text-slate-400 hover:text-fireopal transition" title="Duplicate"><Copy size={16} /></button>
                            <button className="p-2 text-fireopal hover:text-midnight transition"><ChevronRight size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 3. Detail View */}
      {appState === 'detail' && selectedProduct && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Product Header */}
          <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <button onClick={goBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-midnight hover:border-midnight transition">
              <ArrowLeft size={20} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
              <img src={selectedProduct.image} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-black text-midnight uppercase tracking-tight">{selectedProduct.name}</h2>
              <p className="text-[10px] text-fireopal font-mono font-black tracking-widest uppercase">{selectedProduct.code} | {selectedProduct.category}</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Process Tabs & Config */}
            <div className="flex justify-between items-center border-b border-slate-100 bg-slate-50/50 px-4 overflow-x-auto no-scrollbar">
              <div className="flex">
                <button onClick={() => setActiveDetailTab('dimensions')}
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-b-2 ${activeDetailTab === 'dimensions' ? 'border-fireopal text-midnight bg-white' : 'border-transparent text-slate-400 hover:text-midnight'}`}>
                  <Ruler size={16} /> Dimensions
                </button>
                
                <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>

                {currentSteps.map(proc => (
                  <button key={proc} onClick={() => setActiveDetailTab(proc)}
                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-b-2 ${activeDetailTab === proc ? 'border-fireopal text-midnight bg-white' : 'border-transparent text-slate-400 hover:text-midnight'}`}>
                    <ImageIcon size={16} />
                    {proc}
                  </button>
                ))}
              </div>
              <button onClick={openConfigModal} className="p-2 text-slate-400 hover:text-midnight transition" title="Config Steps">
                <Settings size={18} />
              </button>
            </div>

            {/* Tab Content */}
            <div className={`flex-1 overflow-hidden relative ${activeDetailTab === 'dimensions' ? 'p-2' : 'p-8'}`}>
              
              {/* Dimension Tab (Smart Zoom) */}
              {activeDetailTab === 'dimensions' && (
                <div className="flex flex-col h-full w-full">
                  {/* Toolbar */}
                  <div className="absolute top-6 right-8 z-20 flex gap-2">
                    <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-lg flex items-center p-1">
                      <button onClick={zoomOut} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Minus size={16}/></button>
                      <span className="w-16 text-center text-[10px] font-mono font-black text-midnight">{isFit ? 'FIT' : `${zoomLevel}%`}</span>
                      <button onClick={zoomIn} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Plus size={16}/></button>
                    </div>
                    <button onClick={resetZoom} className={`bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-lg p-2.5 transition ${isFit ? 'text-fireopal' : 'text-slate-400 hover:text-midnight'}`} title="Fit to Screen">
                      <Maximize size={16}/>
                    </button>
                  </div>

                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden" onClick={() => dimensionFileInputRef.current?.click()}>
                    <div className="w-full h-full overflow-auto custom-scrollbar flex items-center justify-center p-4">
                      {selectedProduct.dimensionImage ? (
                        <img 
                          src={selectedProduct.dimensionImage} 
                          className={`transition-all duration-300 ease-out ${isFit ? 'max-w-full max-h-full object-contain' : ''}`}
                          style={!isFit ? { width: `${zoomLevel}%`, maxWidth: 'none' } : {}}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-300 cursor-pointer group">
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-fireopal/10">
                            <ImagePlus size={48} className="group-hover:text-fireopal" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest">Upload Dimension Spec Sheet</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-midnight/80 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-md">
                      Click anywhere to change image
                    </div>
                  </div>
                  <input type="file" ref={dimensionFileInputRef} className="hidden" accept="image/*" onChange={handleDimensionImageUpload} />
                </div>
              )}

              {/* Standards List for Active Process */}
              {activeDetailTab !== 'dimensions' && (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-lg font-black text-midnight flex items-center gap-3 uppercase tracking-tight">
                      <span className="w-2 h-8 bg-fireopal rounded-full"></span> 
                      {activeDetailTab} Checkpoints
                    </h3>
                    <button onClick={() => openModal()} className="bg-fireopal hover:bg-fireopal/90 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fireopal/20 flex items-center gap-2 transition">
                      <Plus size={16} /> Add Parameter
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                      {filteredStandards.map(std => (
                        <div key={std.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-row h-48 transition-all duration-300 hover:shadow-xl hover:border-fireopal/30 group">
                          {/* Image Section */}
                          <div className="w-40 bg-slate-50 relative overflow-hidden border-r border-slate-50 flex-shrink-0 group">
                            {std.image ? (
                              <img src={std.image} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 cursor-pointer" onClick={() => openModal(std)}>
                                <ImageIcon size={24} />
                                <span className="text-[9px] font-black uppercase tracking-widest">NO IMAGE</span>
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition cursor-pointer" onClick={() => openModal(std)}></div>
                            
                            {std.image && (
                              <button onClick={(e) => { e.stopPropagation(); setPreviewImage(std.image); }} className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-xl flex items-center justify-center text-midnight shadow-lg hover:bg-fireopal hover:text-white hover:scale-110 transition z-20 border border-slate-100" title="Zoom Image">
                                <Search size={16} />
                              </button>
                            )}
                          </div>

                          {/* Info Section */}
                          <div className="flex-1 p-5 flex flex-col min-w-0">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-black text-midnight text-sm line-clamp-2 uppercase tracking-tight">{std.point}</h3>
                              <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(std)} className="p-2 text-slate-400 hover:text-midnight hover:bg-slate-100 rounded-lg"><Pencil size={14} /></button>
                                <button onClick={() => deleteStandard(std.id)} className="p-2 text-slate-400 hover:text-fireopal hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                              </div>
                            </div>
                            
                            <div className="space-y-3 flex-1 text-xs overflow-y-auto no-scrollbar">
                              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                                <p className="text-[9px] text-emerald-800 font-black uppercase tracking-widest mb-1">Criteria</p>
                                <p className="text-emerald-900 font-bold leading-relaxed">{std.criteria}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Tolerance</p>
                                  <p className="text-midnight font-mono font-bold">{std.tolerance || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Method</p>
                                  <p className="text-midnight font-bold flex items-center gap-1 truncate">
                                    <Wrench size={10} className="text-fireopal" />
                                    {std.method}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredStandards.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                          <ClipboardCheck size={48} className="mb-4 opacity-30" />
                          <p className="text-xs font-black uppercase tracking-widest">No standards defined for {activeDetailTab}.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Standard Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black text-midnight flex items-center gap-3 uppercase tracking-tight">
                  <div className="w-10 h-10 rounded-xl bg-fireopal/10 flex items-center justify-center text-fireopal">
                    {isEditing ? <Pencil size={20} /> : <PlusCircle size={20} />}
                  </div>
                  {isEditing ? 'Edit Standard' : `Add ${activeDetailTab} Standard`}
                </h3>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-midnight hover:bg-slate-100 rounded-xl transition-all"><X size={24} /></button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-vistawhite">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                        <img src={selectedProduct?.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Product</p>
                        <p className="text-sm font-black text-midnight uppercase tracking-tight">{selectedProduct?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Process Step</label>
                    <input value={form.process} disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inspection Point (จุดตรวจสอบ) *</label>
                    <input value={form.point} onChange={e => setForm({...form, point: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-fireopal transition-all" placeholder="e.g. รอยเชื่อมมุม" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Acceptance Criteria (เกณฑ์ยอมรับ) *</label>
                    <textarea value={form.criteria} onChange={e => setForm({...form, criteria: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-fireopal transition-all h-24 resize-none" placeholder="รายละเอียดเกณฑ์การยอมรับ..."></textarea>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tolerance (ค่าเผื่อ)</label>
                    <input value={form.tolerance} onChange={e => setForm({...form, tolerance: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-fireopal transition-all font-mono" placeholder="e.g. +/- 1mm" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tool / Equipment</label>
                    <input value={form.tool} onChange={e => setForm({...form, tool: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-fireopal transition-all" placeholder="e.g. Caliper" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reference Image</label>
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 bg-white ${isDragging ? 'border-fireopal bg-rose-50' : 'border-slate-200 hover:border-fireopal hover:bg-slate-50'}`} 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {form.image ? (
                        <div className="relative group/img">
                          <img src={form.image} className="h-40 mx-auto object-contain rounded-xl shadow-lg" />
                          <div className="absolute inset-0 bg-midnight/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-300 py-4 pointer-events-none flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <Upload size={32} className={isDragging ? "text-fireopal animate-bounce" : ""} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{isDragging ? "Drop image here" : "Click or Drag to upload image"}</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                <button onClick={closeModal} className="px-6 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button onClick={saveStandard} className="px-8 py-2.5 bg-midnight text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-midnight/20 hover:bg-slate-800 flex items-center gap-2 transition-all">
                  <Save size={16} className="text-fireopal" /> Save Standard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-midnight uppercase tracking-tight">Config Process Steps</h3>
                <button onClick={() => setShowConfigModal(false)} className="p-2 text-slate-400 hover:text-midnight hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
              </div>
              <div className="p-8 bg-vistawhite">
                <div className="mb-6">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Select Category to Edit</label>
                  <select value={configCategory} onChange={e => setConfigCategory(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-midnight uppercase tracking-widest focus:outline-none focus:border-fireopal transition-all appearance-none cursor-pointer">
                    {Object.keys(categorySteps).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="flex gap-2 mb-6">
                  <input value={newProcessName} onChange={e => setNewProcessName(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-fireopal transition-all" placeholder="New Step Name..." />
                  <button onClick={addProcess} className="bg-midnight text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">ADD</button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {(categorySteps[configCategory] || []).map((proc, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group">
                      <span className="text-xs font-black text-midnight uppercase tracking-tight">{i+1}. {proc}</span>
                      <button onClick={() => removeProcess(proc)} className="p-2 text-slate-300 hover:text-fireopal hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal (Lightbox) */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-midnight/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-full max-h-full"
            >
              <button onClick={() => setPreviewImage(null)} className="absolute -top-12 -right-12 text-white hover:text-fireopal transition-colors p-2"><X size={40}/></button>
              <img src={previewImage} className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl border-4 border-white/10" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default QCInspectionStandards;
