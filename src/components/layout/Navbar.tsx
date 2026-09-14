import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { TravelSaathiLogo } from '../common/TravelSaathiLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import { MobileNavbar } from './MobileNavbar';
import { useLanguage } from '../../context/LanguageContext';

import {
  Compass,
  Sparkles,
  Hotel,
  Utensils,
  Car,
  Eye,
  Briefcase,
  User as UserIcon,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  BookmarkCheck,
  ChevronDown,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isSuperAdmin, isBusinessOwner } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((res) => {
          if (res.success && res.data) {
            const unread = res.data.filter((n) => !n.is_read).length;
            setUnreadNotifications(unread);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('exploreIndia'), path: '/explore', icon: Compass },
    { name: t('planMyTrip'), path: '/plan-trip', icon: Sparkles, highlight: true },
    { name: t('hotels'), path: '/hotels', icon: Hotel },
    { name: t('restaurants'), path: '/restaurants', icon: Utensils },
    { name: t('taxis'), path: '/taxis', icon: Car },
    { name: t('hiddenGems'), path: '/hidden-gems', icon: Eye },
    { name: t('advertise'), path: '/business/register', icon: Briefcase },
  ];

  return (
    <>
      {/* Dedicated Smartphone Mobile Navigation (<= 767px) */}
      <MobileNavbar />

      {/* Existing Desktop & Tablet Navigation (>= 768px) - 100% untouched */}
      <header className="sticky top-0 z-50 w-full max-w-full bg-[#0B192C] text-slate-100 border-b border-[#0F766E]/40 shadow-md hidden md:block">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <Link to="/" className="group flex-shrink-0">
            <TravelSaathiLogo variant="white" size="sm" className="sm:scale-100" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 flex-nowrap overflow-hidden">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                    link.highlight
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#EA580C] hover:brightness-110 text-white shadow-md shadow-[#FF6B35]/30'
                      : isActive
                      ? 'text-[#2DD4BF] bg-[#0F766E]/50 font-bold border border-[#2DD4BF]/50'
                      : 'text-slate-200 hover:text-[#2DD4BF] hover:bg-[#1E3E62]/50'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 ${link.highlight ? 'text-white' : 'text-[#2DD4BF]'}`} />}
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls: Theme, Language, Profile/Auth */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-2.5 flex-shrink-0">
            {/* White / Dark Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-[#0F766E]/50 hover:border-[#2DD4BF] bg-[#07101C]/80 hover:bg-[#1E3E62]/50 text-xs font-semibold text-slate-200 hover:text-white transition whitespace-nowrap"
              title={`Switch to ${theme === 'dark' ? 'White' : 'Dark'} theme`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="whitespace-nowrap">White</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span className="whitespace-nowrap">Dark</span>
                </>
              )}
            </button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Omni Search Shortcut */}
            <Link
              to="/search"
              title="Omni Search India"
              className="p-1.5 text-slate-300 hover:text-[#2DD4BF] hover:bg-[#1E3E62]/50 rounded-xl transition flex-shrink-0"
              aria-label="Omni Search India"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Quick Settings Shortcut */}
            <Link
              to="/settings"
              title="Settings & Regional Preferences"
              className="p-1.5 text-slate-300 hover:text-[#2DD4BF] hover:bg-[#1E3E62]/50 rounded-xl transition flex-shrink-0"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>

            {user ? (
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                {/* Saved Collection shortcut */}
                <Link
                  to="/saved"
                  title="Saved Places & Trips"
                  className="p-1.5 text-slate-300 hover:text-[#2DD4BF] hover:bg-[#1E3E62]/50 rounded-xl transition flex-shrink-0"
                >
                  <BookmarkCheck className="w-4 h-4" />
                </Link>

                {/* Notifications */}
                <Link
                  to="/dashboard"
                  title="Notifications"
                  className="p-1.5 text-slate-300 hover:text-[#2DD4BF] hover:bg-[#1E3E62]/50 rounded-xl relative transition flex-shrink-0"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B35] rounded-full ring-2 ring-[#0B192C]"></span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-1.5 p-1 pr-2.5 rounded-full border border-[#0F766E]/50 hover:border-[#2DD4BF] bg-[#07101C] hover:bg-[#1E3E62]/40 transition shadow-xs whitespace-nowrap"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate whitespace-nowrap">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0B192C] text-slate-100 rounded-2xl shadow-2xl border border-[#0F766E]/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-[#1E3E62]">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0F766E]/40 text-[#2DD4BF] border border-[#2DD4BF]/30">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      {isSuperAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-[#2DD4BF] hover:bg-[#1E3E62]/50 transition"
                        >
                          <Shield className="w-4 h-4 text-[#2DD4BF]" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      {isBusinessOwner && (
                        <Link
                          to="/business/dashboard"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-teal-300 hover:bg-[#1E3E62]/50 transition"
                        >
                          <Briefcase className="w-4 h-4 text-teal-400" />
                          <span>Business Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/50 hover:text-[#2DD4BF] transition"
                      >
                        <UserIcon className="w-4 h-4 text-[#2DD4BF]" />
                        <span>My Profile / Account</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/50 hover:text-[#2DD4BF] transition"
                      >
                        <Compass className="w-4 h-4 text-slate-400" />
                        <span>Tourist Dashboard</span>
                      </Link>


                      <Link
                        to="/saved"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/50 hover:text-[#2DD4BF] transition"
                      >
                        <BookmarkCheck className="w-4 h-4 text-slate-400" />
                        <span>Saved Trips & Places</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/50 hover:text-[#2DD4BF] transition"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        <span>{t('settings')} & Preferences</span>
                      </Link>

                      <div className="border-t border-[#1E3E62] my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-950/40 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#2DD4BF] hover:bg-[#0F766E]/30 border border-[#2DD4BF]/40 rounded-xl transition whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#EA580C] hover:brightness-110 rounded-xl shadow-sm transition whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Theme Toggle & Hamburger Menu */}
          <div className="flex items-center space-x-2 lg:hidden flex-shrink-0">
            {/* Quick Mobile Theme Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-200 hover:text-white rounded-xl border border-[#0F766E]/50 bg-[#07101C]/80 transition"
              title={`Switch to ${theme === 'dark' ? 'White' : 'Dark'} theme`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#2DD4BF]" />}
            </button>

            {user && (
              <Link to="/dashboard" className="p-2 text-slate-200 hover:text-[#2DD4BF] transition relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B35] rounded-full ring-2 ring-[#0B192C]"></span>
                )}
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-200 rounded-xl hover:bg-[#1E3E62]/50 transition border border-[#0F766E]/40"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#2DD4BF]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#0F766E]/40 bg-[#0B192C] text-slate-100 px-4 pt-4 pb-8 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          {/* Mobile Theme Selection Buttons: White / Dark */}
          <div className="p-3 bg-[#07101C] rounded-2xl border border-[#0F766E]/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Theme Mode</span>
            <div className="flex items-center space-x-1.5 bg-[#0B192C] p-1 rounded-xl border border-[#1E3E62]">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  theme === 'light'
                    ? 'bg-[#FAF9F6] text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>White</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  theme === 'dark'
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Multilingual Selector on Mobile */}
          <div className="flex items-center justify-between p-3 bg-[#07101C] rounded-2xl border border-[#0F766E]/30">
            <span className="text-xs font-semibold text-slate-300">Language</span>
            <LanguageSelector />
          </div>

          {/* Quick Omni Search on Mobile */}
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl bg-[#07101C] border border-[#0F766E]/40 text-xs font-semibold text-slate-200 hover:text-[#2DD4BF] transition"
          >
            <Search className="w-4 h-4 text-[#2DD4BF]" />
            <span>Search destinations, stays, food, taxis...</span>
          </Link>

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                    link.highlight
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#EA580C] text-white font-bold shadow-sm'
                      : isActive
                      ? 'bg-[#0F766E]/40 text-[#2DD4BF] border border-[#2DD4BF]/40 font-bold'
                      : 'text-slate-200 hover:bg-[#1E3E62]/40 hover:text-[#2DD4BF]'
                  }`}
                >
                  {Icon && <Icon className={`w-5 h-5 ${link.highlight ? 'text-white' : 'text-[#2DD4BF]'}`} />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Account / Auth Section in Mobile Menu */}
          <div className="border-t border-[#1E3E62] pt-3 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-3.5 py-2.5 bg-[#07101C] rounded-xl border border-[#0F766E]/30">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0F766E]/40 text-[#2DD4BF] border border-[#2DD4BF]/30">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>

                {isSuperAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm font-bold text-[#2DD4BF] bg-[#0F766E]/20 rounded-xl border border-[#2DD4BF]/30"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Control Panel</span>
                  </Link>
                )}

                {isBusinessOwner && (
                  <Link
                    to="/business/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm font-bold text-teal-300 bg-[#0F766E]/20 rounded-xl"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Business Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/40 rounded-xl"
                >
                  <UserIcon className="w-4 h-4 text-[#2DD4BF]" />
                  <span>My Profile / Account</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/40 rounded-xl"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Tourist Dashboard</span>
                </Link>


                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/40 rounded-xl"
                >
                  <BookmarkCheck className="w-4 h-4 text-slate-400" />
                  <span>Saved Trips & Places</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1E3E62]/40 rounded-xl"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>{t('settings')} & Preferences</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-[#2DD4BF] border border-[#2DD4BF]/40 bg-[#07101C] hover:bg-[#1E3E62]/40 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#EA580C] hover:brightness-110 rounded-xl shadow-md transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
};

