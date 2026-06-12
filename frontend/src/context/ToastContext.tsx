"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
    confirm: (msg: string, onConfirm: () => void) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const triggerConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    info: (msg: string) => addToast(msg, "info"),
    warning: (msg: string) => addToast(msg, "warning"),
    confirm: (msg: string, onConfirm: () => void) => triggerConfirm(msg, onConfirm),
  }), [addToast, triggerConfirm]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Global Toast Notifications (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white/80 backdrop-blur-md border rounded-3xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              t.type === "success"
                ? "border-emerald-200/80 text-emerald-950 shadow-emerald-500/5"
                : t.type === "error"
                ? "border-red-200/80 text-red-950 shadow-red-500/5"
                : t.type === "warning"
                ? "border-amber-200/80 text-amber-950 shadow-amber-500/5"
                : "border-sky-200/80 text-sky-950 shadow-sky-500/5"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 animate-bounce" />}
            {t.type === "error" && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />}
            {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-foreground/40 hover:text-foreground/75 transition-colors p-0.5 rounded-lg hover:bg-black/5 flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Global Interactive Confirm Modal (Center) */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white border border-border-peach rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl flex flex-col gap-5 relative animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeConfirm}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center text-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-extrabold text-foreground font-serif">Konfirmasi Tindakan</h3>
                <p className="text-xs text-foreground/50 font-medium px-2 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-1">
              <button
                onClick={closeConfirm}
                className="flex-1 py-3 px-4 rounded-xl border border-border-peach text-xs font-bold text-foreground/70 hover:bg-background transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  closeConfirm();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/10 transition-colors cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
