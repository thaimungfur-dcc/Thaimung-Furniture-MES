import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { 
  UserCircle, 
  Lock, 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  ScanBarcode, 
  ShieldCheck,
  Factory,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Login: React.FC = () => {
  const { isAuthenticated, login, clientName, isLocked } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [idCard, setIdCard] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanMode, setIsScanMode] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isLocked) {
      setError('Account is locked due to too many failed attempts. Please contact Admin.');
    }
  }, [isLocked]);

  useEffect(() => {
    if (isScanMode && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [isScanMode]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!employeeId.trim() || !idCard.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await login(employeeId, idCard);
      if (response.status === 'success') {
        navigate(from, { replace: true });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Assuming barcode format is EMP-XXXX or similar
    if (value.length > 3) {
      setEmployeeId(value);
      setIsScanMode(false);
      // Auto focus password after scan
      const passInput = document.getElementById('idCard-input');
      if (passInput) passInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#58594D] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        <div className="grid grid-cols-8 gap-10 p-10">
          {Array.from({ length: 32 }).map((_, i) => (
            <Factory key={i} size={40} className="text-slate-900" />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10 overflow-hidden"
      >
        {/* Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-[#58594D] via-[#D4AF37] to-[#58594D]"></div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-[#58594D] rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-[#58594D]/20 rotate-3">
              <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-widest uppercase text-center">
              MES ACCESS CONTROL
            </h1>
            <div className="h-1 w-12 bg-[#D4AF37] mt-2 mb-3 rounded-full"></div>
            <p className="text-slate-500 text-xs font-medium text-center max-w-xs">
              Welcome to <span className="font-bold text-[#58594D]">{clientName}</span>. 
              Please verify your identity to access the factory floor.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Employee ID
                </label>
                <button 
                  type="button"
                  onClick={() => setIsScanMode(true)}
                  className="text-[10px] font-bold text-[#D4AF37] hover:text-[#B48F27] flex items-center gap-1 uppercase tracking-widest transition-colors"
                >
                  <ScanBarcode size={14} />
                  Scan Badge
                </button>
              </div>
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#D4AF37] transition-colors" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP-001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 font-mono placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                ID Card Number (Password)
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#D4AF37] transition-colors" />
                <input
                  id="idCard-input"
                  type={showPassword ? "text" : "password"}
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  placeholder="13-digit ID Number"
                  maxLength={13}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-12 text-slate-900 font-mono placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-xs font-bold"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-[#58594D] hover:bg-[#4A4B41] disabled:opacity-50 disabled:cursor-not-allowed text-[#D4AF37] font-black py-4 rounded-2xl shadow-xl shadow-[#58594D]/20 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Authorize Access
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-4 opacity-30 grayscale">
              <div className="h-[1px] w-12 bg-slate-300"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Thai Mungmee MES</span>
              <div className="h-[1px] w-12 bg-slate-300"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barcode Scan Overlay */}
      <AnimatePresence>
        {isScanMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#58594D]/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-md text-center space-y-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 border-4 border-[#D4AF37] rounded-3xl flex items-center justify-center animate-pulse">
                  <ScanBarcode size={64} className="text-[#D4AF37]" />
                </div>
                {/* Scanning Line */}
                <motion.div 
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-2 right-2 h-1 bg-[#D4AF37] shadow-[0_0_15px_#D4AF37] z-10"
                />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-widest uppercase">Ready to Scan</h2>
                <p className="text-slate-300 text-sm font-medium">Please scan your employee badge now</p>
              </div>

              <input
                ref={scanInputRef}
                type="text"
                className="opacity-0 absolute"
                onChange={handleBarcodeScan}
                onBlur={() => isScanMode && scanInputRef.current?.focus()}
                autoFocus
              />

              <button 
                onClick={() => setIsScanMode(false)}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors border border-white/10"
              >
                Cancel Scan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
