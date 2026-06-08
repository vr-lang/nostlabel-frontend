import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !product) return null;

  const firstSku = product.variants && product.variants[0] ? product.variants[0].sku : 'N/A';

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 select-none font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0D0D0D] border border-white/10 p-6 space-y-6 text-left shadow-2xl rounded-sm"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm shrink-0">
              <AlertTriangle size={14} />
            </div>
            <div>
              <span className="text-[8px] text-red-500 tracking-[0.2em] uppercase font-bold block">
                DANGER ZONE
              </span>
              <h4 className="text-white text-xs uppercase font-bold tracking-widest mt-0.5">
                Confirm Deletion
              </h4>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="p-1 hover:bg-white/5 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer disabled:opacity-20"
          >
            <X size={16} />
          </button>
        </div>

        {/* Product preview */}
        <div className="flex items-center space-x-4 bg-white/[0.01] border border-white/5 p-4 rounded-sm">
          <div className="w-12 h-16 bg-white/5 border border-white/10 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
            {product.images && product.images[0] ? (
              <img src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || '')} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-[6px] text-white/20 uppercase">No Img</div>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-[8px] text-white/30 uppercase tracking-widest block">Silhouette details</span>
            <span className="text-[10px] text-white font-bold block uppercase truncate max-w-[240px]">{product.name}</span>
            <span className="text-[9px] text-white/60 block uppercase">
              SKU: {firstSku}
            </span>
          </div>
        </div>

        {/* Warning text */}
        <div className="space-y-2 text-[9.5px] uppercase leading-relaxed text-red-400">
          <p className="font-bold">This action cannot be undone.</p>
          <p className="text-white/40">
            Deleting this product will permanently remove its record from the database and delete all associated image assets from Cloudinary.
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 text-[10px] uppercase tracking-widest font-bold pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xs transition-colors cursor-pointer disabled:opacity-20"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xs transition-all cursor-pointer disabled:opacity-30"
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmationModal;
