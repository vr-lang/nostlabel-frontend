import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { HERO_PRODUCTS } from '../data/products';
import type { Product } from '../data/products';
import { productService } from '../services/productService';

const NOSTLABEL_PLACEHOLDER = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000";

interface HeroProps {
  onShopClick: () => void;
  onExploreClick: () => void;
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string) => void;
}

const HeroSkeleton: React.FC = () => (
  <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#0F0D0A] pt-28 pb-12 px-6 md:px-12 animate-pulse">
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-grow">
      <div className="lg:col-span-5 flex flex-col text-left space-y-8">
        <div className="space-y-4">
          <div className="h-4 bg-white/10 w-1/3 rounded-xs" />
          <div className="h-16 bg-white/10 w-full rounded-xs" />
          <div className="h-16 bg-white/10 w-5/6 rounded-xs" />
        </div>
        <div className="h-12 bg-white/10 w-2/3 rounded-xs" />
        <div className="flex space-x-6">
          <div className="h-12 bg-white/10 w-32 rounded-xs" />
          <div className="h-12 bg-white/10 w-32 rounded-xs" />
        </div>
      </div>
      <div className="lg:col-span-7 flex items-center justify-center h-[45vh] lg:h-[60vh] w-full">
        <div className="w-64 md:w-80 h-[32vh] lg:h-[40vh] bg-white/5 rounded-xs" />
      </div>
    </div>
    <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-3 border-t border-white/10 pt-8 mt-12">
      <div className="space-y-2 text-left">
        <div className="h-3 bg-white/10 w-16 rounded-xs" />
        <div className="h-4 bg-white/10 w-24 rounded-xs" />
        <div className="h-3 bg-white/10 w-32 rounded-xs" />
      </div>
      <div className="hidden md:flex justify-center">
        <div className="h-8 bg-white/10 w-36 rounded-xs" />
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-3 bg-white/10 w-16 rounded-xs" />
        <div className="h-4 bg-white/10 w-20 rounded-xs" />
      </div>
    </div>
  </div>
);

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreClick, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Background colors corresponding to products for dynamic transitions
  const bgColors = [
    '#F8F5F0', // Cream 1
    '#F0ECE3', // Darker neutral
    '#E9E5DB', // Warm Khaki neutral
    '#E1DCD1', // Warm Sand neutral
  ];

  useEffect(() => {
    const fetchNewest = async () => {
      try {
        const data = await productService.getNewestProducts();
        setProducts(data.slice(0, 4));
      } catch (err) {
        console.error("Failed to load products for Hero:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewest();
  }, []);

  const displayProducts = products.length > 0 ? products : HERO_PRODUCTS;

  // Auto loop interval
  useEffect(() => {
    if (displayProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayProducts.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [displayProducts.length]);

  // Parallax calculations on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayProducts.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % displayProducts.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayProducts.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
  };

  if (loading) {
    return <HeroSkeleton />;
  }

  const currentProduct = displayProducts[activeIndex] || HERO_PRODUCTS[0];

  // Helper to determine slide properties
  const getSlidePosition = (index: number) => {
    const total = displayProducts.length;
    if (total === 0) return 'behind';
    const diff = (index - activeIndex + total) % total;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    if (diff === total - 1) return 'left';
    return 'behind';
  };

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, ease: 'easeOut' as const }}
      className="relative w-full flex flex-col justify-between overflow-hidden transition-colors duration-[1000ms] ease-out pt-20 pb-8 px-4 h-auto min-h-auto md:h-[85vh] md:min-h-[70vh] md:pt-24 md:pb-10 md:px-8 lg:min-h-screen lg:pt-28 lg:pb-12 lg:px-12 z-10"
      style={{ backgroundColor: bgColors[activeIndex % bgColors.length] }}
      id="hero"
    >
      {/* Subtle Dust/Particles Canvas Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute w-2.5 h-2.5 rounded-full bg-accent-gold/40 top-[20%] left-[15%] blur-[1px] animate-[pulse_6s_infinite]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-accent-gold/50 top-[60%] left-[80%] blur-[0.5px] animate-[pulse_4s_infinite_1.5s]" />
        <div className="absolute w-2 h-2 rounded-full bg-accent-gold/30 top-[80%] left-[30%] blur-[1px] animate-[pulse_8s_infinite_3s]" />
      </div>

      {/* Massive 3D Background Ghost Typography */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1.0, ease: 'easeOut' as const }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
      >
        <span 
          className="font-display text-[25vw] leading-none text-text-dark tracking-tighter opacity-[0.035] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -35}px, ${mousePos.y * -35}px, 0)`,
          }}
        >
          NOSTLABEL
        </span>
      </motion.div>

      {/* --- DESKTOP HERO LAYOUT (1024px+) --- */}
      <div className="hidden lg:grid max-w-7xl mx-auto w-full grid-cols-12 gap-8 lg:gap-12 items-center z-10 mt-6 md:mt-12 flex-grow">
        {/* Left Copy Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' as const }}
          className="lg:col-span-5 flex flex-col justify-center text-left space-y-8"
        >
          <div className="space-y-3">
            <span className="text-[10px] md:text-xs tracking-[0.3em] font-semibold text-accent-gold uppercase block">
              ARCHITECTURAL STREETWEAR
            </span>
            <h1 className="font-display text-4xl md:text-6xl xl:text-7xl text-text-dark leading-none uppercase tracking-tight">
              DESIGNED TO FLOAT.<br />
              BUILT TO LAST.
            </h1>
          </div>

          <p className="text-sm md:text-base text-text-dark/70 max-w-md leading-relaxed font-light">
            Minimal silhouettes engineered through precision stitching, premium fabrics, and timeless construction.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' as const }}
            className="flex items-center space-x-6"
          >
            <button
              onClick={onShopClick}
              className="bg-text-dark text-white text-xs uppercase tracking-[0.2em] px-8 py-4 border border-text-dark hover:bg-transparent hover:text-text-dark transition-all duration-300 hover-trigger"
              id="hero-btn-shop"
            >
              Shop Collection
            </button>
            <button
              onClick={onExploreClick}
              className="text-text-dark text-xs uppercase tracking-[0.2em] py-4 flex items-center space-x-2 border-b border-text-dark/20 hover:border-text-dark transition-all duration-300 hover-trigger"
              id="hero-btn-lookbook"
            >
              <span>Explore Lookbook</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Center Floating Carousel Column */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' as const }}
          className="lg:col-span-7 relative flex items-center justify-center h-[45vh] lg:h-[60vh] w-full mt-6 lg:mt-0 select-none"
        >
          {/* TOONHUB Floating Carousel */}
          <div className="relative w-full max-w-md h-full flex items-center justify-center">
            {displayProducts.map((prod, index) => {
              const pos = getSlidePosition(index);
              
              // Define positioning states for visual hierarchy
              let style: React.CSSProperties = {};
              let rotateY = 0;
              let scale = 1.0;
              let opacity = 1.0;
              let zIndex = 10;
              let translateX = 0;
              
              const slideOffset = 170;

              if (pos === 'center') {
                scale = 1.15;
                zIndex = 30;
                // Add minor mouse-parallax rotation
                rotateY = mousePos.x * 20; 
                translateX = mousePos.x * 40;
                style = {
                  filter: 'drop-shadow(0 25px 35px rgba(18, 18, 18, 0.12))',
                  transform: `translate3d(${translateX}px, ${mousePos.y * 40}px, 100px)`,
                };
              } else if (pos === 'left') {
                scale = 0.75;
                opacity = 0.5;
                zIndex = 20;
                translateX = -slideOffset;
                style = {
                  filter: 'drop-shadow(0 15px 15px rgba(18, 18, 18, 0.06))',
                  transform: `translate3d(${translateX}px, 0px, -100px)`,
                };
              } else if (pos === 'right') {
                scale = 0.75;
                opacity = 0.5;
                zIndex = 20;
                translateX = slideOffset;
                style = {
                  filter: 'drop-shadow(0 15px 15px rgba(18, 18, 18, 0.06))',
                  transform: `translate3d(${translateX}px, 0px, -100px)`,
                };
              } else {
                // Behind
                scale = 0.45;
                opacity = 0;
                zIndex = 10;
                style = {
                  transform: 'translate3d(0px, -50px, -200px)',
                  pointerEvents: 'none',
                };
              }

              return (
                <motion.div
                  key={prod.id}
                  onClick={() => {
                    if (pos === 'left') handlePrev({} as any);
                    if (pos === 'right') handleNext({} as any);
                  }}
                  className={`absolute w-44 sm:w-64 md:w-80 h-full flex flex-col justify-center items-center cursor-pointer transition-all duration-[650ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    pos === 'center' ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                  style={{
                    zIndex,
                    opacity,
                    ...style,
                  }}
                >
                  {/* Floating Shadow */}
                  {pos === 'center' && (
                    <motion.div
                      className="absolute bottom-[10%] w-32 h-4 rounded-full bg-black/10 blur-[8px] pointer-events-none"
                      style={{
                        scale: 1 - Math.abs(mousePos.y * 0.2),
                        opacity: 0.6 - Math.abs(mousePos.y * 0.15),
                      }}
                    />
                  )}

                  {/* Garment Image */}
                  <motion.img
                    src={prod.images[0] || NOSTLABEL_PLACEHOLDER}
                    alt={prod.name}
                    className="w-full h-[32vh] lg:h-[40vh] object-contain select-none pointer-events-none transition-transform duration-700 ease-out"
                    loading="lazy"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 1, 0.5, 1] as const,
                    }}
                    style={{
                      transform: `scale(${scale}) rotateY(${rotateY}deg)`,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Carousel Arrow Controls */}
          {displayProducts.length > 1 && (
            <div className="absolute bottom-4 flex items-center space-x-6 z-30">
              <button
                onClick={handlePrev}
                className="p-3 border border-text-dark/15 hover:border-text-dark bg-transparent rounded-full transition-colors hover-trigger"
                aria-label="Previous garment"
              >
                <ArrowLeft size={18} className="text-text-dark" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 border border-text-dark/15 hover:border-text-dark bg-transparent rounded-full transition-colors hover-trigger"
                aria-label="Next garment"
              >
                <ArrowRight size={18} className="text-text-dark" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* --- DESKTOP FOOTER METADATA STRIP --- */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' as const }}
        className="hidden lg:grid max-w-7xl mx-auto w-full grid-cols-3 items-end border-t border-text-dark/10 pt-8 mt-12 z-10"
      >
        {/* Bottom Left: Product Name / Info */}
        <div className="text-left space-y-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              <span className="text-[10px] tracking-widest text-text-dark/40 font-bold uppercase">
                ACTIVE FOCUS
              </span>
              <p className="text-sm font-semibold text-text-dark">
                {currentProduct.name}
              </p>
              <p className="text-xs text-text-dark/60 font-medium font-mono">
                {currentProduct.material} • {currentProduct.gsm}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Center (Desktop Only): Quick Cart Button */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <button
            onClick={() => onAddToCart(currentProduct, 'M', currentProduct.colors[0] || 'Default')}
            className="text-[10px] uppercase font-bold tracking-[0.25em] py-2 px-6 border border-text-dark/20 bg-transparent hover:bg-text-dark hover:text-white transition-all duration-300 hover-trigger"
          >
            Quick Add Size M
          </button>
        </div>

        {/* Bottom Right: Discovery callout */}
        <div className="text-right flex flex-col items-end space-y-1">
          <span className="text-[10px] tracking-widest text-text-dark/40 font-bold uppercase">
            SEASON COLLECTION
          </span>
          <button
            onClick={onShopClick}
            className="text-xs font-semibold tracking-wider text-text-dark hover:text-accent-gold transition-colors flex items-center space-x-1.5 hover-trigger"
          >
            <span>DISCOVER ALL</span>
            <span className="font-mono text-base">→</span>
          </button>
        </div>
      </motion.div>

      {/* --- TABLET HERO LAYOUT (768px - 1023px) --- */}
      <div className="hidden md:flex lg:hidden flex-col items-center justify-between w-full max-w-xl mx-auto text-center z-10 flex-grow h-[75vh] max-h-[80vh] py-2 space-y-4">
        {/* 2. Product Image Display */}
        <div className="relative w-full h-[25vh] max-h-[220px] flex items-center justify-center select-none pt-2">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentProduct.id}
              src={currentProduct.images[0] || NOSTLABEL_PLACEHOLDER}
              alt={currentProduct.name}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4 }}
              className="h-full object-contain"
            />
          </AnimatePresence>
        </div>

        {/* 8. Carousel Controls below image */}
        {displayProducts.length > 1 && (
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={handlePrev}
              className="p-2 border border-text-dark/15 hover:border-text-dark bg-transparent rounded-full transition-colors"
              aria-label="Previous garment"
            >
              <ArrowLeft size={14} className="text-text-dark" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 border border-text-dark/15 hover:border-text-dark bg-transparent rounded-full transition-colors"
              aria-label="Next garment"
            >
              <ArrowRight size={14} className="text-text-dark" />
            </button>
          </div>
        )}

        {/* 3 & 4 & 5. Architectural Streetwear Label, Heading & Description */}
        <div className="space-y-2 px-4">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-accent-gold uppercase block">
            ARCHITECTURAL STREETWEAR
          </span>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-text-dark uppercase tracking-tight">
            DESIGNED TO FLOAT.<br />
            BUILT TO LAST.
          </h1>
          <p className="text-xs text-text-dark/70 font-light leading-relaxed max-w-md mx-auto">
            Minimal silhouettes engineered through precision stitching, premium fabrics, and timeless construction.
          </p>
        </div>

        {/* 6. CTA Buttons */}
        <div className="flex space-x-4 w-full justify-center max-w-sm px-4">
          <button
            onClick={onShopClick}
            className="flex-1 bg-text-dark text-white text-[11px] uppercase tracking-[0.2em] py-3 border border-text-dark font-bold hover:bg-transparent hover:text-text-dark transition-all duration-300"
          >
            Shop Collection
          </button>
          <button
            onClick={onExploreClick}
            className="flex-1 text-text-dark text-[11px] uppercase tracking-[0.2em] py-3 flex items-center justify-center space-x-2 border-b border-text-dark/20 font-bold hover:border-text-dark transition-all duration-300"
          >
            Explore Lookbook
          </button>
        </div>

        {/* 7. Product Metadata Strip */}
        <div className="flex justify-between items-center w-full max-w-md px-4 pt-3 border-t border-text-dark/10">
          <div className="text-left space-y-0.5">
            <span className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase block">
              ACTIVE FOCUS
            </span>
            <p className="text-xs font-semibold text-text-dark">
              {currentProduct.name}
            </p>
            <p className="text-[10px] text-text-dark/60 font-mono">
              {currentProduct.material} • {currentProduct.gsm}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <button
              onClick={() => onAddToCart(currentProduct, 'M', currentProduct.colors[0] || 'Default')}
              className="text-[9px] uppercase font-bold tracking-[0.15em] py-1.5 px-4 border border-text-dark/20 bg-transparent hover:bg-text-dark hover:text-white transition-all duration-300"
            >
              Quick Add M
            </button>
            <button
              onClick={onShopClick}
              className="text-[9px] font-bold tracking-wider text-text-dark hover:text-accent-gold transition-colors flex items-center space-x-1"
            >
              <span>DISCOVER ALL</span>
              <span className="font-mono">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE HERO LAYOUT (Below 768px) --- */}
      <div className="flex md:hidden flex-col items-center w-full max-w-sm mx-auto text-center z-10 px-2 space-y-6">
        {/* 2. Product Image Display */}
        <div className="w-[85%] max-w-[280px] aspect-[4/3] flex items-center justify-center select-none pt-2">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentProduct.id}
              src={currentProduct.images[0] || NOSTLABEL_PLACEHOLDER}
              alt={currentProduct.name}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-contain"
            />
          </AnimatePresence>
        </div>

        {/* 8. Carousel Controls below image */}
        {displayProducts.length > 1 && (
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={handlePrev}
              className="p-2.5 border border-text-dark/15 hover:border-text-dark bg-transparent rounded-full transition-colors"
              aria-label="Previous garment"
            >
              <ArrowLeft size={14} className="text-text-dark" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 border border-text-dark/15 hover:border-text-dark bg-transparent rounded-full transition-colors"
              aria-label="Next garment"
            >
              <ArrowRight size={14} className="text-text-dark" />
            </button>
          </div>
        )}

        {/* 3 & 4 & 5. Architectural Streetwear Label, Heading & Description */}
        <div className="space-y-3 w-full">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-accent-gold uppercase block">
            ARCHITECTURAL STREETWEAR
          </span>
          <h1 className="font-display text-[42px] xs:text-[48px] sm:text-[54px] leading-[1.1] text-text-dark uppercase tracking-tight">
            DESIGNED TO FLOAT.<br />
            BUILT TO LAST.
          </h1>
          <p className="text-xs text-text-dark/70 font-light leading-relaxed max-w-xs mx-auto">
            Minimal silhouettes engineered through precision stitching, premium fabrics, and timeless construction.
          </p>
        </div>

        {/* 6. CTA Buttons */}
        <div className="flex flex-col space-y-3 w-full max-w-[320px]">
          <button
            onClick={onShopClick}
            className="bg-text-dark text-white text-xs uppercase tracking-[0.2em] py-3.5 border border-text-dark font-bold hover:bg-transparent hover:text-text-dark transition-all duration-300"
            id="hero-mobile-btn-shop"
          >
            Shop Collection
          </button>
          <button
            onClick={onExploreClick}
            className="text-text-dark text-xs uppercase tracking-[0.2em] py-3 flex items-center justify-center space-x-2 border-b border-text-dark/20 font-bold hover:border-text-dark transition-all duration-300"
            id="hero-mobile-btn-lookbook"
          >
            Explore Lookbook
          </button>
        </div>

        {/* 7. Product Metadata Strip */}
        <div className="flex flex-col items-center space-y-3 pt-4 border-t border-text-dark/10 w-full max-w-[320px]">
          <div className="space-y-0.5">
            <span className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase block">
              ACTIVE FOCUS
            </span>
            <p className="text-xs font-semibold text-text-dark">
              {currentProduct.name}
            </p>
            <p className="text-[10px] text-text-dark/60 font-medium font-mono">
              {currentProduct.material} • {currentProduct.gsm}
            </p>
          </div>

          <button
            onClick={() => onAddToCart(currentProduct, 'M', currentProduct.colors[0] || 'Default')}
            className="w-full text-[9px] uppercase font-bold tracking-[0.2em] py-2.5 border border-text-dark/20 bg-transparent hover:bg-text-dark hover:text-white transition-all duration-300"
          >
            Quick Add Size M
          </button>

          <button
            onClick={onShopClick}
            className="text-[9px] font-bold tracking-wider text-text-dark hover:text-accent-gold transition-colors flex items-center space-x-1.5"
          >
            <span>DISCOVER ALL</span>
            <span className="font-mono text-xs">→</span>
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
