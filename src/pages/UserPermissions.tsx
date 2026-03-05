import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Plus, 
  Settings2, 
  ChevronDown, 
  UserCog, 
  Image as ImageIcon, 
  Save, 
  Ban, 
  Eye, 
  Edit, 
  CheckSquare, 
  Award,
  XCircle,
  ShoppingCart,
  Package,
  Truck,
  ClipboardList,
  Factory,
  ShieldCheck,
  Wallet,
  Coins,
  FileJson,
  Database,
  CalendarDays,
  Settings,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';
import { dbService } from '../services/dbService';

interface PermissionLevel {
  level: number;
  label: string;
  icon: any;
  color: string;
  bg: string;
}

const PERMISSION_LEVELS: PermissionLevel[] = [
  { level: 0, label: 'No Access', icon: Ban, color: '#94A3B8', bg: '#F1F5F9' },
  { level: 1, label: 'Viewer', icon: Eye, color: '#3B82F6', bg: '#EFF6FF' },
  { level: 2, label: 'Editor', icon: Edit, color: '#F59E0B', bg: '#FFFBEB' },
  { level: 3, label: 'Verifier', icon: CheckSquare, color: '#8B5CF6', bg: '#F5F3FF' },
  { level: 4, label: 'Approver', icon: Award, color: '#10B981', bg: '#ECFDF5' },
];

interface Module {
  id: string;
  label: string;
  icon: any;
  isConfidential?: boolean;
  subItems?: { id: string; label: string; isConfidential?: boolean }[];
}

const SYSTEM_MODULES: Module[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  {
    id: 'sales', label: 'SALE', icon: ShoppingCart,
    subItems: [
      { id: 'catalogue', label: 'CATALOGUE' },
      { id: 'quotation', label: 'QUOTATION', isConfidential: true },
      { id: 'orders', label: 'ORDERS' },
      { id: 'analysis', label: 'SALE ANALYSIS', isConfidential: true },
      { id: 'customer', label: 'CUSTOMER' },
      { id: 'credit', label: 'CREDIT ANALYSIS', isConfidential: true },
      { id: 'cust_feedback', label: 'CUST FEEDBACK' },
      { id: 'csat', label: 'CSAT' },
      { id: 'sale_calendar', label: 'SALE CALENDAR' },
    ]
  },
  {
    id: 'warehouse', label: 'WAREHOUSE', icon: Package,
    subItems: [
      { id: 'transaction', label: 'TRANSACTION' },
      { id: 'inventory_planning', label: 'INVENTORY & PLANNING' },
      { id: 'inventory_lot', label: 'INVENTORY BY LOT' },
      { id: 'stock_card', label: 'STOCK CARD' },
      { id: 'logistics', label: 'LOGISTICS' },
      { id: 'return_goods', label: 'RETURN GOODS' },
      { id: 'wh_calendar', label: 'WH CALENDAR' },
    ]
  },
  {
    id: 'procurement', label: 'PROCUREMENT', icon: Truck,
    subItems: [
      { id: 'pr', label: 'PR' },
      { id: 'pq', label: 'PQ' },
      { id: 'po', label: 'PO', isConfidential: true },
      { id: 'purchase_history', label: 'PURCHASE HISTORY' },
      { id: 'supplier', label: 'SUPPLIER' },
      { id: 'materials', label: 'MATERIALS' },
      { id: 'debt', label: 'DEBT MANAGEMENT' },
      { id: 'scar', label: 'SCAR' },
    ]
  },
  {
    id: 'planning', label: 'PLANNING', icon: ClipboardList,
    subItems: [
      { id: 'job_planning', label: 'JOB PLANNING' },
      { id: 'mat_requirement', label: 'MAT. REQUIREMENT' },
      { id: 'prod_schedule', label: 'PRODUCTION SCHEDULE' },
    ]
  },
  {
    id: 'production', label: 'PRODUCTION', icon: Factory,
    subItems: [
      { id: 'prod_plan_tracking', label: 'PLAN TRACKING' },
      { id: 'prod_report', label: 'PRODUCTION REPORT' },
    ]
  },
  {
    id: 'qc', label: 'QUALITY CONTROL', icon: ShieldCheck,
    subItems: [
      { id: 'qc_spec', label: 'PRODUCT SPEC' },
      { id: 'qc_rm', label: 'RM INSPECTION' },
      { id: 'qc_wip', label: 'WIP INSPECTION' },
      { id: 'qc_fg', label: 'FG INSPECTION' },
      { id: 'nc_control', label: 'NC CONTROL' },
    ]
  },
  {
    id: 'financial', label: 'FINANCIAL', icon: Wallet, isConfidential: true,
    subItems: [
      { id: 'acc_cashflow', label: 'CASH FLOW', isConfidential: true },
      { id: 'acc_income', label: 'INCOME', isConfidential: true },
      { id: 'acc_expense', label: 'EXPENSE', isConfidential: true },
      { id: 'acc_summary', label: 'FINANCIAL SUMMARY', isConfidential: true },
    ]
  },
  {
    id: 'cost', label: 'COST CONTROL', icon: Coins, isConfidential: true,
    subItems: [
      { id: 'product_cost', label: 'PRODUCT COST', isConfidential: true },
      { id: 'cost_analysis', label: 'COST ANALYSIS', isConfidential: true },
    ]
  },
  {
    id: 'bom', label: 'BOM', icon: FileJson,
    subItems: [
      { id: 'product_bom', label: 'PRODUCT BOM' },
    ]
  },
  {
    id: 'master', label: 'CODE MASTER', icon: Database,
    subItems: [
      { id: 'code_master', label: 'CODE MASTER' },
      { id: 'item_master', label: 'ITEM MASTER' },
    ]
  },
  { id: 'mes_calendar', label: 'MES CALENDAR', icon: CalendarDays },
  {
    id: 'setting', label: 'SETTING', icon: Settings,
    subItems: [
      { id: 'user_permission', label: 'USER PERMISSIONS' },
      { id: 'system_config', label: 'SYSTEM CONFIG' }
    ]
  }
];

