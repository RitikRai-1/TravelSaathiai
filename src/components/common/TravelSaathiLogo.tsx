import React from 'react';
import { Link } from 'react-router-dom';

interface TravelSaathiLogoProps {
  variant?: 'full' | 'compact' | 'white';
  showSubtitle?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | string;
}

export const TravelSaathiLogo: React.FC<TravelSaathiLogoProps> = ({
  variant = 'full',
  showSubtitle = true,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
  }[size as 'sm' | 'md' | 'lg'] || 'h-11 w-11';

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 whitespace-nowrap flex-shrink-0 ${className}`}>
      {/* 3D Brand Logo Emblem */}
      <div className={`relative ${sizeClasses} rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-[#0B192C]/40 border border-[#2DD4BF]/40 bg-[#0B192C] flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <img
          src="/logo.png"
          alt="TravelSaathi AI Logo"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Brand Text */}
      <div className="whitespace-nowrap">
        <div className="flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap">
          <span className={`font-black text-lg sm:text-2xl tracking-tight font-heading whitespace-nowrap ${variant === 'white' ? 'text-[#FAF9F6]' : 'text-[#0B192C]'}`}>
            TravelSaathi
          </span>
          <span className="font-black text-lg sm:text-2xl tracking-tight text-[#FF6B35] font-heading whitespace-nowrap">
            AI
          </span>
          <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md hidden sm:inline-block ${
            variant === 'white'
              ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/50'
              : 'bg-[#2DD4BF]/15 text-[#0F766E] border border-[#2DD4BF]/60'
          }`}>
            India
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-[11px] font-medium tracking-wide ${variant === 'white' ? 'text-slate-300' : 'text-slate-500'} hidden sm:block`}>
            Your Smart Travel Companion Across India
          </p>
        )}
      </div>
    </div>
  );
};
