import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface ProductPerf {
  product: string;
  orders: number;
  revenue: number;
  stock: number;
  performance: number;
}

export const CollectionPerformance: React.FC = () => {
  const [data, setData] = useState<ProductPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/products/performance');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load product performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const filtered = data.filter((p) =>
    p.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-[#070707] border border-white/5 p-6 rounded-sm min-h-60 flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] text-white/30 uppercase tracking-[0.25em]">Compiling performance indicators...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 hover:border-white/10 transition-colors select-none text-left font-mono">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] text-accent-gold tracking-[0.2em] uppercase font-bold block">
            Catalog Performance
          </span>
          <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
            Collection Performance
          </h3>
        </div>

        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-2.5 text-white/30" />
          <input
            type="text"
            placeholder="Search silhouette..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/[0.02] border border-white/5 py-2 pl-8 pr-3 text-[9px] text-white focus:outline-none focus:border-accent-gold rounded-xs uppercase tracking-wider placeholder:text-white/20 w-40"
          />
        </div>
      </div>

      <div className="overflow-hidden border border-white/5 bg-[#0D0D0D]/10 rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-[8px] text-white/40 uppercase tracking-[0.2em] font-bold">
              <th className="py-3.5 pl-5 pr-3">Product</th>
              <th className="py-3.5 px-4 text-center">Orders</th>
              <th className="py-3.5 px-4 text-right">Revenue</th>
              <th className="py-3.5 px-4 text-center">Stock</th>
              <th className="py-3.5 pr-5 text-right">Performance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[9px] text-white/70">
            {filtered.map((item, idx) => (
              <motion.tr
                key={item.product}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="hover:bg-white/[0.01] transition-colors"
              >
                <td className="py-3.5 pl-5 pr-3 font-bold text-white uppercase">{item.product}</td>
                <td className="py-3.5 px-4 text-center text-white">{item.orders}</td>
                <td className="py-3.5 px-4 text-right text-white font-medium">₹{item.revenue.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-center text-white/50">{item.stock}</td>
                <td className="py-3.5 pr-5 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-accent-gold font-bold">{item.performance}%</span>
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-accent-gold rounded-full" style={{ width: `${item.performance}%` }} />
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollectionPerformance;
