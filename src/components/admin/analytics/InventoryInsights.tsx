import React, { useEffect, useState } from 'react';
import { Loader2, Package, AlertTriangle, XCircle, DollarSign, Bell } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface InventoryStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
}

export const InventoryInsights: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/inventory/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm min-h-[140px] flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Compiling catalog indexes...</span>
      </div>
    );
  }

  // Calculate percentages for progress bars
  const total = stats?.totalProducts || 1;
  const lowStockPct = Math.round(((stats?.lowStock || 0) / total) * 100);
  const outOfStockPct = Math.round(((stats?.outOfStock || 0) / total) * 100);

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 hover:border-white/10 transition-colors select-none text-left font-mono relative">
      <div className="border-b border-white/5 pb-3">
        <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
          Asset Integrity
        </span>
        <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
          Inventory Insights
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Products */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-white/40 text-[9px]">
            <span>TOTAL Blueprints</span>
            <Package size={11} />
          </div>
          <div className="text-xl font-bold text-white">
            {stats?.totalProducts}
          </div>
          <div className="text-[8px] text-white/30 uppercase">Active designs in system</div>
        </div>

        {/* Inventory Value */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-white/40 text-[9px]">
            <span>TOTAL VALUE</span>
            <DollarSign size={11} className="text-accent-gold" />
          </div>
          <div className="text-xl font-bold text-accent-gold">
            ₹{stats?.inventoryValue.toLocaleString()}
          </div>
          <div className="text-[8px] text-white/30 uppercase">Gross asset valuation</div>
        </div>

        {/* Low Stock Warning */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-white/40 text-[9px]">
            <span>LOW STOCK</span>
            <AlertTriangle size={11} className="text-yellow-500" />
          </div>
          <div className="text-xl font-bold text-white flex items-baseline space-x-1.5">
            <span>{stats?.lowStock}</span>
            <span className="text-[8px] text-white/30 font-normal">({lowStockPct}%)</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${lowStockPct}%` }} />
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-white/40 text-[9px]">
            <span>OUT OF STOCK</span>
            <XCircle size={11} className="text-red-500" />
          </div>
          <div className="text-xl font-bold text-white flex items-baseline space-x-1.5">
            <span>{stats?.outOfStock}</span>
            <span className="text-[8px] text-white/30 font-normal">({outOfStockPct}%)</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${outOfStockPct}%` }} />
          </div>
        </div>

      </div>

      {/* Restock directives indicator block */}
      <div className="bg-white/[0.01] border border-white/5 rounded-sm p-4 flex items-center space-x-4">
        <Bell size={15} className="text-accent-gold animate-pulse shrink-0" />
        <div className="text-[9px] uppercase tracking-wide text-white/60">
          {stats?.lowStock && stats.lowStock > 0 ? (
            <span>Operational Alert: <span className="text-accent-gold font-bold">{stats.lowStock} products</span> require restocking to maintain order fulfillment thresholds.</span>
          ) : (
            <span>All inventory thresholds healthy. No restock alerts pending.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryInsights;
