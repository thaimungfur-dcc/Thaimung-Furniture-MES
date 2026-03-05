import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DynamicIcon } from './DynamicIcon';
import { SalesOrder as SalesOrderData, MOCK_SALES_ORDERS, OrderItem } from '../services/salesOrderService';
import { MOCK_CUSTOMERS } from '../services/customerService';
import { MOCK_PRODUCTS } from '../services/productCatalogueService';

interface IdConfigItem {
    prefix: string;
    format: string;
    seqLength: number;
    reset: string;
}

// KPI Card Component
const KpiCard = ({ title, val, color, icon, desc }: { title: string, val: number, color: string, icon: string, desc?: string }) => (
  <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-white/60 relative overflow-hidden group h-full cursor-pointer">
    <div className="absolute -right-6 -bottom-6 opacity-[0.1] transform rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0" style={{color}}>
      <DynamicIcon name={icon} size={120} />
    </div>
    <div className="relative z-10 flex justify-between items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono opacity-90 truncate">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h4 className="text-3xl font-extrabold tracking-tight font-mono leading-tight truncate" style={{color}}>{val.toLocaleString()}</h4>
        </div>
        {desc && <p className="text-[10px] text-gray-400 font-medium font-sans mt-2 flex items-center gap-1 truncate">
          <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></span>
          {desc}
        </p>}
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md border border-white/60" style={{backgroundColor: color + '33'}}>
        <DynamicIcon name={icon} size={24} className="" style={{color}} />
      </div>
    </div>
  </div>
);

