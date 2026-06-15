import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { productService } from '../services/productService';

export const BrandStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.15 });
  const [imageUrl, setImageUrl] = useState("/logo.png");

  useEffect(() => {
    let active = true;
    const fetchImage = async () => {
      try {
        const products = await productService.getAllProducts();
        if (!active) return;
        const featured = products.find(p => p.featured && p.images && p.images.length > 0);
        const latest = products.find(p => p.images && p.images.length > 0);
        const targetProduct = featured || latest;
        if (targetProduct && targetProduct.images[0]) {
          setImageUrl(targetProduct.images[0]);
        }
      } catch (err) {
        console.error("Failed to load product image for studio mission:", err);
      }
    };
    fetchImage();
    return () => {
      active = false;
    };
  }, []);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] as const } 
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-bg-dark-1 select-none z-10 py-16 md:py-24 lg:py-32 px-6 md:px-12 xl:px-24 border-t border-white/5"
      id="brand-story"
    >
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark-1 via-transparent to-bg-dark-1 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">
        
        {/* Column 1: Editorial storytelling text copy */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="lg:col-span-6 flex flex-col text-left space-y-6 md:space-y-8"
        >
          {/* 1. Small label appears */}
          <motion.div variants={itemVariants} className="flex items-center space-x-3 opacity-60">
            <span className="w-8 h-[1px] bg-accent-gold" />
            <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase">
              STUDIO MISSION
            </span>
          </motion.div>

          {/* 2. Large heading reveals */}
          <motion.h2
            variants={headingVariants}
            className="font-display text-4xl md:text-5xl xl:text-6xl uppercase text-text-light leading-[1.15]"
          >
            WE DON'T MAKE CLOTHES. <br />
            <span className="text-accent-gold">WE BUILD IDENTITY.</span>
          </motion.h2>

          {/* 3. Paragraph fades upward */}
          <motion.p
            variants={itemVariants}
            className="text-sm md:text-base text-white/70 max-w-xl font-light leading-relaxed pt-2"
          >
            NOSTLABEL is a design studio focused on pattern engineering, premium fabric research, and structural streetwear silhouettes. We reject standard fast-fashion proportions. Every seam weight, rib radius, and drop shoulder angle is configured to float away from the body, constructing a structured uniform that remains unchanged through movement.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4 flex items-center space-x-6 text-[10px] font-mono tracking-widest text-white/30 uppercase">
            <span>RELEASE 004 / STRETCH & SHAPE</span>
            <span>•</span>
            <span>MODEL: SS26</span>
          </motion.div>
        </motion.div>

        {/* Column 2: Framed supporting lookbook image */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={containerVariants}
          className="lg:col-span-6 flex justify-center w-full"
        >
          <motion.div
            variants={imageVariants}
            className="aspect-[3/4] w-full max-w-md md:max-w-xl lg:max-w-none lg:w-full overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative group rounded-sm"
          >
            {/* Background Campaign Image with slight zoom */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${imageUrl})`,
                filter: 'grayscale(100%) brightness(55%)',
              }}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            
            {/* Accent Corner details */}
            <div className="absolute top-4 left-4 text-[8px] font-mono text-white/20 uppercase tracking-widest">
              LOOKBOOK SS26
            </div>
            <div className="absolute bottom-4 right-4 text-[8px] font-mono text-white/20 uppercase tracking-widest">
              [ 45.1097° N ]
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default BrandStory;
