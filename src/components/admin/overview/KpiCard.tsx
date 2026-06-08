import React, { useEffect, useState } from 'react';

// Reusable animated counter using requestAnimationFrame
export const AnimatedCounter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1500; // ms
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function: easeOutQuad (starts fast, slows down)
      const ease = progress * (2 - progress);
      const current = start + (end - start) * ease;

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value]);

  const formatted = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  sublabel: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  sublabel,
  trend,
  loading = false,
}) => {
  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-4 relative overflow-hidden transition-all duration-300 hover:border-white/10 group select-none">
      {/* Decorative architectural grid corner mark */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10 group-hover:border-accent-gold/40 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10 group-hover:border-accent-gold/40 transition-colors duration-300" />

      {/* Header Info */}
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase font-semibold">
          {title}
        </span>
        {trend && !loading && (
          <span
            className={`text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-xs font-medium ${
              trend.isPositive
                ? 'text-green-500 bg-green-500/5'
                : 'text-red-400 bg-red-400/5'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {/* Primary Value */}
      <div className="space-y-1">
        {loading ? (
          <div className="h-9 w-28 bg-white/5 animate-pulse rounded-xs" />
        ) : (
          <h3 className="text-3xl font-mono font-bold text-accent-gold tracking-tight group-hover:text-white transition-colors duration-500">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          </h3>
        )}
      </div>

      {/* Footer Sublabel */}
      <div className="pt-2 border-t border-white/5">
        {loading ? (
          <div className="h-3.5 w-36 bg-white/5 animate-pulse rounded-xs" />
        ) : (
          <span className="text-[10px] text-white/50 tracking-wider font-light uppercase block">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
