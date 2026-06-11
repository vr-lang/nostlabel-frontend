import React from 'react';
import { motion } from 'framer-motion';
import { useStartupLoading } from '../context/StartupLoadingContext';

export const PageLoader: React.FC = () => {
  const { isAppLoading, error, retry, statusMessage } = useStartupLoading();
  const brandName = "NOSTLABEL";

  const handleRetry = () => {
    retry();
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center px-6 text-center select-none pointer-events-auto">
        <div className="max-w-md w-full space-y-8 flex flex-col items-center">
          {/* Centered branding with premium tracking */}
          <div className="flex space-x-2 overflow-hidden opacity-30">
            {brandName.split('').map((char, idx) => (
              <span
                key={idx}
                className="font-display text-3xl md:text-5xl text-white tracking-[0.25em] uppercase inline-block font-light"
              >
                {char}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="font-mono text-xs text-red-500 uppercase tracking-[0.3em] font-bold">
              [ SYSTEM PORTAL DISRUPTION ]
            </h2>
            <p className="text-white text-sm tracking-wider font-light">
              Unable to connect to server.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-sm p-4 text-[10px] font-mono text-white/50 text-left max-h-32 overflow-y-auto w-full break-all leading-relaxed">
              <span className="text-white/30 block mb-1">REASON:</span>
              {error}
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="px-8 py-3 bg-transparent border border-white text-white uppercase text-[10px] tracking-[0.3em] font-mono hover:bg-white hover:text-black transition-all duration-300 rounded-sm"
          >
            RETRY HANDSHAKE
          </button>
        </div>
      </div>
    );
  }

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

        {/* Status log for startup awareness */}
        {isAppLoading && (
          <div className="text-[9px] font-mono text-accent-gold tracking-[0.3em] uppercase animate-pulse">
            {statusMessage}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PageLoader;
