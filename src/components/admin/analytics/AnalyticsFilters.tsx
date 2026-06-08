import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, RefreshCw, CheckSquare, Square } from 'lucide-react';

export const AnalyticsFilters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read params or set defaults
  const rangeVal = searchParams.get('range') || '30D';
  const compareVal = searchParams.get('compare') === 'true';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const ranges = [
    { label: 'LAST 7 DAYS', value: '7D' },
    { label: 'LAST 30 DAYS', value: '30D' },
    { label: 'LAST 90 DAYS', value: '90D' },
    { label: 'LAST YEAR', value: '1Y' },
  ];

  return (
    <div className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 select-none font-mono text-[9px] uppercase tracking-widest font-bold">
      
      {/* Time Range Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
        <Calendar size={12} className="text-white/30 mr-1 shrink-0" />
        {ranges.map((r) => {
          const active = rangeVal === r.value;
          return (
            <button
              key={r.value}
              onClick={() => updateParam('range', r.value)}
              className={`px-3.5 py-2 border rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
                active
                  ? 'border-accent-gold bg-accent-gold text-text-dark font-bold'
                  : 'border-white/5 text-white/40 hover:text-white hover:border-white/15'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Compare Options & Reload */}
      <div className="flex items-center space-x-6">
        
        {/* Comparison Checkbox */}
        <button
          onClick={() => updateParam('compare', compareVal ? 'false' : 'true')}
          className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          {compareVal ? (
            <CheckSquare size={13} className="text-accent-gold" />
          ) : (
            <Square size={13} className="text-white/20" />
          )}
          <span>Compare to previous period</span>
        </button>

        {/* Sync Indicator */}
        <div className="flex items-center space-x-1.5 text-white/30">
          <RefreshCw size={11} className="animate-spin-slow" />
          <span>Realtime Feed Sync</span>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsFilters;
