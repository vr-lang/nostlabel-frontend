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
    const targetLink = offer.ctaLink || '/collections/oversized-t-shirts';
    if (targetLink.startsWith('http')) {
      window.location.href = targetLink;
    } else {
      navigate(targetLink);
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  // Safe image URL resolver
  const getProductImageUrl = (product: any) => {
    if (!product) return '/logo.png';
    if (typeof product.images === 'string') return product.images;
    if (Array.isArray(product.images) && product.images.length > 0) {
      const img = product.images[0];
      if (!img) return '/logo.png';
      if (typeof img === 'string') return img;
      if (typeof img === 'object') {
        if (img.url) return img.url;
        if (img.secure_url) return img.secure_url;
      }
    }
    if (product.image) {
      if (typeof product.image === 'string') return product.image;
      if (typeof product.image === 'object' && product.image.url) return product.image.url;
    }
    return '/logo.png';
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
      className="relative w-full min-h-[100dvh] bg-[#070707] text-white flex flex-col justify-between items-center overflow-hidden z-10 select-none px-6 md:px-12 py-8"
      style={{
        paddingTop: isFirstSection ? 'calc(var(--header-height, 80px) + 1.5rem)' : '3rem',
      }}
      id="homepage-offer-section"
    >
      {/* Luxury Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.07)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(7,7,7,0.95)_95%)] pointer-events-none z-0" />

      {/* Campaign Branding Header */}
      <div className="w-full flex flex-col items-center text-center space-y-1 z-10 shrink-0">
        <span className="font-display text-[26px] md:text-[34px] tracking-[0.4em] font-light text-white uppercase block leading-none">
          NØSTLABEL
        </span>
      </div>

      {/* Core Typography Layout */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center z-10 my-4 shrink-0">
        {/* LIMITED TIME OFFER */}
        <div className="flex items-center space-x-2 py-1.5 border-b border-accent-gold/10 px-4 mb-4 md:mb-6">
          <Sparkles size={10} className="text-accent-gold animate-pulse" />
          <span className="text-[10px] md:text-xs tracking-[0.35em] font-mono font-bold text-accent-gold uppercase block">
            {offer.subtitle || 'LIMITED TIME OFFER'}
          </span>
        </div>

        {/* ANY 2 T-SHIRTS */}
        <h2 className="font-display text-[32px] sm:text-[48px] md:text-[64px] xl:text-[80px] leading-[1.05] text-white uppercase tracking-[0.05em] font-black max-w-2xl mb-6 md:mb-8">
          ANY 2 T-SHIRTS
        </h2>

        {/* FOR */}
        <span className="font-serif italic text-xs sm:text-sm md:text-base text-white/40 uppercase tracking-[0.35em] block mb-3.5 md:mb-6">
          FOR
        </span>

        {/* ₹1400 */}
        <span className="font-display text-[64px] sm:text-[88px] md:text-[116px] xl:text-[138px] leading-[0.95] text-accent-gold font-black tracking-tighter drop-shadow-[0_15px_30px_rgba(197,160,89,0.15)] block mb-6 md:mb-8">
          ₹{offer.price || '1400'}
        </span>

        {/* PREMIUM OVERSIZED TEES */}
        <p className="text-[10px] sm:text-[11px] md:text-xs font-mono tracking-[0.4em] text-white/50 uppercase max-w-md">
          {offer.description || 'PREMIUM OVERSIZED TEES'}
        </p>
      </div>

      {/* Large Product Campaign Showcase Collage (Occupies 45-60% on Mobile, 40-50% on Desktop) */}
      {products.length > 0 && (
        <div className="w-full max-w-3xl flex justify-center items-center relative z-10 py-6 md:py-8 flex-grow h-[46vh] sm:h-[50vh] md:h-[42vh] lg:h-[45vh] min-h-[300px]">
          <div className="relative w-full max-w-md md:max-w-lg h-full flex justify-center items-center">
            {/* Left Product Image (Offset & Shadow) */}
            {products[0] && (
              <motion.div
                initial={{ x: -60, opacity: 0, rotate: -3 }}
                animate={{ x: -25, opacity: 1, rotate: -4 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                onClick={() => handleProductClick(products[0].slug)}
                className="absolute left-[6%] h-[92%] aspect-[3/4] bg-[#0E0E0E] border border-white/5 rounded-xs overflow-hidden shadow-2xl shadow-black/80 hover:border-accent-gold/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <img
                  src={getProductImageUrl(products[0])}
                  alt={products[0].name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </motion.div>
            )}

            {/* Right Product Image (Overlapping & Highlighted) */}
            {products[1] && (
              <motion.div
                initial={{ x: 60, opacity: 0, rotate: 3 }}
                animate={{ x: 25, opacity: 1, rotate: 4 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                onClick={() => handleProductClick(products[1].slug)}
                className="absolute right-[6%] h-[92%] aspect-[3/4] bg-[#0E0E0E] border border-white/10 rounded-xs overflow-hidden shadow-2xl shadow-black/80 hover:border-accent-gold/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer z-20"
              >
                <img
                  src={getProductImageUrl(products[1])}
                  alt={products[1].name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Benefits pill grid */}
      <div className="w-full max-w-2xl flex flex-wrap justify-center gap-2 md:gap-3 z-10 my-4 px-4 shrink-0">
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
      <div className="w-full max-w-xs flex flex-col items-center space-y-4 z-10 pt-2 shrink-0">
        <button
          onClick={handleCtaClick}
          className="w-full bg-accent-gold text-black text-[11px] uppercase tracking-[0.25em] font-bold py-4.5 border border-accent-gold hover:bg-transparent hover:text-white transition-all duration-300 shadow-xl shadow-accent-gold/10 font-display flex items-center justify-center space-x-2.5 active:scale-[0.98] cursor-pointer"
        >
          <span>{offer.ctaText || 'SHOP THE OFFER'}</span>
          <ArrowRight size={14} className="stroke-[2.5px]" />
        </button>
      </div>
    </motion.section>
  );
};

export default HomepageOfferSection;
