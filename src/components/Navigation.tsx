import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Home, History, FileText, User, Map as MapIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import profile from "./images/profile.jpg";
import { useEffect, useState } from "react";
import { useNotifications } from '../../hooks/useNotifications';

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  // ✅ FIXED: checks both token and isLoggedIn, same as App.tsx
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true' || !!localStorage.getItem('token')
  );

  const token = localStorage.getItem('token');
  const { notifications, unreadCount, markAllRead } = useNotifications(token);

  useEffect(() => {
    // ✅ FIXED: syncs both isLoggedIn and token on auth changes
    const syncAuth = () => {
      setIsLoggedIn(
        localStorage.getItem('isLoggedIn') === 'true' || !!localStorage.getItem('token')
      );
    };
    window.addEventListener('auth-change', syncAuth);
    return () => window.removeEventListener('auth-change', syncAuth);
  }, []);

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Map', path: '/explore' },
    { name: 'History', path: '/history' },
    { name: 'Report', path: '/report' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav flex justify-between items-center px-8 h-20">
      <div className="flex items-center gap-8">
        <Link to="/home" className="text-xl font-headline font-extrabold ml-8 tracking-tighter text-[#330000]">
          Park 'n Spot
        </Link>
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-headline font-bold tracking-tight transition-colors duration-300 uppercase tracking-widest",
                location.pathname === item.path
                  ? "text-[#330000] border-b-2 border-[#330000]"
                  : "text-on-surface-variant hover:text-primary-container"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-64 bg-white shadow-md rounded-md p-3">
            <p className="text-sm text-[#330000] font-semibold mb-2">Notifications</p>

            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">No notifications</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n._id} className={cn("text-sm border-b pb-2 mb-2", !n.isRead && "font-semibold")}>
                  <p>{n.title}</p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                </div>
              ))
            )}

            <div
              onClick={() => {
                markAllRead();
                setOpen(false);
              }}
              className="text-sm text-[#330000] text-center cursor-pointer mt-1">
              Mark all as read
            </div>
          </div>
        )}

        {/* ✅ FIXED: now checks both isLoggedIn and token */}
        <button
          onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
          className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20"
        >
          <img
            src={profile}
            alt="profile picture"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="py-8 bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-6">
        <p className="text-on-surface-variant text-center tracking-[0.3em] text-[10px] opacity-70 font-body">© 2026 Park 'n Spot. Computer Engineering Students. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function BottomNav() {
  const location = useLocation();
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
      setHideNav(atBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const items = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Explore', path: '/explore', icon: MapIcon },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Report', path: '/report', icon: FileText },
  ];

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 w-full h-20 glass-nav flex justify-around items-center px-6 pb-safe z-50 rounded-t-xl shadow-2xl transition-all duration-300",
        hideNav ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center transition-all",
              isActive ? "text-[#330000] scale-110" : "text-on-surface-variant opacity-60"
            )}
          >
            <Icon size={24} fill={isActive ? "currentColor" : "none"} />
            <span className="text-[11px] font-semibold tracking-wide mt-1">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}