interface User {
  id: number;
  name: string;
  position: string;
  email: string;
  avatar: string;
  isDev?: boolean;
  permissions?: string; // JSON string from DB
}

const UserPermissions: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'step1' | 'step2'>('step1');
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({ name: '', position: '', email: '', avatar: '' });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
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
      const data = await dbService.getUserPermissions();
      if (data && data.length > 0) {
        setUsers(data.map(u => ({
          ...u,
          id: Number(u.id || u.userId)
        })));
      } else {
        // Default mock users if empty
        setUsers([
          { id: 1, name: 'Somchai Jaidee', position: 'Plant Manager', email: 'somchai@thaimungmee.com', avatar: 'https://i.pravatar.cc/150?img=11' },
          { id: 2, name: 'Suda Rakdee', position: 'Sales Head', email: 'suda@thaimungmee.com', avatar: 'https://i.pravatar.cc/150?img=5' },
          { id: 5, name: 'Admin System', position: 'System Admin', email: 'admin@thaimungmee.com', avatar: 'https://i.pravatar.cc/150?img=12' },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Step 1: Global Confidentiality Map
  const [confidentialityMap, setConfidentialityMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SYSTEM_MODULES.forEach(mod => {
      initial[mod.id] = mod.isConfidential || false;
      if (mod.subItems) {
        mod.subItems.forEach(sub => {
          initial[sub.id] = sub.isConfidential || mod.isConfidential || false;
        });
      }
    });
    return initial;
  });

  // Matrix Permissions: { userId: { moduleId: [levels] } }
  const [matrixPermissions, setMatrixPermissions] = useState<Record<number, Record<string, number[]>>>({});

  useEffect(() => {
    if (users.length > 0) {
      const initial: Record<number, Record<string, number[]>> = {};
      users.forEach(user => {
        if (user.permissions) {
          try {
            initial[user.id] = JSON.parse(user.permissions);
          } catch (e) {
            initial[user.id] = {};
          }
        } else {
          initial[user.id] = {};
          SYSTEM_MODULES.forEach(mod => {
            const isModConfidential = mod.isConfidential;
            const defaultLevels = user.isDev ? [1, 2, 3, 4] : (isModConfidential ? [] : [1]);
            initial[user.id][mod.id] = defaultLevels;
            if (mod.subItems) {
              mod.subItems.forEach(sub => {
                const isSubConfidential = sub.isConfidential || isModConfidential;
                initial[user.id][sub.id] = user.isDev ? [1, 2, 3, 4] : (isSubConfidential ? [] : [1]);
              });
            }
          });
        }
      });
      setMatrixPermissions(initial);
    }
  }, [users]);

  const [currentPermissions, setCurrentPermissions] = useState<Record<string, number[]>>({});

  const toggleConfidentiality = (id: string) => {
    setConfidentialityMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      position: user.position,
      email: user.email,
      avatar: user.avatar
    });
    setSelectedUserId(user.id);
    const userPerms = matrixPermissions[user.id] || {};
    setCurrentPermissions(userPerms);
    setModalStep(1);
    setIsEditModalOpen(true);
  };

  const handleNewUser = () => {
    setFormData({ name: '', position: '', email: '', avatar: '' });
    setSelectedUserId(null);
    
    // Default permissions for new user
    const defaultPerms: Record<string, number[]> = {};
    SYSTEM_MODULES.forEach(mod => {
      const isModConfidential = confidentialityMap[mod.id];
      defaultPerms[mod.id] = isModConfidential ? [] : [1];
      if (mod.subItems) {
        mod.subItems.forEach(sub => {
          const isSubConfidential = confidentialityMap[sub.id];
          defaultPerms[sub.id] = isSubConfidential ? [] : [1];
        });
      }
    });
    
    setCurrentPermissions(defaultPerms);
    setModalStep(1);
    setIsEditModalOpen(true);
  };

  const handlePermissionChange = (menuId: string, level: number) => {
    setCurrentPermissions(prev => {
      const currentLevels = prev[menuId] || [];
      let newLevels: number[];
      if (level === 0) {
        newLevels = [];
      } else {
        if (currentLevels.includes(level)) {
          newLevels = currentLevels.filter(l => l !== level);
        } else {
          newLevels = [...currentLevels, level].filter(l => l !== 0);
        }
      }
      return { ...prev, [menuId]: newLevels };
    });
  };

  const toggleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      Swal.fire('Error', 'Please fill in Name and Email', 'error');
      return;
    }
    const userId = selectedUserId || Date.now();
    const userData = {
      ...formData,
      userId: userId.toString(),
      id: userId.toString(),
      permissions: JSON.stringify(currentPermissions)
    };

    try {
      if (dbConnected) {
        await dbService.saveUserPermission(userData);
      }
      
      setMatrixPermissions(prev => ({
        ...prev,
        [userId]: currentPermissions
      }));

      if (!selectedUserId) {
        setUsers(prev => [...prev, { ...formData, id: userId, permissions: userData.permissions }]);
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...formData, permissions: userData.permissions } : u));
      }

      Swal.fire({
        title: 'Saved!',
        text: `Permissions updated for ${formData.name}`,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
      }).then(() => {
        setIsEditModalOpen(false);
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to save to database', 'error');
    }
  };

  const nodeRef = React.useRef(null);

  return (
    <div className="relative min-h-screen p-8 font-sans overflow-hidden w-full">
      {/* Decorative Background Blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-fireopal opacity-5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-midnight opacity-5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 w-full flex flex-col h-full animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-fireopal text-white shadow-lg shadow-fireopal/20">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-midnight tracking-tight uppercase">User Permissions</h1>
              <p className="text-[#64748B] text-xs font-black uppercase tracking-widest mt-1">Access Control & Authorization</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {/* Main Steps Tabs */}
            <div className="bg-midnight/10 p-1 rounded-xl shadow-lg flex gap-1">
              <button 
                onClick={() => setActiveTab('step1')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 tracking-widest ${activeTab === 'step1' ? 'bg-midnight text-white shadow-md' : 'text-midnight/60 hover:text-midnight'}`}
              >
                <Lock size={14} /> Step 1: Confidentiality
              </button>
              <button 
                onClick={() => setActiveTab('step2')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 tracking-widest ${activeTab === 'step2' ? 'bg-midnight text-white shadow-md' : 'text-midnight/60 hover:text-midnight'}`}
              >
                <UserCog size={14} /> Step 2: Operational Rights
              </button>
            </div>

            {activeTab === 'step2' && (
              <div className="bg-white/70 backdrop-blur-md p-1 rounded-xl border border-white/50 shadow-sm flex gap-1">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 tracking-widest ${viewMode === 'list' ? 'bg-midnight text-fireopal shadow-md' : 'text-[#64748B] hover:bg-white/50'}`}
                >
                  <Users size={14} /> User List
                </button>
                <button 
                  onClick={() => setViewMode('matrix')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 tracking-widest ${viewMode === 'matrix' ? 'bg-midnight text-fireopal shadow-md' : 'text-[#64748B] hover:bg-white/50'}`}
                >
                  <LayoutDashboard size={14} /> Summary Matrix
                </button>
                <button 
                  onClick={handleNewUser}
                  className="px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 bg-fireopal text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 ml-2 tracking-widest"
                >
                  <Plus size={14} /> Add User
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STEP 1: GLOBAL CONFIDENTIALITY */}
        {activeTab === 'step1' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-soft border border-white/50">
                <h3 className="text-lg font-black text-midnight mb-2 flex items-center gap-2 uppercase tracking-tight">
                  <Lock size={20} className="text-fireopal" />
                  Confidentiality Rules
                </h3>
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-700 font-black text-[10px] uppercase tracking-widest mb-1">
                      <Eye size={16} /> Public (No Lock)
                    </div>
                    <p className="text-xs text-green-600 leading-relaxed">
                      Every logged-in user will have <strong>Read Only</strong> access by default. Specific rights can be added in Step 2.
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 text-red-700 font-black text-[10px] uppercase tracking-widest mb-1">
                      <Lock size={16} /> Confidential (Locked)
                    </div>
                    <p className="text-xs text-red-600 leading-relaxed">
                      Only users explicitly assigned in <strong>Step 2</strong> will have access. Others will have <strong>No Access</strong>.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-midnight p-6 rounded-2xl shadow-xl text-white">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-fireopal mb-4">Quick Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Total Modules</span>
                    <span className="font-black">{SYSTEM_MODULES.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Confidential</span>
                    <span className="font-black text-fireopal">{Object.values(confidentialityMap).filter(v => v).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Public</span>
                    <span className="font-black text-emerald-400">{Object.values(confidentialityMap).filter(v => !v).length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl shadow-soft border border-white/50 overflow-hidden flex flex-col h-[70vh]">
              <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Module Configuration</h3>
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Toggle Lock to set Confidentiality</span>
              </div>
              <div className="overflow-y-auto custom-scrollbar p-6 space-y-4">
                {SYSTEM_MODULES.map(module => {
                  const isConfidential = confidentialityMap[module.id];
                  const hasSub = module.subItems && module.subItems.length > 0;
                  const isExpanded = expandedModules[module.id];

                  return (
                    <div key={module.id} className="space-y-2">
                      <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isConfidential ? 'bg-red-50/30 border-red-100' : 'bg-white border-gray-100 hover:border-[#D4AF37]/30'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${isConfidential ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            <module.icon size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
                              {module.label}
                              {hasSub && (
                                <button onClick={() => toggleExpand(module.id)} className="p-1 hover:bg-gray-200 rounded transition-colors">
                                  <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                            <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-tighter">
                              {isConfidential ? 'Restricted Access' : 'Public Access (Read Only for all)'}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleConfidentiality(module.id)}
                          className={`p-2 rounded-lg transition-all ${isConfidential ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                        >
                          {isConfidential ? <Lock size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {hasSub && isExpanded && (
                        <div className="ml-12 space-y-2 animate-slide-down">
                          {module.subItems?.map(sub => {
                            const subConfidential = confidentialityMap[sub.id];
                            return (
                              <div key={sub.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${subConfidential ? 'bg-red-50/20 border-red-50' : 'bg-white/50 border-gray-50'}`}>
                                <span className="text-xs font-bold text-[#64748B]">{sub.label}</span>
                                <button 
                                  onClick={() => toggleConfidentiality(sub.id)}
                                  className={`p-1.5 rounded transition-all ${subConfidential ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'}`}
                                >
                                  {subConfidential ? <Lock size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: USER PERMISSIONS */}
        {activeTab === 'step2' && (
          <>
            {/* LIST VIEW */}
            {viewMode === 'list' && (
          <div className="bg-white/70 backdrop-blur-md p-0 rounded-2xl shadow-soft border border-white/50 overflow-hidden flex flex-col h-full">
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="text-[11px] uppercase tracking-wider text-[#64748B] p-4 pl-6 font-bold bg-gray-50/95 border-b border-gray-200">User</th>
                    <th className="text-[11px] uppercase tracking-wider text-[#64748B] p-4 font-bold bg-gray-50/95 border-b border-gray-200">Position</th>
                    <th className="text-[11px] uppercase tracking-wider text-[#64748B] p-4 font-bold bg-gray-50/95 border-b border-gray-200">Email</th>
                    <th className="text-[11px] uppercase tracking-wider text-[#64748B] p-4 font-bold bg-gray-50/95 border-b border-gray-200 text-center">Role Type</th>
                    <th className="text-[11px] uppercase tracking-wider text-[#64748B] p-4 font-bold bg-gray-50/95 border-b border-gray-200 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                          <div>
                            <div className="font-bold text-[#0F172A]">{user.name}</div>
                            <div className="text-xs text-[#64748B] font-mono">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[#0F172A] font-medium">{user.position}</td>
                      <td className="p-4 font-mono text-xs">{user.email}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.isDev ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-gray-100 text-gray-500'}`}>
                          {user.isDev ? 'Developer' : 'Standard User'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all shadow-sm"
                        >
                          <Settings2 size={14} /> Permissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MATRIX VIEW */}
        {viewMode === 'matrix' && (
          <div className="bg-white/70 backdrop-blur-md p-0 rounded-2xl shadow-soft border border-white/50 overflow-hidden flex flex-col h-full">
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 min-w-[200px] text-[11px] uppercase tracking-wider text-[#64748B] p-4 font-bold bg-gray-50/95 border-b border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Module / User</th>
                    {users.map(user => (
                      <th key={user.id} className="text-center min-w-[100px] text-[11px] uppercase tracking-wider text-[#64748B] p-4 font-bold bg-gray-50/95 border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleEditUser(user)}>
                        <div className="flex flex-col items-center gap-2 group">
                          <img src={user.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-[#0F172A] whitespace-nowrap group-hover:text-[#D4AF37]">{user.name.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-600">
                  {SYSTEM_MODULES.map(module => {
                    const isExpanded = expandedModules[module.id];
                    const hasSub = module.subItems && module.subItems.length > 0;
                    return (
                      <React.Fragment key={module.id}>
                        <tr className="bg-gray-50/50 hover:bg-gray-100 transition-colors">
                          <td className="sticky left-0 z-10 bg-[#F9F8F4] p-3 font-bold text-[#0F172A] border-b border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)] cursor-pointer select-none" onClick={() => hasSub && toggleExpand(module.id)}>
                            <div className="flex items-center gap-2">
                              <module.icon size={14} className={confidentialityMap[module.id] ? "text-red-500" : "text-[#D4AF37]"} />
                              {module.label}
                              {confidentialityMap[module.id] && <Lock size={10} className="text-red-500" />}
                              {hasSub && <ChevronDown size={12} className={`ml-auto text-[#64748B] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                            </div>
                          </td>
                          {users.map(user => {
                            const levels = matrixPermissions[user.id]?.[module.id] || [];
                            return (
                              <td key={user.id} className="text-center border-b border-white p-2">
                                <div className="flex justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                                  {levels.map(lvl => {
                                    const pInfo = PERMISSION_LEVELS.find(p => p.level === lvl);
                                    if(!pInfo) return null;
                                    return <div key={lvl} className="inline-flex items-center justify-center w-6 h-6 rounded shadow-sm" style={{ backgroundColor: pInfo.bg }} title={pInfo.label}><pInfo.icon size={12} style={{color: pInfo.color}} /></div>;
                                  })}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        {hasSub && isExpanded && module.subItems?.map(sub => (
                          <tr key={sub.id} className="hover:bg-white transition-colors bg-white/50">
                            <td className="sticky left-0 z-10 bg-white p-3 pl-10 border-b border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center gap-2">
                              {sub.label}
                              {confidentialityMap[sub.id] && <Lock size={10} className="text-red-500" />}
                            </td>
                            {users.map(user => {
                              const levels = matrixPermissions[user.id]?.[sub.id] || [];
                              return (
                                <td key={user.id} className="text-center border-b border-gray-100 p-2">
                                  <div className="flex justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                                    {levels.map(lvl => {
                                      const pInfo = PERMISSION_LEVELS.find(p => p.level === lvl);
                                      if(!pInfo) return null;
                                      return <div key={lvl} className="inline-flex items-center justify-center w-6 h-6 rounded shadow-sm" style={{ backgroundColor: pInfo.bg }} title={pInfo.label}><pInfo.icon size={12} style={{color: pInfo.color}} /></div>;
                                    })}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    )}

        {/* EDIT MODAL */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm pointer-events-auto"
              />
              <Draggable nodeRef={nodeRef} handle=".modal-drag-handle">
                <div ref={nodeRef} className="relative w-full max-w-[1200px] h-[90vh] pointer-events-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full bg-[#F9F8F4] rounded-2xl shadow-grand border border-gray-200 overflow-hidden flex flex-col"
                  >
                  <div className="flex h-full">
                    {/* Left: User Form */}
                    <div className="w-1/3 bg-white border-r border-gray-200 p-4 flex flex-col overflow-y-auto custom-scrollbar">
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 modal-drag-handle cursor-move select-none">
                        <UserCog size={14} /> User Details
                      </h3>
                      
                      <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                          {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : <ImageIcon size={28} className="text-gray-300" />}
                        </div>
                      </div>

                      <div className="space-y-3 flex-1">
                        <div>
                          <label className="text-[9px] font-bold text-[#64748B] uppercase block mb-1">Image URL</label>
                          <input type="text" name="avatar" value={formData.avatar} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-1.5 text-xs border border-transparent focus:border-[#D4AF37] outline-none transition-all"/>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#64748B] uppercase block mb-1">Full Name</label>
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-1.5 text-xs border border-transparent focus:border-[#D4AF37] outline-none transition-all"/>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#64748B] uppercase block mb-1">Position</label>
                          <input type="text" name="position" value={formData.position} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-1.5 text-xs border border-transparent focus:border-[#D4AF37] outline-none transition-all"/>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#64748B] uppercase block mb-1">Email</label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#F9F8F4] rounded-lg px-3 py-1.5 text-xs border border-transparent focus:border-[#D4AF37] outline-none transition-all"/>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200 mt-3">
                        <button onClick={handleSave} className="w-full bg-[#0F172A] text-white py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2 shadow-lg">
                          <Save size={14} /> Save Changes
                        </button>
                        <button onClick={() => setIsEditModalOpen(false)} className="w-full mt-2 text-gray-400 text-[10px] font-bold uppercase hover:text-red-500 transition-colors">Cancel</button>
                      </div>
                    </div>

                    {/* Right: Permission Tree */}
                    <div className="w-2/3 p-4 flex flex-col overflow-hidden">
                      {/* Stepper Header */}
                      <div className="flex items-center gap-3 mb-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm modal-drag-handle cursor-move select-none">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${modalStep === 1 ? 'bg-[#0F172A] text-[#D4AF37] shadow-md' : 'text-gray-400'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${modalStep === 1 ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-gray-100 text-gray-400'}`}>1</div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Confidentiality</span>
                        </div>
                        <div className="h-px w-6 bg-gray-200"></div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${modalStep === 2 ? 'bg-[#0F172A] text-[#D4AF37] shadow-md' : 'text-gray-400'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${modalStep === 2 ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-gray-100 text-gray-400'}`}>2</div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Operational Rights</span>
                        </div>
                      </div>

                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3 shrink-0">
                      <div>
                        <h3 className="text-base font-bold text-[#0F172A]">
                          {modalStep === 1 ? 'Step 1: Visibility & Confidentiality' : 'Step 2: Operational Permissions'}
                        </h3>
                        <p className="text-[10px] text-[#64748B]">
                          {modalStep === 1 
                            ? 'Define which modules this user can see. Confidential modules are restricted by default.' 
                            : 'Define what actions this user can perform (Edit, Verify, Approve).'}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        {PERMISSION_LEVELS.filter(p => {
                          if (modalStep === 1) return p.level <= 1;
                          return p.level === 0 || p.level >= 2;
                        }).map(p => (
                          <div key={p.level} className="flex items-center gap-1 bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[9px] text-gray-500">
                            <p.icon size={8} style={{color: p.color}} /> {p.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-y-auto pr-1 space-y-2 custom-scrollbar flex-1">
                      {SYSTEM_MODULES.map((module) => {
                        const isExpanded = expandedModules[module.id];
                        const hasSub = module.subItems && module.subItems.length > 0;
                        const currentLevels = currentPermissions[module.id] || [];

                        return (
                          <div key={module.id} className={`bg-white rounded-xl border p-2 hover:shadow-sm transition-shadow ${module.isConfidential ? 'border-red-100' : 'border-white'}`}>
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center gap-2 ${hasSub ? 'cursor-pointer select-none' : ''}`} onClick={() => hasSub && toggleExpand(module.id)}>
                                <div className={`p-1.5 rounded-lg ${module.isConfidential ? 'bg-red-50 text-red-500' : 'bg-[#0F172A]/5 text-[#0F172A]'}`}>
                                  <module.icon size={16} />
                                </div>
                                <span className="font-bold text-[#0F172A] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                                  {module.label} 
                                  {module.isConfidential && <Lock size={10} className="text-red-500" />}
                                  {hasSub && <ChevronDown size={10} className={`text-[#64748B] transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>}
                                </span>
                              </div>
                              <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm gap-0.5">
                                {PERMISSION_LEVELS.filter(p => {
                                  if (modalStep === 1) return p.level <= 1;
                                  return p.level === 0 || p.level >= 2;
                                }).map((p) => {
                                  const isActive = p.level === 0 
                                    ? currentLevels.length === 0 || (modalStep === 2 && !currentLevels.some(l => l >= 2))
                                    : currentLevels.includes(p.level);

                                  return (
                                    <button
                                      key={p.level}
                                      onClick={() => handlePermissionChange(module.id, p.level)}
                                      className={`flex items-center justify-center w-6 h-6 rounded transition-all duration-200 relative group cursor-pointer
                                        ${isActive ? 'shadow-sm scale-105 z-10 ring-1 ring-black/5' : 'hover:bg-gray-50 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}
                                      `}
                                      style={{ backgroundColor: isActive ? p.bg : 'transparent' }}
                                      title={p.label}
                                    >
                                      <p.icon size={12} style={{color: isActive ? p.color : '#64748B'}} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            {hasSub && (
                              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                                <div className="pl-8 space-y-0.5 border-l border-gray-200 ml-3 py-0.5">
                                  {module.subItems?.map(sub => {
                                    const subLevels = currentPermissions[sub.id] || [];
                                    return (
                                      <div key={sub.id} className="flex items-center justify-between py-1 pl-3 pr-1 hover:bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-1.5">
                                          <div className={`w-1 h-1 rounded-full ${sub.isConfidential || module.isConfidential ? 'bg-red-500' : 'bg-[#D4AF37]'}`}></div>
                                          <span className="text-[10px] font-medium text-gray-600 flex items-center gap-1">
                                            {sub.label}
                                            {(sub.isConfidential || module.isConfidential) && <Lock size={8} className="text-red-500" />}
                                          </span>
                                        </div>
                                        <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm gap-0.5 scale-90 origin-right">
                                          {PERMISSION_LEVELS.filter(p => {
                                            if (modalStep === 1) return p.level <= 1;
                                            return p.level === 0 || p.level >= 2;
                                          }).map((p) => {
                                            const isActive = p.level === 0 
                                              ? subLevels.length === 0 || (modalStep === 2 && !subLevels.some(l => l >= 2))
                                              : subLevels.includes(p.level);

                                            return (
                                              <button
                                                key={p.level}
                                                onClick={() => handlePermissionChange(sub.id, p.level)}
                                                className={`flex items-center justify-center w-6 h-6 rounded transition-all duration-200 relative group cursor-pointer
                                                  ${isActive ? 'shadow-sm scale-105 z-10 ring-1 ring-black/5' : 'hover:bg-gray-50 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}
                                                `}
                                                style={{ backgroundColor: isActive ? p.bg : 'transparent' }}
                                                title={p.label}
                                              >
                                                <p.icon size={12} style={{color: isActive ? p.color : '#64748B'}} />
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step Navigation */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-3">
                      {modalStep === 2 ? (
                        <button 
                          onClick={() => setModalStep(1)}
                          className="px-5 py-1.5 rounded-xl text-[10px] font-bold uppercase text-[#0F172A] border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          Back to Step 1
                        </button>
                      ) : <div />}
                      
                      {modalStep === 1 ? (
                        <button 
                          onClick={() => setModalStep(2)}
                          className="px-6 py-1.5 bg-[#0F172A] text-[#D4AF37] rounded-xl text-[10px] font-bold uppercase shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          Next: Operational Rights
                        </button>
                      ) : (
                        <button 
                          onClick={handleSave}
                          className="px-6 py-1.5 bg-[#D4AF37] text-white rounded-xl text-[10px] font-bold uppercase shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          <Save size={12} /> Finalize & Save
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Draggable>
          </div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserPermissions;
