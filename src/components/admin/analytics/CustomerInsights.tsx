import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Loader2, Users, CheckCircle, Award, UserPlus, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  vipCustomers: number;
  repeatCustomers: number;
}

export const CustomerInsights: React.FC = () => {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/customers/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm min-h-[160px] flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Compiling CRM cohorts...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Total Customers', count: stats?.totalCustomers ?? 0, growth: '14.1', icon: <Users size={12} className="text-white/60" /> },
    { label: 'Active Customers', count: stats?.activeCustomers ?? 0, growth: '11.8', icon: <CheckCircle size={12} className="text-green-500" /> },
    { label: 'VIP Customers', count: stats?.vipCustomers ?? 0, growth: '8.4', icon: <Award size={12} className="text-accent-gold" /> },
    { label: 'New Customers (30D)', count: stats?.newCustomers ?? 0, growth: '16.5', icon: <UserPlus size={12} className="text-blue-400" /> },
    { label: 'Repeat Customers', count: stats?.repeatCustomers ?? 0, growth: '9.2', icon: <RefreshCw size={12} className="text-purple-400" /> }
  ];

  const chartData = [
    { name: 'Active', count: stats?.activeCustomers ?? 0, color: '#C9A46A' },
    { name: 'VIP', count: stats?.vipCustomers ?? 0, color: '#FFFFFF' },
    { name: 'New (30D)', count: stats?.newCustomers ?? 0, color: '#3B82F6' },
    { name: 'Repeat', count: stats?.repeatCustomers ?? 0, color: '#8B5CF6' }
  ];

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 hover:border-white/10 transition-colors select-none text-left font-mono relative">
      <div className="border-b border-white/5 pb-3">
        <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
          Client Cohorts
        </span>
        <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
          Customer Insights
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Left/Middle: Customer Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, idx) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white/[0.01] border border-white/5 p-4 rounded-sm flex flex-col justify-between space-y-3 hover:border-white/10 transition-all"
            >
              <div className="flex justify-between items-center text-white/40 text-[9px] uppercase font-bold">
                <span className="truncate max-w-[130px]">{c.label}</span>
                <div className="p-1 bg-white/[0.02] border border-white/5 rounded-xs shrink-0">
                  {c.icon}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-white leading-none">{c.count}</span>
                <span className="text-[7.5px] text-green-500 font-bold">+{c.growth}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Small Chart */}
        <div className="h-44 w-full bg-white/[0.01] border border-white/5 rounded-sm p-4 relative flex flex-col justify-between">
          <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold block mb-2">Segment Distributions</span>
          
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                <XAxis type="number" stroke="rgba(255,255,255,0.1)" fontSize={7} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={7.5} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070707', border: '1px solid rgba(255,255,255,0.1)', fontSize: '8px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#FFFFFF' }}
                  cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                />
                <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerInsights;
