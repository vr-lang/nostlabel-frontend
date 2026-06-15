import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const BrandStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.15 });

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

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-bg-dark-1 select-none z-10 py-16 md:py-24 lg:py-32 px-6 md:px-12 xl:px-24 border-t border-white/5"
      id="brand-story"
    >
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark-1 via-transparent to-bg-dark-1 z-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Editorial storytelling text copy */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-col text-left space-y-6 md:space-y-8"
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
            className="text-sm md:text-base text-white/70 max-w-2xl font-light leading-relaxed pt-2"
          >
            NOSTLABEL is a design studio focused on pattern engineering, premium fabric research, and structural streetwear silhouettes. We reject standard fast-fashion proportions. Every seam weight, rib radius, and drop shoulder angle is configured to float away from the body, constructing a structured uniform that remains unchanged through movement.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4 flex items-center space-x-6 text-[10px] font-mono tracking-widest text-white/30 uppercase">
            <span>RELEASE 004 / STRETCH & SHAPE</span>
            <span>•</span>
            <span>MODEL: SS26</span>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default BrandStory;
