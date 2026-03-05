import React, { useState, useEffect } from 'react';
import { CalendarRange, Filter, Plus, Search } from 'lucide-react';
import { dbService } from '../services/dbService';
import AspectModal from '../components/AspectModal';
import Swal from 'sweetalert2';

interface Plan {
  id: string;
  planId: string;
  product: string;
  quantity: string;
  dueDate: string;
  status: string;
}

const Planning: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [form, setForm] = useState({ product: '', quantity: '', dueDate: '' });

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
      const data = await dbService.getPlanning();
      if (data && data.length > 0) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleSave = async () => {
    if (!form.product || !form.quantity || !form.dueDate) {
      Swal.fire('Error', 'Please fill in all fields', 'error');
      return;
    }

    const newPlan = {
      planId: `PLN-${Date.now().toString().slice(-6)}`,
      product: form.product,
      quantity: form.quantity,
      dueDate: form.dueDate,
      status: 'Scheduled',
      id: Date.now().toString()
    };

    try {
      if (dbConnected) {
        await dbService.savePlanning(newPlan);
      }
      setPlans(prev => [newPlan, ...prev]);
      setShowModal(false);
      setForm({ product: '', quantity: '', dueDate: '' });
      Swal.fire({ icon: 'success', title: 'Plan Created', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', 'Failed to save to database', 'error');
    }
  };

  return (
    <div className="p-8 space-y-8 w-full bg-vistawhite">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-white">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-midnight uppercase tracking-tight">Production Planning</h1>
            <p className="text-slate-500 text-sm">Manage and schedule production orders.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-fireopal hover:bg-fireopal/90 text-white font-black rounded-xl shadow-lg shadow-fireopal/20 transition-all uppercase tracking-widest text-[10px]"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search plans..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-xs focus:outline-none focus:border-fireopal transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {plans.length > 0 ? plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono font-black text-fireopal">{plan.planId}</td>
                  <td className="px-6 py-4 text-xs font-black text-midnight uppercase tracking-tight">{plan.product}</td>
                  <td className="px-6 py-4 text-xs font-black text-midnight">{plan.quantity} units</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{plan.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                      {plan.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No plans found. Create a new plan to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AspectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Production Plan"
        footer={
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-midnight text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-midnight/20 hover:shadow-xl transition-all">Create Plan</button>
          </div>
        }
      >
        <div className="space-y-4 p-2">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Product Name</label>
            <input 
              type="text" 
              value={form.product}
              onChange={(e) => setForm({...form, product: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fireopal transition-colors"
              placeholder="e.g. Dining Table Model A"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Quantity</label>
              <input 
                type="number" 
                value={form.quantity}
                onChange={(e) => setForm({...form, quantity: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fireopal transition-colors"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Due Date</label>
              <input 
                type="date" 
                value={form.dueDate}
                onChange={(e) => setForm({...form, dueDate: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fireopal transition-colors"
              />
            </div>
          </div>
        </div>
      </AspectModal>
    </div>
  );
};

export default Planning;
