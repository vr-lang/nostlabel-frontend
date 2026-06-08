import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { authService } from '../services/authService';
import GrainOverlay from '../components/GrainOverlay';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    setMousePos({ x, y });
  };

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  const validateEmail = (mail: string) => {
    return /\S+@\S+\.\S+/.test(mail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation checks
    if (!name || !email || !phone || !password || !confirmPassword) {
      setErrorMsg('ALL FIELDS ARE REQUIRED');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('INVALID EMAIL FORMAT');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMsg('PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('PASSWORDS DO NOT MATCH');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('YOU MUST ACCEPT THE TERMS AND CONDITIONS');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Send verification email OTP
      await authService.sendOTP(email);
      
      // Step 2: Redirect to OTP verification page and pass the registration state
      navigate('/verify-otp', {
        state: {
          email,
          registrationDetails: { name, email, phone, password }
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'REGISTRATION INITIALIZATION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-screen bg-[#F8F5F0] overflow-hidden flex flex-col justify-between items-center py-20 px-6 select-none z-10 font-body"
      id="register-root"
    >
      <GrainOverlay />

      {/* Luxury Parallax Ghost Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span
          className="font-display text-[12vw] leading-none text-text-dark tracking-tighter opacity-[0.02] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
          }}
        >
          JOIN THE ARCHIVE
        </span>
      </div>

      {/* Header Info */}
      <div className="text-center space-y-2 z-10 pt-4">
        <Link
          to="/"
          className="font-display text-4xl text-text-dark tracking-widest hover:text-accent-gold transition-colors duration-300 uppercase"
        >
          NOSTLABEL
        </Link>
        <div className="text-[9px] tracking-[0.35em] font-mono font-bold text-text-dark/40 uppercase">
          CREATE CUSTOMER PROFILE
        </div>
      </div>

      {/* Form Container */}
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
              JOIN THE ARCHIVE
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase">
              REGISTER FOR MEMBERSHIP ACCESS
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Full Name */}
            <div className="space-y-1 relative group">
              <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                FULL NAME
              </label>
              <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                <User size={14} className="text-text-dark/30 mr-3" />
                <input
                  type="text"
                  required
                  placeholder="JOHN DOE"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full bg-transparent text-xs tracking-widest text-text-dark placeholder:text-text-dark/20 focus:outline-none uppercase font-mono"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div className="space-y-1 relative group">
              <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                PHONE NUMBER
              </label>
              <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                <Phone size={14} className="text-text-dark/30 mr-3" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-xs tracking-widest text-text-dark placeholder:text-text-dark/20 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 relative group">
              <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">
                PASSWORD
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
                CONFIRM PASSWORD
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

            {/* Terms checkbox */}
            <div className="flex items-start space-x-3 py-2">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 accent-text-dark border-text-dark/20 focus:ring-0"
              />
              <label htmlFor="accept-terms" className="text-[10px] font-mono tracking-wider text-text-dark/60 uppercase cursor-pointer select-none">
                I accept the <span className="underline hover:text-accent-gold">Terms of Service</span> and <span className="underline hover:text-accent-gold">Privacy Policy</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-dark text-white hover:bg-transparent hover:text-text-dark text-[10px] uppercase font-bold tracking-[0.25em] py-4.5 flex items-center justify-center space-x-2 border border-text-dark transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                  <span>INITIALIZING...</span>
                </div>
              ) : (
                <>
                  <span>JOIN THE ARCHIVE</span>
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-text-dark/5">
            <span className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase mr-1.5">
              ALREADY REGISTERED?
            </span>
            <Link
              to="/login"
              className="text-[9px] font-mono tracking-widest text-accent-gold hover:text-text-dark uppercase font-bold underline transition-colors"
            >
              SIGN IN
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

export default Register;
