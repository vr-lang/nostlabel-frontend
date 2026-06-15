import React from 'react';
import { ShieldCheck, RotateCcw, Truck, Award, Globe, Compass } from 'lucide-react';

export const TrustSignals: React.FC = () => {
  const signals = [
    {
      icon: <Compass className="text-accent-gold" size={20} />,
      title: "PREMIUM FABRICS",
      desc: "Conceived from carefully curated, extra-long staple organic cotton fibers for ultimate softness and long-lasting strength."
    },
    {
      icon: <Award className="text-accent-gold" size={20} />,
      title: "240 GSM HEAVYWEIGHT",
      desc: "Engineered with a dense, thick double-knit weight that holds its architectural drape and structured streetwear silhouette."
    },
    {
      icon: <Globe className="text-accent-gold" size={20} />,
      title: "MADE IN INDIA",
      desc: "Crafted in local boutique mills with rigorous hand-stitched details, double-needle cover seams, and pre-shrunk wash treatments."
    },
    {
      icon: <Truck className="text-accent-gold" size={20} />,
      title: "EXPRESS DISPATCH",
      desc: "Orders processed and shipped with speed across regions. Fast, reliable delivery cycles with end-to-end tracking."
    },
    {
      icon: <ShieldCheck className="text-accent-gold" size={20} />,
      title: "SECURE TRANSACTIONS",
      desc: "Industry-standard SSL encryption and trusted gateways ensure completely protected payment environments."
    },
    {
      icon: <RotateCcw className="text-accent-gold" size={20} />,
      title: "EASY EXCHANGES",
      desc: "Try out silhouettes with absolute peace of mind. Hassle-free exchanges and returns within a 7-day window."
    }
  ];

  return (
    <section className="bg-bg-cream-1 py-24 border-t border-text-dark/5" id="trust-signals">
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-24 text-left">
        <div className="space-y-2 mb-16 max-w-xl">
          <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
            OUR PROMISE
          </span>
          <h2 className="font-display text-4xl md:text-5xl uppercase text-text-dark">
            LEGITIMATE QUALITY STANDARDS
          </h2>
          <p className="text-xs font-mono text-text-dark/50 leading-relaxed uppercase pt-1">
            EVERY SILHOUETTE IS BORN FROM RIGOROUS DESIGN PRINCIPLES AND ETHICAL QUALITY CHECKS.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 w-full">
          {signals.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col space-y-4 border-l border-text-dark/10 pl-6 hover:border-accent-gold transition-colors duration-300 w-full min-w-0"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xs bg-bg-cream-2 border border-text-dark/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  {item.icon}
                </div>
                <span className="font-mono text-[10px] text-text-dark/30 font-bold">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="font-display text-lg uppercase text-text-dark tracking-wide group-hover:text-accent-gold transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-xs text-text-dark/65 font-light leading-relaxed w-full max-w-none">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
