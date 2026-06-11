import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
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

  // Luxury benefits list
  const benefits = [
    '100% Organic Cotton',
    '240 GSM Fabric',
    'Oversized Fit',
    'Soft & Breathable',
    'Durable & Long Lasting',
    'Unisex',
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
      className="relative w-full min-h-[100dvh] bg-[#070707] text-white flex flex-col justify-between items-center overflow-hidden z-10 select-none px-6 md:px-12 py-10"
      style={{
        paddingTop: isFirstSection ? 'calc(var(--header-height, 80px) + 2rem)' : '4rem',
      }}
      id="homepage-offer-section"
    >
      {/* Luxury Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.07)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(7,7,7,0.95)_95%)] pointer-events-none z-0" />

      {/* Campaign Branding Header */}
      <div className="w-full flex flex-col items-center text-center space-y-2 z-10">
        <span className="font-display text-[26px] md:text-[34px] tracking-[0.4em] font-light text-white uppercase block leading-none">
          NØSTLABEL
        </span>
        <div className="flex items-center space-x-1.5 py-1">
          <Sparkles size={8} className="text-accent-gold animate-pulse" />
          <span className="text-[9px] md:text-[10px] font-mono tracking-[0.3em] text-accent-gold uppercase block font-semibold">
            {offer.subtitle || 'LIMITED TIME OFFER'}
          </span>
        </div>
      </div>

      {/* Core Typography Layout */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-4 md:space-y-6 z-10 my-4">
        <div className="space-y-1 md:space-y-2">
          <h2 className="font-display text-[32px] sm:text-[46px] md:text-[56px] xl:text-[68px] leading-none text-white/95 uppercase tracking-tighter font-extrabold">
            ANY 2 T-SHIRTS
          </h2>
          <div className="flex items-center justify-center space-x-3 md:space-x-4">
            <span className="font-serif italic text-lg sm:text-2xl md:text-3xl text-white/40 font-light">for</span>
            <span className="font-display text-[50px] sm:text-[72px] md:text-[92px] xl:text-[108px] leading-none text-accent-gold font-black tracking-tight drop-shadow-[0_10px_20px_rgba(197,160,89,0.15)]">
              ₹{offer.price || '1400'}
            </span>
          </div>
        </div>
        
        <p className="text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.25em] text-white/50 uppercase max-w-md">
          {offer.description || 'Premium Oversized Tees'}
        </p>
      </div>

      {/* Large Product Campaign Showcase Collage */}
      {products.length > 0 && (
        <div className="w-full max-w-2xl flex justify-center items-center relative z-10 py-6 md:py-8 flex-grow max-h-[35vh] sm:max-h-[40vh] md:max-h-[45vh]">
          <div className="relative w-full max-w-lg h-full flex justify-center items-center aspect-[16/10]">
            {/* Left Product Image (Offset & Shadow) */}
            {products[0] && (
              <motion.div
                initial={{ x: -40, opacity: 0, rotate: -3 }}
                animate={{ x: -20, opacity: 1, rotate: -4 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                onClick={() => handleProductClick(products[0].slug)}
                className="absolute left-[15%] w-[45%] aspect-[3/4] bg-[#0E0E0E] border border-white/5 rounded-xs overflow-hidden shadow-2xl shadow-black/80 hover:border-accent-gold/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <img
                  src={products[0].images[0] || '/logo.png'}
                  alt={products[0].name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
              </motion.div>
            )}

            {/* Right Product Image (Overlapping & Highlighted) */}
            {products[1] && (
              <motion.div
                initial={{ x: 40, opacity: 0, rotate: 3 }}
                animate={{ x: 20, opacity: 1, rotate: 4 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                onClick={() => handleProductClick(products[1].slug)}
                className="absolute right-[15%] w-[45%] aspect-[3/4] bg-[#0E0E0E] border border-white/10 rounded-xs overflow-hidden shadow-2xl shadow-black/80 hover:border-accent-gold/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer z-20"
              >
                <img
                  src={products[1].images[0] || '/logo.png'}
                  alt={products[1].name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Benefits pill grid */}
      <div className="w-full max-w-2xl flex flex-wrap justify-center gap-2 md:gap-3 z-10 my-4 md:my-6 px-4">
        {benefits.map((benefit, i) => (
          <span
            key={i}
            className="text-[8px] sm:text-[9px] md:text-[10px] font-mono tracking-widest text-white/50 bg-white/[0.02] border border-white/5 px-3.5 py-1.5 rounded-full uppercase select-none hover:text-accent-gold hover:border-accent-gold/25 transition-all duration-200"
          >
            {benefit}
          </span>
        ))}
      </div>

      {/* Call-to-Action Bottom Banner */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-4 z-10 pt-2">
        <button
          onClick={handleCtaClick}
          className="w-full bg-accent-gold text-black text-[11px] uppercase tracking-[0.25em] font-bold py-4.5 border border-accent-gold hover:bg-transparent hover:text-white transition-all duration-300 shadow-xl shadow-accent-gold/10 font-display flex items-center justify-center space-x-2.5 active:scale-[0.98]"
        >
          <span>{offer.ctaText || 'SHOP THE OFFER'}</span>
          <ArrowRight size={14} className="stroke-[2.5px]" />
        </button>
      </div>
    </motion.section>
  );
};

export default HomepageOfferSection;
