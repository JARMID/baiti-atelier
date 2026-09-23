import React from 'react';

interface BaitiLogoMarkProps {
  className?: string;
  size?: number;
  showText?: boolean;
  isLight?: boolean;
}

export const BaitiLogoMark: React.FC<BaitiLogoMarkProps> = ({
  className = '',
  size = 40,
  showText = false,
  isLight = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="markBgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#0B1526'} />
            <stop offset="50%" stopColor={isLight ? '#F1F5F9' : '#060D18'} />
            <stop offset="100%" stopColor={isLight ? '#E2E8F0' : '#02050A'} />
          </linearGradient>

          <linearGradient id="markAluProfile" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isLight ? '#64748B' : '#FFFFFF'} />
            <stop offset="25%" stopColor={isLight ? '#94A3B8' : '#CBD5E1'} />
            <stop offset="60%" stopColor={isLight ? '#475569' : '#94A3B8'} />
            <stop offset="100%" stopColor={isLight ? '#334155' : '#64748B'} />
          </linearGradient>

          <linearGradient id="markGoldAccent" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF3D4" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#C5A880" />
            <stop offset="100%" stopColor="#9A7B38" />
          </linearGradient>

          <filter id="markCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Tile with Glass Bezel */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill="url(#markBgGrad)"
          stroke="url(#markGoldAccent)"
          strokeWidth="1.5"
          className="shadow-lg"
        />

        {/* Left Vertical Jamb Profile */}
        <path
          d="M 16 12 L 24 18 L 24 46 L 16 52 Z"
          fill="url(#markAluProfile)"
          stroke={isLight ? '#CBD5E1' : '#02050A'}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Top Horizontal Header */}
        <path
          d="M 16 12 L 38 12 L 44 18 L 24 18 Z"
          fill="url(#markAluProfile)"
          stroke={isLight ? '#CBD5E1' : '#02050A'}
          strokeWidth="0.8"
        />

        {/* Upper Loop Diagonal & Vertical Return */}
        <path
          d="M 38 12 L 46 20 L 46 26 L 38 31 L 24 31 L 24 25 L 38 25 L 40 22 L 36 18 L 24 18"
          fill="url(#markAluProfile)"
          stroke={isLight ? '#CBD5E1' : '#02050A'}
          strokeWidth="0.8"
        />

        {/* Center Transom (Meneau / Traverse Médiane) */}
        <path
          d="M 16 32 L 24 28 L 38 28 L 41 32 L 38 36 L 24 36 Z"
          fill="url(#markGoldAccent)"
          stroke={isLight ? '#CBD5E1' : '#02050A'}
          strokeWidth="0.8"
        />

        {/* Lower Loop Diagonal & Vertical Return */}
        <path
          d="M 38 33 L 48 39 L 48 45 L 40 52 L 16 52 L 24 46 L 38 46 L 42 42 L 38 38 L 24 38 L 24 33 Z"
          fill="url(#markAluProfile)"
          stroke={isLight ? '#CBD5E1' : '#02050A'}
          strokeWidth="0.8"
        />

        {/* Golden Assembly Corner Brackets */}
        <rect x="15" y="11" width="5" height="5" rx="1" fill="url(#markGoldAccent)" />
        <circle cx="17.5" cy="13.5" r="0.8" fill={isLight ? '#FFFFFF' : '#1E293B'} />

        <rect x="15" y="48" width="5" height="5" rx="1" fill="url(#markGoldAccent)" />
        <circle cx="17.5" cy="50.5" r="0.8" fill={isLight ? '#FFFFFF' : '#1E293B'} />

        <rect x="42" y="17" width="4.5" height="4.5" rx="1" fill="url(#markGoldAccent)" />
        <circle cx="44.2" cy="19.2" r="0.7" fill={isLight ? '#FFFFFF' : '#1E293B'} />

        <rect x="44" y="42" width="4.5" height="4.5" rx="1" fill="url(#markGoldAccent)" />
        <circle cx="46.2" cy="44.2" r="0.7" fill={isLight ? '#FFFFFF' : '#1E293B'} />

        {/* Thermal Break Laser Guide (Cyan Line) */}
        <line
          x1="20"
          y1="16"
          x2="20"
          y2="48"
          stroke="#38BDF8"
          strokeWidth="1.2"
          filter="url(#markCyanGlow)"
          strokeLinecap="round"
        />
      </svg>

      {/* Optional Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-serif font-bold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Baiti Atelier
            </span>
            <span
              dir="rtl"
              lang="ar"
              className="text-base font-bold text-[#D4AF37] font-arabic tracking-wide"
            >
              بيتي
            </span>
          </div>
          <span
            className={`text-[10px] font-mono -mt-1 ${
              isLight ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            Menuiserie & Débitage · 58 Wilayas
          </span>
        </div>
      )}
    </div>
  );
};
