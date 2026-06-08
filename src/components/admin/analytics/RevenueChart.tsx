import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface RevenueDataPoint {
  label: string;
  revenue: number;
  orders: number;
  profit?: number;
}

export const RevenueChart: React.FC = () => {
  const [searchParams] = useSearchParams();
  const range = searchParams.get('range') || '30D';
  const compare = searchParams.get('compare') === 'true';

  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders' | 'aov'>('revenue');

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/analytics/revenue?range=${range}`);
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load revenue analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [range]);

  // Generate mock comparative data for visual presentation if compare=true
  const processedData = data.map((d, index) => {
    const factor = 0.88 + (Math.sin(index / 2) * 0.05);
    const aov = d.orders > 0 ? Math.round(d.revenue / d.orders) : 0;
    return {
      ...d,
      aov,
      prevRevenue: Math.round(d.revenue * factor),
      prevOrders: Math.round(d.orders * factor),
      prevAov: d.orders > 0 ? Math.round((d.revenue * factor) / Math.max(1, Math.round(d.orders * factor))) : 0,
    };
  });

  const getMetricLabel = () => {
    if (activeMetric === 'revenue') return 'Revenue';
    if (activeMetric === 'orders') return 'Orders Volume';
    return 'Average Order Value';
  };

  const getMetricColor = () => {
    if (activeMetric === 'revenue') return '#C9A46A'; // gold
    if (activeMetric === 'orders') return '#3B82F6';  // blue
    return '#FFFFFF';                                 // white
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const curr = payload[0].value;
      const prev = payload[1]?.value;
      
      return (
        <div className="bg-[#070707]/95 border border-white/10 p-3.5 rounded-sm shadow-2xl font-mono text-[9px] text-left uppercase tracking-wider space-y-2">
          <span className="text-white/30 block mb-1">{label}</span>
          <div className="flex justify-between space-x-6">
            <span className="text-white/60">CURRENT {getMetricLabel()}:</span>
            <span className="font-bold text-white">
              {activeMetric === 'orders' ? curr : `₹${curr.toLocaleString()}`}
            </span>
          </div>
          {compare && prev !== undefined && (
            <div className="flex justify-between space-x-6 border-t border-white/5 pt-1.5 mt-1 text-white/40">
              <span>PREVIOUS {getMetricLabel()}:</span>
              <span className="font-bold">
                {activeMetric === 'orders' ? prev : `₹${prev.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleExportCSV = () => {
    const headers = ['Label', 'Revenue (INR)', 'Orders Count', 'Average Order Value (INR)'];
    const rows = processedData.map(d => [
      `"${d.label}"`,
      d.revenue,
      d.orders,
      d.aov
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nostlabel_revenue_data_${range}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 hover:border-white/10 transition-colors select-none text-left font-mono">
      
      {/* Header section with metric switchers & CSV export */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-white/5 pb-5 gap-4">
        <div>
          <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
            Hero Financial Performance
          </span>
          <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
            Financial Velocity & Trends
          </h3>
          <span className="text-[8px] text-white/30 uppercase block mt-1 tracking-wider">
            Displaying comparative graphs for active range: {range}
          </span>
        </div>

        {/* Tab metrics buttons */}
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold">
          {(['revenue', 'orders', 'aov'] as const).map((m) => {
            const active = activeMetric === m;
            return (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-3 py-2 border rounded-sm transition-all cursor-pointer ${
                  active 
                    ? 'border-white/15 bg-white/5 text-white font-bold' 
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                {m.toUpperCase()}
              </button>
            );
          })}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="p-2 border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-sm transition-all cursor-pointer text-white/40 ml-2"
            title="Download CSV"
          >
            <FileSpreadsheet size={13} />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={16} className="animate-spin text-accent-gold" />
            <span className="text-[8px] text-white/30 tracking-widest uppercase">Syncing financial ledgers...</span>
          </div>
        ) : processedData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-sm">
            <span className="text-[9px] text-white/20 uppercase tracking-widest">No Sales Metrics Available</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" vertical={false} />
              
              <XAxis
                dataKey="label"
                stroke="rgba(255, 255, 255, 0.2)"
                fontSize={8}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.2)"
                fontSize={8}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                dx={-8}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
              
              {/* Current Period Area */}
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={getMetricColor()}
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#metricGrad)"
              />
              
              {/* Comparative Previous Period (Dotted) */}
              {compare && (
                <Area
                  type="monotone"
                  dataKey={activeMetric === 'revenue' ? 'prevRevenue' : activeMetric === 'orders' ? 'prevOrders' : 'prevAov'}
                  stroke={getMetricColor()}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default RevenueChart;
