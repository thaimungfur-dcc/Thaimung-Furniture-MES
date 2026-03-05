import React, { useEffect, useState } from 'react';
import { AlertTriangle, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SecurityGuard: React.FC = () => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    // 1. Handle Visibility Change (Screen Capture / Tab Switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsBlurred(true);
      } else {
        // Optional: keep blurred for a bit or show warning
        // setIsBlurred(false);
      }
    };

    // 2. Handle Print Screen / Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen key (PrtScn) - Note: Browsers have limited support for detecting the actual key press
      if (e.key === 'PrintScreen') {
        triggerWarning("Screen capture detected. Content protected.");
        e.preventDefault();
      }

      // Common capture shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        triggerWarning("Printing is disabled for security reasons.");
        e.preventDefault();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        triggerWarning("Screen capture shortcut detected.");
      }
    };

    // 3. Handle Print Event
    const handleBeforePrint = () => {
      setIsBlurred(true);
      triggerWarning("Printing is strictly prohibited.");
    };

    const handleAfterPrint = () => {
      // Keep blurred or reset
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    // 4. Handle Window Blur (Focus lost)
    // Disabled because it blocks interaction in iframe/preview environments
    /*
    const handleWindowBlur = () => {
      setIsBlurred(true);
    };
    
    const handleWindowFocus = () => {
      setIsBlurred(false);
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    */

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      // window.removeEventListener('blur', handleWindowBlur);
      // window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const triggerWarning = (msg: string) => {
    setWarning(msg);
    setIsBlurred(true);
    setTimeout(() => setWarning(null), 5000);
  };

  return (
    <>
      {/* Global Blur Overlay - Disabled to prevent blocking interaction */}
      {/*
      <AnimatePresence>
        {isBlurred && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] backdrop-blur-3xl bg-slate-900/40 flex flex-col items-center justify-center text-white p-10 text-center select-none pointer-events-auto"
          >
            <EyeOff className="w-20 h-20 mb-6 text-emerald-400 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4">Security Protection Active</h2>
            <p className="text-slate-200 max-w-md text-lg">
              Content is hidden because the window lost focus or a screen capture attempt was detected. 
              Please return to the window to continue.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      */}

      {/* Floating Warning Toast */}
      <AnimatePresence>
        {warning && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10001] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-red-500"
          >
            <AlertTriangle className="w-6 h-6" />
            <span className="font-bold">{warning}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { display: none !important; }
        }
        
        /* Disable selection and context menu globally - Disabled for better interaction */
        /*
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        */
      `}} />
    </>
  );
};

export default SecurityGuard;
