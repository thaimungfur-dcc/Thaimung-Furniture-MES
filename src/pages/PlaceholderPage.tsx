import React from 'react';
import { motion } from 'motion/react';
import { Construction, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-12 shadow-grand border border-slate-100"
      >
        <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          This module is currently under development. 
          We are working hard to bring you the best experience.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
        >
          <ChevronLeft size={18} />
          Go Back
        </button>
      </motion.div>

      <div className="mt-12 grid grid-cols-3 gap-4 opacity-20 grayscale pointer-events-none">
        <div className="h-32 w-32 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-32 w-32 bg-slate-200 rounded-2xl animate-pulse delay-75" />
        <div className="h-32 w-32 bg-slate-200 rounded-2xl animate-pulse delay-150" />
      </div>
    </div>
  );
};

export default PlaceholderPage;
