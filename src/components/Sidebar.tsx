import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  ShoppingCart,
  Container,
  Truck,
  CalendarRange, 
  Factory, 
  ClipboardCheck,
  Wallet,
  BadgeDollarSign,
  Database,
  CalendarDays,
  Settings, 
  LogOut, 
  UserCircle,
  ChevronDown,
  Armchair,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (id: string) => {
    if (isCollapsed) return;
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems = [
    { id: 'dashboard', name: 'Home', path: '/', icon: HomeIcon },
    {
      id: 'sales', name: 'Sale', icon: ShoppingCart,
      subItems: [
        { id: 'catalogue', name: 'Catalogue', path: '/sales/catalogue' },
        { id: 'orders', name: 'Orders', path: '/sales/orders' },
        { id: 'analysis', name: 'Sale Analysis', path: '/sales/analysis' },
        { id: 'customer', name: 'Customer', path: '/sales/customer' },
        { id: 'sale_calendar', name: 'Sale Calendar', path: '/sales/calendar' },
      ]
    },
    {
      id: 'warehouse', name: 'Warehouse', icon: Container, 
      subItems: [
        { id: 'outbound', name: 'Warehouse Out', path: '/warehouse/outbound' },
        { id: 'inbound', name: 'Warehouse In', path: '/warehouse/inbound' },
        { id: 'FG_analytics', name: 'FG Transaction Analytics', path: '/warehouse/fg-analytics' },
        { id: 'RM_analytics', name: 'RM Transaction Analytics', path: '/warehouse/rm-analytics' },
        { id: 'wh_booking', name: 'Warehouse Booking', path: '/warehouse/booking' },
        { id: 'inventory_planning', name: 'Inventory & Planning', path: '/warehouse/planning' },
        { id: 'stock_card', name: 'Stock Card', path: '/warehouse/stock-card' },
        { id: 'logistics', name: 'Logistics', path: '/warehouse/logistics' },
        { id: 'return_goods', name: 'Return Goods', path: '/warehouse/returns' },
        { id: 'wh_calendar', name: 'WH Calendar', path: '/warehouse/calendar' },
      ]
    },
    {
      id: 'procurement', name: 'Procurement', icon: Truck,
      subItems: [
        { id: 'pr', name: 'PR', path: '/procurement/pr' },
        { id: 'po', name: 'PO', path: '/procurement/po' },
        { id: 'pr_analysis', name: 'PR Analysis', path: '/procurement/pr-analysis' },
        { id: 'po_analysis', name: 'PO Analysis', path: '/procurement/po-analysis' },
        { id: 'purchase_history', name: 'Purchase History', path: '/procurement/history' },
        { id: 'supplier', name: 'Supplier', path: '/procurement/supplier' },
        { id: 'debt', name: 'Debt Management', path: '/procurement/debt' },
      ]
    },
    {
      id: 'planning', name: 'Planning', icon: CalendarRange,
      subItems: [
        { id: 'job_planning', name: 'Job Planning', path: '/planning' },
        { id: 'mrp', name: 'Material Requirement Plan', path: '/planning/mrp' },
        { id: 'mat_requirement', name: 'Mat. Requirement', path: '/planning/mat-requirement' },
        { id: 'prod_schedule', name: 'Production Schedule', path: '/planning/schedule' },
      ]
    },
    {
      id: 'production', name: 'Production', icon: Factory,
      subItems: [
        { id: 'prod_tracking', name: 'Production Tracking', path: '/production' },
        { id: 'prod_report', name: 'Production Report', path: '/production/report' },
      ]
    },
    {
      id: 'qc', name: 'Quality Control', icon: ClipboardCheck, 
      subItems: [
        { id: 'product_spec', name: 'Inspection Standards', path: '/qc/spec' },
        { id: 'nc_control', name: 'NC Control', path: '/qc/nc-control' },
      ]
    },
    {
      id: 'finance', name: 'Financial', icon: Wallet, 
      subItems: [
        { id: 'cash_flow', name: 'Cash Flow', path: '/finance/cash-flow' },
        { id: 'income', name: 'Income', path: '/finance/income' },
        { id: 'expense', name: 'Expense', path: '/finance/expense' },
        { id: 'financial_summary', name: 'Financial Summary', path: '/finance/summary' },
      ]
    },
    {
      id: 'cost', name: 'Cost Control', icon: BadgeDollarSign,
      subItems: [
        { id: 'product_cost', name: 'Product Cost', path: '/cost/product-cost' },
        { id: 'cost_analysis', name: 'Cost Analysis', path: '/cost/analysis' },
        { id: 'product_bom', name: 'Recipe BOM', path: '/cost/bom' },
      ]
    },
    {
      id: 'master', name: 'Code Master', icon: Database,
      subItems: [
        { id: 'code_master', name: 'Code Master', path: '/master/codes' },
        { id: 'item_master', name: 'Item Master', path: '/master/items' },
        { id: 'fabric_design', name: 'Fabric Design', path: '/master/fabric-design' },
      ]
    },
    { id: 'mes_calendar', name: 'MES Calendar', path: '/calendar', icon: CalendarDays },
    {
      id: 'setting', name: 'Setting', icon: Settings,
      subItems: [
        { id: 'user_permission', name: 'User Permissions', path: '/settings/permissions' },
      ]
    }
  ];

  return (
    <div className={cn(
      "fixed lg:relative inset-y-0 left-0 bg-portgore text-white h-screen flex flex-col shadow-2xl z-40 lg:z-30 transition-all duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Collapse Toggle Button (Desktop) */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-terracotta rounded-full items-center justify-center text-white shadow-lg z-50 hover:scale-110 transition-transform border-2 border-portgore"
      >
        <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isCollapsed ? "-rotate-90" : "rotate-90")} />
      </button>

      <div className={cn(
        "flex flex-col items-center justify-center border-b border-white/5 bg-portgore/50 relative transition-all duration-300",
        isCollapsed ? "h-24" : "h-32"
      )}>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>

        <div className={cn("flex items-center transition-all duration-300", isCollapsed ? "flex-col gap-1" : "gap-3")}>
          <div className={cn(
            "rounded-xl bg-gradient-to-br from-terracotta to-pomegranate flex items-center justify-center shadow-lg border border-white/20 transition-all duration-300",
            isCollapsed ? "w-10 h-10" : "w-12 h-12"
          )}>
            <Armchair size={isCollapsed ? 20 : 26} className="text-white" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-center animate-fade-in">
              <h1 className="text-white font-black text-xl tracking-widest whitespace-nowrap">
                <span className="font-normal">THAI</span>
                <span className="text-terracotta ml-1.5">MUNGMEE</span>
              </h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.55em] text-center whitespace-nowrap mt-1">Furniture MES</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleMenu(item.id)}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "w-full flex items-center rounded-xl transition-all duration-300 group hover:bg-white/5",
                    isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                    expandedMenus[item.id] ? "text-terracotta" : "text-slate-400"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-colors shrink-0", expandedMenus[item.id] ? "text-terracotta" : "group-hover:text-terracotta")} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm flex-1 text-left whitespace-nowrap overflow-hidden">{item.name}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", expandedMenus[item.id] && "rotate-180")} />
                    </>
                  )}
                </button>
                {!isCollapsed && (
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out pl-11 space-y-1",
                    expandedMenus[item.id] ? "max-h-[500px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
                  )}>
                    {item.subItems.map(sub => (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2 py-2 text-xs font-medium transition-colors",
                          isActive ? "text-terracotta font-bold" : "text-slate-500 hover:text-white"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <span className={cn("w-1.5 h-1.5 rounded-full transition-all", isActive ? "bg-terracotta shadow-[0_0_8px_#DE8650]" : "bg-slate-700")} />
                            {sub.name}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) => cn(
                  "flex items-center rounded-xl transition-all duration-300 group",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                  isActive 
                    ? "bg-terracotta text-white shadow-lg shadow-terracotta/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-5 h-5 transition-colors shrink-0", isActive ? "text-white" : "group-hover:text-terracotta")} />
                    {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{item.name}</span>}
                  </>
                )}
              </NavLink>
            )}
          </div>
        ))}
      </div>

      <div className={cn("p-6 border-t border-white/5 bg-portgore/50 transition-all duration-300", isCollapsed ? "px-4" : "p-6")}>
        {isAuthenticated && user ? (
          <div className="space-y-4">
            <button 
              onClick={logout}
              title={isCollapsed ? "Logout" : undefined}
              className={cn(
                "w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 rounded-xl transition-all text-sm font-bold border border-white/5",
                isCollapsed ? "p-3" : "py-3 px-4"
              )}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!isCollapsed && (
              <div className="px-4 py-3 bg-slate-800/50 rounded-2xl text-center border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">GUEST MODE</p>
              </div>
            )}
            <NavLink 
              to="/login"
              title={isCollapsed ? "Login" : undefined}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={cn(
                "w-full flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-terracotta/20",
                isCollapsed ? "p-3" : "py-3 px-4"
              )}
            >
              <UserCircle className="w-4 h-4" />
              {!isCollapsed && <span>Login</span>}
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
