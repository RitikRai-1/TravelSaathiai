import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Compass,
  CheckSquare,
  Car,
  MessageSquare,
  Settings,
  ToggleLeft,
  History,
  Shield,
  ArrowLeft,
  LogOut,
  AlertCircle,
  Users,
  Eye,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isSuperAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-4">
          <Shield className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Super Admin Restricted</h2>
          <p className="text-xs text-slate-500">
            This management console requires Super Admin privileges. You must log in with an administrator account to view or modify live tourism data.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              Sign In with Admin Account
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/cities', label: 'Destinations & Cities', icon: MapPin },
    { to: '/admin/places', label: 'Attractions & Places', icon: Compass },
    { to: '/admin/hidden-gems', label: 'Hidden Gems', icon: Eye },
    { to: '/admin/approvals', label: 'Business Approvals', icon: CheckSquare },
    { to: '/admin/users', label: 'User Accounts', icon: Users },
    { to: '/admin/bookings', label: 'Taxi Bookings', icon: Car },
    { to: '/admin/reviews', label: 'Review Moderation', icon: MessageSquare },
    { to: '/admin/cms', label: 'CMS & Settings', icon: Settings },
    { to: '/admin/features', label: 'Feature Toggles', icon: ToggleLeft },
    { to: '/admin/logs', label: 'Activity Logs', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header (<= 767px) */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black font-heading text-xs shadow-md">
            TS
          </div>
          <div>
            <h1 className="font-bold text-xs text-white font-heading tracking-tight leading-none">
              TravelSaathi CMS
            </h1>
            <span className="text-[9px] text-amber-400 font-semibold uppercase tracking-wider block">
              Admin Console
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle Admin Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer (<= 767px) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 animate-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Portal</span>
            </Link>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="truncate pr-2">
                <p className="font-bold text-white truncate">{user.name}</p>
                <span className="text-[10px] text-slate-500 truncate block">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (>= 768px) - 100% Preserved */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800/80 flex-col justify-between flex-shrink-0 min-h-screen">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black font-heading shadow-md">
                TS
              </div>
              <div>
                <h1 className="font-bold text-sm text-white font-heading tracking-tight">
                  TravelSaathi CMS
                </h1>
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                  Super Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar info & Return */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Portal</span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <div className="truncate pr-2">
              <p className="font-bold text-white truncate">{user.name}</p>
              <span className="text-[10px] text-slate-500 truncate block">{user.email}</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-slate-950 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};
