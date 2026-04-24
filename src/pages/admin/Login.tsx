import { User, Lock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/logo.png";
import { Footer } from '../../components/Footer';

export function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate("/");
  };

  return (
    <div className="bg-surface text-on-surface flex items-center justify-center min-h-screen p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-surface-container-low rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-secondary-container opacity-20 rounded-full blur-[100px]"></div>
      </div>

      <motion.main 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 editorial-shadow border border-outline-variant/10">
            <Logo className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Park 'N Spot</h1>
          <p className="text-on-surface-variant font-medium tracking-tight">The Curator Access Portal</p>
        </div>

        <div className="bg-surface-container-lowest editorial-shadow rounded-xl p-10 backdrop-blur-md border border-outline-variant/10">
          <h2 className="text-xl font-bold text-on-surface mb-8">Admin Authorization</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Username / Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-1 focus:ring-primary text-sm pl-12 py-4 rounded-sm placeholder:text-on-surface-variant/40 transition-all" 
                  placeholder="curator@sovereign.com" 
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-on-secondary-container transition-colors">Forgot Credentials?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-1 focus:ring-primary text-sm pl-12 py-4 rounded-sm placeholder:text-on-surface-variant/40 transition-all" 
                  placeholder="••••••••" 
                  type="password"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                className="w-full bg-primary text-white py-5 rounded-sm font-bold tracking-tight text-sm flex items-center justify-center space-x-2 hover:bg-primary-container transition-all active:scale-[0.98] editorial-shadow border border-primary/50" 
                type="submit"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-outline-variant/20 flex flex-col items-center space-y-4">
            <p className="text-xs text-on-surface-variant/60 text-center">Restricted access for facility curators and system leads only.</p>
            <div className="flex justify-center space-x-6">
              <button className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</button>
              <button className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
