import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../data/products';
import GrainOverlay from '../components/GrainOverlay';

interface CollectionItem {
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export const CollectionsPage: React.FC<{ onProductClick: (product: Product) => void }> = () => {
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCollectionsData = async () => {
      try {
        const prods = await productService.getAllProducts();
        if (!active) return;
        
        if (prods.length > 0) {
          setCollection({
            name: "OVERSIZED TEES",
            slug: "oversized-tees",
            description: "Premium oversized t-shirts engineered from heavyweight organic cotton with architectural drape and drop shoulder styling.",
            image: prods[0].images?.[0] || '',
            productCount: prods.length
          });
        } else {
          setCollection(null);
        }
      } catch (err) {
        console.error("Failed to load collection:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchCollectionsData();
    return () => {
      active = false;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] as const }
    }
  };

  const isPageLoading = loading;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-bg-cream-1 pt-32 pb-24 px-6 md:px-12 xl:px-24 animate-pulse">
        <div className="max-w-7xl mx-auto h-16 bg-text-dark/5 w-1/3 rounded-xs mb-12" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4 shadow-xs">
            <div className="aspect-[16/10] w-full bg-text-dark/5 rounded-xs" />
            <div className="h-6 bg-text-dark/10 w-1/3 rounded-xs" />
            <div className="h-4 bg-text-dark/5 w-full rounded-xs" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream-1 pt-32 pb-24 px-6 md:px-12 xl:px-24 relative selection:bg-accent-gold/30">
      <GrainOverlay />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-text-dark/10 pb-6 text-left">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
              ARCHIVE
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase text-text-dark leading-none">
              COLLECTIONS
            </h1>
          </div>
          <p className="text-xs uppercase font-mono tracking-widest text-text-dark/50 mt-4 md:mt-0">
            {collection ? 1 : 0} ACTIVE BLUEPRINTS
          </p>
        </div>

        {/* Collection Grid */}
        {collection ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16"
          >
            <motion.div
              variants={itemVariants}
              onClick={() => navigate(`/collections/${collection.slug}`)}
              className="group cursor-pointer flex flex-col space-y-6 text-left"
            >
              {/* Image Container */}
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#F2ECE4] border border-text-dark/5 shadow-sm transition-all duration-700 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-accent-gold/20 relative">
                {collection.image && (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-bg-dark-1/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xs text-[9px] font-mono font-bold tracking-widest text-text-dark uppercase">
                  {collection.productCount} SILHOUETTES
                </div>
              </div>

              {/* Text Description Block */}
              <div className="space-y-2.5 transition-transform duration-500 group-hover:-translate-y-1">
                <div className="flex items-end justify-between">
                  <h2 className="font-display text-2xl md:text-3xl uppercase text-text-dark leading-none group-hover:text-accent-gold transition-colors duration-300">
                    {collection.name}
                  </h2>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-accent-gold group-hover:translate-x-1.5 transition-transform duration-300 flex items-center space-x-1 uppercase">
                    <span>VIEW COLLECTION</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
                <p className="text-xs text-text-dark/70 font-light leading-relaxed max-w-xl">
                  {collection.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-20 border border-dashed border-text-dark/10 rounded-sm">
            <p className="text-xs uppercase font-mono tracking-widest text-text-dark/40">NO SILHOUETTES FOUND IN ARCHIVE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
