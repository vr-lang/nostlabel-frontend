import React from 'react';
import { motion } from 'framer-motion';

export const PageLoader: React.FC = () => {
  const brandName = "NOSTLABEL";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center select-none pointer-events-auto"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Brand logo letters staggered reveal */}
        <div className="flex space-x-2 overflow-hidden">
          {brandName.split('').map((char, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.6,
                delay: idx * 0.04,
                ease: [0.22, 1, 0.36, 1], // Premium cubic-bezier
              }}
              className="font-display text-3xl md:text-5xl text-white tracking-[0.25em] uppercase inline-block font-light"
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Minimal elegant loading slider line */}
        <div className="w-24 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'easeInOut',
            }}
            className="absolute top-0 h-full w-1/2 bg-white/70"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PageLoader;
