import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useStartupLoading } from '../context/StartupLoadingContext';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const { isAppLoading, error, retry, statusMessage } = useStartupLoading();
  const [percent, setPercent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef({ val: 0 });
  const slowTweenRef = useRef<gsap.core.Tween | null>(null);

  // 1. Initial letter reveal (run once on mount)
  useEffect(() => {
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
  }, []);

  // 2. Slow progress tween (0 to 95%) when app is loading and no error
  useEffect(() => {
    if (isAppLoading && !error) {
      percentRef.current.val = percent;

      if (slowTweenRef.current) {
        slowTweenRef.current.kill();
      }

      slowTweenRef.current = gsap.to(percentRef.current, {
        val: 95,
        duration: 15,
        ease: 'power2.out',
        onUpdate: () => {
          const currentVal = Math.floor(percentRef.current.val);
          setPercent(currentVal);
          if (barRef.current) {
            gsap.set(barRef.current, { scaleX: percentRef.current.val / 100 });
          }
        },
      });
    }

    return () => {
      if (slowTweenRef.current) {
        slowTweenRef.current.kill();
      }
    };
  }, [isAppLoading, error]);

  // 3. Complete and slide out when isAppLoading is false and no error
  useEffect(() => {
    if (!isAppLoading && !error) {
      if (slowTweenRef.current) {
        slowTweenRef.current.kill();
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            onComplete();
          },
        });

        // 1. Quick animation to 100%
        tl.to(percentRef.current, {
          val: 100,
          duration: 0.5,
          ease: 'power1.out',
          onUpdate: () => {
            setPercent(Math.floor(percentRef.current.val));
          },
        });

        // 2. Align progress bar scale
        tl.to(barRef.current, {
          scaleX: 1,
          duration: 0.5,
          ease: 'power1.out',
        }, '<');

        // 3. Slide/fade container out
        tl.to(containerRef.current, {
          yPercent: -100,
          opacity: 0,
          duration: 1.0,
          ease: 'power4.inOut',
          delay: 0.1,
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [isAppLoading, error, onComplete]);

  const handleRetry = () => {
    percentRef.current.val = 0;
    setPercent(0);
    if (barRef.current) {
      gsap.set(barRef.current, { scaleX: 0 });
    }
    retry();
  };

  const brandName = "NOSTLABEL";

  if (error) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center px-6 text-center select-none pointer-events-auto"
      >
        <div className="max-w-md w-full space-y-8 flex flex-col items-center">
          {/* Branded Title/Header */}
          <div className="flex space-x-1.5 overflow-hidden">
            {brandName.split('').map((char, idx) => (
              <span
                key={idx}
                className="font-display text-4xl md:text-6xl text-white/20 tracking-widest uppercase inline-block"
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
              CONNECTION TO NOSTLABEL SERVERS COULD NOT BE ESTABLISHED.
            </p>
            
            {/* Details Box */}
            <div className="bg-white/5 border border-white/10 rounded-sm p-4 text-[10px] font-mono text-white/50 text-left max-h-32 overflow-y-auto w-full break-all leading-relaxed">
              <span className="text-white/30 block mb-1">REASON:</span>
              {error}
            </div>
          </div>

          {/* Luxury-style Retry Button */}
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
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center select-none pointer-events-auto"
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

        {/* Monospace numbers & Status */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">
            CATALOG LOADING {percent.toString().padStart(3, '0')}%
          </div>
          <div className="text-[9px] font-mono text-accent-gold tracking-[0.3em] uppercase animate-pulse">
            {statusMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
