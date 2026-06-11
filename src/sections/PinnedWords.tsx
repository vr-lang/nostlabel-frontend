import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Count-up helper component
const CountUp: React.FC<{ value: number; suffix?: string; prefix?: string; duration?: number }> = ({ 
  value, 
  suffix = '', 
  prefix = '',
  duration = 1500 
}) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(elementRef, { once: true });

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [inView, value, duration]);

  return <span ref={elementRef}>{prefix}{count}{suffix}</span>;
};

export const PinnedWords: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.15 });

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  const cardContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] as const } }
  };

  const coreCards = [
    {
      num: 220,
      suffix: " GSM",
      label: "FABRIC WEIGHT",
      desc: "Heavyweight organic cotton constructs structural drape that outlives movement."
    },
    {
      num: 95,
      suffix: "%",
      label: "COTTON PURITY",
      desc: "Blended with 5% spandex for stretch tension and dimensional stability."
    },
    {
      num: 100,
      suffix: "%",
      label: "ACID WASHED",
      desc: "Distressed fibers cured in small-batch dye vats for bespoke lookbook character."
    },
    {
      num: 12,
      suffix: " NM",
      label: "SEAM INTEGRITY",
      desc: "Reinforced thread tension counts ensure cuffs and ribs remain pristine."
    }
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-bg-dark-1 select-none z-10 py-16 md:py-24 lg:py-28 px-6 md:px-12 xl:px-24"
      id="pinned-words"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Editorial Title Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 text-left"
        >
          <div className="space-y-3 max-w-xl">
            <motion.span 
              variants={itemVariants}
              className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block"
            >
              BRAND CORE METADATA
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="font-display text-4xl md:text-5xl uppercase text-text-light leading-tight"
            >
              OUR SYSTEM <br />
              ATTRIBUTES
            </motion.h2>
          </div>
          <motion.p 
            variants={itemVariants}
            className="text-sm text-white/50 max-w-md font-light leading-relaxed mt-4 md:mt-0 md:pb-1"
          >
            A technical breakdown of raw material indices configured for luxury structure, premium weight, and longevity.
          </motion.p>
        </motion.div>

        {/* Staggered Grid of Metadata Cards with CountUps */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {coreCards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative overflow-hidden bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between min-h-[200px] md:min-h-[220px] rounded-sm shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-accent-gold/30 hover:bg-white/[0.04] cursor-default text-left"
            >
              {/* Border glow decoration */}
              <div className="absolute inset-0 border border-transparent group-hover:border-accent-gold/20 rounded-sm pointer-events-none transition-colors duration-500" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono tracking-widest text-accent-gold uppercase font-bold">
                    {card.label}
                  </span>
                  <span className="text-[10px] font-mono text-white/20 group-hover:text-accent-gold/40 transition-colors duration-500">
                    // 0{idx + 1}
                  </span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-text-light font-semibold tracking-tight uppercase group-hover:text-accent-gold transition-colors duration-300">
                  {inView ? (
                    <CountUp value={card.num} suffix={card.suffix} />
                  ) : (
                    <span>0{card.suffix}</span>
                  )}
                </h3>
              </div>

              <p className="text-[11px] text-white/50 font-light leading-relaxed mt-6">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PinnedWords;
