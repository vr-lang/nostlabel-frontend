import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "CONFIRM DIRECTIVE",
  cancelText = "ABORT",
  isDestructive = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg-dark-1/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="relative bg-bg-cream-1 border border-text-dark/10 p-6 md:p-8 max-w-md w-full shadow-2xl rounded-sm text-left z-10 space-y-6 select-none font-mono"
          >
            {/* Header Accent */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-600' : 'bg-accent-gold/10 text-accent-gold'}`}>
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-dark">
                {title}
              </h3>
            </div>

            {/* Warning Message details */}
            <div className="space-y-2 text-[11px] leading-relaxed text-text-dark/70 uppercase">
              <p>{message}</p>
            </div>

            {/* Actions Grid */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer border ${
                  isDestructive
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                    : 'bg-text-dark text-white border-text-dark hover:bg-accent-gold hover:text-text-dark'
                }`}
              >
                {confirmText}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-transparent text-text-dark border border-text-dark/20 hover:border-text-dark py-3 text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
