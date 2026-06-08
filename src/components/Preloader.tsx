import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Percentage counter animation
    const obj = { val: 0 };
    const counterTween = gsap.to(obj, {
      val: 100,
      duration: 2.2,
      ease: 'power1.out',
      onUpdate: () => {
        setPercent(Math.floor(obj.val));
      },
    });

    // 2. Stagger reveal of brand letters
    const letters = textRef.current?.querySelectorAll('.pre-char');
    if (letters) {
      gsap.fromTo(
        letters,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.08,
          duration: 1.2,
          ease: 'power3.out',
        }
      );
    }

    // 3. Main container slide out wipe
    const ctx = gsap.context(() => {
      gsap.timeline({
        onComplete: () => {
          onComplete();
        },
      })
      .to(barRef.current, {
        scaleX: 1,
        duration: 2.0,
        ease: 'power2.inOut',
      })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 1.0,
        ease: 'power4.inOut',
        delay: 0.2,
      });
    }, containerRef);

    return () => {
      counterTween.kill();
      ctx.revert();
    };
  }, [onComplete]);

  const brandName = "NOSTLABEL";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-bg-dark-1 flex flex-col items-center justify-center select-none pointer-events-auto"
    >
      <div className="space-y-8 flex flex-col items-center">
        {/* Brand logo letters staggered */}
        <div ref={textRef} className="flex space-x-1.5 overflow-hidden">
          {brandName.split('').map((char, idx) => (
            <span
              key={idx}
              className="pre-char font-display text-4xl md:text-6xl text-white tracking-widest uppercase inline-block gpu-accel"
            >
              {char}
            </span>
          ))}
        </div>

        {/* Minimal loading bar */}
        <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
          <div
            ref={barRef}
            className="absolute top-0 left-0 h-full w-full bg-accent-gold transform origin-left scale-x-0"
          />
        </div>

        {/* Monospace numbers */}
        <div className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">
          CATALOG LOADING {percent.toString().padStart(3, '0')}%
        </div>
      </div>
    </div>
  );
};

export default Preloader;
