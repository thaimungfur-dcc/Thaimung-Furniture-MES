import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, ChevronRight, BookOpen, MessageSquare, Phone, ExternalLink } from 'lucide-react';

const HelpSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const helpSections = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      items: [
        'Dashboard Overview',
        'Navigating the MES',
        'User Permissions Guide'
      ]
    },
    {
      title: 'Modules Help',
      icon: HelpCircle,
      items: [
        'Sales & Catalogue',
        'Warehouse Management',
        'Production Planning',
        'Quality Control'
      ]
    },
    {
      title: 'Support',
      icon: MessageSquare,
      items: [
        'Report a Bug',
        'Request Feature',
        'System Status'
      ]
    }
  ];

  return (
    <>
      {/* Help Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-midnight text-white p-3 rounded-l-2xl shadow-2xl hover:bg-fireopal transition-all group border-y border-l border-white/20"
      >
        <div className="flex flex-col items-center gap-2">
          <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[9px] font-black uppercase tracking-[0.3em] py-2">HELP CENTER</span>
        </div>
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col border-l border-slate-100"
            >
              {/* Header */}
              <div className="p-8 bg-midnight text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <HelpCircle size={120} />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">
                    USER <span className="text-fireopal">MANUAL</span>
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">Thai Mungmee MES Support</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white relative z-10"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {helpSections.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-midnight">
                        <section.icon size={16} />
                      </div>
                      <h3 className="text-[11px] font-black text-midnight uppercase tracking-widest">{section.title}</h3>
                    </div>
                    <div className="grid gap-2">
                      {section.items.map((item, i) => (
                        <button key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all group text-left">
                          <span className="text-[10px] font-black text-slate-500 group-hover:text-midnight uppercase tracking-widest">{item}</span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-fireopal transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Contact Support */}
                <div className="pt-8 border-t border-slate-100">
                  <div className="bg-fireopal/5 rounded-[2rem] p-6 border border-fireopal/10">
                    <h4 className="text-[11px] font-black text-fireopal uppercase tracking-widest mb-4">Need Urgent Help?</h4>
                    <div className="space-y-3">
                      <a href="tel:0825695654" className="flex items-center gap-4 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-lg bg-fireopal text-white flex items-center justify-center">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-midnight uppercase tracking-widest">Call Technical Support</p>
                          <p className="text-xs font-bold text-fireopal">082-5695654</p>
                        </div>
                      </a>
                      <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-midnight text-white text-[10px] font-black uppercase tracking-widest hover:bg-fireopal transition-all">
                        <ExternalLink size={14} /> Open Knowledge Base
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center gap-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Version 2.4.0-Stable | Build 2024.12
                </p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  © T ALL INTELLIGENCE CO., LTD.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpSidebar;
