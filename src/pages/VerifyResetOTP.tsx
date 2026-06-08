import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, RotateCw, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import GrainOverlay from '../components/GrainOverlay';

export const VerifyResetOTP: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Resend cooldown timer
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const inputRefs = useRef<HTMLInputElement[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from router state
  const state = location.state as { email?: string } | null;
  const email = state?.email || '';

  // If no email exists in state, block view and redirect to forgot password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Autofocus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: any;
    if (countdown > 0 && isResendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isResendDisabled]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    setMousePos({ x, y });
  };

  // Move cursor, delete characters, handle backspace
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Ensure digits only

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last typed character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // Empty input, backspace moves focus back and clears
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else if (otp[index]) {
        // Value exists, clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Clipboard Paste Support
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedText)) return; // Validates 6 digit numbers only

    const digits = pastedText.split('');
    setOtp(digits);

    // Focus last input
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleResend = async () => {
    if (isResendDisabled || resending) return;

    setResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await authService.resendResetOTP(email);
      setSuccessMsg('RESET OTP RESENT SUCCESSFULLY');
      setCountdown(60);
      setIsResendDisabled(true);
      
      // Focus first input
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'FAILED TO RESEND RESET OTP');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMsg('PLEASE ENTER ALL 6 DIGITS');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.verifyResetOTP(email, otpCode);
      if (res && res.success && res.data && res.data.resetSessionToken) {
        setSuccessMsg('CODE VERIFIED SUCCESSFULLY');
        const resetSessionToken = res.data.resetSessionToken;
        
        setTimeout(() => {
          navigate('/reset-password', { state: { email, resetSessionToken } });
        }, 1500);
      } else {
        setErrorMsg('VERIFICATION SESSION FAILED TO GENERATE');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP VERIFICATION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-screen bg-[#F8F5F0] overflow-hidden flex flex-col justify-between items-center py-20 px-6 select-none z-10 font-body"
      id="verify-reset-otp-root"
    >
      <GrainOverlay />

      {/* Luxury Parallax Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span
          className="font-display text-[14vw] leading-none text-text-dark tracking-tighter opacity-[0.02] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
          }}
        >
          VERIFICATION
        </span>
      </div>

      {/* Title Header */}
      <div className="text-center space-y-2 z-10 pt-4">
        <Link
          to="/"
          className="font-display text-4xl text-text-dark tracking-widest hover:text-accent-gold transition-colors duration-300 uppercase"
        >
          NOSTLABEL
        </Link>
        <div className="text-[9px] tracking-[0.35em] font-mono font-bold text-text-dark/40 uppercase">
          SECURE MFA CHECK
        </div>
      </div>

      {/* OTP Container */}
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
          
          <div className="space-y-2.5 text-left border-b border-text-dark/10 pb-4">
            <h2 className="font-display text-2xl uppercase text-text-dark tracking-wider">
              VERIFY OTP
            </h2>
            <div className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase leading-relaxed">
              WE HAVE SENT A 6-DIGIT CODE TO:<br/>
              <span className="text-text-dark/80 font-bold">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 6 Grid input inputs */}
            <div className="grid grid-cols-6 gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { if (el) inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-full h-12 md:h-14 bg-transparent border-b-2 border-text-dark/10 focus:border-accent-gold text-center text-lg md:text-xl font-mono text-text-dark focus:outline-none transition-colors duration-300"
                />
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-text-dark text-white hover:bg-transparent hover:text-text-dark text-[10px] uppercase font-bold tracking-[0.25em] py-4.5 flex items-center justify-center space-x-2 border border-text-dark transition-all duration-300 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>VERIFYING...</span>
                  </div>
                ) : (
                  <>
                    <span>VERIFY CODE</span>
                    <ArrowRight size={12} />
                  </>
                )}
              </button>

              {/* Resend Cooldown Action */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResendDisabled || resending}
                  className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors flex items-center justify-center mx-auto space-x-2 cursor-pointer ${
                    isResendDisabled
                      ? 'text-text-dark/30'
                      : 'text-accent-gold hover:text-text-dark'
                  }`}
                >
                  <RotateCw size={10} className={resending ? 'animate-spin' : ''} />
                  <span>
                    {isResendDisabled
                      ? `RESEND OTP IN ${countdown}S`
                      : 'RESEND VERIFICATION CODE'}
                  </span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center z-10 pt-4">
        <span className="text-[9px] font-mono tracking-widest text-text-dark/30 uppercase">
          SECURE TRANSACTIONS VERIFIED BY NOSTLABEL CODES © 2026
        </span>
      </div>
    </div>
  );
};

export default VerifyResetOTP;
