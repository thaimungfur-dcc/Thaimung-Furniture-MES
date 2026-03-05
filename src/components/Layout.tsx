import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HelpSidebar from './HelpSidebar';
import Watermark from './Watermark';
import SecurityGuard from './SecurityGuard';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Bell, Menu, Database } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: false, configured: false });

  useEffect(() => {
    checkDb();
  }, []);

  const checkDb = async () => {
    try {
      const status = await dbService.getStatus();
      setDbStatus(status);
    } catch (e) {
      console.error("Failed to check DB status", e);
    }
  };

  return (
    <div className="flex h-screen bg-vistawhite text-slate-900 overflow-hidden font-sans relative">
      <SecurityGuard />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <HelpSidebar />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-hidden relative flex flex-col w-full">
        {/* Global Header */}
        <header className="h-20 lg:h-24 px-4 lg:px-8 flex items-center justify-between z-20 bg-vistawhite/80 backdrop-blur-md border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase truncate max-w-[150px] md:max-w-none">
                SAWASDEE, <span className="text-terracotta">{isAuthenticated && user ? user.name.split(' ')[0] : 'GUEST'}</span>
              </h1>
              <p className="text-[8px] lg:text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase mt-0.5 lg:mt-1 truncate">
                THAI MUNGMEE FURNITURE MES
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-5">
            <button className="relative p-2 lg:p-3 rounded-2xl bg-white hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm">
              <Bell size={16} className="text-slate-600" />
              <span className="absolute top-1.5 lg:top-2 right-2 lg:right-2.5 w-2 h-2 bg-pomegranate rounded-full border border-white"></span>
            </button>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${dbStatus.connected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              <Database size={12} className={dbStatus.connected ? 'animate-pulse' : ''} />
              <span className="hidden md:inline">{dbStatus.connected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <Watermark />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
          
          <footer className="mt-auto py-8 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center md:items-start gap-1">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                  THAI MUNGMEE FURNITURE MES
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  © 2024 ALL RIGHTS RESERVED
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="h-10 w-px bg-slate-100 hidden md:block" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-terracotta flex items-center justify-center text-white font-black text-sm shadow-lg shadow-terracotta/20">
                    TI
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Developed By</p>
                    <p className="text-xs font-bold text-terracotta">T All Intelligence</p>
                    <p className="text-[9px] text-slate-400 font-medium">Smart Solutions | 📞 082-5695654</p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Layout;
