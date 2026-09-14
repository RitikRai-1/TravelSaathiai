import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { TravelSaathiLogo } from '../common/TravelSaathiLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  Menu,
  X,
  Search,
  User as UserIcon,
  Home,
  Compass,
  Sparkles,
  Hotel,
  Utensils,
  Car,
  Eye,
  BookmarkCheck,
  Bell,
  Briefcase,
  Info,
  PhoneCall,
  LogOut,
  LogIn,
  Sun,
  Moon,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const MobileNavbar: React.FC = () => {
  const { user, logout, isSuperAdmin, isBusinessOwner } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const navMenuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore India', path: '/explore', icon: Compass },
    { name: 'Plan My Trip', path: '/plan-trip', icon: Sparkles, highlight: true },
    { name: 'Hotels & Havelis', path: '/hotels', icon: Hotel },
    { name: 'Restaurants & Food', path: '/restaurants', icon: Utensils },
    { name: 'Taxis & Cabs', path: '/taxis', icon: Car },
    { name: 'Hidden Gems', path: '/hidden-gems', icon: Eye },
    { name: 'My Saved Trips', path: '/dashboard', icon: Sparkles },
    { name: 'My Taxi Bookings', path: '/dashboard', icon: Car },
    { name: 'Saved Stays & Places', path: '/saved', icon: BookmarkCheck },
    { name: 'Partner / Business', path: user && isBusinessOwner ? '/business/dashboard' : '/business/register', icon: Briefcase },
  ];

  return (
    <>
      {/* ================= STICKY MOBILE TOP BAR ================= */}
      <header className="sticky top-0 z-40 bg-[#0B192C] text-white px-3.5 py-2.5 shadow-md flex items-center justify-between border-b border-[#0F766E]/40 md:hidden">
        {/* Logo */}
        <Link to="/" onClick={closeDrawer} className="flex items-center gap-1.5 focus:outline-none">
          <TravelSaathiLogo size="sm" />
        </Link>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-200 hover:text-white rounded-xl active:bg-[#1E3E62]/50 transition"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#2DD4BF]" />}
          </button>

          {/* Omni Search Button */}
          <Link
            to="/search"
            onClick={closeDrawer}
            className="p-2 text-slate-200 hover:text-[#2DD4BF] rounded-xl active:bg-[#1E3E62]/50 transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Profile / Account Shortcut */}
          <Link
            to={user ? '/profile' : '/login'}
            onClick={closeDrawer}
            className="p-1.5 text-slate-200 hover:text-[#2DD4BF] rounded-xl active:bg-[#1E3E62]/50 transition flex items-center justify-center"
            aria-label={user ? 'My Profile' : 'Login'}
          >
            {user ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] flex items-center justify-center text-white font-bold text-xs ring-1 ring-[#2DD4BF]/50">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="p-1 rounded-lg border border-[#0F766E]/50 text-[#2DD4BF]">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </Link>

          {/* Hamburger Menu Toggle Button (Min 44x44 target) */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2.5 rounded-xl text-slate-200 hover:text-white active:bg-[#1E3E62]/50 border border-[#0F766E]/40 flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label={drawerOpen ? 'Close Menu' : 'Open Navigation Menu'}
          >
            {drawerOpen ? <X className="w-5 h-5 text-[#2DD4BF]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ================= MOBILE DRAWER / OVERLAY ================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-150">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={closeDrawer}
          />

          {/* Drawer Panel (slides up from bottom or fills 88vh) */}
          <div className="relative z-10 w-full max-h-[90vh] bg-[#0B192C] text-slate-100 rounded-t-3xl border-t border-[#0F766E]/60 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#1E3E62] flex items-center justify-between bg-[#07101C]">
              <div className="flex items-center gap-2">
                <TravelSaathiLogo size="sm" />
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#0F766E]/40 text-[#2DD4BF] border border-[#2DD4BF]/30">
                  Menu
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#0B192C] border border-slate-700 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Banner inside Drawer */}
            <div className="px-4 py-3 bg-[#07101C]/80 border-b border-[#1E3E62]/60">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link
                    to="/profile"
                    onClick={closeDrawer}
                    className="flex items-center gap-3 truncate group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-[#2DD4BF] truncate">
                        {user.name || 'TravelSaathi User'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {user.mobile_number ? `+91 ${user.mobile_number}` : user.email}
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={closeDrawer}
                    className="px-2.5 py-1 text-[11px] font-bold text-[#2DD4BF] bg-[#0F766E]/30 rounded-lg border border-[#2DD4BF]/30 whitespace-nowrap"
                  >
                    View Profile
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="py-2.5 text-center text-xs font-bold text-[#2DD4BF] border border-[#2DD4BF]/40 bg-[#07101C] rounded-xl active:bg-[#1E3E62] transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeDrawer}
                    className="py-2.5 text-center text-xs font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#EA580C] rounded-xl shadow-sm active:brightness-110 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Preference Bar (Theme & Language) */}
            <div className="px-4 py-2.5 bg-[#07101C]/50 border-b border-[#1E3E62]/40 flex items-center justify-between">
              {/* Theme Mode Toggle Buttons */}
              <div className="flex items-center space-x-1 bg-[#0B192C] p-1 rounded-xl border border-[#1E3E62]">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    theme === 'light' ? 'bg-[#FAF9F6] text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>White</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    theme === 'dark' ? 'bg-[#0F766E] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3 h-3 text-[#2DD4BF]" />
                  <span>Dark</span>
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center">
                <LanguageSelector />
              </div>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {/* Admin Portal Shortcut if user is SuperAdmin */}
              {user && isSuperAdmin && (
                <Link
                  to="/admin"
                  onClick={closeDrawer}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Super Admin Control Center</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              )}

              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={closeDrawer}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition ${
                      item.highlight
                        ? 'bg-gradient-to-r from-[#FF6B35] to-[#EA580C] text-white font-bold shadow-md'
                        : isActive
                        ? 'bg-[#0F766E]/40 text-[#2DD4BF] border border-[#2DD4BF]/40 font-bold'
                        : 'text-slate-200 hover:bg-[#1E3E62]/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : 'text-[#2DD4BF]'}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </Link>
                );
              })}

              {/* Logout Button if Logged In */}
              {user && (
                <button
                  onClick={() => {
                    closeDrawer();
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 min-h-[44px] transition text-left mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
