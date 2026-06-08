import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Award, BarChart2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../services/authService';

// Animated counter helper
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({ value, prefix = '', suffix = '' }) => {
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

  return <span>{prefix}{Math.round(count).toLocaleString()}{suffix}</span>;
};

interface MetricItem {
  value: number;
  growth: number;
  trend: 'up' | 'down';
}

interface OverviewData {
  revenue: MetricItem;
  totalOrders: MetricItem;
  totalCustomers: MetricItem;
  averageOrderValue: MetricItem;
}

export const AnalyticsOverview: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/analytics/overview');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load analytics overview:', err);
      setError(err.message || 'Overview metrics stream offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const cardConfig = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: data?.revenue?.value ?? 0,
      growth: data?.revenue?.growth ?? 0,
      trend: data?.revenue?.trend ?? 'up',
      desc: 'Gross completed payment value',
      icon: <DollarSign size={15} className="text-accent-gold" />,
      prefix: '₹',
      suffix: '',
      bg: 'border-accent-gold/10 hover:border-accent-gold/25'
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: data?.totalOrders?.value ?? 0,
      growth: data?.totalOrders?.growth ?? 0,
      trend: data?.totalOrders?.trend ?? 'up',
      desc: 'Gross completed transactions count',
      icon: <ShoppingBag size={15} className="text-white/70" />,
      prefix: '',
      suffix: '',
      bg: 'border-white/5 hover:border-white/15'
    },
    {
      id: 'customers',
      label: 'Total Customers',
      value: data?.totalCustomers?.value ?? 0,
      growth: data?.totalCustomers?.growth ?? 0,
      trend: data?.totalCustomers?.trend ?? 'up',
      desc: 'Registered retail customer accounts',
      icon: <Award size={15} className="text-white/70" />,
      prefix: '',
      suffix: '',
      bg: 'border-white/5 hover:border-white/15'
    },
    {
      id: 'aov',
      label: 'Average Order Value',
      value: data?.averageOrderValue?.value ?? 0,
      growth: data?.averageOrderValue?.growth ?? 0,
      trend: data?.averageOrderValue?.trend ?? 'up',
      desc: 'Average gross invoice value',
      icon: <BarChart2 size={15} className="text-white/70" />,
      prefix: '₹',
      suffix: '',
      bg: 'border-white/5 hover:border-white/15'
    }
  ];

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-4 text-left font-mono rounded-sm flex items-center space-x-3 text-red-500 select-none">
        <AlertCircle size={16} />
        <span className="text-[10px] tracking-widest uppercase font-bold">Failed to load overview data: {error}</span>
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
          {/* Header row */}
          <div className="flex justify-between items-center">
            <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-bold">
              {card.label}
            </span>
            <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xs">
              {card.icon}
            </div>
          </div>

          {/* Numbers / Trends */}
          <div className="space-y-1 text-left">
            {loading ? (
              <div className="h-9 w-24 bg-white/5 animate-pulse rounded-xs" />
            ) : (
              <div className="flex justify-between items-end">
                <h3 className={`text-2xl font-bold tracking-tight transition-colors duration-500 ${card.id === 'revenue' ? 'text-accent-gold group-hover:text-white' : 'text-white'}`}>
                  <AnimatedCounter value={card.value} prefix={card.prefix} suffix={card.suffix} />
                </h3>

                {/* Growth trend indicator pill */}
                <div className={`flex items-center space-x-0.5 px-2 py-0.5 border rounded-full text-[8px] font-bold ${
                  card.trend === 'up' 
                    ? 'border-green-500/20 bg-green-500/5 text-green-500' 
                    : 'border-red-500/20 bg-red-500/5 text-red-500'
                }`}>
                  {card.trend === 'up' ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                  <span>{card.growth}%</span>
                </div>
              </div>
            )}
            <span className="text-[8px] text-white/40 tracking-wider font-light uppercase block pt-1">
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

export default AnalyticsOverview;
