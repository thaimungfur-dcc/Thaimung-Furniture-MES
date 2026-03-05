import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  List, 
  BarChart3, 
  Search, 
  Plus, 
  Star, 
  Edit2, 
  Trash2, 
  HelpCircle,
  Package,
  TrendingUp,
  X,
  Save,
  Pencil,
  Image as ImageIcon,
  Ruler,
  Info,
  FileText,
  History,
  ArrowLeft,
  Settings,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';
import Swal from 'sweetalert2';

// --- Mock Data ---
const categories = ['All', 'Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor', 'Laundry'];

const initialProducts = [
  { 
    id: 'ND-SOF-3S', 
    name: 'Nordic Sofa 3-Seater', 
    category: 'Living Room', 
    subCategory: 'Sofa', 
    price: 25900, 
    rating: 5, 
    dimensions: '210 x 90 x 85 cm', 
    tags: ['Modern', 'Nordic'], 
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/sofa/400/300'
  },
  { 
    id: 'GR-DNT-01', 
    name: 'Grand Dining Table', 
    category: 'Dining', 
    subCategory: 'Dining Table', 
    price: 42500, 
    rating: 4, 
    dimensions: '180 x 90 x 75 cm', 
    tags: ['Luxury', 'Marble'], 
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/table/400/300'
  },
  { 
    id: 'IB-PRO-01', 
    name: 'Pro Ironing Board', 
    category: 'Laundry', 
    subCategory: 'Ironing Board', 
    price: 1290, 
    rating: 5, 
    dimensions: '37.5 x 100 x 86 cm', 
    tags: ['Utility', 'Home'], 
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/iron/400/300'
  },
  { 
    id: 'SC-CH-01', 
    name: 'Smart Chair', 
    category: 'Office', 
    subCategory: 'Chair', 
    price: 5500, 
    rating: 4, 
    dimensions: '60 x 60 x 110 cm', 
    tags: ['Ergonomic'], 
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/chair/400/300'
  },
  { 
    id: 'GB-BE-01', 
    name: 'Garden Bench', 
    category: 'Outdoor', 
    subCategory: 'Bench', 
    price: 3200, 
    rating: 3, 
    dimensions: '120 x 40 x 45 cm', 
    tags: ['Wood', 'Outdoor'], 
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/bench/400/300'
  },
  { 
    id: 'KB-BE-01', 
    name: 'King Bed', 
    category: 'Bedroom', 
    subCategory: 'Bed', 
    price: 18900, 
    rating: 5, 
    dimensions: '180 x 200 x 30 cm', 
    tags: ['Premium'], 
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/bed/400/300'
  },
  { 
    id: 'ST-LI-01', 
    name: 'Side Table', 
    category: 'Living Room', 
    subCategory: 'Table', 
    price: 1500, 
    rating: 4, 
    dimensions: '40 x 40 x 50 cm', 
    tags: ['Minimal'], 
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/sidetable/400/300'
  }
];

const dashboardData = {
  categoryDistribution: [
    { name: 'Living Room', value: 35, color: '#0F172A' },
    { name: 'Dining', value: 15, color: '#D4AF37' },
    { name: 'Laundry', value: 20, color: '#64748B' },
    { name: 'Office', value: 10, color: '#B43B42' },
    { name: 'Outdoor', value: 12, color: '#555934' },
    { name: 'Bedroom', value: 8, color: '#919D85' },
  ],
  monthlyTrend: [
    { name: 'Jan', value: 65 }, { name: 'Feb', value: 115 }, { name: 'Mar', value: 125 },
    { name: 'Apr', value: 120 }, { name: 'May', value: 150 }, { name: 'Jun', value: 75 },
    { name: 'Jul', value: 140 }, { name: 'Aug', value: 135 }, { name: 'Sep', value: 128 },
    { name: 'Oct', value: 115 }, { name: 'Nov', value: 55 }, { name: 'Dec', value: 70 },
  ],
  topProducts: [
    { name: 'Pro Ironing Board', value: 850 },
    { name: 'Rug', value: 420 },
    { name: 'Nordic Sofa', value: 380 },
    { name: 'Smart Chair', value: 310 },
  ]
};

