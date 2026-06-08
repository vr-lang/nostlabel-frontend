import React from 'react';
import { Package, RefreshCw, ShoppingCart, Info } from 'lucide-react';

interface ActivityLog {
  _id: string;
  product?: {
    name: string;
    images: string[];
  };
  variant: {
    size: string;
    color: string;
  };
  type: 'SALE' | 'RETURN' | 'MANUAL';
  quantity: number;
  createdBy?: {
    name: string;
  };
  createdAt: string;
}

interface InventoryActivityProps {
  activity: ActivityLog[];
  loading: boolean;
}

export const InventoryActivity: React.FC<InventoryActivityProps> = ({ activity = [], loading }) => {
  const getActivityIcon = (type: 'SALE' | 'RETURN' | 'MANUAL') => {
    switch (type) {
      case 'SALE':
        return <ShoppingCart size={11} className="text-accent-gold" />;
      case 'RETURN':
        return <RefreshCw size={11} className="text-green-400" />;
      default:
        return <Package size={11} className="text-white/60" />;
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-5 select-none hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
            Warehouse Ledger
          </span>
          <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
            Log Stream
          </h3>
        </div>
        <div className="p-2 bg-white/5 border border-white/5 text-white/50 rounded-sm">
          <Info size={15} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex space-x-3 items-start animate-pulse">
              <div className="w-5 h-5 bg-white/5 rounded-full" />
              <div className="space-y-1.5 flex-1"><div className="h-3.5 bg-white/5 rounded-xs w-full" /></div>
            </div>
          ))}
        </div>
      ) : activity.length === 0 ? (
        <div className="py-8 text-center text-white/30 text-[9.5px] uppercase tracking-widest border border-dashed border-white/5 rounded-sm">
          No inventory activity logged.
        </div>
      ) : (
        <div className="relative pl-4 border-l border-white/5 space-y-5 max-h-80 overflow-y-auto pr-1 dark-theme-scrollbar" data-lenis-prevent>
          {activity.map((log) => {
            const isNegative = log.quantity < 0;
            const logName = log.product?.name || 'Deleted silhouette';

            return (
              <div key={log._id} className="relative space-y-1 text-left text-[9.5px]">
                {/* Timeline connector dot */}
                <div className="absolute -left-[22.5px] top-1 w-4 h-4 bg-[#070707] border border-white/15 rounded-full flex items-center justify-center shrink-0">
                  {getActivityIcon(log.type)}
                </div>

                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-bold uppercase block tracking-wide truncate max-w-[200px]">
                    {logName}
                  </span>
                  <span className={`font-bold ${isNegative ? 'text-red-400' : 'text-green-400'} shrink-0`}>
                    {isNegative ? '' : '+'}{log.quantity}
                  </span>
                </div>

                <p className="text-white/40 uppercase text-[8.5px] leading-relaxed">
                  Variant Size {log.variant.size} / {log.variant.color} • Reason: {log.type} Adjustment
                </p>

                <div className="flex justify-between items-center text-[7.5px] text-white/30 tracking-wider">
                  <span>OPERATOR: {log.createdBy?.name || 'System Auto'}</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryActivity;
