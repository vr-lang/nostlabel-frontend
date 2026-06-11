import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  review: string;
  rating: number;
}

export const Testimonials: React.FC = () => {
  const reviews: Testimonial[] = [
    {
      name: "Marcus Vance",
      location: "Copenhagen, DK",
      review: "The drape of the boxy hoodie is unmatched. It retains its architectural stiffness even after multiple cycles. Replaces all my high-end blanks.",
      rating: 5
    },
    {
      name: "Elena Rostova",
      location: "Berlin, DE",
      review: "NOSTLABEL's shoulder drops are engineered perfectly. Minimal, comfortable, and structured. A brand that actually understands pattern making.",
      rating: 5
    },
    {
      name: "Kenji Sato",
      location: "Tokyo, JP",
      review: "The 220 GSM long-staple cotton feels luxurious and breathes well. The stitching detail along the cuffs and neck ribbing is pristine.",
      rating: 5
    },
    {
      name: "Chloe Mercier",
      location: "Paris, FR",
      review: "Clean lines, heavy construction, and beautiful muted color tones. The package arrived in a custom linen protective bag. Highly impressed.",
      rating: 5
    }
  ];

  // Duplicate the list to ensure seamless infinite looping scroll
  const marqueeList = [...reviews, ...reviews];

  return (
    <section className="bg-bg-dark-2 py-24 overflow-hidden relative z-10" id="testimonials">
      
      {/* Background radial light */}
      <div className="absolute w-[50vw] h-[30vw] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] rounded-full bg-accent-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 text-left mb-16 space-y-2">
        <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
          EXPERIENCES
        </span>
        <h2 className="font-display text-4xl md:text-5xl uppercase text-text-light">
          VERIFIED VERDICTS
        </h2>
      </div>

      {/* Infinite Scrolling Ticker (CSS Marquee) */}
      <div className="relative w-full flex items-center overflow-x-hidden py-4">
        {/* Scroll Track */}
        <div className="flex w-max space-x-6 animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] gpu-accel">
          {marqueeList.map((item, idx) => (
            <div
              key={idx}
              className="w-[300px] md:w-[380px] shrink-0 glassmorphism p-8 flex flex-col justify-between space-y-6 text-left"
            >
              {/* Rating stars */}
              <div className="flex space-x-1">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} size={12} className="fill-accent-gold text-accent-gold" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-xs md:text-sm text-white/80 leading-relaxed font-light italic">
                "{item.review}"
              </p>

              {/* Reviewer Meta */}
              <div className="flex items-center space-x-4 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-[10px] font-bold font-mono tracking-wider shrink-0 uppercase">
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-text-light uppercase tracking-wider">
                    {item.name}
                  </h4>
                  <span className="text-[10px] font-mono text-white/40">
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add standard CSS keyframes for marquee */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 12px)); /* half offset */
          }
        }
      `}</style>

    </section>
  );
};

export default Testimonials;
