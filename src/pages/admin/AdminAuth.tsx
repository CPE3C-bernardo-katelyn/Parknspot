import React, { useState } from 'react';
import { Footer } from '../../components/Footer'
import Logo from "../../components/Logo/logo.png";
import { useNavigate } from 'react-router-dom';
import { Lock, PersonStanding, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

export function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(value) }));
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    else setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setTouched({ email: true, password: true });
    setErrors({ email: emailError, password: passwordError, general: '' });
    if (emailError || passwordError) return;

    setLoading(true);

    try {
      const res = await fetch(`${ADMIN_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminToken', data.data.token);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/admin/dashboard');
      } else {
        setErrors(prev => ({ ...prev, general: data.message || 'Invalid email or password.' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, general: 'Cannot connect to server.' }));
    }

    setLoading(false);
  };

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-surface-container-low rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-secondary-container opacity-20 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-md mx-auto flex-1 flex items-center">
        <div className="w-full">
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <img src={Logo} alt="Logo" className="w-46 h-46 object-contain" />
              <h1 className="text-5xl font-bold tracking-tight text-on-surface font-headline mb-4 absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1 whitespace-nowrap">Park 'n Spot</h1>
            </div>
            <p className="text-on-surface-variant font-medium tracking-tight font-body mt-2">Admin Access Portal</p>
          </div>

          <div className="bg-surface-container-lowest shadow-[0_12px_40px_rgba(27,28,25,0.06)] rounded-xl p-10 backdrop-blur-md border border-outline-variant/10">
            <h2 className="text-xl font-bold text-on-surface mb-8 font-headline">Admin Authorization</h2>

            {errors.general && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle size={14} className="text-red-600 shrink-0" />
                <p className="text-red-700 text-xs font-bold">{errors.general}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <PersonStanding size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email && touched.email ? 'text-error' : 'text-on-surface-variant'}`} />
                  <input
                    className={`w-full bg-surface-container-high focus:ring-1 focus:ring-primary text-sm pl-12 py-4 rounded-sm placeholder:text-on-surface-variant/40 transition-all font-body text-on-surface outline-none ${errors.email && touched.email ? 'ring-1 ring-error' : ''}`}
                    id="email"
                    placeholder="admin@parknspot.com"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    required
                  />
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center gap-1 mt-1 text-error text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password && touched.password ? 'text-error' : 'text-on-surface-variant'}`} />
                  <input
                    className={`w-full bg-surface-container-high focus:ring-1 focus:ring-primary text-sm pl-12 pr-12 py-4 rounded-sm placeholder:text-on-surface-variant/40 transition-all font-body text-on-surface outline-none ${errors.password && touched.password ? 'ring-1 ring-error' : ''}`}
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <div className="flex items-center gap-1 mt-1 text-error text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  className="w-full bg-primary-container text-secondary-container py-5 rounded-sm font-bold tracking-tight text-sm flex items-center justify-center space-x-2 hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg shadow-primary/20 border-none cursor-pointer font-headline disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Logging in...' : 'Log In'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  );
}