import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Shield, Sparkles, Shirt, Move, Award, Users, Heart } from 'lucide-react';

const CARDS = [
  {
    title: "95% COTTON + 5% SPANDEX",
    description: "Premium breathable organic fabric blended with stretch tension for comfortable, structural shape retention.",
    icon: Layers,
    gridSpan: "lg:col-span-2"
  },
  {
    title: "220 GSM HEAVYWEIGHT FABRIC",
    description: "Engineered heavyweight density designed to hold a clean boxy drape that outlives movement.",
    icon: Shield,
    gridSpan: "lg:col-span-2"
  },
  {
    title: "ACID WASH FINISH",
    description: "Bespoke washed cotton cured in small dye batches for a unique lookbook character.",
    icon: Sparkles,
    gridSpan: "lg:col-span-1"
  },
  {
    title: "OVERSIZED FIT",
    description: "Relaxed streetwear silhouettes crafted with dropped shoulders.",
    icon: Shirt,
    gridSpan: "lg:col-span-1"
  },
  {
    title: "4-WAY COMFORT",
    description: "Enhanced flexibility and elasticity for unrestricted styling utility.",
    icon: Move,
    gridSpan: "lg:col-span-2"
  },
  {
    title: "GRAPHIC PRINT",
    description: "Sharp screen detaling with premium wash durability.",
    icon: Award,
    gridSpan: "lg:col-span-1"
  },
  {
    title: "UNISEX ARCHIVE",
    description: "Minimalist proportions tailored for men and women.",
    icon: Users,
    gridSpan: "lg:col-span-1"
  },
  {
    title: "ALL-DAY COMFORT",
    description: "Constructed for everyday luxury wearability and modern architectural styling.",
    icon: Heart,
    gridSpan: "lg:col-span-2"
  }
];

export const WhyNostlabel: React.FC = () => {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0] as const
      } 
    }
  };

  return (
    <section 
      className="bg-bg-cream-1 py-16 md:py-24 lg:py-28 px-6 md:px-12 xl:px-24 z-10 relative" 
      id="why-nostlabel"
    >
      {/* Background Soft Parallax or Transition Overlay */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg-cream-2 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-text-dark/10 pb-8 text-left">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
              CRAFTED FOR COMFORT
            </span>
            <h2 className="font-display text-4xl md:text-5xl uppercase text-text-dark leading-tight">
              BUILT WITH PREMIUM MATERIALS
            </h2>
          </div>
          <p className="text-sm text-text-dark/70 max-w-md font-light leading-relaxed mt-4 md:mt-0 md:pb-1">
            Every NOSTLABEL piece is engineered with raw technical specs for maximum structure and timeless streetwear wearability.
          </p>
        </div>

        {/* 4x2 Asymmetric Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {CARDS.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className={`group relative overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 p-8 flex flex-col justify-between space-y-8 rounded-sm shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-accent-gold/30 hover:bg-white/80 cursor-default ${card.gridSpan}`}
              >
                {/* Border Glow Effect */}
                <div className="absolute inset-0 border border-transparent group-hover:border-accent-gold/20 rounded-sm pointer-events-none transition-colors duration-500" />
                
                {/* Card Top - Icon */}
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-bg-cream-2 rounded-xs border border-text-dark/5 text-text-dark/80 group-hover:text-accent-gold group-hover:border-accent-gold/20 transition-all duration-500 shadow-sm">
                    <IconComponent 
                      size={20} 
                      className="transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-dark/20 group-hover:text-accent-gold/40 transition-colors duration-500">
                    // 0{idx + 1}
                  </span>
                </div>

                {/* Card Bottom - Text */}
                <div className="space-y-2 text-left transition-transform duration-500 group-hover:-translate-y-1">
                  <h3 className="font-display text-lg uppercase text-text-dark tracking-tight leading-tight group-hover:text-accent-gold transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-xs text-text-dark/60 font-light leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default WhyNostlabel;
