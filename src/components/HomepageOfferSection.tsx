import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '../data/products';
import { getOptimizedImageUrl } from '../utils/image';

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
    let resolvedUrl = '/logo.png';
    if (product) {
      if (typeof product.images === 'string') {
        resolvedUrl = product.images;
      } else if (Array.isArray(product.images) && product.images.length > 0) {
        const img = product.images[0];
        if (img) {
          if (typeof img === 'string') resolvedUrl = img;
          else if (typeof img === 'object') {
            resolvedUrl = img.url || img.secure_url || '/logo.png';
          }
        }
      } else if (product.image) {
        if (typeof product.image === 'string') resolvedUrl = product.image;
        else if (typeof product.image === 'object' && product.image.url) resolvedUrl = product.image.url;
      }
    }
    return getOptimizedImageUrl(resolvedUrl, 800);
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
      className="relative w-full min-h-[100dvh] bg-[#070707] text-white flex flex-col justify-between items-center lg:justify-start overflow-hidden z-10 select-none px-6 md:px-12 lg:px-20 py-8 lg:py-16"
      style={{
        paddingTop: isFirstSection ? 'calc(var(--header-height, 80px) + 3rem)' : '4rem',
      }}
      id="homepage-offer-section"
    >
      {/* Luxury Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.07)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(7,7,7,0.95)_95%)] pointer-events-none z-0" />

      {/* --- MOBILE / TABLET LAYOUT (lg:hidden) --- */}
      <div className="lg:hidden flex flex-col justify-between items-center w-full h-full flex-grow">
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

        {/* Large Product Campaign Showcase Collage */}
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
      </div>

      {/* --- DESKTOP REDESIGNED LAYOUT (hidden lg:grid) --- */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center lg:w-full lg:max-w-7xl lg:mx-auto lg:flex-grow z-10 px-8">
        {/* Left Column: Premium Editorial Typography & CTA */}
        <div className="lg:col-span-5 flex flex-col items-start text-left py-6 w-full">
          {/* Branding */}
          <span className="font-display text-[28px] xl:text-[34px] tracking-[0.25em] font-light text-white uppercase block leading-none mb-10">
            NØSTLABEL
          </span>

          {/* Sparkles Campaign Capsule */}
          <div className="flex items-center space-x-2 py-1.5 border-b border-accent-gold/10 px-4 mb-6">
            <Sparkles size={10} className="text-accent-gold animate-pulse" />
            <span className="text-[10px] md:text-xs tracking-[0.35em] font-mono font-bold text-accent-gold uppercase block">
              {offer.subtitle || 'LIMITED TIME OFFER'}
            </span>
          </div>

          {/* ANY 2 T-SHIRTS */}
          <h2 className="font-display text-[56px] xl:text-[72px] leading-[1.05] text-white uppercase tracking-[0.05em] font-black mb-4">
            ANY 2 T-SHIRTS
          </h2>

          {/* FOR ₹1400 */}
          <div className="flex items-baseline space-x-4 mb-6">
            <span className="font-serif italic text-sm md:text-base text-white/40 uppercase tracking-[0.35em]">
              FOR
            </span>
            <span className="font-display text-[96px] xl:text-[120px] leading-none text-accent-gold font-black tracking-tight drop-shadow-[0_20px_45px_rgba(197,160,89,0.25)]">
              ₹{offer.price || '1400'}
            </span>
          </div>

          {/* PREMIUM OVERSIZED TEES */}
          <p className="text-[11px] xl:text-xs font-mono tracking-[0.4em] text-white/50 uppercase max-w-md mb-8">
            {offer.description || 'PREMIUM OVERSIZED TEES'}
          </p>

          {/* SHOP THE OFFER CTA */}
          <button
            onClick={handleCtaClick}
            className="w-[280px] bg-accent-gold text-black text-[11px] xl:text-[12px] uppercase tracking-[0.25em] font-bold py-4 border border-accent-gold hover:bg-transparent hover:text-white transition-all duration-300 shadow-xl shadow-accent-gold/10 font-display flex items-center justify-center space-x-2.5 active:scale-[0.98] cursor-pointer mb-8"
          >
            <span>{offer.ctaText || 'SHOP THE OFFER'}</span>
            <ArrowRight size={14} className="stroke-[2.5px]" />
          </button>

          {/* Feature Highlights Pills directly below CTA */}
          <div className="flex flex-wrap gap-3 w-full max-w-md mt-6">
            {benefits.map((benefit, i) => (
              <span
                key={i}
                className="text-[8px] xl:text-[9px] font-mono tracking-widest text-white/50 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full uppercase select-none hover:text-accent-gold hover:border-accent-gold/25 transition-all duration-200"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Large Product Showcase */}
        {products.length > 0 && (
          <div className="lg:col-span-7 flex justify-center items-center w-full h-[60vh] xl:h-[65vh]">
            <div className="relative w-full max-w-2xl xl:max-w-3xl h-full flex items-center justify-center px-4">
              {/* Left Product Image (Offset & Shadow) */}
              {products[0] && (
                <motion.div
                  initial={{ x: -40, opacity: 0, rotate: -2 }}
                  animate={{ x: 0, opacity: 1, rotate: -3 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  onClick={() => handleProductClick(products[0].slug)}
                  className="absolute left-[4%] top-[8%] w-[54%] xl:w-[56%] aspect-[3/4] bg-[#0E0E0E] border border-white/5 rounded-xs overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-accent-gold/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer z-10"
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
                  initial={{ x: 40, opacity: 0, rotate: 2 }}
                  animate={{ x: 0, opacity: 1, rotate: 3 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  onClick={() => handleProductClick(products[1].slug)}
                  className="absolute right-[4%] bottom-[8%] w-[54%] xl:w-[56%] aspect-[3/4] bg-[#0E0E0E] border border-white/10 rounded-xs overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-accent-gold/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer z-20"
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
      </div>
    </motion.section>
  );
};

export default HomepageOfferSection;
