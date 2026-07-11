"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-full border shadow-2xl backdrop-blur-md ${
                toast.type === "success" 
                  ? "bg-mf-success/10 border-mf-success text-white" 
                  : toast.type === "error"
                  ? "bg-mf-danger/10 border-mf-danger text-white"
                  : "bg-mf-obsidian/85 border-mf-gold/40 text-white"
              }`}
            >
              {toast.type === "success" && <div className="w-6 h-6 rounded-full bg-mf-success flex items-center justify-center text-black"><Check size={14} /></div>}
              {toast.type === "error" && <div className="w-6 h-6 rounded-full bg-mf-danger flex items-center justify-center text-white"><AlertTriangle size={14} /></div>}
              {toast.type === "info" && <div className="w-6 h-6 rounded-full bg-gradient-to-b from-mf-gold-hi to-mf-gold-deep flex items-center justify-center text-black"><Check size={14} /></div>}
              
              <span className="font-mono text-xs tracking-wide">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
