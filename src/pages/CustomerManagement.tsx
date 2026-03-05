import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Building2, 
  User, 
  List, 
  LayoutDashboard, 
  Search, 
  UploadCloud, 
  Plus, 
  Eye, 
  X, 
  Pencil, 
  UserPlus, 
  Info, 
  MapPin, 
  Coins, 
  Trash2, 
  Save, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';

// --- Shared Components ---
const KPICard = ({ title, val, color, icon: Icon }: any) => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 relative overflow-hidden group h-full cursor-pointer">
    <div className="absolute -right-6 -bottom-6 opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0" style={{ color }}>
      <Icon size={110} />
    </div>
    <div className="relative z-10 flex justify-between items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono opacity-90 truncate">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h4 className="text-2xl font-extrabold tracking-tight font-mono leading-tight truncate" style={{ color }}>{val}</h4>
        </div>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md border border-white/60" style={{ backgroundColor: color + '22' }}>
        <Icon size={20} color={color} />
      </div>
    </div>
    <div className="w-full bg-slate-50 rounded-full h-1 mt-3 overflow-hidden relative z-10">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: '70%', backgroundColor: color }}></div>
    </div>
  </div>
);

const CustomerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('general');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const filterCategories = ['All', 'MT', 'Dealer', 'Online', 'Project', 'GOV', 'OTH'];
  const customerTypes = ['MT', 'Dealer', 'Online', 'Project', 'GOV', 'OTH'];
  const formTabs = [
    { id: 'general', label: 'General Info', icon: Info },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'financial', label: 'Financial', icon: Coins },
    { id: 'contact', label: 'Contact Person', icon: User },
  ];

  const [customers, setCustomers] = useState<any[]>([
    { id: 1, customerID: 'MT-260001', customerName: 'HomePro (Public Company)', customerType: 'MT', contactName: 'Khun Nareerat', phone: '02-832-1000', status: 'Active', creditTerm: 60, taxID: '0105555000123', creditLimit: 5000000, billingAddress: '97/11 Moo 4, Klong Nueng, Klong Luang, Pathumthani', shippingAddress: 'Bang Na Warehouse, Bangkok', email: 'procurement@homepro.co.th', mobile: '081-XXX-XXXX', contactPosition: 'Purchasing Manager' },
    { id: 2, customerID: 'DL-001', customerName: 'Index Living Mall', customerType: 'MT', contactName: 'Khun Weerawat', phone: '02-417-1111', status: 'Active', creditTerm: 60, taxID: '0105555000456', creditLimit: 3000000, billingAddress: 'Index Living Mall HQ, Bangkok', shippingAddress: 'Main Warehouse, Samut Sakhon', email: 'weerawat@index.co.th', mobile: '089-XXX-XXXX', contactPosition: 'Supply Chain Manager' },
    { id: 3, customerID: 'PJ-2026-001', customerName: 'Origin Condo Sukhumvit', customerType: 'Project', contactName: 'Ploy', phone: '090-XXX-XXXX', status: 'Active', creditTerm: 45, taxID: '0102233445566', creditLimit: 1000000, billingAddress: 'Origin Property PLC, Sukhumvit', shippingAddress: 'Project Site, Soi 24', email: 'ploy@origin.co.th', mobile: '090-XXX-XXXX', contactPosition: 'Project Coordinator' }
  ]);

  const [form, setForm] = useState<any>({});

  const filteredCustomers = useMemo(() => {
    let data = customers;
    if (customerTypeFilter !== 'All') data = data.filter(c => c.customerType === customerTypeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(c => (c.customerName + c.customerID + (c.contactName || '')).toLowerCase().includes(q));
    }
    return data;
  }, [customers, customerTypeFilter, searchQuery]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;

  const getTypeClass = (t: string) => {
    const map: any = { 'MT': 'bg-indigo-50 text-indigo-700 border-indigo-100', 'Project': 'bg-rose-50 text-rose-700 border-rose-100', 'GOV': 'bg-blue-50 text-blue-700 border-blue-100', 'OTH': 'bg-slate-100 text-slate-500 border-slate-200' };
    return map[t] || 'bg-slate-100 border-slate-200';
  };

  const openModal = (cust: any = null) => {
    if (cust) {
      setForm({ ...cust });
      setModalReadOnly(true);
    } else {
      setForm({ customerType: 'MT', status: 'Active', creditTerm: 30, billingAddress: '', shippingAddress: '', contactName: '', mobile: '', contactPosition: '', creditLimit: 0, paymentMethod: 'Transfer' });
      setModalReadOnly(false);
    }
    setActiveFormTab('general');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const saveCustomer = () => {
    if (form.id) {
      setCustomers(customers.map(c => c.id === form.id ? form : c));
    } else {
      const newCust = { ...form, id: Date.now(), customerID: `${form.customerType}-${Math.floor(Math.random()*100000)}` };
      setCustomers([newCust, ...customers]);
    }
    Swal.fire({ icon: 'success', title: 'Saved Successfully', timer: 1000, showConfirmButton: false });
    closeModal();
  };

  const deleteCustomer = () => {
    Swal.fire({ 
      title: 'Delete Customer?', 
      text: `Are you sure you want to delete ${form.customerName}?`,
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#B43B42',
      confirmButtonText: 'Yes, Delete it'
    }).then(r => {
      if (r.isConfirmed) {
        setCustomers(customers.filter(c => c.id !== form.id));
        closeModal();
        Swal.fire({title: 'Deleted', icon: 'success', timer: 1000, showConfirmButton: false});
      }
    }); 
  };

  return (
    <div className="min-h-screen bg-vistawhite p-6 space-y-8 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-midnight shadow-sm border border-slate-100 flex-shrink-0">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-midnight tracking-tighter uppercase leading-none">
              CUSTOMER <span className="text-luxuryGold">DATABASE</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">CRM & Client Management System</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('list')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'list' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <List size={16}/> LIST VIEW
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-midnight text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            <LayoutDashboard size={16}/> ANALYTICS
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <KPICard title="Total Accounts" val={customers.length} color="#809BBF" icon={Users} />
        <KPICard title="Active Deals" val={customers.length} color="#3F6212" icon={Activity} />
        <KPICard title="MT Accounts" val="2" color="#3A3659" icon={Building2} />
        <KPICard title="Retail Accounts" val="1" color="#A66382" icon={User} />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-1 z-10">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
            {filterCategories.map(type => (
              <button key={type} onClick={() => {setCustomerTypeFilter(type); setCurrentPage(1);}} 
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${customerTypeFilter === type ? 'bg-midnight text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
                {type}
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${customerTypeFilter === type ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{type === 'All' ? customers.length : customers.filter(c => c.customerType === type).length}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-72">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} 
                placeholder="Search Name / ID / Contact..." 
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-luxuryGold bg-white transition-colors font-medium" 
              />
            </div>
            <button className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-white border border-slate-200 text-midnight hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
              <UploadCloud size={14} /> IMPORT
            </button>
            <button onClick={() => openModal()} className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-midnight text-white hover:bg-midnight/90 shadow-lg shadow-midnight/20 transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
              <Plus size={14} /> NEW CUSTOMER
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Company Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Phone</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Term</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-black text-luxuryGold">{cust.customerID}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-midnight uppercase">{cust.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{cust.taxID || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getTypeClass(cust.customerType)}`}>{cust.customerType}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">{cust.contactName}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{cust.phone}</td>
                  <td className="px-6 py-4 text-center font-mono text-xs font-black text-midnight">{cust.creditTerm}d</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => openModal(cust)} className="p-2 text-slate-400 hover:text-midnight transition-all"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Show</span>
            <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none">
              <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"><ChevronLeft size={16} /></button>
            <span className="text-[10px] font-black text-midnight px-4 py-2 bg-white border border-slate-200 rounded-xl uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Customer Modal */}
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
                className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-[8px] border-luxuryGold"
              >
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 modal-handle cursor-move">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-luxuryGold">
                      {modalReadOnly ? <Eye size={24} /> : (form.id ? <Pencil size={24} /> : <UserPlus size={24} />)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-midnight uppercase tracking-tight">
                        {modalReadOnly ? 'Customer Profile' : (form.id ? 'Edit Customer' : 'New Customer')}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">Code: {form.customerID || 'AUTO'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"><X size={24} /></button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                  <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-2 shrink-0">
                    {formTabs.map(tab => (
                      <button key={tab.id} onClick={() => setActiveFormTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left uppercase text-[10px] font-black tracking-widest ${activeFormTab === tab.id ? 'bg-midnight text-luxuryGold shadow-lg' : 'text-slate-400 hover:bg-white'}`}>
                        <tab.icon size={16} /> {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-vistawhite/30">
                    <div className="max-w-3xl mx-auto space-y-8">
                      {activeFormTab === 'general' && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Basic Information</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                              <input value={form.customerName || ''} onChange={e => setForm({...form, customerName: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-midnight focus:outline-none focus:border-luxuryGold" placeholder="e.g. HomePro PCL" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Type</label>
                              <select value={form.customerType || 'MT'} onChange={e => setForm({...form, customerType: e.target.value})} disabled={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold">
                                {customerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tax ID</label>
                              <input value={form.taxID || ''} onChange={e => setForm({...form, taxID: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                              <input value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                              <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeFormTab === 'address' && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Address Details</h4>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Billing Address</label>
                              <textarea value={form.billingAddress || ''} onChange={e => setForm({...form, billingAddress: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold min-h-[100px]" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Shipping Address</label>
                              <textarea value={form.shippingAddress || ''} onChange={e => setForm({...form, shippingAddress: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold min-h-[100px]" />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeFormTab === 'financial' && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Financial Settings</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Credit Term (Days)</label>
                              <input type="number" value={form.creditTerm || 0} onChange={e => setForm({...form, creditTerm: Number(e.target.value)})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Credit Limit (THB)</label>
                              <input type="number" value={form.creditLimit || 0} onChange={e => setForm({...form, creditLimit: Number(e.target.value)})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono" />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeFormTab === 'contact' && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Contact Person</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Name</label>
                              <input value={form.contactName || ''} onChange={e => setForm({...form, contactName: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Position</label>
                              <input value={form.contactPosition || ''} onChange={e => setForm({...form, contactPosition: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile</label>
                              <input value={form.mobile || ''} onChange={e => setForm({...form, mobile: e.target.value})} readOnly={modalReadOnly} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-midnight focus:outline-none focus:border-luxuryGold font-mono" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center shrink-0 rounded-b-2xl">
                  <div className="flex gap-2">
                    {modalReadOnly && (
                      <button onClick={deleteCustomer} className="px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 text-[10px] font-black rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest">
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="px-8 py-3 text-slate-400 hover:text-midnight text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                    {modalReadOnly ? (
                      <button onClick={() => setModalReadOnly(false)} className="px-12 py-3 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-widest">
                        <Pencil size={16} /> Edit Customer
                      </button>
                    ) : (
                      <button onClick={saveCustomer} disabled={!form.customerName} className="px-12 py-3 bg-midnight text-luxuryGold text-[10px] font-black rounded-2xl shadow-xl shadow-midnight/20 hover:bg-midnight/90 transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50">
                        <Save size={16} /> Save Record
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

export default CustomerManagement;
