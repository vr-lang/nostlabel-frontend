import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, RotateCcw, Award, Settings, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  date: string;
}

interface CustomerTimelineProps {
  customerId: string;
  refreshTrigger: number;
}

export const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ customerId, refreshTrigger }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/admin/customers/${customerId}/timeline`);
      if (res.data && res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch timeline:', err);
      setError(err.message || 'Timeline synchronization failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [customerId, refreshTrigger]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ACCOUNT_CREATED':
        return <User size={10} className="text-blue-400" />;
      case 'ORDER_PLACED':
        return <ShoppingBag size={10} className="text-green-400" />;
      case 'RETURN_REQUESTED':
      case 'RETURNED':
        return <RotateCcw size={10} className="text-red-400" />;
      case 'VIP_UPGRADED':
        return <Award size={10} className="text-accent-gold" />;
      default:
        return <Settings size={10} className="text-white/40" />;
    }
  };

  const getEventBulletColor = (type: string) => {
    switch (type) {
      case 'ACCOUNT_CREATED':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'ORDER_PLACED':
        return 'border-green-500/30 bg-green-500/10';
      case 'RETURN_REQUESTED':
      case 'RETURNED':
        return 'border-red-500/30 bg-red-500/10';
      case 'VIP_UPGRADED':
        return 'border-accent-gold/40 bg-accent-gold/15';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-2 select-none">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">Loading timeline log...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-sm flex items-center space-x-2 text-red-500 select-none">
        <AlertCircle size={12} />
        <span className="text-[8px] uppercase tracking-wider">Timeline Sync Fail: {error}</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-6 border border-white/5 bg-white/[0.01] rounded-sm select-none">
        <span className="text-[9px] uppercase tracking-widest text-white/30">No timeline data available</span>
      </div>
    );
  }

  return (
    <div className="font-mono text-left select-none relative pl-4 border-l border-white/5 space-y-6">
      {events.map((event, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          className="relative pl-5"
        >
          {/* Vertical bullet */}
          <div className={`absolute -left-[25px] top-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center ${getEventBulletColor(event.type)}`}>
            {getEventIcon(event.type)}
          </div>

          {/* Event Details */}
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
              <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">
                {event.title}
              </h5>
              <span className="text-[8px] text-white/30 uppercase tracking-widest">
                {new Date(event.date).toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] text-white/50 uppercase leading-relaxed font-light">
              {event.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CustomerTimeline;
