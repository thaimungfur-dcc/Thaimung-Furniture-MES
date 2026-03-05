import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AspectModal: React.FC<AspectModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const nodeRef = useRef(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Draggable Modal */}
          <Draggable
            nodeRef={nodeRef}
            handle=".modal-header"
          >
            <div ref={nodeRef} className="w-full max-w-2xl pointer-events-auto flex justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full bg-[#F9F8F4] rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col"
              >
                {/* Header - Drag Handle */}
                <div className="modal-header h-12 bg-[#1A261C] flex items-center justify-between px-5 cursor-move select-none shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest">
                      {title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-slate-400 hover:text-white transition-colors">
                      <Minimize2 size={14} />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-white transition-colors">
                      <Maximize2 size={14} />
                    </button>
                    <div className="w-px h-3 bg-white/10 mx-1"></div>
                    <button 
                      onClick={onClose}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar max-h-[75vh]">
                  {children}
                </div>

                {/* Footer */}
                {footer !== undefined ? footer : (
                  <div className="px-6 py-3 bg-white/50 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                      onClick={onClose}
                      className="px-5 py-1.5 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      Close
                    </button>
                    <button 
                      className="px-6 py-1.5 bg-[#D4AF37] text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </Draggable>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AspectModal;
