import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';
import GrainOverlay from '../components/GrainOverlay';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string; resetSessionToken?: string } | null;
  const resetSessionToken = state?.resetSessionToken || '';

  // Redirect to forgot-password if resetSessionToken is missing
  useEffect(() => {
    if (!resetSessionToken) {
      navigate('/forgot-password');
    }
  }, [resetSessionToken, navigate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password || !confirmPassword) {
      setErrorMsg('ALL FIELDS ARE REQUIRED');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('PASSWORDS DO NOT MATCH');
      return;
    }

    if (!resetSessionToken) {
      setErrorMsg('RESET SESSION IS MISSING');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(resetSessionToken, password);
      setSuccessMsg('PASSWORD UPDATED SUCCESSFULLY');
    } catch (err: any) {
      setErrorMsg(err.message || 'FAILED TO UPDATE PASSWORD KEY');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-screen bg-[#F8F5F0] overflow-hidden flex flex-col justify-between items-center py-20 px-6 select-none z-10 font-body"
      id="reset-password-root"
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
          RESET KEY
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
          RESET CREDENTIAL KEY
        </div>
      </div>

      {/* Form Card */}
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

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-500/10 border border-green-500/30 p-4 rounded-sm flex items-center space-x-3 text-left"
            >
              <ShieldCheck className="text-green-600 shrink-0" size={18} />
              <div className="text-[10px] font-mono tracking-widest text-text-dark uppercase font-semibold">
                {successMsg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glassmorphism-light p-8 md:p-12 shadow-2xl rounded-sm border border-text-dark/5 space-y-8">
          
          <div className="space-y-1.5 text-left border-b border-text-dark/10 pb-4">
            <h2 className="font-display text-2xl uppercase text-text-dark tracking-wider">
              RESET PASSWORD
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase">
              DECRYPT AND SET NEW ACCESS KEY
            </p>
          </div>

          {!successMsg ? (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* New Password */}
              <div className="space-y-1 relative group">
                <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                  NEW PASSWORD
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

              {/* Confirm Password */}
              <div className="space-y-1 relative group">
                <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                  <Lock size={14} className="text-text-dark/30 mr-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-xs tracking-widest text-text-dark placeholder:text-text-dark/20 focus:outline-none font-mono"
                  />
                </div>
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
                    <span>RESETTING...</span>
                  </div>
                ) : (
                  <>
                    <span>RESET PASSWORD</span>
                    <ArrowRight size={12} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4">
              <p className="text-[10px] font-mono tracking-widest text-text-dark/60 uppercase leading-relaxed">
                YOUR ACCESS KEY HAS BEEN RE-ENCRYPTED SUCCESSFULLY. YOU MAY NOW LOGIN.
              </p>
              <Link
                to="/login"
                className="inline-block bg-text-dark text-white hover:bg-transparent hover:text-text-dark text-[10px] uppercase font-bold tracking-[0.25em] px-8 py-4 flex items-center justify-center space-x-2 border border-text-dark transition-all duration-300 cursor-pointer max-w-xs mx-auto"
              >
                <span>GO TO LOGIN</span>
              </Link>
            </div>
          )}

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

export default ResetPassword;
