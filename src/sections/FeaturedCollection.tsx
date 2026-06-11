import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../data/products';

interface FeaturedCollectionProps {
  onCategoryClick: (category: string) => void;
}

const FeaturedCollectionSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px] md:auto-rows-[320px] animate-pulse">
    <div className="lg:col-span-2 lg:row-span-2 md:row-span-2 bg-white/5 border border-white/5 rounded-xs p-8 flex flex-col justify-end space-y-4">
      <div className="h-4 bg-white/10 w-16 rounded-xs" />
      <div className="h-10 bg-white/10 w-2/3 rounded-xs" />
      <div className="h-4 bg-white/10 w-1/2 rounded-xs" />
    </div>
    <div className="bg-white/5 border border-white/5 rounded-xs p-6 flex flex-col justify-end space-y-3">
      <div className="h-3 bg-white/10 w-12 rounded-xs" />
      <div className="h-8 bg-white/10 w-3/4 rounded-xs" />
      <div className="h-3 bg-white/10 w-1/3 rounded-xs" />
    </div>
    <div className="bg-white/5 border border-white/10 rounded-xs p-8 flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        <div className="h-3 bg-white/10 w-24 rounded-xs" />
        <div className="h-8 bg-white/10 w-2/3 rounded-xs" />
        <div className="h-16 bg-white/10 w-full rounded-xs" />
      </div>
      <div className="h-6 bg-white/10 w-24 rounded-xs" />
    </div>
  </div>
);

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ onCategoryClick }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        if (!active) return;
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products for bento grid:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, []);

  // Default mock cards
  const mockCards = [
    {
      id: 'limited-drops',
      title: 'Limited Drops',
      subtitle: 'RELEASE 004',
      size: 'large',
      image: '/logo.png',
      description: 'Exclusive technical utility outer garments produced in limited numbered runs. Water-resistant shells with modular layering panels.',
      count: '04 items',
      categoryLink: 'Limited Drops'
    },
    {
      id: 'oversized-tees',
      title: 'Oversized Tees',
      subtitle: 'ESSENTIAL SHAPES',
      size: 'medium',
      image: '/logo.png',
      description: 'Ultra-heavy 220 GSM cotton tees featuring custom box cuts and drop shoulders.',
      count: '06 items',
      categoryLink: 'Oversized T-Shirts'
    }
  ];

  // Dynamic mapping: Replace mockCards items with actual products if available
  const cards = mockCards.map((mockCard) => {
    // Find product matching category that has images, or fall back to any product with images
    const product = products.find(p => p.category.toLowerCase() === mockCard.categoryLink.toLowerCase() && p.images && p.images.length > 0)
                    || products.find(p => p.images && p.images.length > 0);
    
    if (!product) {
      return {
        ...mockCard,
        image: '/logo.png'
      };
    }

    return {
      id: product.id,
      title: product.name,
      subtitle: product.category.toUpperCase(),
      size: mockCard.size,
      image: product.images[0] || '/logo.png',
      description: product.description.length > 130 
        ? `${product.description.slice(0, 130)}...` 
        : product.description,
      count: product.discountPrice ? (
        <span className="flex items-center space-x-1.5">
          <span className="text-accent-gold">₹{product.discountPrice.toLocaleString()}</span>
          <span className="line-through text-white/30 text-[9px]">₹{product.price.toLocaleString()}</span>
        </span>
      ) : (
        `₹${product.price.toLocaleString()}`
      ),
      categoryLink: product.category
    };
  });

  const finalCards = [
    ...cards,
    {
      id: 'editorial-text',
      title: 'The Blueprint',
      subtitle: 'BRAND PHILOSOPHY',
      size: 'text',
      description: 'We reject standard garment proportions. Every slope, neck radius, and stitching weight is configured to float away from the body, constructing a structured silhouette that remains unchanged through movement.',
      quote: '"Form is not a reaction to trends, but an architectural statement."',
      categoryLink: 'Essentials'
    }
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0] as const
      } 
    }
  };

  return (
    <section className="bg-bg-cream-1 py-14 md:py-20 lg:py-24 px-6 md:px-12 xl:px-24 z-10 relative" id="featured">
      {/* Background Soft Parallax or Transition Overlay */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg-cream-2 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-text-dark/10 pb-6 text-left">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.4em] font-bold text-accent-gold uppercase">
              CATEGORIES
            </span>
            <h2 className="font-display text-4xl md:text-5xl uppercase text-text-dark">
              FEATURED COLLECTIONS
            </h2>
          </div>
          <p className="text-xs uppercase font-mono tracking-widest text-text-dark/50 mt-4 md:mt-0">
            SPRING/SUMMER 2026 BLUEPRINT
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        {loading ? (
          <FeaturedCollectionSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px] md:auto-rows-[320px]"
          >
            {finalCards.map((card: any) => {
              if (card.size === 'large') {
                return (
                  <motion.div
                    key={card.id}
                    variants={cardVariants}
                    onClick={() => onCategoryClick(card.categoryLink)}
                    className="lg:col-span-2 lg:row-span-2 md:row-span-2 relative group overflow-hidden border border-text-dark/5 bg-bg-cream-2 flex flex-col justify-end p-8 cursor-pointer hover-trigger transition-all duration-500 shadow-sm hover:shadow-xl hover:border-accent-gold/25"
                  >
                    {/* Background Image with Zoom */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark-1/80 via-bg-dark-1/20 to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 text-left space-y-3 text-white transition-transform duration-500 group-hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-widest text-accent-gold uppercase font-bold">
                          {card.subtitle}
                        </span>
                        <span className="text-[10px] font-mono opacity-50 font-bold">{card.count}</span>
                      </div>
                      <h3 className="font-display text-3xl md:text-5xl uppercase leading-none">
                        {card.title}
                      </h3>
                      <p className="text-xs md:text-sm text-white/70 max-w-md font-light leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 overflow-hidden">
                        {card.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs font-bold text-accent-gold pt-2 uppercase tracking-widest">
                        <span>EXPLORE COLLECTION</span>
                        <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </motion.div>
                );
              }

              if (card.size === 'medium') {
                return (
                  <motion.div
                    key={card.id}
                    variants={cardVariants}
                    onClick={() => onCategoryClick(card.categoryLink)}
                    className="relative group overflow-hidden border border-text-dark/5 bg-bg-cream-2 flex flex-col justify-end p-6 cursor-pointer hover-trigger transition-all duration-500 shadow-sm hover:shadow-lg hover:border-accent-gold/25"
                  >
                    {/* Background Image with Zoom */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark-1/90 via-bg-dark-1/30 to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 text-left space-y-2 text-white transition-transform duration-500 group-hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-widest text-accent-gold uppercase font-bold">
                          {card.subtitle}
                        </span>
                        <span className="text-[10px] font-mono opacity-50 font-bold">{card.count}</span>
                      </div>
                      <h3 className="font-display text-2xl md:text-3xl uppercase leading-none">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-white/70 font-light leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-16 transition-all duration-500 overflow-hidden">
                        {card.description}
                      </p>
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-accent-gold pt-1.5 uppercase tracking-widest">
                        <span>VIEW ITEMS</span>
                        <ArrowUpRight size={12} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Editorial Text Card
              return (
                <motion.div
                  key={card.id}
                  variants={cardVariants}
                  onClick={() => onCategoryClick(card.categoryLink)}
                  className="relative group border border-accent-gold/25 bg-bg-cream-2/80 p-8 flex flex-col justify-between text-left cursor-pointer hover-trigger transition-all duration-500 shadow-sm hover:shadow-md hover:bg-bg-cream-2"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                      <span className="text-[9px] font-mono tracking-widest text-text-dark/50 uppercase">
                        {card.subtitle}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl uppercase text-text-dark leading-none group-hover:text-accent-gold transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-xs text-text-dark/70 font-light leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-text-dark/5 transition-transform duration-500 group-hover:-translate-y-0.5">
                    <p className="text-[11px] italic text-accent-gold font-light leading-snug">
                      {card.quote}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-text-dark group-hover:text-accent-gold transition-colors uppercase tracking-widest">
                      <span>SEE ESSENTIALS</span>
                      <ArrowUpRight size={12} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
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

export default FeaturedCollection;
