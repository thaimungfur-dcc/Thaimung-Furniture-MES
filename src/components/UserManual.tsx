import React, { useState } from 'react';
import { HelpCircle, X, BookOpen, ChevronRight, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManualSection {
  title: string;
  content: string;
  icon: any;
}

const manualData: Record<string, ManualSection[]> = {
  '/': [
    { title: 'Dashboard Overview', content: 'View real-time production stats, recent orders, and system alerts.', icon: Info },
    { title: 'Quick Actions', content: 'Use the "Report NC" button to log quality issues immediately.', icon: Lightbulb },
  ],
  '/sales/catalogue': [
    { title: 'Product Management', content: 'Browse, search, and manage the furniture catalogue. Switch between Grid, List, and Dashboard views.', icon: BookOpen },
    { title: 'Adding Items', content: 'Click "ADD ITEM" to register new furniture. You can upload photos and define technical specs.', icon: Info },
  ],
  '/qc/spec': [
    { title: 'Inspection Standards', content: 'Define quality checkpoints for each production process (Welding, Bending, etc.).', icon: AlertTriangle },
    { title: 'Smart Zoom', content: 'Use the zoom tools to inspect technical drawings in high detail.', icon: Lightbulb },
  ],
  '/warehouse/booking': [
    { title: 'Stock Allocation', content: 'Manage product reservations for Sales Orders. Ensure stock is locked before picking.', icon: BookOpen },
    { title: 'Label Printing', content: 'Select items and click "Print Selected" to generate A6 or A4 barcode tags.', icon: Info },
  ],
  '/planning/mrp': [
    { title: 'Material Planning', content: 'Calculate raw material requirements based on active Job Orders and current stock.', icon: Info },
    { title: 'Shortage Handling', content: 'Items in red are below required levels. Click "PR" to request purchase.', icon: AlertTriangle },
  ],
  '/cost/bom': [
    { title: 'BOM Structure', content: 'Define multi-level Bill of Materials. Include Raw Materials, Parts, and WIP items.', icon: BookOpen },
    { title: 'Cost Analysis', content: 'The system automatically calculates the estimated standard cost based on component prices and scrap rates.', icon: Lightbulb },
  ],
};

const UserManual: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = window.location.pathname;
  const sections = manualData[currentPath] || manualData['/'];

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] bg-midnight text-white p-3 rounded-l-2xl shadow-2xl border border-white/10 hover:bg-fireopal transition-all group"
        title="User Manual"
      >
        <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-midnight/20 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[120] flex flex-col border-l border-slate-100"
            >
              <div className="p-6 bg-midnight text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fireopal/20 flex items-center justify-center text-fireopal">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-sm">User Manual</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Help & Documentation</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-fireopal uppercase tracking-widest">Current Page</p>
                  <h4 className="text-lg font-black text-midnight uppercase tracking-tight">{currentPath === '/' ? 'Dashboard' : currentPath.split('/').pop()?.replace('-', ' ')}</h4>
                </div>

                <div className="space-y-4">
                  {sections.map((section, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 group hover:border-fireopal/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-midnight">
                        <section.icon size={16} className="text-fireopal" />
                        <span className="text-xs font-black uppercase tracking-tight">{section.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {section.content}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="bg-fireopal/5 p-4 rounded-2xl border border-fireopal/10">
                    <div className="flex items-center gap-2 text-fireopal mb-2">
                      <Lightbulb size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Pro Tip</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                      Use the search bar at the top of most pages to quickly find specific items, orders, or documents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button className="w-full py-3 bg-midnight text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-midnight/90 transition-all shadow-lg shadow-midnight/10">
                  Full Documentation <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserManual;
