import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = true, variant = 'auto' }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* 3D Glass Badge Logo Icon */}
      <div className={`relative ${iconSizes[size]} shrink-0`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[#5433eb]/30 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300" />
        
        {/* Outer Bevel Frame */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-[#5433eb] via-[#7c3aed] to-[#a855f7] p-[1.5px] shadow-lg shadow-[#5433eb]/20">
          <div className="w-full h-full rounded-[14px] bg-[#ffffff] flex items-center justify-center overflow-hidden relative shadow-inner">
            
            {/* SVG Prime Monogram */}
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300"
            >
              <defs>
                <linearGradient id="primeVioletGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5433EB" />
                  <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
              </defs>

              {/* Hexagon facet */}
              <path
                d="M18 3L30 10V26L18 33L6 26V10L18 3Z"
                fill="#5433EB"
                fillOpacity="0.08"
                stroke="url(#primeVioletGrad)"
                strokeWidth="1.5"
              />

              {/* Stylized P with diamond star */}
              <path
                d="M13 9H20.5C23.5 9 25.5 11.2 25.5 14.2C25.5 17.2 23.5 19.4 20.5 19.4H17V27H13V9Z"
                fill="url(#primeVioletGrad)"
              />
              <circle cx="17.5" cy="14.2" r="2" fill="#ffffff" />
              
              {/* Sparkle star */}
              <circle cx="28" cy="8" r="2.2" fill="#5433EB" className="animate-pulse" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight text-[#0a0a0c] ${textSizes[size]} flex items-center gap-1.5`}>
          <span className="font-display">Prime</span>
          <span className="text-[#5433eb] font-display font-extrabold">
            Shop
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-slate-500 mt-0.5">
            Store Officiel
          </span>
        )}
      </div>
    </div>
  );
};

// Wordmark version inspired by the reference screenshot's center top script
export const PrimeWordmark: React.FC<{ className?: string }> = ({ className = 'h-10' }) => {
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0a0a0c] font-display flex items-center">
        <span>prime</span>
        <span className="text-[#5433eb] italic font-serif ml-0.5 font-bold">shop</span>
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5433eb] ml-1.5 mb-1 animate-pulse" />
      </span>
    </div>
  );
};
