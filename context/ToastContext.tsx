import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={`
                                pointer-events-auto min-w-[300px] p-4 rounded-lg shadow-2xl border backdrop-blur-md flex items-center gap-3
                                ${toast.type === 'success' ? 'bg-green-900/80 border-green-500 text-green-100' :
                                    toast.type === 'error' ? 'bg-red-900/80 border-red-500 text-red-100' :
                                        'bg-gray-900/80 border-blue-500 text-blue-100'}
                            `}
                        >
                            <div className={`
                                w-2 h-2 rounded-full
                                ${toast.type === 'success' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' :
                                    toast.type === 'error' ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]' :
                                        'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]'}
                            `} />
                            <p className="text-sm font-medium">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-auto text-white/50 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
