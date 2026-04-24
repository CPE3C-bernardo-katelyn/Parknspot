import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { TopNav, BottomNav, Footer  } from './components/Navigation';
import Home from './pages/user/Home';
import AboutUs from './pages/user/AboutUs';
import Explore from './pages/user/Explore';
import History from './pages/user/History';
import Report from './pages/user/Report';
import Profile from './pages/user/Profile';
import FacilityDetails from './pages/user/FacilityDetails';
import { Login, SignUp, Verify, AuthSuccess, ResetPassword } from './pages/user/Auth';
import Dashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/Users';
import Complaints from './pages/admin/Complaints';
import Reports from './pages/admin/Reports';
import { AdminLogin } from './pages/admin/AdminAuth';


function AppContent() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true' || !!localStorage.getItem('token');
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true' || !!localStorage.getItem('token'));
      setIsAdminLoggedIn(localStorage.getItem('isAdminLoggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const isAuthPage = ['/login', '/signup', '/verify', '/auth-success', '/reset-password'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLandingPage = location.pathname === '/';
  const shouldHideNav = isAuthPage || isLandingPage || isAdminPage;

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNav && <TopNav />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<AboutUs />} />
          <Route 
            path="/home" 
            element={isLoggedIn ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/explore" 
            element={isLoggedIn ? <Explore /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/history" 
            element={isLoggedIn ? <History /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/report" 
            element={isLoggedIn ? <Report /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile"
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
          />
          <Route 
            path="/facility/:id" 
            element={isLoggedIn ? <FacilityDetails /> : <Navigate to="/login" />} 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={isAdminLoggedIn ? <Dashboard /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/users" 
            element={isAdminLoggedIn ? <UsersPage /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/complaints" 
            element={isAdminLoggedIn ? <Complaints /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/reports" 
            element={isAdminLoggedIn ? <Reports /> : <Navigate to="/admin/login" />} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/explore" : "/"} />} />
        </Routes>
      </div>
      {!shouldHideNav && <BottomNav />}
      {!shouldHideNav && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}