import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from '../LenisProvider';

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    // Scroll standard window instantly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as any
    });

    // Reset Lenis scrolling tracker if active
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return null;
};

export default ScrollToTop;
