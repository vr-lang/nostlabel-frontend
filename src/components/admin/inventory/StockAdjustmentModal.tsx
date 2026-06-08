import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface Variant {
  _id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface Product {
  _id: string;
  name: string;
  variants: Variant[];
}

interface StockAdjustmentModalProps {
  product: Product;
  variant: Variant;
  action: 'increase' | 'decrease' | 'transfer' | 'damaged';
  onClose: () => void;
  onSubmit: (quantity: number, reason: string, notes: string) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  variant,
  action,
  onClose,
  onSubmit
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('Restock');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const actionLabels = {
    increase: 'Increase Stock (Inflow)',
    decrease: 'Decrease Stock (Outflow)',
    transfer: 'Transfer Stock Location',
    damaged: 'Declare Damaged Goods'
  };

  const defaultReasons = {
    increase: ['Restock', 'Count Correction', 'Return Unopened'],
    decrease: ['Manual Draw', 'Count Correction', 'Promo Allocation'],
    transfer: ['Warehouse Transfer', 'Rack Migration'],
    damaged: ['Quality Issue', 'Courier Damaged', 'Shelf Wear']
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = Number(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }
    setLoading(true);
    try {
      // For damaged/decrease/transfer, the change is negative, but we pass positive quantity and handle it on the controller/action map
      await onSubmit(qtyVal, reason, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0D0D0D] border border-white/10 p-6 space-y-6 text-left shadow-2xl rounded-sm"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <span className="text-[8px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
              STOCK AUDIT ENTRY
            </span>
            <h4 className="text-white text-xs uppercase font-bold tracking-widest mt-0.5">
              {actionLabels[action]}
            </h4>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1 bg-white/[0.01] border border-white/5 p-3.5 rounded-sm">
          <span className="text-[8px] text-white/30 uppercase tracking-widest block">silhouette details</span>
          <span className="text-[10px] text-white font-bold block uppercase">{product.name}</span>
          <span className="text-[9px] text-white/60 block uppercase">
            SKU: {variant.sku} • Variant: Size {variant.size} / Color {variant.color}
          </span>
          <span className="text-[9px] text-white/40 block mt-1">
            CURRENT ONSITE COUNT: {variant.stock} UNITS
          </span>
        </div>

        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-[10px]">
          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label className="text-white/40 text-[9px] uppercase tracking-wider block font-bold">Adjust Quantity</label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 15"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold text-[10px]"
            />
          </div>

          {/* Reason Select */}
          <div className="space-y-1.5">
            <label className="text-white/40 text-[9px] uppercase tracking-wider block font-bold">Reason Code</label>
            <div className="relative border border-white/10 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-transparent p-2.5 appearance-none text-white focus:outline-none uppercase font-bold tracking-wider cursor-pointer"
              >
                {defaultReasons[action].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Other">Other (Audit logs)</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-white/40 border-l border-white/5 pl-2">
                ▼
              </div>
            </div>
          </div>

          {/* Notes Text Area */}
          <div className="space-y-1.5">
            <label className="text-white/40 text-[9px] uppercase tracking-wider block font-bold">Operational Notes</label>
            <textarea
              rows={3}
              placeholder="Add audit description or courier reference logs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold text-[9.5px]"
            />
          </div>

          {action === 'damaged' && (
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xs flex items-start space-x-2 text-[9px] text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>WARNING: Declaring stock damaged will immediately deduct these units from the active online store catalog inventory.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 text-[10px] uppercase tracking-widest font-bold pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-accent-gold text-text-dark rounded-xs hover:bg-accent-gold/90 transition-all cursor-pointer disabled:opacity-30"
            >
              {loading ? 'Submitting...' : 'Commit Adjust'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StockAdjustmentModal;
