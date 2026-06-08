import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger globally
gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

interface LenisProviderProps {
  children: React.ReactNode;
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis with refined easing curve
    const instance = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium smooth curves
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    setLenis(instance);

    // Synchronize ScrollTrigger
    instance.on('scroll', ScrollTrigger.update);

    // Bind GSAP ticker to Lenis animation frame loop
    const updatePhysics = (time: number) => {
      instance.raf(time * 1000);
    };
    
    gsap.ticker.add(updatePhysics);
    gsap.ticker.lagSmoothing(0);

    return () => {
      instance.destroy();
      gsap.ticker.remove(updatePhysics);
    };
  }, []);

  // Stop Lenis on admin paths to allow native overflow scrolling
  useEffect(() => {
    if (!lenis) return;

    if (location.pathname.startsWith('/admin') || location.pathname === '/director-login') {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [location.pathname, lenis]);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
};
export default LenisProvider;
