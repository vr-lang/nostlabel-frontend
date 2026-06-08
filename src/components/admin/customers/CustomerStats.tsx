import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserPlus, Award, AlertCircle } from 'lucide-react';
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
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  vipCustomers: number;
}

export const CustomerStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/customers/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load customer stats:', err);
      setError(err.message || 'Stats stream offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardConfig = [
    {
      id: 'total',
      label: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      desc: 'All registered client profiles',
      icon: <Users size={16} className="text-white/70" />,
      bg: 'border-white/5 hover:border-white/15'
    },
    {
      id: 'active',
      label: 'Active Customers',
      value: stats?.activeCustomers ?? 0,
      desc: 'Unblocked active relationships',
      icon: <UserCheck size={16} className="text-green-500" />,
      bg: 'border-green-500/10 hover:border-green-500/20'
    },
    {
      id: 'new',
      label: 'New Customers',
      value: stats?.newCustomers ?? 0,
      desc: 'Joined within last 30 days',
      icon: <UserPlus size={16} className="text-blue-500" />,
      bg: 'border-blue-500/10 hover:border-blue-500/20'
    },
    {
      id: 'vip',
      label: 'VIP Customers',
      value: stats?.vipCustomers ?? 0,
      desc: 'Lifetime spend exceeds ₹10,000',
      icon: <Award size={16} className="text-accent-gold" />,
      bg: 'border-accent-gold/10 hover:border-accent-gold/25'
    }
  ];

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-4 text-left font-mono rounded-sm flex items-center space-x-3 text-red-500">
        <AlertCircle size={16} />
        <span className="text-[10px] tracking-widest uppercase font-bold">Failed to load customer statistics: {error}</span>
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
              <h3 className={`text-3xl font-bold tracking-tight transition-colors duration-500 ${card.id === 'vip' ? 'text-accent-gold group-hover:text-white' : 'text-white'}`}>
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

export default CustomerStats;
