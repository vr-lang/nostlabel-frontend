import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { TrendingUp, Award, Activity } from 'lucide-react';

interface AnalyticProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
}

interface TopSellingItem {
  _id: string;
  quantitySold: number;
  revenue: number;
  product: AnalyticProduct;
}

interface InventoryAnalyticsProps {
  analytics: {
    topSelling: TopSellingItem[];
    slowMoving: AnalyticProduct[];
    mostViewed: AnalyticProduct[];
    turnoverRate: number;
  } | null;
  loading: boolean;
}

export const InventoryAnalytics: React.FC<InventoryAnalyticsProps> = ({ analytics, loading }) => {
  
  // Format data for the Recharts BarChart
  const chartData = analytics?.topSelling.map(item => ({
    name: item.product?.name ? item.product.name.substring(0, 12).toUpperCase() : 'UNKNOWN',
    units: item.quantitySold,
    revenue: item.revenue
  })) || [];

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism p-3 rounded-sm shadow-2xl border border-white/10 text-left font-mono text-[9px]">
          <span className="text-white/40 block mb-1.5 tracking-widest uppercase">{label}</span>
          <div className="flex justify-between space-x-6">
            <span className="text-white/60">UNITS SOLD:</span>
            <span className="font-bold text-accent-gold">{payload[0].value} UNITS</span>
          </div>
          <div className="flex justify-between space-x-6 mt-1">
            <span className="text-white/60">REVENUE:</span>
            <span className="font-bold text-white">₹{payload[0].payload.revenue.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none text-left">
      
      {/* 1. Turnover rate and sales bar chart */}
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 xl:col-span-2 hover:border-white/10 transition-colors">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-white/5 pb-4 gap-4">
          <div>
            <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
              Inventory Performance
            </span>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
              Sales Volume & Velocity
            </h3>
          </div>

          {/* Turnover rate badge */}
          <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/5 p-3 rounded-sm shrink-0">
            <TrendingUp size={14} className="text-accent-gold" />
            <div>
              <span className="text-[8px] text-white/30 block uppercase tracking-wider">Turnover Rate</span>
              <span className="text-white font-bold font-mono text-xs">
                {loading ? '---' : `${analytics?.turnoverRate ?? '4.2'}x Ratio`}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-60 w-full relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
              <span className="text-[8px] text-white/30 tracking-widest uppercase">Calculating velocity...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-sm">
              <span className="text-[9px] text-white/20 uppercase tracking-widest">No Sales Metrics Available</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={32}
              >
                <XAxis
                  dataKey="name"
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                
                <Bar dataKey="units">
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#C9A46A' : 'rgba(201, 164, 106, 0.25)'} 
                      stroke="#C9A46A"
                      strokeWidth={index === 0 ? 0 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Slow moving and Most Viewed side widgets */}
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 hover:border-white/10 transition-colors flex flex-col justify-between">
        
        {/* Slow Moving Widget */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Activity size={12} className="text-accent-gold" />
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-white">
              Slow Moving Inventory
            </h4>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 animate-pulse rounded-sm" />
              ))
            ) : !analytics?.slowMoving || analytics.slowMoving.length === 0 ? (
              <div className="text-[8px] text-white/20 uppercase tracking-wider py-2">No items flags.</div>
            ) : (
              analytics.slowMoving.slice(0, 3).map(prod => (
                <div key={prod._id} className="flex justify-between items-center text-[9px] py-1 border-b border-white/[0.02]">
                  <span className="text-white/70 uppercase truncate max-w-[150px]">{prod.name}</span>
                  <span className="text-white/30 font-bold shrink-0">{prod.stock} IN STOCK</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Viewed Widget */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Award size={12} className="text-accent-gold" />
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-white">
              Highest Reviewed Styles
            </h4>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 animate-pulse rounded-sm" />
              ))
            ) : !analytics?.mostViewed || analytics.mostViewed.length === 0 ? (
              <div className="text-[8px] text-white/20 uppercase tracking-wider py-2">No review stats.</div>
            ) : (
              analytics.mostViewed.slice(0, 3).map(prod => (
                <div key={prod._id} className="flex justify-between items-center text-[9px] py-1 border-b border-white/[0.02]">
                  <span className="text-white/70 uppercase truncate max-w-[150px]">{prod.name}</span>
                  <span className="text-accent-gold shrink-0">{prod.rating ? `${prod.rating}★` : 'N/A'} ({prod.reviewCount || 0} reviews)</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default InventoryAnalytics;
