import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../components/Button';

interface ModalContextType {
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modal, setModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setModal({ title, message, onConfirm });
    };

    const closeModal = () => {
        setModal(null);
    };

    const handleConfirm = () => {
        if (modal) {
            modal.onConfirm();
            closeModal();
        }
    };

    return (
        <ModalContext.Provider value={{ showConfirm, closeModal }}>
            {children}
            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#111] border border-cyan-500/30 p-8 rounded-xl max-w-sm w-full shadow-[0_0_30px_rgba(0,191,255,0.1)]"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">{modal.title}</h3>
                            <p className="text-gray-400 text-sm mb-6">{modal.message}</p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1 border-gray-700" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button variant="primary" className="flex-1" onClick={handleConfirm}>
                                    Confirm
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};
