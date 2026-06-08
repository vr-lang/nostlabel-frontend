import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type Product } from '../data/products';
import { productService } from '../services/productService';

const NOSTLABEL_PLACEHOLDER = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000";

interface BestSellersProps {
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string) => void;
}

const BestSellersSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex flex-col space-y-4 text-left relative">
        <div className="aspect-[3/4] w-full bg-text-dark/5 border border-text-dark/5 rounded-xs" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-text-dark/10 w-16 rounded-xs" />
            <div className="h-3 bg-text-dark/10 w-12 rounded-xs" />
          </div>
          <div className="h-5 bg-text-dark/10 w-3/4 rounded-xs" />
          <div className="h-3 bg-text-dark/10 w-1/2 rounded-xs" />
        </div>
      </div>
    ))}
  </div>
);

export const BestSellers: React.FC<BestSellersProps> = ({ onProductClick }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        // Filter bestsellers or use all products if no bestsellers found
        const filtered = data.filter(p => p.bestseller);
        const finalData = filtered.length > 0 ? filtered : data;

        if (finalData.length > 0) {
          setProducts(finalData);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to load products for Best Sellers:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // 100ms stagger between cards
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 15 } }
  };

  return (
    <section className="bg-bg-cream-2 py-14 md:py-20 lg:py-24 px-6 md:px-12 xl:px-24 z-10 relative" id="bestsellers">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-text-dark/10 pb-6 text-left">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.4em] font-bold text-accent-gold uppercase">
              CATALOG
            </span>
            <h2 className="font-display text-4xl md:text-5xl uppercase text-text-dark">
              BEST SELLERS
            </h2>
          </div>
          <p className="text-xs uppercase font-mono tracking-widest text-text-dark/50">
            {loading ? '...' : products.length} ARCHITECTURAL SILHOUETTES
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <BestSellersSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16"
          >
            {products.map((product) => {
              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  onClick={() => onProductClick(product)}
                  className="group flex flex-col space-y-4 text-left relative cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="aspect-[3/4] w-full bg-[#F2ECE4] overflow-hidden border border-text-dark/5 relative shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-accent-gold/20">
                    <img
                      src={product.images[0] || NOSTLABEL_PLACEHOLDER}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                      loading="lazy"
                    />
                    
                    {/* Subtle Luxury Gradient Overlay */}
                    <div className="absolute inset-0 bg-bg-dark-1/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase">
                        {product.category}
                      </span>
                      <span className="text-[10px] font-mono text-accent-gold font-semibold">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-display text-lg md:text-xl uppercase text-text-dark leading-tight group-hover:text-accent-gold transition-colors duration-300">
                      {product.name}
                    </h3>
                    
                    {/* Hover text reveal */}
                    <div className="relative overflow-hidden h-4">
                      <p className="text-[9px] font-mono text-text-dark/50 transition-all duration-300 transform group-hover:-translate-y-full">
                        {product.material} • {product.gsm}
                      </p>
                      <p className="absolute top-0 left-0 text-[9px] font-mono text-accent-gold font-bold tracking-widest uppercase transition-all duration-300 transform translate-y-full group-hover:translate-y-0 flex items-center space-x-1">
                        <span>EXPLORE SILHOUETTE</span>
                        <span>→</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;
