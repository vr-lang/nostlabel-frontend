import React from 'react';
import { AnimatedCounter } from '../overview/KpiCard';

interface InventoryStatsProps {
  stats: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
    inventoryValue: number;
  } | null;
  loading: boolean;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ stats, loading }) => {
  const data = [
    {
      title: 'TOTAL PRODUCTS',
      value: stats?.totalProducts ?? 0,
      sublabel: 'Active catalog styles',
      prefix: '',
      suffix: '',
      decimals: 0,
      color: 'text-white'
    },
    {
      title: 'LOW STOCK PRODUCTS',
      value: stats?.lowStock ?? 0,
      sublabel: 'Fewer than 10 units left',
      prefix: '',
      suffix: '',
      decimals: 0,
      color: stats && stats.lowStock > 0 ? 'text-amber-500' : 'text-accent-gold'
    },
    {
      title: 'OUT OF STOCK PRODUCTS',
      value: stats?.outOfStock ?? 0,
      sublabel: 'Zero variants available',
      prefix: '',
      suffix: '',
      decimals: 0,
      color: stats && stats.outOfStock > 0 ? 'text-red-500' : 'text-accent-gold'
    },
    {
      title: 'INVENTORY VALUE',
      value: stats?.inventoryValue ?? 0,
      sublabel: 'Calculated catalog value',
      prefix: '₹',
      suffix: '',
      decimals: 0,
      color: 'text-accent-gold'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
      {data.map((item, index) => (
        <div 
          key={index}
          className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-4 relative overflow-hidden transition-all duration-300 hover:border-white/10 group"
        >
          {/* Decorative design corner marks */}
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10 group-hover:border-accent-gold/40 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10 group-hover:border-accent-gold/40 transition-colors duration-300" />

          {/* Card title */}
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase font-semibold">
              {item.title}
            </span>
          </div>

          {/* Card Value */}
          <div className="space-y-1">
            {loading ? (
              <div className="h-9 w-28 bg-white/5 animate-pulse rounded-xs" />
            ) : (
              <h3 className={`text-3xl font-mono font-bold ${item.color} tracking-tight group-hover:text-white transition-colors duration-500`}>
                <AnimatedCounter
                  value={item.value}
                  prefix={item.prefix}
                  suffix={item.suffix}
                  decimals={item.decimals}
                />
              </h3>
            )}
          </div>

          {/* Card footer */}
          <div className="pt-2 border-t border-white/5">
            {loading ? (
              <div className="h-3.5 w-36 bg-white/5 animate-pulse rounded-xs" />
            ) : (
              <span className="text-[10px] text-white/50 tracking-wider font-light uppercase block">
                {item.sublabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;
