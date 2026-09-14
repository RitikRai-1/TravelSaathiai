import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, Mail, Lock, Phone, ArrowRight, Briefcase, Compass, ShieldCheck, RefreshCw, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { TravelSaathiLogo } from '../../components/common/TravelSaathiLogo';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';

export const SignupPage: React.FC = () => {
  const { signup, signupWithOtp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') navigate('/admin');
      else if (user.role === 'BUSINESS_OWNER') navigate('/business/dashboard');
      else navigate('/profile');
    }
  }, [user, navigate]);

  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');
  const [role, setRole] = useState<'TOURIST' | 'BUSINESS_OWNER'>('TOURIST');

  // Email form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile form state
  const [mobileName, setMobileName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    if (authenticatedUser.role === 'BUSINESS_OWNER') {
      navigate('/business/dashboard');
    } else if (authenticatedUser.role === 'SUPER_ADMIN') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };

  // Handle Email & Password Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const createdUser = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: cleanPhone || undefined,
        role,
      });

      navigateAfterAuth(createdUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP for Mobile Signup
  const handleSendMobileOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!mobileName.trim()) {
      setError('Please enter your full name before requesting OTP.');
      return;
    }
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10 || !/^[6-9]/.test(cleanNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp({
        mobile_number: cleanNumber,
        purpose: 'SIGNUP',
      });

      if (res.success) {
        setOtpSent(true);
        setCooldown(res.cooldown_seconds || 60);
        if (res.simulated_otp) {
          setSimulatedOtpNotice(res.simulated_otp);
        } else {
          setSimulatedOtpNotice(null);
        }
        setSuccessMsg('6-digit OTP verification code sent to your phone.');
      } else {
        setError(res.message || 'Unable to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP for Mobile Signup
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your phone.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const createdUser = await signupWithOtp({
        mobile_number: mobileNumber.replace(/\D/g, ''),
        otp: cleanOtp,
        full_name: mobileName.trim() || 'TravelSaathi Explorer',
      });

      navigateAfterAuth(createdUser);
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
            Create Your Account
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join thousands exploring India or list your tourism business
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
              <span>With Email</span>
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
              <span>With Mobile OTP</span>
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

          {/* Role Switcher */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('TOURIST')}
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  role === 'TOURIST'
                    ? 'border-[#1B5E20] dark:border-[#2DD4BF] bg-emerald-50 dark:bg-[#0F766E]/30 text-[#1B5E20] dark:text-[#2DD4BF] font-bold shadow-xs'
                    : 'border-slate-200 dark:border-[#1E3E62] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E3E62]/40'
                }`}
              >
                <Compass className="w-4 h-4 text-[#1B5E20] dark:text-[#2DD4BF]" />
                <span>Tourist / Explorer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('BUSINESS_OWNER')}
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  role === 'BUSINESS_OWNER'
                    ? 'border-[#F3722C] bg-orange-50 dark:bg-orange-950/30 text-[#F3722C] font-bold shadow-xs'
                    : 'border-slate-200 dark:border-[#1E3E62] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E3E62]/40'
                }`}
              >
                <Briefcase className="w-4 h-4 text-[#F3722C]" />
                <span>Business Partner</span>
              </button>
            </div>
          </div>

          {/* ================= METHOD 1: EMAIL SIGNUP ================= */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

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
                    placeholder="priya@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-400 font-bold text-xs border-r border-slate-200 dark:border-[#1E3E62] pr-2.5">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-20 pr-4 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password (min 6 characters)
                </label>
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
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= METHOD 2: MOBILE & OTP SIGNUP ================= */}
          {authMethod === 'mobile' && (
            <div className="space-y-4">
              {!otpSent ? (
                /* Step 1: Enter Name & Mobile Number */
                <form onSubmit={handleSendMobileOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={mobileName}
                        onChange={(e) => setMobileName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                      />
                    </div>
                  </div>

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
                      We will send a 6-digit OTP to verify your phone number and create your account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || mobileNumber.replace(/\D/g, '').length !== 10 || !mobileName.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP Code */
                <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07101C]/80 border border-slate-200 dark:border-[#1E3E62] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Registering: </span>
                      <strong className="text-slate-900 dark:text-white">{mobileName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Mobile: </span>
                      <strong className="font-mono text-slate-900 dark:text-white">+91 {mobileNumber}</strong>
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
                        onClick={() => handleSendMobileOtp()}
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
                    <span>{loading ? 'Verifying & Registering...' : 'Verify & Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bottom Link to Sign In */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#1E3E62] text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1B5E20] dark:text-[#2DD4BF] hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>

        {/* Indian Monuments Skyline Accent */}
        <div className="pt-2">
          <IndianMonumentsSkyline className="w-full text-emerald-800/15 dark:text-[#2DD4BF]/10" tagline="Bharat Ki Khoj Ab Aur Aasaan • India" />
        </div>
      </div>
    </div>
  );
};
