import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ScrollStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Text letter-by-letter stagger reveal (Play Once)
      const chars = textRef.current?.querySelectorAll('.char');
      if (chars) {
        gsap.fromTo(
          chars,
          { opacity: 0, scale: 1.25 },
          {
            opacity: 1,
            scale: 1,
            stagger: 0.03,
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

      // 2. Parallax: Image moves faster, text moves slower
      gsap.fromTo(
        imageRef.current,
        { y: -80 },
        {
          y: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        textRef.current,
        { y: 40 },
        {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const splitLetters = (text: string) => {
    return text.split('').map((char, idx) => (
      <span
        key={idx}
        className={`char inline-block gpu-accel ${char === ' ' ? 'mr-3 md:mr-6' : ''}`}
      >
        {char}
      </span>
    ));
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[60vh] md:h-[75vh] lg:h-[85vh] w-full flex items-center justify-center bg-bg-cream-1 overflow-hidden z-10"
      id="scroll-story"
    >
      {/* Parallax Image Layer */}
      <div
        ref={imageRef}
        className="absolute w-[80vw] md:w-[50vw] h-[60vh] md:h-[70vh] flex items-center justify-center z-0 opacity-40 md:opacity-50"
      >
        <img
          src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000"
          alt="Floating Garment Movement"
          className="w-full h-full object-contain filter grayscale contrast-125"
        />
        {/* Shadow beneath parallax image */}
        <div className="absolute bottom-4 w-40 h-6 rounded-full bg-black/5 blur-md" />
      </div>

      {/* Floating text on top */}
      <div className="relative z-10 text-center px-6 pointer-events-none">
        <span className="text-[10px] tracking-[0.4em] font-bold text-accent-gold uppercase block mb-4">
          MATERIAL & WEIGHT
        </span>
        <h2
          ref={textRef}
          className="font-display text-5xl md:text-8xl xl:text-9xl text-text-dark leading-none uppercase tracking-tight flex flex-wrap justify-center overflow-hidden py-4"
        >
          {splitLetters("DESIGNED FOR MOVEMENT")}
        </h2>
      </div>

      {/* Editorial aesthetic coordinates */}
      <div className="absolute bottom-12 left-12 hidden md:block text-left text-[9px] font-mono tracking-widest text-text-dark/40 space-y-1">
        <p>CO-ORD // 45.1097° N, 122.6801° W</p>
        <p>RAW MATERIAL SPEC // FOG:REP:AL</p>
      </div>

      <div className="absolute bottom-12 right-12 hidden md:block text-right text-[9px] font-mono tracking-widest text-text-dark/40">
        <p>MODEL 1.88M / WEARING SIZE L</p>
      </div>
    </section>
  );
};

export default ScrollStory;
