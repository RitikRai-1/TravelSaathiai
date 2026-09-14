import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, Sparkles, BookmarkCheck, User } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/plan-trip', label: 'Plan Trip', icon: Sparkles, highlight: true },
    { to: '/saved', label: 'Saved', icon: BookmarkCheck },
    { to: user ? '/profile' : '/login', label: user ? 'Profile' : 'Log In', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B192C]/95 backdrop-blur-md border-t border-[#0F766E]/40 px-2 py-1.5 md:hidden flex items-center justify-around shadow-2xl safe-area-pb"
      aria-label="Mobile Navigation Bar"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] min-h-[44px] transition active:scale-95 ${
                item.highlight
                  ? 'bg-gradient-to-tr from-[#FF6B35] to-[#EA580C] text-white font-bold shadow-md shadow-orange-500/20 -mt-3 ring-4 ring-[#0B192C]'
                  : isActive
                  ? 'text-[#2DD4BF] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className={item.highlight ? 'w-5 h-5' : 'w-4 h-4 mb-0.5'} />
            <span className="text-[10px] tracking-tight leading-none">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
