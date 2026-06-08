import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ChartDataPoint {
  label: string;
  salesCount: number;
  revenue: number;
  avgOrderValue: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  activeRange: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = [],
  loading = false,
  activeRange
}) => {

  // CSV Export Handler
  const handleExport = () => {
    if (data.length === 0) return;

    // Build CSV header & rows
    const headers = ['Interval Label', 'Revenue (INR)', 'Orders Count', 'Average Order Value (INR)'];
    const rows = data.map(point => [
      `"${point.label}"`,
      point.revenue,
      point.salesCount,
      point.avgOrderValue
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nostlabel_performance_${activeRange.toLowerCase()}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism p-4.5 rounded-sm shadow-2xl border border-white/10 text-left font-mono">
          <span className="text-[10px] text-white/40 block mb-2 tracking-widest uppercase">
            {label}
          </span>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center space-x-8 text-[11px] py-0.5">
              <span className="text-white/60 tracking-wider uppercase">{entry.name}:</span>
              <span className="font-bold font-mono" style={{ color: entry.color }}>
                {entry.name === 'Revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 text-left relative transition-all duration-300 hover:border-white/10">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase block">
            SALES DATASTREAM
          </span>
          <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
            SALES PERFORMANCE
          </h3>
        </div>

        <button
          onClick={handleExport}
          disabled={data.length === 0 || loading}
          className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-[9px] font-mono uppercase tracking-widest text-white/70 hover:text-white rounded-xs transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed uppercase"
        >
          EXPORT DATA
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/10">
            <div className="w-8 h-8 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
            <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
              CALCULATING GRAPH DATA...
            </span>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5">
            <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">
              NO TRANSACTION METRICS IN THIS INTERVAL
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                {/* Golden Glow Gradient for Revenue Area */}
                <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A46A" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#C9A46A" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.03)"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              <YAxis
                yAxisId="left"
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                tickLine={false}
                axisLine={false}
                dx={10}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201, 164, 106, 0.15)', strokeWidth: 1 }} />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={6}
                formatter={(value) => (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-300">
                    {value}
                  </span>
                )}
              />

              {/* Area for Revenue Trend */}
              <Area
                yAxisId="left"
                type="monotone"
                name="Revenue"
                dataKey="revenue"
                stroke="#C9A46A"
                strokeWidth={2}
                fill="url(#revenueGlow)"
                activeDot={{ r: 4, stroke: '#0D0D0D', strokeWidth: 2, fill: '#C9A46A' }}
              />

              {/* Line for Orders Trend */}
              <Line
                yAxisId="right"
                type="monotone"
                name="Orders"
                dataKey="salesCount"
                stroke="#FFFFFF"
                strokeWidth={1.5}
                dot={{ r: 2, fill: '#FFFFFF', strokeWidth: 0 }}
                activeDot={{ r: 4, stroke: '#0D0D0D', strokeWidth: 2, fill: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
