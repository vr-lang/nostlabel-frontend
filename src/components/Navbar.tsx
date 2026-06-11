import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, CircleUserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onSearchClick: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onCartClick,
  onSearchClick,
  onNavigateToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch active TOP_BAR offer on mount
  useEffect(() => {
    const fetchActiveOffer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/offers/active`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data)) {
            const topBarOffer = res.data.find((o: any) => o.displayLocation === 'TOP_BAR');
            if (topBarOffer) {
              setActiveOffer(topBarOffer);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load top bar offer:', err);
      }
    };
    fetchActiveOffer();
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Collections', sectionId: 'featured' },
    { name: 'Shop', sectionId: 'bestsellers' },
    { name: 'Lookbook', sectionId: 'manifesto' },
    { name: 'About', sectionId: 'brand-story' },
  ];

  const handleDropdownItemClick = (path: string) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const handleLinkClick = (link: { name: string; sectionId: string }) => {
    if (link.name === 'Collections') {
      navigate('/collections');
    } else if (link.name === 'About') {
      navigate('/about');
    } else {
      onNavigateToSection(link.sectionId);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300 gpu-accel bg-[#F5F3EF]/90 backdrop-blur-md border-b border-text-dark/5"
      >
        <AnimatePresence>
          {activeOffer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="bg-text-dark text-white text-[9px] md:text-[10px] font-mono uppercase tracking-[0.25em] py-2 md:py-2.5 px-4 text-center overflow-hidden flex items-center justify-center relative border-b border-white/5 select-none"
            >
              <span>{activeOffer.title}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between py-4">
          {/* Logo */}
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const el = document.getElementById('hero');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover-trigger flex items-center"
            id="nav-logo"
          >
            <img
              src="/logo.png"
              alt="NØST"
              className="h-[20px] md:h-[26px] w-auto object-contain transition-all duration-300 brightness-0"
            />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link)}
                className="text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 relative py-1 hover-trigger group text-text-dark hover:text-accent-gold"
              >
                {link.name}
                <span
                  className="absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full bg-accent-gold"
                />
              </button>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            {/* Search Trigger */}
            <button
              onClick={onSearchClick}
              className="p-1.5 rounded-full transition-colors hover-trigger text-text-dark hover:text-accent-gold hover:bg-black/5"
              aria-label="Search Catalog"
              id="btn-search-trigger"
            >
              <Search size={18} />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onCartClick}
              className="p-1.5 rounded-full relative transition-colors hover-trigger text-text-dark hover:text-accent-gold hover:bg-black/5"
              aria-label="View Cart"
              id="btn-cart-trigger"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-gold text-text-dark text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Trigger (with Dropdown) */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-1.5 rounded-full transition-colors hover-trigger text-text-dark hover:text-accent-gold hover:bg-black/5"
                aria-label="User Account"
                id="btn-user-trigger"
              >
                <CircleUserRound size={18} />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-52 py-4 rounded-sm shadow-2xl border text-left flex flex-col font-mono text-[9px] tracking-widest uppercase bg-[#F5F3EF]/95 backdrop-blur-md border-text-dark/10 text-text-dark"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 pb-2.5 mb-2 border-b border-text-dark/5 text-[8px] font-mono text-text-dark/50">
                          SESSION // {user?.name}
                        </div>
                        <button
                          onClick={() => handleDropdownItemClick('/account')}
                          className="px-4 py-2 hover-trigger text-left transition-colors duration-200 hover:bg-black/5 hover:text-text-dark"
                        >
                          My Account
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/account');
                          }}
                          className="px-4 py-2 hover-trigger text-left transition-colors duration-200 hover:bg-black/5 hover:text-text-dark"
                        >
                          Orders
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/account');
                          }}
                          className="px-4 py-2 hover-trigger text-left transition-colors duration-200 hover:bg-black/5 hover:text-text-dark"
                        >
                          Addresses
                        </button>
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 hover-trigger text-left text-red-600 font-bold border-t border-text-dark/5 mt-2 transition-colors duration-200 hover:bg-black/5"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDropdownItemClick('/login')}
                          className="px-4 py-2 hover-trigger text-left transition-colors duration-200 hover:bg-black/5 hover:text-text-dark"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => handleDropdownItemClick('/register')}
                          className="px-4 py-2 hover-trigger text-left transition-colors duration-200 hover:bg-black/5 hover:text-text-dark"
                        >
                          Register
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-full transition-colors text-text-dark hover:text-accent-gold hover:bg-black/5"
              aria-label="Open Mobile Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <div
        className={`fixed inset-0 z-50 bg-[#F5F3EF]/95 backdrop-blur-lg md:hidden transition-all duration-500 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-text-dark/5">
          <img
            src="/logo.png"
            alt="NØST"
            className="h-[20px] w-auto object-contain brightness-0"
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-text-dark p-2 rounded-full hover:bg-black/5"
            aria-label="Close Mobile Menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-between h-[80vh] py-12">
          {/* Main Links */}
          <nav className="flex flex-col items-center space-y-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  handleLinkClick(link);
                  setMobileMenuOpen(false);
                }}
                className="text-xl text-text-dark/70 hover:text-text-dark uppercase tracking-[0.3em] font-medium transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Account Actions Drawer section */}
          <div className="flex flex-col items-center space-y-5 border-t border-text-dark/5 pt-8 w-4/5">
            {isAuthenticated ? (
              <>
                <span className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase">
                  ACTIVE DECRYPTION HASH // {user?.name}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/account');
                  }}
                  className="text-sm text-text-dark/80 hover:text-text-dark uppercase tracking-[0.25em] font-bold"
                >
                  My Account
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="text-xs text-red-600 hover:text-red-500 uppercase tracking-[0.25em] font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="text-sm text-text-dark/80 hover:text-text-dark uppercase tracking-[0.25em] font-bold"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="text-sm text-accent-gold hover:text-text-dark uppercase tracking-[0.25em] font-bold"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
