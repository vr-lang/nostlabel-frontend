import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitCraftProps {
  onLearnMoreClick: () => void;
}

export const SplitCraft: React.FC<SplitCraftProps> = ({ onLearnMoreClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Line by line heading reveal
      const lines = headingRef.current?.querySelectorAll('.heading-line');
      if (lines) {
        gsap.fromTo(
          lines,
          { y: '100%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            stagger: 0.15,
            ease: 'power2.out',
            duration: 0.6,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
              once: true,
            },
          }
        );
      }

      // Right content fade-in & slide-up
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[60vh] w-full flex items-center bg-bg-cream-2 py-14 md:py-20 lg:py-28 px-6 md:px-12 xl:px-24 overflow-hidden z-10"
      id="split-craft"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column - Huge Typography with negative space */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
            THE PRODUCTION PRINCIPLE
          </span>
          <h2
            ref={headingRef}
            className="font-display text-4xl md:text-6xl xl:text-7xl text-text-dark leading-[0.9] uppercase tracking-tight"
          >
            <div className="overflow-hidden py-1">
              <span className="heading-line inline-block gpu-accel">PRECISION</span>
            </div>
            <div className="overflow-hidden py-1">
              <span className="heading-line inline-block gpu-accel">IN EVERY</span>
            </div>
            <div className="overflow-hidden py-1">
              <span className="heading-line inline-block gpu-accel">THREAD.</span>
            </div>
          </h2>
        </div>

        {/* Right Column - Editorial copy description */}
        <div
          ref={contentRef}
          className="lg:col-span-5 space-y-8 text-left mt-8 lg:mt-16"
        >
          <div className="h-[2px] w-12 bg-accent-gold" />
          
          <div className="space-y-6">
            <p className="text-sm md:text-base text-text-dark/80 leading-relaxed font-light">
              Each garment begins in our design lab, where architectural scale models guide the drafting of custom shoulder sweeps and sleeve slopes. We select only the highest density long-staple cotton, double-weaving the fibers to withstand daily abrasion while retaining a perfect, structured hang.
            </p>
            
            <p className="text-xs md:text-sm text-text-dark/60 leading-relaxed font-mono">
              Flat-locked side seams prevent folding inside layered coats, while double-needle collar structures are pre-shrunk through custom wash cycles to preserve the neckline shape over years of wash and wear.
            </p>
          </div>

          <div>
            <button
              onClick={onLearnMoreClick}
              className="group flex items-center space-x-3 text-xs uppercase tracking-[0.25em] font-bold text-text-dark hover:text-accent-gold transition-colors hover-trigger"
              id="btn-split-cta"
            >
              <span>DISCOVER CRAFTSMANSHIP</span>
              <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 font-mono">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SplitCraft;
