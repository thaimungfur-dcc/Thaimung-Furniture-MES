import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  widthClass?: string;
}

const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  widthClass = 'max-w-4xl'
}) => {
  const nodeRef = useRef(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none">
          <Draggable
            nodeRef={nodeRef}
            handle=".modal-handle"
          >
            <div ref={nodeRef} className="w-full pointer-events-auto flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 w-full ${widthClass}`}
              >
                {/* Modal Header - Draggable Area */}
                <div className="modal-handle bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between cursor-move">
                  <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {children}
                </div>
              </motion.div>
            </div>
          </Draggable>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DraggableModal;
