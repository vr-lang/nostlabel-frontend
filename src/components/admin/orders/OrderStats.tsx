import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Box, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../services/authService';

// Reusable animated counter
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1200; // ms
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      setCount(start + (end - start) * ease);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value]);

  return <span>{Math.round(count).toLocaleString()}</span>;
};

interface StatsData {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
}

export const OrderStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/orders/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err.message || 'Stats sync failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardConfig = [
    { 
      id: 'pending', 
      label: 'Pending Orders', 
      value: stats?.pending ?? 0, 
      desc: 'Awaiting Director review', 
      icon: <FileText size={16} className="text-yellow-500" />,
      bg: 'border-yellow-500/10 hover:border-yellow-500/20'
    },
    { 
      id: 'processing', 
      label: 'Processing Orders', 
      value: stats?.processing ?? 0, 
      desc: 'Silhouettes in tailoring', 
      icon: <Box size={16} className="text-blue-500" />,
      bg: 'border-blue-500/10 hover:border-blue-500/20'
    },
    { 
      id: 'shipped', 
      label: 'Shipped Orders', 
      value: stats?.shipped ?? 0, 
      desc: 'Packages in logistics network', 
      icon: <Truck size={16} className="text-purple-500" />,
      bg: 'border-purple-500/10 hover:border-purple-500/20'
    },
    { 
      id: 'delivered', 
      label: 'Delivered Orders', 
      value: stats?.delivered ?? 0, 
      desc: 'Successfully dispatched to client', 
      icon: <CheckCircle size={16} className="text-green-500" />,
      bg: 'border-green-500/10 hover:border-green-500/20'
    }
  ];

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-4 text-left font-mono rounded-sm flex items-center space-x-3 text-red-500">
        <AlertCircle size={16} />
        <span className="text-[10px] tracking-widest uppercase font-bold">Failed to load statistics stream: {error}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-mono">
      {cardConfig.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          className={`bg-[#070707] border p-6 rounded-sm space-y-4 transition-all duration-300 relative group ${card.bg}`}
        >
          {/* Top layout */}
          <div className="flex justify-between items-center">
            <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-bold">
              {card.label}
            </span>
            <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xs">
              {card.icon}
            </div>
          </div>

          {/* Number and Subtext */}
          <div className="space-y-1">
            {loading ? (
              <div className="h-9 w-24 bg-white/5 animate-pulse rounded-xs" />
            ) : (
              <h3 className="text-3xl font-bold text-accent-gold tracking-tight group-hover:text-white transition-colors duration-500">
                <AnimatedCounter value={card.value} />
              </h3>
            )}
            <span className="text-[9px] text-white/40 tracking-wider font-light uppercase block">
              {card.desc}
            </span>
          </div>

          {/* Luxury corner marks */}
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/10 group-hover:border-white/20 transition-colors" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/10 group-hover:border-white/20 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
};

export default OrderStats;