const ProductCatalogue: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'dashboard'>('grid');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeModalTab, setActiveModalTab] = useState('info');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleAddProduct = () => {
    setSelectedProduct({
      id: '', name: '', category: 'Living Room', subCategory: '', price: 0, rating: 5, dimensions: '', tags: [], status: 'ACTIVE', image: ''
    });
    setActiveModalTab('info');
    setShowModal(true);
  };

  const handleEditProduct = (p: any) => {
    setSelectedProduct({ ...p });
    setActiveModalTab('info');
    setShowModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    Swal.fire({
      title: 'Delete Item?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B43B42',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter(p => p.id !== id));
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      }
    });
  };

  const handleSaveProduct = () => {
    if (!selectedProduct.id || !selectedProduct.name) {
      return Swal.fire('Error', 'Please fill in SKU and Name', 'error');
    }
    
    const exists = products.find(p => p.id === selectedProduct.id);
    if (exists && !products.find(p => p.id === selectedProduct.id && p === selectedProduct)) {
      // Update
      setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p));
    } else {
      // Add
      setProducts([selectedProduct, ...products]);
    }
    
    setShowModal(false);
    Swal.fire('Saved!', 'Product information has been updated.', 'success');
  };

  return (
    <div className="min-h-screen bg-vistawhite p-8 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-goldenrod text-white shadow-lg shadow-goldenrod/20 flex-shrink-0">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              FURNITURE <span className="text-goldenrod">CATALOGUE</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">ฐานข้อมูลสินค้าเฟอร์นิเจอร์ (STD)</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setViewMode('grid')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'grid' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <LayoutGrid size={16}/> GRID
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'list' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <List size={16}/> LIST
          </button>
          <button 
            onClick={() => setViewMode('dashboard')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'dashboard' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <BarChart3 size={16}/> DASHBOARD
          </button>
          <div className="w-px bg-slate-300 mx-2 my-2" />
          <button className="p-2.5 text-slate-400 hover:text-midnight transition-colors">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-cadetblue text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Product / SKU / Tag..." 
              className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-goldenrod bg-white transition-colors font-medium" 
            />
          </div>
          <button onClick={handleAddProduct} className="px-8 py-3 rounded-2xl text-[10px] font-black bg-midnight text-white hover:bg-midnight/90 shadow-xl shadow-midnight/20 transition-all flex items-center gap-3 uppercase tracking-widest whitespace-nowrap">
            <Plus size={16} /> ADD ITEM
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-8"
            >
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-slate-100 flex flex-col h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-black rounded-lg uppercase tracking-widest">{product.status}</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1.5 bg-midnight/90 backdrop-blur-md text-white text-[9px] font-mono font-black rounded-lg uppercase tracking-widest shadow-lg">{product.id}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                      <button onClick={() => handleEditProduct(product)} className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl hover:bg-goldenrod hover:text-white text-midnight shadow-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl hover:bg-fireopal hover:text-white text-fireopal shadow-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-midnight uppercase tracking-tight leading-tight group-hover:text-goldenrod transition-colors">{product.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.category} &gt; {product.subCategory}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < product.rating ? 'fill-goldenrod text-goldenrod' : 'text-slate-200'} />
                      ))}
                      <span className="ml-auto text-xl font-black text-midnight font-mono tracking-tighter">{product.price.toLocaleString()}</span>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{product.dimensions}</span>
                        <div className="flex gap-1">
                          {product.tags.map(tag => (
                            <span key={tag} className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Code</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimensions</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" referrerPolicy="no-referrer" />
                      </td>
                      <td className="px-8 py-4 font-mono font-black text-xs text-goldenrod">{product.id}</td>
                      <td className="px-8 py-4 font-black text-midnight text-xs uppercase tracking-tight">{product.name}</td>
                      <td className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{product.category}</td>
                      <td className="px-8 py-4 font-mono text-[10px] text-slate-400">{product.dimensions}</td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < product.rating ? 'fill-goldenrod text-goldenrod' : 'text-slate-200'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right font-mono font-black text-xs text-midnight">{product.price.toLocaleString()}</td>
                      <td className="px-8 py-4 text-center">
                        <span className="text-[8px] px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">{product.status}</span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEditProduct(product)} className="p-2 text-slate-400 hover:text-midnight transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-fireopal transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {viewMode === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8 pb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TrendingUp className="text-goldenrod" size={24} />
                  <h2 className="text-xl font-black text-midnight uppercase tracking-tight">Sales & Popularity Analysis</h2>
                </div>
                <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-goldenrod">
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sales by Category</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.categoryDistribution}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dashboardData.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Legend 
                          verticalAlign="middle" 
                          align="right" 
                          layout="vertical"
                          formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Monthly Sales Trend</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} 
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0F172A" 
                          strokeWidth={4} 
                          dot={{ r: 4, fill: '#0F172A', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Top 10 Best Selling Products</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 800 }}
                          width={150}
                        />
                        <Tooltip 
                          cursor={{ fill: '#F8FAFC' }}
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="#D4AF37" 
                          radius={[0, 10, 10, 0]} 
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Modal */}
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
                className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-t-[8px] border-goldenrod"
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-white"><Package size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">
                        {selectedProduct?.id ? 'Edit Product' : 'New Product'}
                      </h3>
                      <p className="text-goldenrod font-black uppercase tracking-widest text-[9px] mt-1">SKU: {selectedProduct?.id || 'AUTO-GEN'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
              
              <div className="flex-1 flex overflow-hidden">
                <div className="w-56 bg-slate-50/50 border-r border-slate-100 p-4 space-y-2 shrink-0 overflow-y-auto">
                  {[
                    { id: 'info', label: 'Basic Info', icon: Info },
                    { id: 'detail', label: 'Descriptions', icon: FileText },
                    { id: 'specs', label: 'Technical Specs', icon: Ruler },
                    { id: 'history', label: 'Audit Log', icon: History }
                  ].map(tab => (
                      <button key={tab.id} onClick={() => setActiveModalTab(tab.id)} 
                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-black rounded-2xl transition-all text-left uppercase tracking-widest ${activeModalTab === tab.id ? 'bg-midnight text-white shadow-lg shadow-midnight/20' : 'text-slate-400 hover:bg-white hover:text-midnight'}`}>
                        <tab.icon size={16} /> {tab.label}
                      </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30">
                  <div className="max-w-3xl mx-auto space-y-8">
                    {activeModalTab === 'info' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="md:col-span-1 space-y-4">
                          <div className="aspect-[3/4] bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group hover:border-goldenrod transition-all cursor-pointer shadow-sm">
                            {selectedProduct?.image ? (
                              <img src={selectedProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="text-center text-slate-300">
                                <PlusCircle size={48} className="mx-auto mb-3 opacity-30" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Upload Image</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-goldenrod/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white text-goldenrod px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Change Photo</span>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-5 h-fit">
                          <div className="col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                            <input 
                              value={selectedProduct?.name} 
                              onChange={e => setSelectedProduct({...selectedProduct, name: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs font-black text-midnight focus:outline-none focus:border-goldenrod transition-colors shadow-sm uppercase tracking-tight" 
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU Code</label>
                            <input 
                              value={selectedProduct?.id} 
                              onChange={e => setSelectedProduct({...selectedProduct, id: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs font-mono font-black text-goldenrod focus:outline-none focus:border-goldenrod transition-colors shadow-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                            <select 
                              value={selectedProduct?.category} 
                              onChange={e => setSelectedProduct({...selectedProduct, category: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs font-black text-midnight focus:outline-none focus:border-goldenrod transition-colors shadow-sm cursor-pointer"
                            >
                              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (THB)</label>
                            <input 
                              type="number"
                              value={selectedProduct?.price} 
                              onChange={e => setSelectedProduct({...selectedProduct, price: parseInt(e.target.value) || 0})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs font-black text-midnight text-right focus:outline-none focus:border-goldenrod transition-colors shadow-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                            <select 
                              value={selectedProduct?.status} 
                              onChange={e => setSelectedProduct({...selectedProduct, status: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs font-black text-midnight focus:outline-none focus:border-goldenrod transition-colors shadow-sm cursor-pointer"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                              <option value="DRAFT">DRAFT</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeModalTab !== 'info' && (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-300 space-y-4">
                        <Settings size={48} className="opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Additional settings coming soon</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50/50 flex justify-end gap-4 shrink-0">
                <button onClick={() => setShowModal(false)} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Discard Changes</button>
                <button onClick={handleSaveProduct} className="px-10 py-3 bg-midnight text-white text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-3 uppercase tracking-widest">
                  <Save size={16} /> Save Product
                </button>
              </div>
            </motion.div>
          </Draggable>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default ProductCatalogue;
