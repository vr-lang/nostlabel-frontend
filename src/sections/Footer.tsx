import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onNavigateToSection: (sectionId: string) => void;
  onDirectorClick?: () => void;
  onCartClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateToSection, 
  onDirectorClick,
  onCartClick 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-bg-dark-1 text-white/50 pt-24 pb-12 relative overflow-hidden z-10 border-t border-white/5">
      
      {/* Massive ghost background outline text */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none select-none z-0">
        <h4 className="font-display text-[20vw] leading-[0.75] text-outline-stroke-light text-center uppercase translate-y-[20%]">
          NOST  LABEL
        </h4>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12 md:gap-12 text-left mb-20">
        
        {/* Col 1: Brand Info */}
        <div 
          className="space-y-4 col-span-1 sm:col-span-2 md:col-span-2 w-full max-w-md"
          style={{ width: '100%', minWidth: '280px' }}
        >
          <img
            src="/logo.png"
            alt="Nost Label"
            className="h-[24px] w-auto object-contain invert brightness-200 block mb-2"
          />
          <p 
            className="text-xs text-white/40 leading-relaxed font-light block"
            style={{ width: '100%', maxWidth: '380px' }}
          >
            Architectural garments designed to float away from body friction. Precision engineered, premium fabrics, and timeless construction.
          </p>
        </div>

        {/* Col 2: Shop Links */}
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.25em] font-bold text-accent-gold uppercase block">
            SHOP
          </span>
          <ul className="space-y-2.5">
            <li>
              <button
                onClick={() => navigate('/collections')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                Shop All
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/collections/oversized-tees')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                Oversized Tees
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/collections/oversized-tees')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                New Arrivals
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateToSection('bestsellers')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                Best Sellers
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/collections')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                Collections
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Company Links */}
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.25em] font-bold text-accent-gold uppercase block">
            COMPANY
          </span>
          <ul className="space-y-2.5">
            <li>
              <button
                onClick={() => navigate('/about')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => { window.location.href = 'mailto:support@nostlabel.com'; }}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                Contact Us
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/privacy-policy')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/terms-of-service')}
                className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
              >
                Terms of Service
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Account Links & Connect */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.25em] font-bold text-accent-gold uppercase block">
              ACCOUNT
            </span>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigate('/account')}
                  className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/account/orders')}
                  className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
                >
                  Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => { if (onCartClick) onCartClick(); }}
                  className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
                >
                  Cart
                </button>
              </li>
              {!isAuthenticated && (
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-xs hover:text-white transition-colors uppercase tracking-widest font-mono text-white/60 hover-trigger"
                  >
                    Login
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-[10px] tracking-[0.25em] font-bold text-accent-gold uppercase block">
              CONNECT
            </span>
            <div className="flex space-x-3.5">
              <a
                href="https://www.instagram.com/nostfit?igsh=ZmYwbm1tMGdqcGx5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent-gold hover:scale-110 transition-all duration-300 p-2 border border-white/10 hover:border-accent-gold/40 rounded-full flex items-center justify-center"
                aria-label="Instagram"
              >
                {/* Lucide Instagram Path SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://twitter.com/nostlabel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent-gold hover:scale-110 transition-all duration-300 p-2 border border-white/10 hover:border-accent-gold/40 rounded-full flex items-center justify-center"
                aria-label="Twitter Profile"
              >
                {/* Lucide Twitter Path SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="https://wa.me/919729051506"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent-gold hover:scale-110 transition-all duration-300 p-2 border border-white/10 hover:border-accent-gold/40 rounded-full flex items-center justify-center"
                aria-label="WhatsApp"
              >
                {/* Lucide Message Circle SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-message-circle"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/nostlabel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent-gold hover:scale-110 transition-all duration-300 p-2 border border-white/10 hover:border-accent-gold/40 rounded-full flex items-center justify-center"
                aria-label="Facebook Profile"
              >
                {/* Lucide Facebook SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Director Access Button */}
          {onDirectorClick && (
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={onDirectorClick}
                className="group border border-white/10 hover:border-accent-gold/30 px-3 py-1.5 hover:bg-white/[0.02] text-white/30 hover:text-white text-[9px] uppercase tracking-[0.2em] font-display flex items-center space-x-1.5 transition-all duration-300 hover:shadow-[0_0_8px_rgba(201,164,106,0.15)] hover-trigger font-display"
              >
                <span>DIRECTOR ACCESS</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300 font-mono">→</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Footer Bottom copyright and detail */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono tracking-widest uppercase">
        <span className="text-white/30">© 2026 NOST LABEL. All Rights Reserved.</span>
        <span className="text-white/30 mt-4 md:mt-0">Designed by Yuvraj Singh</span>
      </div>

    </footer>
  );
};

export default Footer;
