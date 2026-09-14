import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Mail, Lock, Phone, ArrowRight, ShieldCheck, RefreshCw, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { TravelSaathiLogo } from '../../components/common/TravelSaathiLogo';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';

export const LoginPage: React.FC = () => {
  const { login, loginWithOtp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') navigate('/admin');
      else if (user.role === 'BUSINESS_OWNER') navigate('/business/dashboard');
      else navigate('/profile');
    }
  }, [user, navigate]);

  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile OTP state
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const redirectPath = (location.state as any)?.from?.pathname || '/profile';

  // Cooldown countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const navigateAfterAuth = (authenticatedUser: any) => {
    if (authenticatedUser.role === 'SUPER_ADMIN') {
      navigate('/admin');
    } else if (authenticatedUser.role === 'BUSINESS_OWNER') {
      navigate('/business/dashboard');
    } else {
      navigate(redirectPath);
    }
  };

  // Handle Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const loggedInUser = await login({ email: email.trim(), password });
      navigateAfterAuth(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10 || !/^[6-9]/.test(cleanNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.sendOtp({
        mobile_number: cleanNumber,
        purpose: 'LOGIN',
      });

      if (res.success) {
        setOtpSent(true);
        setCooldown(res.cooldown_seconds || 60);
        if (res.simulated_otp) {
          setSimulatedOtpNotice(res.simulated_otp);
        } else {
          setSimulatedOtpNotice(null);
        }
        setSuccessMsg('6-digit OTP code sent successfully to your mobile number.');
      } else {
        setError(res.message || 'Unable to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your phone.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const loggedInUser = await loginWithOtp({
        mobile_number: mobileNumber.replace(/\D/g, ''),
        otp: cleanOtp,
      });
      navigateAfterAuth(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-[#FAF9F6] dark:bg-[#07101C] transition-colors duration-200">
      <div className="max-w-md w-full space-y-6">
        {/* Top Header Card */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-3 hover:scale-105 transition-transform duration-200">
            <TravelSaathiLogo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Welcome to TravelSaathi AI
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Log in to manage your AI itineraries, taxi bookings, or business portal
          </p>
        </div>

        {/* Authentication Container Box */}
        <div className="bg-white dark:bg-[#0B192C] py-8 px-6 sm:px-8 rounded-3xl border border-slate-200/90 dark:border-[#0F766E]/40 shadow-xl">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-[#07101C] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                authMethod === 'email'
                  ? 'bg-white dark:bg-[#0F766E] text-[#1B5E20] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email & Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('mobile');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                authMethod === 'mobile'
                  ? 'bg-white dark:bg-[#0F766E] text-[#1B5E20] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Mobile & OTP</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= METHOD 1: EMAIL & PASSWORD ================= */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-[#1B5E20] dark:text-[#2DD4BF] hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= METHOD 2: MOBILE & OTP ================= */}
          {authMethod === 'mobile' && (
            <div className="space-y-4">
              {!otpSent ? (
                /* Step 1: Enter Indian Mobile Number */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-300 font-bold text-xs border-r border-slate-200 dark:border-[#1E3E62] pr-2.5">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        required
                        maxLength={10}
                        className="w-full pl-20 pr-4 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      We'll send a 6-digit one-time password via SMS to verify your number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || mobileNumber.replace(/\D/g, '').length !== 10}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP Code */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#07101C]/80 border border-slate-200 dark:border-[#1E3E62]">
                    <div className="text-xs">
                      <span className="text-slate-500 dark:text-slate-400">OTP sent to: </span>
                      <strong className="font-mono text-slate-900 dark:text-white">+91 {mobileNumber}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-xs font-bold text-[#1B5E20] dark:text-[#2DD4BF] hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  {simulatedOtpNotice && (
                    <div className="p-3 rounded-xl bg-teal-50 dark:bg-[#0F766E]/20 border border-[#0F766E]/40 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Simulated SMS OTP: <strong className="font-mono text-sm tracking-widest">{simulatedOtpNotice}</strong>
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Enter 6-Digit OTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        required
                        maxLength={6}
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
                    {cooldown > 0 ? (
                      <span className="font-mono text-slate-400">Resend in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={loading}
                        className="font-bold text-[#1B5E20] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.replace(/\D/g, '').length !== 6}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying OTP...' : 'Verify & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bottom Link to Sign Up */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#1E3E62] text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have a TravelSaathi account?{' '}
            <Link to="/signup" className="text-[#1B5E20] dark:text-[#2DD4BF] hover:underline font-bold">
              Create an account
            </Link>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#0B192C] w-full max-w-sm rounded-3xl p-6 border border-slate-200 dark:border-[#0F766E]/40 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Reset Account Password
              </h3>
              {forgotSent ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    If an account matches <strong>{forgotEmail}</strong>, password reset instructions will be sent shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSent(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#1B5E20] text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (forgotEmail) setForgotSent(true);
                  }}
                  className="space-y-3"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter the email registered with TravelSaathi AI to receive reset instructions:
                  </p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-3 py-2 text-xs font-bold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold"
                    >
                      Send Instructions
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Indian Monuments Skyline Accent */}
        <div className="pt-2">
          <IndianMonumentsSkyline className="w-full text-emerald-800/15 dark:text-[#2DD4BF]/10" tagline="Bharat Ki Khoj Ab Aur Aasaan • India" />
        </div>
      </div>
    </div>
  );
};
