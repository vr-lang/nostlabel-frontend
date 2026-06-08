import React from 'react';
import { AlertTriangle, PlusCircle } from 'lucide-react';

interface AlertItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  currentStock: number;
  recommendedRestockQuantity: number;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'OUT_OF_STOCK' | 'LOW_STOCK';
}

interface InventoryAlertsProps {
  alerts: AlertItem[];
  loading: boolean;
}

export const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ alerts = [], loading }) => {
  const getPriorityStyle = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return 'border-red-500/20 bg-red-500/5 text-red-500 font-bold animate-pulse';
      case 'MEDIUM':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-500 font-bold';
      default:
        return 'border-white/10 bg-white/5 text-white/50';
    }
  };

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-5 select-none hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
            Automated Auditing
          </span>
          <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
            Low Stock & Warnings Desk
          </h3>
        </div>
        <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm">
          <AlertTriangle size={15} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-8 text-center text-white/30 text-[9.5px] uppercase tracking-widest border border-dashed border-white/5 rounded-sm">
          All catalog products healthy. No restock alerts.
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 dark-theme-scrollbar" data-lenis-prevent>
          {alerts.map((alert) => {
            const priorityClass = getPriorityStyle(alert.priorityLevel);

            return (
              <div 
                key={alert.productId}
                className="border border-white/5 bg-white/[0.01] p-3 rounded-sm flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                    {alert.image ? (
                      <img src={alert.image} alt={alert.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[6px] text-white/20 uppercase">No Img</div>
                    )}
                  </div>
                  <div>
                    <span className="text-white block font-bold uppercase text-[10px] truncate max-w-[200px]">
                      {alert.name}
                    </span>
                    <span className="text-[8.5px] text-white/40 block">
                      CURRENT STOCK: {alert.currentStock} UNITS • {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="text-right">
                    <span className="text-[8px] text-white/30 block uppercase">RESTOCK SUGGESTION</span>
                    <span className="text-white font-bold text-[9.5px] flex items-center justify-end space-x-1">
                      <PlusCircle size={10} className="text-accent-gold" />
                      <span>+{alert.recommendedRestockQuantity} UNITS</span>
                    </span>
                  </div>
                  <span className={`px-2.5 py-1.5 border text-[7.5px] tracking-widest rounded-xs ${priorityClass}`}>
                    {alert.priorityLevel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
