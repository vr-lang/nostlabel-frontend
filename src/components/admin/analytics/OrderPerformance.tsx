import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Clock, Eye, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export const OrderPerformance: React.FC = () => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/orders/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load order stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm min-h-[120px] flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Compiling fulfillment states...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Pending Orders', count: stats?.pending ?? 0, icon: <Clock size={14} className="text-yellow-500" /> },
    { label: 'Processing Orders', count: stats?.processing ?? 0, icon: <Eye size={14} className="text-blue-400" /> },
    { label: 'Shipped Orders', count: stats?.shipped ?? 0, icon: <Truck size={14} className="text-accent-gold" /> },
    { label: 'Delivered Orders', count: stats?.delivered ?? 0, icon: <CheckCircle2 size={14} className="text-green-500" /> },
    { label: 'Cancelled Orders', count: stats?.cancelled ?? 0, icon: <XCircle size={14} className="text-red-500" /> }
  ];

  return (
    <div className="space-y-4 font-mono select-none text-left">
      <div className="border-b border-white/5 pb-3">
        <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
          Logistics Performance
        </span>
        <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
          Order Fulfillment states
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c, idx) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-[#070707] border border-white/5 p-5 rounded-sm hover:border-white/15 transition-all relative group"
          >
            <div className="flex justify-between items-center text-white/30 mb-2">
              <span className="text-[8.5px] uppercase font-bold tracking-wider leading-tight max-w-[80px]">
                {c.label}
              </span>
              <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xs">
                {c.icon}
              </div>
            </div>

            <div className="text-xl font-bold text-white tracking-tight mt-1">
              {c.count}
            </div>

            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white/10 group-hover:border-white/25 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrderPerformance;
