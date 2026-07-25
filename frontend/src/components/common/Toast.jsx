import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let _id = 0;

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  }, []);

  const addToast = useCallback(({ message, type = 'success', duration = 4500 }) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type, leaving: false }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ addToast, dismiss }}>
      {children}
      {/* Portal-style overlay so toasts are always on top */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-[99999] flex flex-col-reverse gap-2.5 w-full max-w-[360px]"
        style={{ pointerEvents: 'none' }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ─── Config ───────────────────────────────────────────────────────────────────
const CONFIG = {
  success: {
    icon: CheckCircle2,
    bar:  'bg-emerald-500',
    bg:   'bg-white border-emerald-200',
    icon_cls: 'text-emerald-500',
    title_cls: 'text-emerald-700',
  },
  error: {
    icon: XCircle,
    bar:  'bg-red-500',
    bg:   'bg-white border-red-200',
    icon_cls: 'text-red-500',
    title_cls: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    bar:  'bg-amber-500',
    bg:   'bg-white border-amber-200',
    icon_cls: 'text-amber-500',
    title_cls: 'text-amber-700',
  },
  info: {
    icon: Info,
    bar:  'bg-blue-500',
    bg:   'bg-white border-blue-200',
    icon_cls: 'text-blue-500',
    title_cls: 'text-blue-700',
  },
};

// ─── Toast Item ───────────────────────────────────────────────────────────────
const ToastItem = ({ toast, onDismiss }) => {
  const cfg  = CONFIG[toast.type] || CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      role="alert"
      style={{
        pointerEvents: 'auto',
        animation: toast.leaving
          ? 'toastOut 0.3s ease-in forwards'
          : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
      className={`relative overflow-hidden rounded-2xl border shadow-xl shadow-black/10
        flex items-start gap-3 p-4 pr-10 ${cfg.bg}`}
    >
      {/* Colored left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${cfg.bar}`} />

      <div className={`flex-shrink-0 mt-0.5 ${cfg.icon_cls}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${cfg.title_cls} capitalize`}>{toast.type}</p>
        <p className="text-sm text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');

  return {
    success: (msg, opts) => ctx.addToast({ message: msg, type: 'success', ...opts }),
    error:   (msg, opts) => ctx.addToast({ message: msg, type: 'error',   ...opts }),
    warning: (msg, opts) => ctx.addToast({ message: msg, type: 'warning', ...opts }),
    info:    (msg, opts) => ctx.addToast({ message: msg, type: 'info',    ...opts }),
    dismiss: ctx.dismiss,
  };
};

export default ToastItem;
