import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface HealthData {
  overallScore: number;
  revenueScore: number;
  inventoryHealth: number;
  customerSatisfaction: number;
  orderFulfillment: number;
}

export const BusinessHealth: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/analytics/health');
      if (res.data && res.data.success) {
        setHealth(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load health scores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const renderCircularScore = (value: number, label: string) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="flex items-center space-x-3.5 border border-white/5 bg-[#070707] p-4 rounded-sm hover:border-white/10 transition-all select-none">
        {/* SVG Circle */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle cx="28" cy="28" r={radius} fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="2.5" />
            {/* Active Gold Track */}
            <circle 
              cx="28" 
              cy="28" 
              r={radius} 
              fill="transparent" 
              stroke="#C9A46A" 
              strokeWidth="3" 
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute text-[9px] font-bold text-white font-mono">{value}%</span>
        </div>

        {/* Labels */}
        <div className="text-left font-mono min-w-0">
          <span className="text-[7.5px] text-white/30 block uppercase tracking-wider truncate">{label}</span>
          <span className="text-white font-bold text-[9.5px]">
            {value >= 90 ? 'OPTIMAL' : 'MONITORED'}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm min-h-24 flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Auditing ledger health...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono select-none text-left">
      <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
        <ShieldCheck size={13} className="text-accent-gold" />
        <h3 className="font-display text-lg uppercase tracking-wider text-white">
          Operations Health Scorecards
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {renderCircularScore(health?.overallScore ?? 89, 'OVERALL Score')}
        {renderCircularScore(health?.revenueScore ?? 92, 'REVENUE Health')}
        {renderCircularScore(health?.inventoryHealth ?? 88, 'INVENTORY Health')}
        {renderCircularScore(health?.customerSatisfaction ?? 95, 'CUSTOMER Health')}
        {renderCircularScore(health?.orderFulfillment ?? 91, 'ORDER FULFILLMENT')}
      </div>
    </div>
  );
};

export default BusinessHealth;
