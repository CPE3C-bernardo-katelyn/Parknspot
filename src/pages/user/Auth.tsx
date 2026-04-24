import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import smart from "../../components/images/smart.png";
import findparkgo from "../../components/images/findparkgo.png";

const API_URL = import.meta.env.VITE_API_URL;

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.googleAccount) {
          handleGoogleLogin();
          return;
        }
        setError(data.message || 'Login failed. Please try again.');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = '/explore';
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      setResetSent(true);
    } catch {
      setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="min-h-screen lg-h-screen w-full flex flex-col lg:flex-row bg-surface">
      <section className="relative w-full lg:w-7/12 h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-primary/20 z-10" />
        <img
          src={smart}
          alt="smart parking"
          className="w-full h-full object-cover grayscale contrast-125 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-12 lg:left-12 z-20">
          <h2 className="text-white font-headline text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tighter max-w-[85%] sm:max-w-xs leading-tight uppercase">
            SMART PARKING STARTS HERE.
          </h2>
        </div>
      </section>

      <section className="w-full lg:w-5/12 bg-surface flex flex-col justify-between p-5 sm:p-8 md:p-12 lg:p-16 xl:p-20 h-full overflow-hidden">
        <header className="flex items-center gap-3 mb-4 sm:mb-6 md:mb-8">
          <h1 className="font-headline font-black text-xl sm:text-2xl tracking-tighter text-primary">Park 'n Spot</h1>
        </header>

        <div className="flex flex-col justify-center max-w-md w-full mx-auto flex-grow">
          <button
            onClick={() => navigate('/aboutus')}
            className="flex items-center gap-2 sm:gap-4 text-primary/60 hover:text-primary transition-colors duration-200 group border-none bg-transparent cursor-pointer w-fit mb-4 sm:mb-6"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-headline font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Back to About Us</span>
          </button>

          <div className="mb-4 sm:mb-6">
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight mb-2">
              Enter the Spot
            </h2>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-xs font-headline font-bold">{error}</p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-5 md:space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2 sm:space-y-3">
              <label className="font-headline text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">
                EMAIL
              </label>
              <input
                className="mt-1 sm:mt-2 w-full bg-surface-container-high border-none focus:ring-2 focus:ring-outline text-on-surface py-3 sm:py-4 px-4 sm:px-5 text-sm transition-all duration-300 placeholder:text-outline/50 rounded-md"
                placeholder="juandelacruz@gmail.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end flex-wrap gap-2">
                <label className="font-headline text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setResetSent(false); }}
                  className="text-[9px] sm:text-[10px] font-headline uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
              <input
                className="w-full bg-surface-container-high border-none focus:ring-2 focus:ring-outline text-on-surface py-3 sm:py-4 px-4 sm:px-5 text-sm transition-all duration-300 placeholder:text-outline/50 rounded-md"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 flex flex-col gap-4 sm:gap-5 md:gap-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#660000] py-3 sm:py-4 text-surface-container-lowest border-none cursor-pointer font-headline font-bold text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-primary-container transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/10 text-center rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'LOG IN'}
              </button>
              

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full border border-outline-variant/50 py-3 sm:py-4 text-on-surface font-headline font-semibold text-[11px] sm:text-xs tracking-widest uppercase hover:bg-surface-container-low transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 rounded-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                LOG IN WITH GOOGLE
              </button>

              <div className="text-center pt-2">
                <p className="text-on-surface-variant font-body text-[11px] sm:text-[12px] tracking-wide">
                  Exploring for the first time?{' '}
                  <Link to="/signup" className="text-primary font-bold hover:underline decoration-secondary-container underline-offset-4 transition-all">
                    CREATE ACCOUNT
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-4">
          <Footer />
        </div>
      </section>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 sm:p-6 md:p-8 space-y-4 shadow-xl mx-4">
            <h2 className="font-headline text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">Forgot Password</h2>
            {resetSent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                  <Mail size={18} className="text-green-700 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">
                    If that email exists in our system, a reset link has been sent. Check your inbox.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full font-headline text-[12px] uppercase tracking-widest text-on-surface-variant font-bold px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                  onClick={() => { setShowForgotModal(false); setResetEmail(''); }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-on-surface-variant">Enter your email address to receive a password reset link.</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-surface-container-high border-none focus:outline-none focus:ring-2 focus:ring-outline py-3 px-4 text-sm placeholder:text-outline/50 rounded-md"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="font-headline text-[12px] uppercase tracking-widest text-on-surface-variant font-bold px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                    onClick={() => { setShowForgotModal(false); setResetEmail(''); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={resetLoading || !resetEmail}
                    className="font-headline text-[12px] tracking-widest text-white font-bold px-4 py-2 bg-[#660000] rounded-md uppercase hover:bg-primary-container transition-all duration-300 active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleForgotPassword}
                  >
                    {resetLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept the Terms and Conditions to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = '/verify';
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-white min-h-screen flex flex-col">
      <main className="bg-surface-container-low w-full flex flex-col lg:flex-row">
        <div className="lg:w-5/12 relative h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-screen lg:sticky lg:top-0 bg-primary overflow-hidden">
          <img
            className="absolute inset-0 w-full h-full object-cover object-bottom opacity-70 mix-blend-luminosity"
            src={findparkgo}
            alt="findparkgo"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent opacity-90" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-12 lg:left-12 z-10">
            <div className="w-8 sm:w-10 h-1 bg-secondary-container mb-3 sm:mb-4 lg:mb-6" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-surface-container-lowest tracking-tighter max-w-xs leading-tight uppercase font-headline">
              Find. Park. Go.
            </h2>
            <p className="text-surface-container-low font-light py-4 sm:py-5 lg:py-7 leading-relaxed max-w-xs text-xs sm:text-sm font-body hidden sm:block">
              Experience parking spaces reimagined through smart layout, optimal accessibility, and architectural precision.
            </p>
          </div>
        </div>

        <div className="lg:w-7/12 bg-surface-container-low p-5 sm:p-8 md:p-12 lg:p-16 xl:p-20 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-md w-full mx-auto relative">
            <header className="flex items-center gap-3 mb-6 sm:mb-8">
              <h1 className="font-headline font-black text-xl sm:text-2xl tracking-tighter text-primary">Park 'n Spot</h1>
            </header>
            <div className="mb-4 sm:mb-5">
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight">Sign Up</h2>
            </div>
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-xs font-headline font-bold">{error}</p>
              </div>
            )}
            <form className="space-y-4 sm:space-y-5" onSubmit={handleRegister}>
              <div className="space-y-1 sm:space-y-2">
                <label className="font-headline text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">Full Name</label>
                <input
                  className="mt-1 w-full bg-surface-container-high border-none focus:ring-2 focus:ring-outline text-on-surface py-3 sm:py-4 px-4 sm:px-5 text-sm transition-all duration-300 placeholder:text-outline/50 rounded-md"
                  placeholder="e.g Juan Dela Cruz"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="font-headline text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">Email</label>
                <input
                  className="mt-1 w-full bg-surface-container-high border-none focus:ring-2 focus:ring-outline text-on-surface py-3 sm:py-4 px-4 sm:px-5 text-sm transition-all duration-300 placeholder:text-outline/50 rounded-md"
                  placeholder="juandelacruz@gmail.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="font-headline text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">PASSWORD</label>
                <div className="relative">
                  <input
                    className="mt-1 w-full bg-surface-container-high border-none focus:ring-2 focus:ring-outline text-on-surface py-3 sm:py-4 px-4 sm:px-5 text-sm transition-all duration-300 placeholder:text-outline/50 rounded-md pr-10"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                    title="must be at least 8 characters with A-Z a-z letters, 0-9, and @$!%*#?& symbols"
                    pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3 pt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 cursor-pointer accent-[#660000]"
                />
                <div className="text-on-surface-variant font-body text-[10px] sm:text-[11px] md:text-[12px] tracking-wide">
                  I agree to the{' '}
                  <button type="button" onClick={() => setShowTermsModal(true)} className="text-primary font-headline font-semibold underline underline-offset-4 hover:opacity-80">
                    Terms and Conditions
                  </button>.
                </div>
              </div>
              <div className="pt-2 sm:pt-3 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#660000] py-3 sm:py-4 text-surface-container-lowest border-none cursor-pointer font-headline font-bold text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-primary-container transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/10 text-center rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full border border-outline-variant/50 py-3 sm:py-4 text-on-surface font-headline font-semibold text-[11px] sm:text-xs tracking-widest uppercase hover:bg-surface-container-low transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 rounded-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  SIGN UP WITH GOOGLE
                </button>
              </div>
              <div className="text-center mt-4 sm:mt-6">
                <span className="text-on-surface-variant font-body text-[11px] sm:text-[12px] tracking-wide">Already have an account? </span>
                <Link to="/login" className="text-primary font-bold text-[11px] sm:text-[12px] hover:underline decoration-secondary-container underline-offset-4 transition-all">LOGIN</Link>
              </div>
            </form>
          </div>
          <div className="mt-8"><Footer /></div>
        </div>
      </main>

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 md:p-8 space-y-4 shadow-xl mx-4">
            <h2 className="text-lg sm:text-xl font-bold">Terms & Conditions</h2>
            <p className="text-sm"><strong>Park 'n Spot</strong></p>
            <p className="text-xs text-gray-500">Last Updated: 09/04/2026</p>
            <div className="text-xs sm:text-sm font-headline space-y-3">
              <p><strong>1. Acceptance:</strong> By using the app, you agree to these Terms.</p>
              <p><strong>2. Service:</strong> Helps find and share free parking spaces. Availability is not guaranteed.</p>
              <p><strong>3. Responsibilities:</strong></p>
              <ul className="list-disc ml-5">
                <li>Follow parking laws</li>
                <li>Verify parking availability</li>
                <li>Provide accurate info</li>
              </ul>
              <p><strong>4. Listings:</strong> Must have permission to post. We may remove listings anytime.</p>
              <p><strong>5. Liability:</strong> Not responsible for damage, theft, fines, or incorrect info.</p>
              <p><strong>6. Prohibited Use:</strong> No false info or misuse.</p>
              <p><strong>7. Termination:</strong> Accounts may be suspended for violations.</p>
              <p><strong>8. Changes:</strong> Terms may be updated anytime.</p>
              <p><strong>9. Governing Law:</strong> Philippines</p>
              <p><strong>10. Contact:</strong> park'ngo@gmail.com</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3">
              <button type="button" onClick={() => setShowTermsModal(false)} className="font-headline text-[12px] uppercase tracking-widest text-on-surface-variant font-bold px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition">Decline</button>
              <button type="button" onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} className="font-headline text-[12px] tracking-widest text-white font-bold px-4 py-2 bg-[#660000] rounded-md uppercase hover:bg-primary-container transition-all duration-300 active:scale-[0.98] shadow-md text-center">Accept</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Verify() {
  const navigate = useNavigate();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      setResendSent(true);
    } catch {
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface h-screen flex flex-col">
      <header className="flex items-center gap-2 sm:gap-3 pt-5 sm:pt-6 md:pt-8 px-5 sm:px-8 md:px-12 lg:px-16">
        <h1 className="font-headline font-black text-xl sm:text-2xl ml-8 tracking-tighter text-primary">Park 'n Spot</h1>
      </header>
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div className="max-w-md w-full bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] p-5 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden rounded-lg">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#660000]" />
          <div className="flex flex-col items-start gap-6 sm:gap-8">
            <button onClick={() => navigate('/signup')} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors duration-200 group border-none bg-transparent cursor-pointer">
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span className="font-headline font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Back to Sign Up</span>
            </button>
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-surface-container-low flex items-center justify-center rounded-md">
                <Mail size={24} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight text-[#660000]">Verify your<br />parking profile.</h1>
                <p className="text-on-surface-variant/80 text-xs sm:text-sm leading-relaxed font-body">We've sent a secure confirmation link to your email. Click the link to activate your account.</p>
              </div>
            </div>
            <div className="w-full space-y-4">
              {resendSent ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                  <Mail size={16} className="text-green-700 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">Verification email resent! Check your inbox.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3">
                  <p className="text-on-surface-variant/70 text-xs sm:text-sm font-medium tracking-wide font-body">Didn't receive the email?</p>
                  <button onClick={handleResend} disabled={resendLoading} className="text-primary font-headline font-bold flex items-center gap-2 hover:opacity-60 transition-opacity w-fit border-none bg-transparent cursor-pointer disabled:opacity-40">
                    <span className="tracking-tight uppercase text-[11px] sm:text-xs">{resendLoading ? 'Sending...' : 'Resend Link'}</span>
                    <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              )}
              <button onClick={() => navigate('/explore')} className="text-xs text-on-surface-variant/50 hover:text-on-surface-variant underline underline-offset-4 transition-colors font-body">
                Skip for now (dev only)
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function AuthSuccess() {
  const [error, setError] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userName', name ?? '');
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = '/explore';
    } else {
      setError('Authentication failed. Please try again.');
      setTimeout(() => { window.location.href = '/login'; }, 3000);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {error ? (
        <p className="text-red-600 font-headline font-bold text-sm">{error}</p>
      ) : (
        <>
          <div className="w-8 h-8 border-4 border-[#660000] border-t-transparent rounded-full animate-spin" />
          <p className="font-headline font-bold uppercase tracking-widest text-sm text-primary animate-pulse">Authenticating with Google...</p>
        </>
      )}
    </div>
  );
}
// ─────────────────────────────────────────
// Reset Password Page
// ─────────────────────────────────────────
export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = new URLSearchParams(window.location.search).get('token') || '';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Reset failed. Please try again.'); return; }
      setSuccess(true);
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
        <p className="text-red-600 font-headline font-bold text-sm text-center">Invalid or missing reset link. Please request a new one.</p>
        <button onClick={() => navigate('/login')} className="font-headline text-xs uppercase tracking-widest text-primary underline">Back to Login</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface p-6">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-8 space-y-6">
        <div>
          <h1 className="font-headline font-black text-xl tracking-tighter text-primary mb-1">Park 'n Spot</h1>
          <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">New Password</h2>
          <p className="text-xs text-on-surface-variant mt-2">Choose a strong password for your account.</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
              <Mail size={18} className="text-green-700 shrink-0" />
              <p className="text-xs text-green-700 font-medium">Password reset successfully! You can now log in.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#660000] py-3 text-white font-headline font-bold text-xs tracking-widest uppercase rounded-md hover:bg-primary-container transition"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleReset}>
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-xs font-headline font-bold">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="font-headline text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">New Password</label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-high border-none focus:ring-2 focus:ring-outline text-on-surface py-3 px-4 text-sm rounded-md placeholder:text-outline/50"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-headline text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">Confirm Password</label>
              <input
                className="w-full bg-surface-container-high border-none focus:ring-2 focus:ring-outline text-on-surface py-3 px-4 text-sm rounded-md placeholder:text-outline/50"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#660000] py-3 text-white font-headline font-bold text-xs tracking-widest uppercase rounded-md hover:bg-primary-container transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="w-full text-center font-headline text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition">
              Back to Login
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
