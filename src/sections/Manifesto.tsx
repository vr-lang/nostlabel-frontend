import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Manifesto: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Line 1: WE DON'T FOLLOW TRENDS
      const words1 = line1Ref.current?.querySelectorAll('.manifesto-word');
      if (words1) {
        gsap.fromTo(
          words1,
          { opacity: 0.15, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      // Line 2: WE CREATE SILHOUETTES THAT OUTLIVE THEM
      const words2 = line2Ref.current?.querySelectorAll('.manifesto-word');
      if (words2) {
        gsap.fromTo(
          words2,
          { opacity: 0.15, y: 35 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 65%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const splitText = (text: string) => {
    return text.split(' ').map((word, idx) => (
      <span key={idx} className="manifesto-word inline-block mr-4 md:mr-6 gpu-accel">
        {word}
      </span>
    ));
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[60vh] w-full flex flex-col justify-center items-center bg-bg-cream-2 px-6 md:px-12 py-14 md:py-20 lg:py-24 select-none z-10"
      id="manifesto"
    >
      <div className="max-w-6xl w-full text-center space-y-12 md:space-y-20">
        
        {/* Editorial Subtitle */}
        <div className="flex items-center justify-center space-x-3 opacity-60">
          <span className="w-10 h-[1px] bg-text-dark" />
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-text-dark">
            BRAND MANIFESTO
          </span>
          <span className="w-10 h-[1px] bg-text-dark" />
        </div>

        {/* Word reveal lines */}
        <div className="space-y-6 md:space-y-10">
          <h2
            ref={line1Ref}
            className="font-display text-4xl md:text-7xl xl:text-8xl leading-none text-text-dark uppercase tracking-tight flex flex-wrap justify-center overflow-hidden py-2"
          >
            {splitText("WE DON'T FOLLOW TRENDS")}
          </h2>

          <div className="h-[1px] w-24 bg-accent-gold/45 mx-auto my-4" />

          <h2
            ref={line2Ref}
            className="font-display text-4xl md:text-7xl xl:text-8xl leading-none text-text-dark uppercase tracking-tight flex flex-wrap justify-center overflow-hidden py-2"
          >
            {splitText("WE CREATE SILHOUETTES THAT OUTLIVE THEM")}
          </h2>
        </div>

        {/* Small detail note */}
        <p className="text-xs uppercase font-mono tracking-[0.2em] text-text-dark/40 max-w-sm mx-auto">
          NOSTLABEL / STUDIO COLLECTION 01
        </p>

      </div>
    </section>
  );
};

export default Manifesto;