// Searchable Select Component
const SearchableSelect = ({ options, value, onChange, placeholder, disabled, displayKey = 'name', valueKey = 'name', subKey = 'code' }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => { 
        if (!isOpen) setFilter(value || ''); 
    }, [value, isOpen]);

    const filteredOptions = useMemo(() => {
        const safeOptions = Array.isArray(options) ? options : [];
        if (!filter && !isOpen) return safeOptions.slice(0, 50);
        const lowerFilter = filter.toLowerCase().trim();
        const terms = lowerFilter.split(/\s+/);
        return safeOptions.filter((opt: any) => {
            const text = (String(opt[displayKey] || '') + ' ' + String(opt[subKey] || '')).toLowerCase();
            return terms.every(term => text.includes(term));
        }).slice(0, 50);
    }, [options, filter, displayKey, subKey, isOpen]);

    const handleSelect = (opt: any) => {
        onChange(opt);
        setFilter(opt[displayKey]);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input 
                type="text" 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 transition-all disabled:bg-gray-50 disabled:text-gray-400" 
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setIsOpen(true); }}
                onFocus={() => { setIsOpen(true); }}
                placeholder={placeholder}
                disabled={disabled}
            />
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt: any, i: number) => (
                            <div key={i} className="px-3 py-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center text-sm border-b border-gray-50 last:border-0" onClick={() => handleSelect(opt)}>
                                <span className="font-bold text-gray-700">{opt[displayKey]}</span>
                                <span className="text-xs text-gray-400 font-mono">{opt[subKey] || ''}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-3 text-xs text-gray-400 text-center">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

const SalesOrder = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState<'list' | 'kanban'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(false);
    
    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
    const [activeModalTab, setActiveModalTab] = useState('Order Info');
    const [showHelp, setShowHelp] = useState(false);

    // Drag State
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    
    // Data State
    const [orders, setOrders] = useState<SalesOrderData[]>(MOCK_SALES_ORDERS);
    const [masterItems, setMasterItems] = useState<any[]>(MOCK_PRODUCTS.map(p => ({...p, stock: { onHand: Math.floor(Math.random() * 200), allocated: 0 }})));
    const [masterCustomers, setMasterCustomers] = useState<any[]>(MOCK_CUSTOMERS);
    
    // Form Data
    const [formData, setFormData] = useState<Partial<SalesOrderData>>({
        soNumber: '', customer: '', date: '', status: 'Booking', 
        paymentTerm: 'Cash', salesPerson: 'Admin', vatType: 'Excl.', vatRate: 7,
        items: []
    });

    // ID Config State
    const [idConfig, setIdConfig] = useState<Record<string, IdConfigItem>>({
        so: { prefix: 'SO', format: '{YY}{MM}{DD}-{SEQ}', seqLength: 3, reset: 'Daily' },
        rs: { prefix: 'RS', format: '{YY}{MM}-{SEQ}', seqLength: 4, reset: 'Monthly' },
        jo: { prefix: 'JO', format: '{YY}-{SEQ}', seqLength: 5, reset: 'Yearly' }
    });

    // Dropdown tracking
    const [activeRowDropdown, setActiveRowDropdown] = useState<number | null>(null);

    // Upload
    const [uploadPreview, setUploadPreview] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pagination
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Constants - Kanban Statuses
    const statuses = [
        'Booking',       // เปิดจองสินค้า
        'JO Created',    // เปิดใบสั่งผลิตแล้ว
        'Production',    // อยู่ระหว่างผลิต
        'Ready to Ship', // รอจัดส่ง
        'Delivered',     // ส่งมอบแล้ว
        'Returned'       // ลูกค้าเคลม
    ];

    // --- Logic: Auto Gen SO Number ---
    const generateSONumber = () => {
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const yymmdd = `${yy}${mm}${dd}`;
        
        const todayOrders = orders.filter(o => o.soNumber.startsWith(`SO${yymmdd}`));
        const nextSeq = todayOrders.length + 1;
        return `SO${yymmdd}-${String(nextSeq).padStart(3, '0')}`;
    };

    // --- Logic: Calculations ---
    const calculateTotals = () => {
        const items = formData.items || [];
        const subtotal = items.reduce((acc, i) => acc + ( (i.qty || 0) * (i.price || 0) - (i.discount || 0) ), 0);
        let vatAmount = 0;
        let grandTotal = 0;
        const rate = Number(formData.vatRate) || 7;

        if (formData.vatType === 'No VAT') {
            vatAmount = 0;
            grandTotal = subtotal;
        } else if (formData.vatType === 'Excl.') {
            vatAmount = subtotal * (rate / 100);
            grandTotal = subtotal + vatAmount;
        } else if (formData.vatType === 'Incl.') {
            grandTotal = subtotal; 
            const preVatTotal = subtotal / (1 + rate / 100);
            vatAmount = subtotal - preVatTotal;
        }

        return { 
            rawSubtotal: subtotal + (items.reduce((acc,i)=>acc+(i.discount||0),0)), 
            totalDiscount: items.reduce((acc,i)=>acc+(i.discount||0),0), 
            subtotal, 
            vatAmount, 
            grandTotal 
        };
    };

    // --- Computed ---
    const filteredOrders = useMemo(() => {
        let res = orders;
        if (statusFilter !== 'All') res = res.filter(o => o.status === statusFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(o => 
                (o.soNumber||'').toLowerCase().includes(q) || 
                (o.customer||'').toLowerCase().includes(q)
            );
        }
        return res;
    }, [orders, statusFilter, searchQuery]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

    const stats = useMemo(() => ({
        total: orders.length,
        booking: orders.filter(o => o.status === 'Booking').length,
        production: orders.filter(o => o.status === 'Production').length,
        delivered: orders.filter(o => o.status === 'Delivered').length
    }), [orders]);

    const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const getStatusClass = (status: string) => {
        switch(status) {
            case 'Booking': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'JO Created': return 'bg-cadetblue/10 text-cadetblue border-cadetblue/20';
            case 'Production': return 'bg-fireopal/10 text-fireopal border-fireopal/20'; 
            case 'Ready to Ship': return 'bg-goldenrod/10 text-goldenrod border-goldenrod/20';
            case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Returned': return 'bg-crimson/10 text-crimson border-crimson/20';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getBoardItems = (status: string) => orders.filter(o => o.status === status);
    const getBoardCount = (status: string) => getBoardItems(status).length;

    // --- Handlers ---
    const openModal = (order?: SalesOrderData, mode: 'create' | 'edit' | 'view' = 'create') => {
        setModalPosition({ x: 0, y: 0 });
        if (order) {
            setModalMode(mode || 'view');
            setFormData(JSON.parse(JSON.stringify({
                ...order,
                items: order.items || [] 
            })));
        } else {
            setModalMode('create');
            setFormData({
                soNumber: generateSONumber(),
                customer: '',
                date: new Date().toISOString().split('T')[0],
                status: 'Booking',
                paymentTerm: 'Cash',
                salesPerson: 'Admin',
                vatType: 'Excl.',
                vatRate: 7,
                items: [{ name: '', sku: '', qty: 1, price: 0, discount: 0 }]
            });
        }
        setActiveModalTab('Order Info');
        setShowModal(true);
    };

    const saveOrder = () => {
        if (!formData.customer) return alert('Customer is required');
        if (!formData.items || formData.items.length === 0) return alert('Add at least one item');

        const totals = calculateTotals();
        const payload = { ...formData, total: totals.grandTotal } as SalesOrderData;

        if (modalMode === 'create') {
            const newId = String(Date.now());
            setOrders(prev => [{ ...payload, id: newId }, ...prev]);
        } else {
            setOrders(prev => prev.map(o => o.id === payload.id ? payload : o));
        }
        setShowModal(false);
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), { name: '', sku: '', qty: 1, price: 0, discount: 0 }] }));
    };
    const removeItem = (idx: number) => {
        const items = [...(formData.items || [])];
        items.splice(idx, 1);
        setFormData(prev => ({ ...prev, items }));
    };

    const addDelivery = (itemIndex: number) => {
        const newItems = [...(formData.items || [])];
        if (!newItems[itemIndex].deliveries) newItems[itemIndex].deliveries = [];
        newItems[itemIndex].deliveries!.push({ date: '', qty: 0, destination: '' });
        setFormData(prev => ({...prev, items: newItems}));
    };

    const removeDelivery = (itemIndex: number, deliveryIndex: number) => {
        const newItems = [...(formData.items || [])];
        newItems[itemIndex].deliveries!.splice(deliveryIndex, 1);
        setFormData(prev => ({...prev, items: newItems}));
    };

    // --- Drag Handlers ---
    const onMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('input, textarea, button, select, .no-drag')) return;
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { ...modalPosition };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setModalPosition({ x: startPos.current.x + dx, y: startPos.current.y + dy });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="flex flex-col h-full bg-vistawhite">
            {/* Header */}
            <div className="px-8 py-6 flex justify-between items-center bg-vistawhite/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center text-fireopal">
                        <DynamicIcon name="shopping-bag" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-midnight tracking-tighter uppercase">SALES <span className="text-fireopal">ORDERS</span></h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Order Management System</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowConfigModal(true)} className="bg-white border border-gray-200 text-slate-500 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2 transition-all">
                        <DynamicIcon name="settings" size={14} /> Config
                    </button>
                    <button onClick={() => setShowHelp(!showHelp)} className={`bg-white border border-gray-200 text-slate-500 px-3 py-2.5 rounded-2xl hover:bg-gray-50 transition-all ${showHelp ? 'bg-gray-100' : ''}`}>
                        <DynamicIcon name="help-circle" size={18} />
                    </button>
                </div>
            </div>

            {/* Help Panel */}
            {showHelp && (
                <div className="fixed right-0 top-20 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-40 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#0F172A] flex items-center gap-2"><DynamicIcon name="book-open" size={18} className="text-blue-600" /> User Guide</h3>
                        <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-red-500"><DynamicIcon name="x" size={18} /></button>
                    </div>
                    <div className="space-y-6 text-sm text-gray-600">
                        <div>
                            <h4 className="font-bold text-[#0F172A] mb-2">1. Creating Orders</h4>
                            <p>Click "New Order" to start. Select a customer and add items. The SO Number is auto-generated based on the daily sequence.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0F172A] mb-2">2. Status Workflow</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><b>Booking:</b> Initial state. Stock is reserved.</li>
                                <li><b>JO Created:</b> Production job issued.</li>
                                <li><b>Production:</b> Items are being made.</li>
                                <li><b>Ready to Ship:</b> Production complete.</li>
                                <li><b>Delivered:</b> Customer received goods.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0F172A] mb-2">3. Delivery Allocation</h4>
                            <p>In the "Delivery Schedule" tab, you can split deliveries for an item. The system auto-calculates allocation from Booking (Stock) vs Job Order (Production).</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0">
                <div className="flex flex-col gap-6 mt-6">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <KpiCard title="Total Orders" val={stats.total} color="#0B1120" icon="shopping-bag" desc="All Time" />
                        <KpiCard title="Booking" val={stats.booking} color="#DB9E32" icon="clock" desc="Pending Process" />
                        <KpiCard title="In Production" val={stats.production} color="#E3624A" icon="hammer" desc="WIP" />
                        <KpiCard title="Delivered" val={stats.delivered} color="#3F6212" icon="check-circle" desc="Completed" />
                    </div>

                    {/* Tabs & List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center gap-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setActiveTab('list')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab==='list' ? 'bg-white text-midnight shadow-sm' : 'text-gray-500'}`}>List View</button>
                                <button onClick={() => setActiveTab('kanban')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab==='kanban' ? 'bg-white text-midnight shadow-sm' : 'text-gray-500'}`}>Kanban Board</button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><DynamicIcon name="search" size={14} /></div>
                                    <input type="text" placeholder="Search orders..." className="pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-fireopal rounded-lg text-xs w-64 outline-none transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowUploadModal(true)} className="bg-white border border-gray-200 text-slate-500 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2 transition-all">
                                        <DynamicIcon name="upload-cloud" size={14} /> Upload CSV
                                    </button>
                                    <button onClick={() => openModal()} className="bg-fireopal text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-fireopal/90 flex items-center gap-2 shadow-lg shadow-fireopal/20 transition-all">
                                        <DynamicIcon name="plus" size={14} /> New Order
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* List View */}
                        {activeTab === 'list' && (
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase bg-gray-50 border-b border-gray-200">SO Number</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase bg-gray-50 border-b border-gray-200">Date</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase bg-gray-50 border-b border-gray-200">Customer</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase bg-gray-50 border-b border-gray-200 text-center">Items</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase bg-gray-50 border-b border-gray-200 text-right">Total</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase bg-gray-50 border-b border-gray-200 text-center">Status</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase bg-gray-50 border-b border-gray-200 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100/50">
                                        {paginatedOrders.map(so => (
                                            <tr key={so.id} className="group cursor-pointer hover:bg-fireopal/5 transition-colors" onClick={() => openModal(so, 'view')}>
                                                <td className="p-4 font-mono font-black text-fireopal text-xs">{so.soNumber}</td>
                                                <td className="p-4 text-gray-500 text-xs font-bold">{so.date}</td>
                                                <td className="p-4 font-black text-midnight text-sm uppercase tracking-tight">{so.customer}</td>
                                                <td className="p-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">{so.items.length}</span></td>
                                                <td className="p-4 text-right font-mono font-black text-midnight text-sm">{formatCurrency(so.total)}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-widest ${getStatusClass(so.status)}`}>{so.status}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button className="text-gray-400 hover:text-midnight transition-colors"><DynamicIcon name="chevron-right" size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedOrders.length === 0 && (
                                            <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm italic">No orders found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Kanban View */}
                        {activeTab === 'kanban' && (
                            <div className="flex-1 overflow-x-auto p-6 bg-gray-50/50 flex gap-6">
                                {statuses.map(status => (
                                    <div key={status} className="min-w-[280px] flex flex-col h-full">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-[10px] font-black text-midnight uppercase tracking-[0.2em]">{status}</h4>
                                            <span className="bg-white text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm border border-slate-100">{getBoardCount(status)}</span>
                                        </div>
                                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                            {getBoardItems(status).map(so => (
                                                <div key={so.id} onClick={() => openModal(so, 'view')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl cursor-pointer transition-all group hover:-translate-y-1">
                                                    <div className="flex justify-between mb-3">
                                                        <span className="text-[10px] font-mono font-black text-fireopal bg-fireopal/5 px-2 py-0.5 rounded uppercase tracking-widest">{so.soNumber}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold">{so.date}</span>
                                                    </div>
                                                    <div className="font-black text-sm text-midnight mb-2 truncate uppercase tracking-tight">{so.customer}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{so.items.length} items • {formatCurrency(so.total)}</div>
                                                    <div className={`w-full h-1 rounded-full ${getStatusClass(so.status).split(' ')[0]}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Config Modal */}
            {showConfigModal && (
                <div className="fixed inset-0 bg-midnight/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfigModal(false)}>
                    <div 
                        className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border-t-[8px] border-fireopal overflow-hidden flex flex-col relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-midnight uppercase tracking-tight flex items-center gap-3">
                                <DynamicIcon name="settings" size={24} className="text-fireopal" /> ID Configuration
                            </h3>
                            <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-fireopal transition-colors"><DynamicIcon name="x" size={24} /></button>
                        </div>
                        <div className="p-8 bg-vistawhite space-y-6">
                            {Object.entries(idConfig).map(([key, config]) => {
                                const cfg = config as IdConfigItem;
                                return (
                                    <div key={key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{key.toUpperCase()} Number Format</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Format Pattern</label>
                                                <input value={cfg.format} onChange={e => setIdConfig({...idConfig, [key]: {...cfg, format: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-fireopal/10 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reset Sequence</label>
                                                <select value={cfg.reset} onChange={e => setIdConfig({...idConfig, [key]: {...cfg, reset: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-fireopal/10 outline-none">
                                                    <option value="Daily">Daily</option>
                                                    <option value="Monthly">Monthly</option>
                                                    <option value="Yearly">Yearly</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Preview: <span className="font-mono text-fireopal font-black ml-2">
                                                {cfg.format.replace('{YY}', '26').replace('{MM}', '02').replace('{DD}', '25').replace('{SEQ}', '001')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-6 border-t bg-white flex justify-end">
                            <button onClick={() => setShowConfigModal(false)} className="px-8 py-3 bg-midnight text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-midnight/90 shadow-lg shadow-midnight/20 transition-all">Save Configuration</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sales Order Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div 
                        className="bg-vistawhite w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col relative"
                        onClick={e => e.stopPropagation()}
                        style={{ 
                            transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
                            transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
                        }}
                    >
                        {/* Header */}
                        <div 
                            className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0 cursor-move"
                            onMouseDown={onMouseDown}
                        >
                            <div className="flex items-center gap-3 pointer-events-none">
                                <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center text-blue-400 shadow-lg shadow-[#0F172A]/20">
                                    <DynamicIcon name="file-text" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">
                                        {modalMode === 'create' ? 'New Sales Order' : 'Sales Order Detail'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">{formData.soNumber}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors no-drag">
                                <DynamicIcon name="x" size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-60 bg-white border-r border-gray-200 flex flex-col p-4 gap-1 overflow-y-auto shrink-0">
                                {['Order Info', 'Items & Pricing', 'Delivery Schedule', 'Summary & Note', 'History Log'].map(tab => (
                                    <button key={tab} onClick={() => setActiveModalTab(tab)} 
                                        className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-3 transition-all ${activeModalTab === tab ? 'bg-[#0F172A] text-blue-400 shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        <DynamicIcon name={tab === 'Order Info' ? 'info' : tab.includes('Items') ? 'shopping-cart' : tab.includes('Delivery') ? 'truck' : tab.includes('Summary') ? 'file-text' : 'history'} size={16} />
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Content Form */}
                            <div className="flex-1 overflow-y-auto p-8 bg-vistawhite relative custom-scrollbar">
                                
                                {/* 1. Order Info */}
                                {activeModalTab === 'Order Info' && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                                        <h4 className="text-xs font-bold text-[#0F172A] uppercase border-b border-gray-100 pb-2">Basic Information</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Customer</label>
                                                <SearchableSelect 
                                                    options={masterCustomers} 
                                                    value={formData.customer} 
                                                    onChange={(opt: any) => setFormData({...formData, customer: opt.customerName})} 
                                                    placeholder="Select Customer..."
                                                    displayKey="customerName"
                                                    subKey="customerID"
                                                    disabled={modalMode === 'view'}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Order Date</label>
                                                <input type="date" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} disabled={modalMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Sales Person</label>
                                                <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600" value={formData.salesPerson} onChange={e => setFormData({...formData, salesPerson: e.target.value})} disabled={modalMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Status (Auto)</label>
                                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 cursor-not-allowed">
                                                    {formData.status}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <h4 className="text-xs font-bold text-[#0F172A] uppercase border-b border-gray-100 pb-2 pt-4">Tax & Payment</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">VAT Type</label>
                                                <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 cursor-pointer" value={formData.vatType} onChange={e => setFormData({...formData, vatType: e.target.value as any})} disabled={modalMode === 'view'}>
                                                    <option value="Excl.">VAT Excluded (ราคายังไม่รวมภาษี)</option>
                                                    <option value="Incl.">VAT Included (ราคารวมภาษีแล้ว)</option>
                                                    <option value="No VAT">No VAT (ไม่มีภาษี)</option>
                                                </select>
                                                <p className="text-[10px] text-gray-400 mt-1">Excl: Add 7% on top. Incl: Extract 7% from total.</p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">VAT Rate (%)</label>
                                                <input type="number" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600" value={formData.vatRate} onChange={e => setFormData({...formData, vatRate: Number(e.target.value)})} disabled={modalMode === 'view' || formData.vatType === 'No VAT'} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Items & Pricing */}
                                {activeModalTab === 'Items & Pricing' && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-[#0F172A] uppercase">Order Items</h4>
                                            {modalMode !== 'view' && (
                                                <button type="button" onClick={addItem} className="text-[10px] bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white font-bold transition-all flex items-center gap-1">
                                                    <DynamicIcon name="plus" size={12} /> Add Item
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-3 pb-20">
                                            {formData.items?.map((item, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-3 items-end relative" style={{zIndex: activeRowDropdown === idx ? 20 : 1}}>
                                                    <div className="w-8 text-center text-xs font-bold text-gray-400 pb-2">{idx+1}</div>
                                                    <div className="flex-1" onClick={() => setActiveRowDropdown(idx)}>
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Product</label>
                                                        <SearchableSelect 
                                                            options={masterItems} 
                                                            value={item.name}
                                                            onChange={(opt: any) => {
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx].name = opt.name;
                                                                newItems[idx].sku = opt.sku;
                                                                newItems[idx].price = Number(opt.price) || 0;
                                                                setFormData({...formData, items: newItems});
                                                            }}
                                                            placeholder="Search Product..."
                                                            displayKey="name"
                                                            subKey="sku"
                                                            disabled={modalMode === 'view'}
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Qty</label>
                                                        <input type="number" className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm text-center font-bold text-[#0F172A] focus:outline-none focus:border-blue-600" value={item.qty} 
                                                            onChange={e => {
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx].qty = parseInt(e.target.value) || 0;
                                                                setFormData({...formData, items: newItems});
                                                            }} disabled={modalMode === 'view'} />
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Price</label>
                                                        <input type="number" className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:border-blue-600" value={item.price} 
                                                            onChange={e => {
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx].price = parseFloat(e.target.value) || 0;
                                                                setFormData({...formData, items: newItems});
                                                            }} disabled={modalMode === 'view'} />
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Disc.</label>
                                                        <input type="number" className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm text-right text-rose-500 focus:outline-none focus:border-blue-600" value={item.discount} placeholder="0"
                                                            onChange={e => {
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx].discount = parseFloat(e.target.value) || 0;
                                                                setFormData({...formData, items: newItems});
                                                            }} disabled={modalMode === 'view'} />
                                                    </div>
                                                    <div className="w-24 text-right pb-2">
                                                        <span className="text-xs text-gray-400 block mb-1">Total</span>
                                                        <span className="text-sm font-bold text-[#0F172A]">{formatCurrency((item.qty * item.price) - (item.discount || 0))}</span>
                                                    </div>
                                                    {modalMode !== 'view' && (
                                                        <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 mb-2 p-1"><DynamicIcon name="trash-2" size={16} /></button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* 3. Delivery & Allocation */}
                                {activeModalTab === 'Delivery Schedule' && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-[#0F172A] uppercase border-b border-gray-100 pb-2 mb-4">Delivery Plan & Allocation</h4>
                                        
                                        {formData.items?.map((item, idx) => {
                                            const master = masterItems.find(m => m.sku === item.sku);
                                            const stockOnHand = master ? (master.stock?.onHand || 0) : 0;
                                            let remainingStock = stockOnHand;

                                            return (
                                                <div key={idx} className="mb-6 last:mb-0 border-b border-dashed border-gray-200 pb-6 last:border-0 last:pb-0">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="font-bold text-sm text-[#0F172A]">{idx+1}. {item.name}</div>
                                                        <div className="text-xs text-gray-500">Ordered: <b className="text-[#0F172A]">{item.qty}</b> | Stock: <b className={stockOnHand > 0 ? "text-green-600" : "text-red-500"}>{stockOnHand}</b></div>
                                                    </div>
                                                    <div className="flex justify-end mb-2">
                                                        {modalMode !== 'view' && <button type="button" onClick={() => addDelivery(idx)} className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 font-bold">+ Split Delivery</button>}
                                                    </div>
                                                    
                                                    <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                                                        {(!item.deliveries || item.deliveries.length === 0) ? (
                                                            <div className="text-xs text-gray-400 italic pl-2">
                                                                No delivery schedule set. One-time delivery assumed.
                                                                {(() => {
                                                                    const bk = Math.min(item.qty, stockOnHand);
                                                                    const jo = Math.max(0, item.qty - stockOnHand);
                                                                    const suffix = "-DL#1";
                                                                    const bkRef = (formData.soNumber || '').replace('SO', 'BK') + suffix;
                                                                    const joRef = (formData.soNumber || '').replace('SO', 'JO') + suffix;

                                                                    return (
                                                                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded flex gap-4">
                                                                            {bk > 0 && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1"><DynamicIcon name="check-circle" size={10} /> Booking: {bk} ({bkRef})</span>}
                                                                            {jo > 0 && <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded flex items-center gap-1"><DynamicIcon name="hammer" size={10} /> Job Order: {jo} ({joRef})</span>}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {item.deliveries.map((del, dIdx) => {
                                                                    const qty = Number(del.qty) || 0;
                                                                    let currentBk = 0;
                                                                    let currentJo = 0;
                                                                    
                                                                    if (remainingStock >= qty) {
                                                                        currentBk = qty;
                                                                        remainingStock -= qty;
                                                                    } else {
                                                                        currentBk = remainingStock;
                                                                        currentJo = qty - remainingStock;
                                                                        remainingStock = 0;
                                                                    }
                                                                    
                                                                    const suffix = `-DL#${dIdx + 1}`;
                                                                    const bkRef = (formData.soNumber || '').replace('SO', 'BK') + suffix;
                                                                    const joRef = (formData.soNumber || '').replace('SO', 'JO') + suffix;

                                                                    return (
                                                                        <div key={dIdx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                                            <div className="flex gap-2 items-center mb-2">
                                                                                <span className="text-xs font-bold text-gray-500 w-6">#{dIdx+1}</span>
                                                                                <input type="date" value={del.date} onChange={e => { 
                                                                                    const n=[...(formData.items || [])]; 
                                                                                    n[idx].deliveries![dIdx].date = e.target.value; 
                                                                                    setFormData({...formData, items: n}); 
                                                                                }} disabled={modalMode === 'view'} className="w-32 bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-600" />
                                                                                <input type="number" value={del.qty} onChange={e => { const n=[...(formData.items || [])]; n[idx].deliveries![dIdx].qty=Number(e.target.value); setFormData({...formData, items: n}); }} disabled={modalMode === 'view'} className="w-24 bg-white border border-gray-200 rounded px-2 py-1 text-xs text-right font-bold focus:outline-none focus:border-blue-600" placeholder="Qty" />
                                                                                <input type="text" value={del.destination} onChange={e => { const n=[...(formData.items || [])]; n[idx].deliveries![dIdx].destination=e.target.value; setFormData({...formData, items: n}); }} disabled={modalMode === 'view'} className="flex-grow bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-600" placeholder="Specific Location" />
                                                                                {modalMode !== 'view' && <button type="button" onClick={() => removeDelivery(idx, dIdx)} className="text-red-400 hover:text-red-600 ml-2"><DynamicIcon name="x" size={14} /></button>}
                                                                            </div>
                                                                            
                                                                            <div className="ml-8 flex gap-2 text-[10px]">
                                                                                {currentBk > 0 && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">Booking: {currentBk} ({bkRef})</span>}
                                                                                {currentJo > 0 && <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded">Job Order: {currentJo} ({joRef})</span>}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {/* 4. Summary & Note */}
                                {activeModalTab === 'Summary & Note' && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-[#0F172A] uppercase border-b border-gray-100 pb-2 mb-4">Financial Summary</h4>
                                        
                                        <div className="flex flex-col items-end gap-3 mb-8">
                                            <div className="w-64 flex justify-between text-sm text-gray-500">
                                                <span>Subtotal</span>
                                                <span>{formatCurrency(calculateTotals().rawSubtotal)}</span>
                                            </div>
                                            <div className="w-64 flex justify-between text-sm text-rose-500">
                                                <span>Discount</span>
                                                <span>-{formatCurrency(calculateTotals().totalDiscount)}</span>
                                            </div>
                                            <div className="w-64 flex justify-between text-sm text-gray-500">
                                                <span>VAT ({formData.vatRate}%)</span>
                                                <span>{formatCurrency(calculateTotals().vatAmount)}</span>
                                            </div>
                                            <div className="w-64 flex justify-between text-xl font-black text-[#0F172A] border-t border-gray-200 pt-3">
                                                <span>Grand Total</span>
                                                <span>{formatCurrency(calculateTotals().grandTotal)}</span>
                                            </div>
                                        </div>

                                        <h4 className="text-xs font-bold text-[#0F172A] uppercase border-b border-gray-100 pb-2 mb-4">Internal Note</h4>
                                        <textarea rows={4} placeholder="Add note here..." disabled={modalMode === 'view'} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 resize-none"></textarea>
                                    </div>
                                )}

                                {/* 5. History Log Tab */}
                                {activeModalTab === 'History Log' && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-[#0F172A] uppercase border-b border-gray-100 pb-2 mb-4">Transaction History</h4>
                                        <div className="text-center text-gray-400 text-xs italic py-8">
                                            No history records found for this order.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-500 font-bold text-xs hover:bg-gray-50 rounded-lg transition-colors">CANCEL</button>
                            {modalMode !== 'view' && (
                                <button onClick={saveOrder} className="px-8 py-2.5 bg-[#0F172A] text-blue-400 font-bold text-xs rounded-lg shadow-lg hover:bg-[#0F172A]/90 transition-transform active:scale-95 flex items-center gap-2">
                                    <DynamicIcon name="save" size={14} /> SAVE ORDER
                                </button>
                            )}
                            {modalMode === 'view' && (
                                <button onClick={() => setModalMode('edit')} className="px-6 py-2.5 bg-white border border-[#0F172A] text-[#0F172A] font-bold text-xs rounded-lg hover:bg-[#0F172A] hover:text-white transition-colors flex items-center gap-2">
                                    <DynamicIcon name="pencil" size={14} /> EDIT
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesOrder;
