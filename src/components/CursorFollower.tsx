import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export const CursorFollower: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const isAdminOrLogin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/director-login');

  useEffect(() => {
    // Check if it's a touch device or if we are in admin/login dashboards
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || isAdminOrLogin) {
      setIsVisible(false);
      document.documentElement.classList.remove('custom-cursor-enabled');
      return;
    }
    setIsVisible(true);
    document.documentElement.classList.add('custom-cursor-enabled');

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled');
    };
  }, [isAdminOrLogin]);

  useEffect(() => {
    if (!isVisible || !dotRef.current || !ringRef.current) {
      return;
    }

    // Set initial opacity to 0 to prevent cursor from flickering at (0, 0)
    gsap.set([dotRef.current, ringRef.current], { opacity: 0 });

    const xDotTo = gsap.quickTo(dotRef.current, 'x', { duration: 0.08, ease: 'power3.out' });
    const yDotTo = gsap.quickTo(dotRef.current, 'y', { duration: 0.08, ease: 'power3.out' });
    const xRingTo = gsap.quickTo(ringRef.current, 'x', { duration: 0.35, ease: 'power3.out' });
    const yRingTo = gsap.quickTo(ringRef.current, 'y', { duration: 0.35, ease: 'power3.out' });

    let hasMoved = false;

    const onMouseMove = (e: MouseEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        // Fade in when mouse starts moving
        gsap.to(dotRef.current, { opacity: 1, duration: 0.2 });
        gsap.to(ringRef.current, { opacity: 0.6, duration: 0.2 });
      }

      xDotTo(e.clientX - 4);
      yDotTo(e.clientY - 4);
      xRingTo(e.clientX - 20);
      yRingTo(e.clientY - 20);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('hover-trigger') ||
        target.closest('.hover-trigger');

      if (isInteractive) {
        // Expand ring and change color on hover
        gsap.to(ringRef.current, { 
          scale: 1.5, 
          backgroundColor: 'rgba(212, 175, 55, 0.15)', // accent gold with alpha
          borderColor: 'rgba(212, 175, 55, 0.8)',
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to(dotRef.current, {
          scale: 0.5,
          backgroundColor: '#d4af37', // turn gold
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        // Restore standard cursor
        gsap.to(ringRef.current, { 
          scale: 1, 
          backgroundColor: 'transparent',
          borderColor: '#d4af37',
          opacity: 0.6,
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to(dotRef.current, {
          scale: 1,
          backgroundColor: 'currentColor', // fall back to mix-blend color
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const onMouseLeave = () => {
      // Fade out cursor when it leaves the window
      gsap.to([dotRef.current, ringRef.current], { opacity: 0, duration: 0.2 });
    };

    const onMouseEnter = () => {
      // Fade in cursor when it re-enters the window
      if (hasMoved) {
        gsap.to(dotRef.current, { opacity: 1, duration: 0.2 });
        gsap.to(ringRef.current, { opacity: 0.6, duration: 0.2 });
      }
    };

    const onMouseDown = () => {
      // Click shrink effect
      gsap.to(ringRef.current, { scale: 0.85, duration: 0.15 });
      gsap.to(dotRef.current, { scale: 1.5, duration: 0.15 });
    };

    const onMouseUp = () => {
      // Restore scales
      gsap.to(ringRef.current, { scale: 1, duration: 0.15 });
      gsap.to(dotRef.current, { scale: 1, duration: 0.15 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Tiny solid center dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-text-dark mix-blend-difference pointer-events-none z-[99999]"
      />
      {/* Large trailing golden glow ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-accent-gold pointer-events-none z-[99998]"
      />
    </>
  );
};

export default CursorFollower;
