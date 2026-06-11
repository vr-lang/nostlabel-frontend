import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GrainOverlay from '../components/GrainOverlay';

export const DirectorLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to admin immediately
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMsg(res.message || 'INVALID CREDENTIALS');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'SERVER UNAVAILABLE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-screen bg-[#F5F3EF] overflow-hidden flex flex-col justify-between items-center py-12 px-6 select-none z-10"
      id="director-login-root"
    >
      <GrainOverlay />

      {/* Luxury Parallax Ghost Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span
          className="font-display text-[15vw] leading-none text-text-dark tracking-tighter opacity-[0.02] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * -25}px, 0)`,
          }}
        >
          THE ARCHIVE
        </span>
      </div>

      {/* Header Info */}
      <div className="text-center space-y-2.5 z-10">
        <button
          onClick={() => navigate('/')}
          className="font-display text-4xl text-text-dark tracking-widest hover:text-accent-gold transition-colors duration-300 hover-trigger"
        >
          NOSTLABEL
        </button>
        <div className="flex items-center justify-center space-x-2 text-[10px] tracking-[0.35em] font-mono font-bold text-text-dark/50 uppercase">
          <Sparkles size={10} className="text-accent-gold" />
          <span>Director Access | Internal Portal</span>
        </div>
      </div>

      {/* Centered Glassmorphic Form Card */}
      <div className="w-full max-w-[480px] z-10">
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 p-4.5 rounded-sm flex items-center space-x-3 text-left"
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
              AUTHORIZE ACCESS
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase">
              CREDENTIAL DECRYPTION ENFORCED
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Email field */}
            <div className="space-y-1 relative group">
              <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                EMAIL ADDRESS
              </label>
              <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                <Mail size={14} className="text-text-dark/30 mr-3" />
                <input
                  type="email"
                  required
                  placeholder="name@nostlabel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs tracking-widest text-text-dark placeholder:text-text-dark/20 focus:outline-none uppercase font-mono"
                />
              </div>
            </div>

            {/* Password field */}
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

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-dark text-white hover:bg-transparent hover:text-text-dark text-[10px] uppercase font-bold tracking-[0.25em] py-4.5 flex items-center justify-center space-x-2 border border-text-dark transition-all duration-300 hover-trigger"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                  <span>VERIFYING...</span>
                </div>
              ) : (
                <>
                  <span>ENTER ARCHIVE</span>
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center z-10">
        <span className="text-[9px] font-mono tracking-widest text-text-dark/30 uppercase">
          SECURED BY NOSTLABEL DECRYPTION CODES © 2026
        </span>
      </div>
    </div>
  );
};

export default DirectorLogin;
