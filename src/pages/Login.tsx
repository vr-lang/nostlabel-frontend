import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GrainOverlay from '../components/GrainOverlay';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { customerLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load saved email if remember me was active
  useEffect(() => {
    const savedEmail = localStorage.getItem('nostlabel_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await customerLogin(email, password);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('nostlabel_remember_email', email);
        } else {
          localStorage.removeItem('nostlabel_remember_email');
        }
        navigate('/');
      } else {
        setErrorMsg(res.message || 'INVALID EMAIL OR PASSWORD');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'AUTHENTICATION SERVICE OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-screen bg-[#F5F3EF] overflow-hidden flex flex-col justify-between items-center py-20 px-6 select-none z-10 font-body"
      id="customer-login-root"
    >
      <GrainOverlay />

      {/* Parallax Background Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span
          className="font-display text-[14vw] leading-none text-text-dark tracking-tighter opacity-[0.02] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
          }}
        >
          ENTER ARCHIVE
        </span>
      </div>

      {/* Branding Header */}
      <div className="text-center space-y-2 z-10 pt-4">
        <Link
          to="/"
          className="font-display text-4xl text-text-dark tracking-widest hover:text-accent-gold transition-colors duration-300 uppercase"
        >
          NOSTLABEL
        </Link>
        <div className="text-[9px] tracking-[0.35em] font-mono font-bold text-text-dark/40 uppercase">
          CUSTOMER SIGN IN
        </div>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-[480px] z-10 my-8">
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-sm flex items-center space-x-3 text-left"
            >
              <ShieldAlert className="text-red-600 shrink-0" size={18} />
              <div className="text-[10px] font-mono tracking-widest text-text-dark uppercase font-semibold">
                {errorMsg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glassmorphism-light p-8 md:p-12 shadow-2xl rounded-sm border border-text-dark/5 space-y-8">
          
          <div className="space-y-1.5 text-left border-b border-text-dark/10 pb-4">
            <h2 className="font-display text-2xl uppercase text-text-dark tracking-wider">
              ENTER ARCHIVE
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase">
              PROVIDE YOUR CREDENTIAL KEY
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Email Field */}
            <div className="space-y-1 relative group">
              <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                EMAIL ADDRESS
              </label>
              <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                <Mail size={14} className="text-text-dark/30 mr-3" />
                <input
                  type="email"
                  required
                  placeholder="NAME@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs tracking-widest text-text-dark placeholder:text-text-dark/20 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 relative group">
              <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                DECRYPT PASSWORD
              </label>
              <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                <Lock size={14} className="text-text-dark/30 mr-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-xs tracking-widest text-text-dark placeholder:text-text-dark/20 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Options Row (Remember Me & Forgot Password) */}
            <div className="flex items-center justify-between py-1 text-[10px] font-mono tracking-widest uppercase text-text-dark/60">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-text-dark border-text-dark/20 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="remember-me" className="cursor-pointer select-none">
                  REMEMBER ME
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="hover:text-accent-gold transition-colors underline"
              >
                FORGOT PASSWORD?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-dark text-white hover:bg-transparent hover:text-text-dark text-[10px] uppercase font-bold tracking-[0.25em] py-4.5 flex items-center justify-center space-x-2 border border-text-dark transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                  <span>DECRYPTING...</span>
                </div>
              ) : (
                <>
                  <span>ENTER THE ARCHIVE</span>
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </form>

          {/* Create Account redirect */}
          <div className="text-center pt-2 border-t border-text-dark/5">
            <span className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase mr-1.5">
              NEW TO THE ARCHIVE?
            </span>
            <Link
              to="/register"
              className="text-[9px] font-mono tracking-widest text-accent-gold hover:text-text-dark uppercase font-bold underline transition-colors"
            >
              CREATE ACCOUNT
            </Link>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center z-10 pt-4">
        <span className="text-[9px] font-mono tracking-widest text-text-dark/30 uppercase">
          NOSTLABEL SECURED ENCRYPTION SYSTEM © 2026
        </span>
      </div>
    </div>
  );
};

export default Login;
