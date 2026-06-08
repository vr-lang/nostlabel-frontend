import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(headingRef, { once: true, margin: "-100px" });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    // Simulate API registration with backend list
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  const title = "JOIN THE NOSTLABEL COMMUNITY";
  
  // Split title into letters for stagger animation
  const letters = title.split('');

  return (
    <section className="bg-bg-cream-1 py-32 px-6 md:px-12 relative z-10 overflow-hidden" id="newsletter">
      
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-text-dark/10" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-text-dark/10" />

      <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
        
        {/* Title Stagger */}
        <h2
          ref={headingRef}
          className="font-display text-4xl md:text-6xl xl:text-7xl uppercase text-text-dark tracking-tight leading-none flex flex-wrap justify-center overflow-hidden py-2"
        >
          {letters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: '100%', opacity: 0 }}
              animate={isInView ? { y: '0%', opacity: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.03,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={`inline-block gpu-accel ${char === ' ' ? 'mr-3 md:mr-5' : ''}`}
            >
              {char}
            </motion.span>
          ))}
        </h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.7, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-sm md:text-base text-text-dark max-w-lg mx-auto leading-relaxed font-light"
        >
          Receive exclusive drops, editorial stories, and early access releases directly to your private catalog inbox.
        </motion.p>

        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="max-w-md mx-auto"
        >
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-accent-gold/10 border border-accent-gold/30 text-text-dark text-xs uppercase tracking-[0.2em] font-semibold"
            >
              WELCOME TO THE INNER CIRCLE.
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <input
                type="email"
                placeholder="ENTER EMAIL ADDRESS"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-transparent border-b border-text-dark/20 text-xs tracking-widest font-medium py-4 px-2 text-text-dark focus:outline-none focus:border-accent-gold transition-colors placeholder:text-text-dark/30 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-text-dark text-white text-[10px] uppercase font-bold tracking-[0.25em] px-8 py-4 border border-text-dark hover:bg-transparent hover:text-text-dark transition-all duration-300 hover-trigger shrink-0"
              >
                {status === 'loading' ? 'SUBMITTING...' : 'SUBSCRIBE'}
              </button>
            </form>
          )}
        </motion.div>

        {/* Small terms */}
        <span className="block text-[9px] font-mono text-text-dark/30 tracking-widest uppercase">
          BY SUBMITTING, YOU AGREE TO OUR PRIVACY POLICY
        </span>

      </div>
    </section>
  );
};

export default Newsletter;
