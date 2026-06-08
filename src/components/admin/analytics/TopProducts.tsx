import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface TopProduct {
  name: string;
  images: string[];
  unitsSold: number;
  revenue: number;
  inventoryRemaining: number;
  growth: number;
}

export const TopProducts: React.FC = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/products/top-selling');
      if (res.data && res.data.success) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load top selling products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm min-h-60 flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] text-white/30 uppercase tracking-[0.25em]">Compiling top selling index...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-[#070707] border border-white/5 p-12 text-center rounded-sm font-mono select-none">
        <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] block">No sales metrics recorded</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono select-none text-left">
      <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
        <Sparkles size={13} className="text-accent-gold" />
        <h3 className="font-display text-lg uppercase tracking-wider text-white">
          Top Selling Silhouettes
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {products.slice(0, 10).map((p, idx) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="bg-[#070707] border border-white/5 hover:border-accent-gold/30 p-4 rounded-sm flex flex-col justify-between space-y-4 transition-all duration-300 relative group"
          >
            {/* Visual Header */}
            <div className="flex items-start justify-between space-x-3">
              <div className="flex items-center space-x-2.5">
                {p.images && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-xs border border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xs flex items-center justify-center text-[8px] font-bold text-accent-gold">
                    GARMENT
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-[9.5px] uppercase tracking-wide group-hover:text-accent-gold transition-colors line-clamp-1">
                    {p.name}
                  </h4>
                  <span className="text-[7.5px] text-green-500 uppercase tracking-widest block mt-0.5">
                    +{p.growth}% growth
                  </span>
                </div>
              </div>
              
              {/* Placement badge */}
              <span className="text-[8px] font-bold text-accent-gold bg-accent-gold/5 px-1.5 py-0.5 border border-accent-gold/20 rounded-xs shrink-0">
                #{idx + 1}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-1.5 border-t border-white/5 pt-3 text-[8.5px] text-white/40">
              <div className="space-y-0.5">
                <span className="block text-[7.5px] uppercase tracking-wider text-white/20">SOLD</span>
                <span className="text-white font-bold">{p.unitsSold}</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[7.5px] uppercase tracking-wider text-white/20">REVENUE</span>
                <span className="text-accent-gold font-bold">₹{p.revenue.toLocaleString()}</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[7.5px] uppercase tracking-wider text-white/20">STOCK</span>
                <span className={`font-bold ${p.inventoryRemaining < 10 ? 'text-red-400' : 'text-white'}`}>
                  {p.inventoryRemaining}
                </span>
              </div>
            </div>

            {/* Corner Marks */}
            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white/10 group-hover:border-accent-gold/30 transition-colors" />
            <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white/10 group-hover:border-accent-gold/30 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
