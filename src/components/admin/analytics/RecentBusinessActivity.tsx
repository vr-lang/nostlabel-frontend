import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShoppingBag, PlusCircle, RefreshCw, UserPlus, CheckCircle } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

export const RecentBusinessActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/activity');
      if (res.data && res.data.success) {
        setActivities(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load recent activity feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm min-h-60 flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Retrieving ledger timeline...</span>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingBag size={12} className="text-accent-gold" />;
      case 'PRODUCT_ADDED':
        return <PlusCircle size={12} className="text-blue-400" />;
      case 'INVENTORY_UPDATED':
        return <RefreshCw size={12} className="text-purple-400" />;
      case 'NEW_CUSTOMER':
        return <UserPlus size={12} className="text-green-500" />;
      case 'ORDER_DELIVERED':
        return <CheckCircle size={12} className="text-emerald-500" />;
      default:
        return <ShoppingBag size={12} className="text-white/40" />;
    }
  };

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 hover:border-white/10 transition-colors select-none text-left font-mono relative">
      <div className="border-b border-white/5 pb-3">
        <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
          Ledger Feed
        </span>
        <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
          Recent Business Activity
        </h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 text-[9.5px] text-white/20 uppercase tracking-widest">
          No business activity recorded.
        </div>
      ) : (
        <div className="relative border-l border-white/5 pl-4 ml-2.5 py-1 space-y-5">
          {activities.slice(0, 8).map((act, idx) => {
            const formattedTime = new Date(act.time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            const formattedDate = new Date(act.time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });

            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="relative"
              >
                {/* Visual timeline node */}
                <div className="absolute -left-[22.5px] top-0.5 bg-[#070707] p-1 border border-white/5 rounded-full z-10">
                  {getActivityIcon(act.type)}
                </div>

                {/* Content block */}
                <div className="text-left space-y-1">
                  <div className="flex justify-between items-baseline text-[9px] uppercase font-bold">
                    <span className="text-white tracking-wider font-display font-medium">
                      {act.title}
                    </span>
                    <span className="text-white/30 font-light text-[8px]">
                      {formattedDate} @ {formattedTime}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-white/50 leading-relaxed max-w-lg">
                    {act.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentBusinessActivity;
