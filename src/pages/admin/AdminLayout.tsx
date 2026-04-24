import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import Logo from "../../components/Logo/logo.png";
import { 
  LayoutDashboard, 
  Users, 
  CircleUserRound,
  BarChart3, 
  AlertTriangle, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Complaints', path: '/admin/complaints', icon: AlertTriangle },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="text-center mb-8 md:mb-12 px-4">
        <div className="relative inline-block">
          <img src={Logo} alt="Logo" className="w-20 h-20 md:w-26 md:h-26 object-contain" />
          <Link 
            to="/user/aboutus" 
            className="text-lg md:text-2xl font-bold tracking-tight text-on-surface font-headline absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1 whitespace-nowrap text-center"
          >
            Park ‘n Spot
          </Link>
        </div>
      </div>

      {/* Profile section */}
      <div className="px-4 md:px-8 flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-container-low overflow-hidden flex-shrink-0">
          <CircleUserRound className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-on-surface font-bold text-sm md:text-base font-headline truncate">Admin</p>
          <p className="text-on-surface-variant text-xs md:text-sm font-body truncate">Facility Lead</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center space-x-3 py-2.5 md:py-3 transition-all pl-4 md:pl-5 ${
                isActive 
                  ? 'text-on-surface font-bold border-l-4 border-primary bg-surface-container-low' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Icon size={18} className={`md:w-5 md:h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="font-medium text-sm md:text-base font-body">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 md:px-8 py-4 border-t border-outline-variant/10">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 py-2.5 md:py-3 mt-4 text-on-surface-variant hover:text-primary transition-colors w-full text-left bg-transparent border-none cursor-pointer"
        >
          <LogOut size={18} className="md:w-5 md:h-5" />
          <span className="font-medium text-sm md:text-base font-body">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-background text-on-surface flex min-h-screen">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SideNavBar - Desktop */}
      <aside className={`hidden md:block h-screen w-64 fixed left-0 top-0 bg-surface-container-high flex flex-col py-8 space-y-6 z-40 border-r border-outline-variant/10`}>
        <SidebarContent />
      </aside>

      {/* SideNavBar - Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 w-72 h-full bg-surface-container-high flex flex-col py-6 space-y-4 z-50 shadow-xl"
          >
            <div className="px-4 flex justify-end">
              <button
                onClick={closeSidebar}
                className="p-2 hover:bg-surface-container-low rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* TopAppBar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md flex justify-between items-center w-full px-4 sm:px-6 md:px-8 py-3 md:py-4 shadow-[0_12px_40px_rgba(27,28,25,0.06)]">
          <div className="flex items-center space-x-3 md:space-x-8">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-surface-container-low rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-on-surface font-headline truncate">
              {title}
            </h2>
          </div>
          
          {/* Optional: Add user menu or notifications for mobile */}
          <div className="md:hidden">
            <div className="w-8 h-8 rounded-full bg-surface-container-low overflow-hidden">
              <CircleUserRound className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-x-auto">
          {children}
        </div>
        
        <Footer />
      </main>
    </div>
  );
}
