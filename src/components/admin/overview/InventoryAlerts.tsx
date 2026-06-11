import React from 'react';
import { AlertTriangle, PackageOpen } from 'lucide-react';

interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images?: string[];
  slug: string;
  variants?: ProductVariant[];
}

interface InventoryAlertsProps {
  products: LowStockProduct[];
  loading?: boolean;
}

export const InventoryAlerts: React.FC<InventoryAlertsProps> = ({
  products = [],
  loading = false,
}) => {
  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-5 text-left relative transition-all duration-300 hover:border-white/10 flex flex-col h-full justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-mono tracking-[0.2em] text-red-500 uppercase font-semibold block">
            CRITICAL STOCK LEVEL
          </span>
          <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
            INVENTORY ALERTS
          </h3>
        </div>
        {!loading && products.length > 0 && (
          <div className="flex items-center space-x-1.5 text-red-500 bg-red-500/5 border border-red-500/10 px-2.5 py-1 rounded-xs">
            <AlertTriangle size={11} className="animate-pulse" />
            <span className="text-[9px] font-mono font-bold tracking-widest">
              {products.length} SILHOUETTES AT RISK
            </span>
          </div>
        )}
      </div>

      {/* List Content */}
      <div className="flex-grow overflow-y-auto space-y-4 max-h-[340px] pr-1 dark-theme-scrollbar">
        {loading ? (
          // Skeleton Loader
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-1.5 animate-pulse">
              <div className="w-10 h-13 bg-white/5 rounded-xs" />
              <div className="flex-grow space-y-2">
                <div className="h-3 w-1/2 bg-white/5 rounded-xs" />
                <div className="h-2.5 w-1/3 bg-white/5 rounded-xs" />
              </div>
              <div className="w-12 h-6 bg-white/5 rounded-xs" />
            </div>
          ))
        ) : products.length === 0 ? (
          // Empty state
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center opacity-40">
            <PackageOpen size={32} className="text-white/40" />
            <span className="text-[10px] font-mono tracking-widest text-white uppercase">
              All Silhouettes Correctly Stocked
            </span>
          </div>
        ) : (
          // Alerts List
          products.map((product) => {
            const firstSku = product.variants?.[0]?.sku || 'N/A';
            const imageUrl = product.images?.[0] || '/logo.png';
            
            return (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 border border-white/5 hover:border-white/10 bg-white/[0.01] transition-all duration-300 rounded-sm hover:translate-x-1 group"
              >
                <div className="flex items-center space-x-4">
                  {/* Aspect Ratio Premium Image */}
                  <div className="w-10 h-13 bg-white/5 border border-white/10 overflow-hidden shrink-0 rounded-xs">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="text-left">
                    <span className="font-display text-xs uppercase text-white block tracking-wide group-hover:text-accent-gold transition-colors duration-300">
                      {product.name}
                    </span>
                    <span className="text-[9px] font-mono text-white/30 uppercase block mt-0.5 tracking-wider">
                      SKU: <span className="text-white/60 font-semibold">{firstSku}</span>
                    </span>
                  </div>
                </div>

                {/* Remaining Quantity alert badge */}
                <div className="text-right shrink-0">
                  <span className={`px-2.5 py-1.5 rounded-xs text-[10px] font-mono font-bold tracking-widest block border ${
                    product.stock === 0
                      ? 'bg-red-950/20 text-red-500 border-red-500/20'
                      : 'bg-red-500/5 text-red-400 border-red-400/10'
                  }`}>
                    {product.stock === 0 ? 'DEPLETED' : `${product.stock} LEFT`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default InventoryAlerts;
