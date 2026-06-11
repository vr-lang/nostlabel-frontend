import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '../data/products';

interface HomepageOfferSectionProps {
  offer: {
    title: string;
    subtitle: string;
    description?: string;
    price: number;
    ctaText: string;
    ctaLink: string;
    products?: Product[];
  };
  isFirstSection?: boolean;
  onAddToCart?: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string) => void;
}

export const HomepageOfferSection: React.FC<HomepageOfferSectionProps> = ({
  offer,
  isFirstSection = true,
}) => {
  const navigate = useNavigate();
  const products = offer.products || [];

  const handleCtaClick = () => {
    navigate(offer.ctaLink || '/collections/t-shirts');
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full overflow-hidden bg-[#0A0A0A] text-white flex flex-col justify-center items-center px-6 md:px-12 py-16 md:py-24 lg:py-28 z-10 border-b border-white/5"
      style={{
        paddingTop: isFirstSection ? 'calc(var(--header-height, 80px) + 2rem)' : '4rem',
      }}
      id="homepage-offer-section"
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Offer Details Copy */}
        <div className="lg:col-span-6 flex flex-col text-left space-y-6 lg:space-y-8 z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles size={12} className="text-accent-gold" />
              <span className="text-[10px] md:text-xs tracking-[0.3em] font-semibold text-accent-gold uppercase block">
                {offer.subtitle || 'LIMITED TIME OFFER'}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl xl:text-7xl text-white leading-none uppercase tracking-tight font-bold">
              {offer.title || 'ANY 2 T-SHIRTS FOR ₹1400'}
            </h1>
          </div>

          <p className="text-sm md:text-base text-white/60 max-w-md leading-relaxed font-light font-mono">
            {offer.description || 'Premium Oversized Tees engineered through precision stitching, premium fabrics, and timeless construction.'}
          </p>

          <div className="pt-2">
            <button
              onClick={handleCtaClick}
              className="bg-accent-gold text-black text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 border border-accent-gold hover:bg-transparent hover:text-white transition-all duration-300 flex items-center space-x-2"
            >
              <span>{offer.ctaText || 'SHOP THE OFFER'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Two Featured Products */}
        <div className="lg:col-span-6 z-10">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {products.slice(0, 2).map((product) => {
              const price = product.discountPrice || product.price;
              const hasDiscount = !!product.discountPrice;
              
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.slug)}
                  className="group cursor-pointer bg-white/[0.02] border border-white/5 p-4 rounded-sm hover:border-accent-gold/30 hover:bg-white/[0.03] transition-all duration-300 text-left flex flex-col justify-between aspect-[3/4]"
                >
                  {/* Thumbnail */}
                  <div className="w-full aspect-[4/5] bg-white/[0.01] overflow-hidden rounded-xs border border-white/5 relative flex items-center justify-center">
                    <img
                      src={product.images[0] || '/logo.png'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-[10px] font-mono tracking-widest uppercase border border-white/40 px-3 py-1.5 rounded-sm">
                        VIEW PRODUCT
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 space-y-1">
                    <span className="text-[8px] font-mono text-white/40 tracking-wider block uppercase">
                      {product.category || 'T-SHIRTS'}
                    </span>
                    <h4 className="font-display text-sm md:text-base text-white uppercase truncate group-hover:text-accent-gold transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="font-bold text-accent-gold">₹{price.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-white/40 line-through">₹{product.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default HomepageOfferSection;
