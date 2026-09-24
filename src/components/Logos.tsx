import React from 'react';

/**
 * UNIKMA (Universitas Komputama) Crest Logo SVG
 * Matched directly to the official logo:
 * - Green Globe with Meridian & Parallel Lines: #1b5e20 / #2e7d32
 * - Orange Orbit Swoosh with 5-point Star: #e67e22 / #f39c12
 * - Navy Blue Serif Typography: #1e2b82
 */
export const UnikmaLogo: React.FC<{
  className?: string;
  size?: number;
  showText?: boolean;
  customLogoUrl?: string;
}> = ({
  className = '',
  size = 48,
  showText = false,
  customLogoUrl,
}) => {
  if (customLogoUrl && customLogoUrl.trim()) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src={customLogoUrl}
          alt="UNIKMA Logo"
          style={{ width: size, height: size }}
          className="object-contain rounded-xl drop-shadow-sm transition-transform hover:scale-105"
        />
        {showText && (
          <div className="flex flex-col leading-tight">
            <span className="font-serif-brand text-[15px] font-extrabold tracking-wider text-[#1e2b82]">
              UNIKMA
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#1e2b82]/85">
              UNIVERSITAS KOMPUTAMA
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="unikmaGreenGlobe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e7d32" />
            <stop offset="100%" stopColor="#1b5e20" />
          </linearGradient>
          <linearGradient id="unikmaOrangeOrbit" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d35400" />
            <stop offset="40%" stopColor="#e67e22" />
            <stop offset="100%" stopColor="#f39c12" />
          </linearGradient>
        </defs>

        {/* --- Globe Structure --- */}
        {/* Main Globe Outline */}
        <circle
          cx="82"
          cy="78"
          r="48"
          stroke="url(#unikmaGreenGlobe)"
          strokeWidth="4.5"
          fill="none"
        />

        {/* Globe Longitude / Meridian Arcs */}
        {/* Vertical Center Meridian */}
        <ellipse
          cx="82"
          cy="78"
          rx="22"
          ry="48"
          stroke="#2e7d32"
          strokeWidth="3.5"
          fill="none"
        />
        {/* Inner Curved Longitudinal Arcs */}
        <path
          d="M82,30 Q60,54 58,78 Q56,102 82,126"
          stroke="#2e7d32"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M82,30 Q104,54 106,78 Q108,102 82,126"
          stroke="#2e7d32"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Globe Latitude Arc */}
        <path
          d="M38,88 Q82,106 126,88"
          stroke="#1b5e20"
          strokeWidth="3.5"
          fill="none"
        />
        <path
          d="M44,66 Q82,82 120,66"
          stroke="#2e7d32"
          strokeWidth="2.5"
          opacity="0.8"
          fill="none"
        />

        {/* --- Sweeping Orange Orbit Swoosh --- */}
        {/* Big dynamic crescent swooshing around the globe towards top-right */}
        <path
          d="M20,90 C18,108 38,124 64,124 C100,124 130,96 142,66 C144,62 136,72 122,86 C98,110 52,114 32,96 C24,88 22,82 20,90 Z"
          fill="url(#unikmaOrangeOrbit)"
        />
        <path
          d="M18,92 C16,84 28,70 54,60 C86,48 126,30 148,16 C142,26 122,50 94,66 C64,84 32,94 18,92 Z"
          fill="url(#unikmaOrangeOrbit)"
        />

        {/* Orbit Star at Top Right pointing to future / excellence */}
        {/* Star coordinates centered around (148, 16) */}
        <polygon
          points="148,6 151.5,14 159,14 153,19 155.5,27 148,22 140.5,27 143,19 137,14 144.5,14"
          fill="#e67e22"
          stroke="#d35400"
          strokeWidth="0.8"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-serif-brand text-[15px] font-extrabold tracking-wider text-[#1e2b82]">
            UNIKMA
          </span>
          <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#1e2b82]/85">
            UNIVERSITAS KOMPUTAMA
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * KLOVIBE GIFT Logo SVG
 * Matched directly to the official uploaded identity:
 * - Floral emblem: terracotta rose bud, folded petals, sage green leaf
 * - Infinity ribbon stem forming an embracing heart contour
 * - Warm kraft paper cream tone: #f5ede0
 * - Terracotta: #c07a50 / #bd734b
 * - Sage Green: #4a5d4e
 * - Typography: "KLOVIBE", "· G I F T ·", "Crafted Moments, Enduring Love"
 */
export const KlovibeLogo: React.FC<{
  className?: string;
  size?: number;
  showSlogan?: boolean;
  customLogoUrl?: string;
  sloganText?: string;
  brandName?: string;
}> = ({
  className = '',
  size = 48,
  showSlogan = true,
  customLogoUrl,
  sloganText = 'Crafted Moments, Enduring Love',
  brandName = 'KLOVIBE GIFT',
}) => {
  if (customLogoUrl && customLogoUrl.trim()) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src={customLogoUrl}
          alt="KLOVIBE Logo"
          style={{ width: size, height: size }}
          className="object-contain rounded-xl drop-shadow-sm transition-transform hover:scale-105"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-serif-brand text-[16px] font-bold tracking-tight text-[#223a31]">
            {brandName}
          </span>
          {showSlogan && (
            <span className="text-[10.5px] italic text-[#4a5d4e] font-medium tracking-wide">
              "{sloganText}"
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="klovibeTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d5865e" />
            <stop offset="100%" stopColor="#ba6d46" />
          </linearGradient>
          <linearGradient id="klovibeBlush" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e4b092" />
            <stop offset="100%" stopColor="#cb8f6f" />
          </linearGradient>
          <linearGradient id="klovibeSage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#586e5c" />
            <stop offset="100%" stopColor="#3d5141" />
          </linearGradient>
        </defs>

        {/* Soft rounded subtle kraft medallion background */}
        <circle cx="70" cy="70" r="66" fill="#f8f4ee" stroke="#ebd9c8" strokeWidth="1.5" />

        {/* --- LEFT FLORAL BUD (Terracotta) --- */}
        <path
          d="M56,36 C54,30 52,28 50,30 C49,32 50,34 49,36 C42,42 42,56 46,68 C44,66 38,62 34,66 C30,70 34,78 40,82 C46,86 54,88 60,86 C58,74 54,60 56,48 C56,42 58,38 56,36 Z"
          fill="url(#klovibeTerracotta)"
        />

        {/* --- RIGHT ROSE BLOOM (Layered Terracotta & Champagne Blush) --- */}
        {/* Back Rose Cup */}
        <path
          d="M74,38 C80,30 92,34 96,44 C100,54 94,66 84,74 C78,70 76,64 74,58 C72,50 72,42 74,38 Z"
          fill="url(#klovibeTerracotta)"
        />
        {/* Folded Rose Petal / Layer */}
        <path
          d="M84,38 L92,44 L96,52 L88,60 L80,56 L82,46 Z"
          fill="url(#klovibeBlush)"
          opacity="0.9"
        />

        {/* --- RIGHT SAGE GREEN LEAF --- */}
        <path
          d="M82,78 C94,76 104,82 108,86 C102,96 88,100 80,94 C78,90 80,84 82,78 Z"
          fill="url(#klovibeSage)"
        />

        {/* --- CENTER EMBRACING HEART / INFINITY RIBBON STEM --- */}
        {/* The elegant ribbon loops from bottom stem into heart contour */}
        <path
          d="M70,98 C66,94 62,88 62,80 C62,72 68,66 74,68 C80,70 82,78 78,84 C74,90 70,94 70,98 Z"
          stroke="url(#klovibeSage)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M70,98 C72,102 74,106 72,110 C70,114 66,114 66,110 C66,104 70,98 70,98 Z"
          stroke="url(#klovibeTerracotta)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-serif-brand text-[17px] font-extrabold tracking-wide text-[#223a31]">
            KLOVIBE
          </span>
          <span className="text-[11px] font-semibold tracking-widest text-[#c07a50] uppercase">
            · GIFT ·
          </span>
        </div>
        {showSlogan && (
          <span className="text-[10px] italic text-[#4a5d4e] font-medium tracking-wide">
            "{sloganText}"
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Unified Header showing UNIKMA and KLOVIBE GIFT logos harmoniously side by side
 */
export const HarmoniousBrandBar: React.FC<{
  onOpenAdmin?: () => void;
  onOpenKiosk?: () => void;
  currentScreen?: 'opener' | 'catalog';
  onNavigateScreen?: (screen: 'opener' | 'catalog') => void;
  visitorCount: number;
  customUnikmaLogoUrl?: string;
  customKlovibeLogoUrl?: string;
}> = ({
  onOpenAdmin,
  onOpenKiosk,
  currentScreen = 'opener',
  onNavigateScreen,
  visitorCount,
  customUnikmaLogoUrl,
  customKlovibeLogoUrl,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf8]/95 backdrop-blur-md border-b border-[#ebd9c8] shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Dual Brand presentation */}
        <div className="flex items-center gap-3 sm:gap-5 divide-x divide-[#ebd9c8]">
          <div className="flex items-center gap-2">
            <UnikmaLogo size={42} showText={true} customLogoUrl={customUnikmaLogoUrl} />
          </div>

          <div className="pl-3 sm:pl-5 flex items-center gap-2">
            <KlovibeLogo size={42} showSlogan={true} customLogoUrl={customKlovibeLogoUrl} />
          </div>
        </div>

        {/* Right: Quick actions & Stand indicator */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Visitor Counter Tag */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4efe6] border border-[#d98c62]/30 text-[#4a5d4e] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#1b5e20] animate-pulse"></span>
            <span className="hidden md:inline">Pengunjung Stand:</span>
            <span className="font-bold text-[#c07a50]">{visitorCount} Tamu</span>
          </div>

          {/* Screen Switcher (Opener <-> Catalog) */}
          {onNavigateScreen && (
            <>
              {currentScreen === 'opener' ? (
                <button
                  onClick={() => onNavigateScreen('catalog')}
                  title="Lihat Katalog Buket Stand KLOVIBE"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c07a50] to-[#a96640] hover:opacity-95 text-white transition-all shadow-xs flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <span>🌸</span>
                  <span>Buka Katalog Stand</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateScreen('opener')}
                  title="Kembali ke Halaman Pembuka / Registrasi Stand"
                  className="px-3.5 py-1.5 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white transition-all shadow-xs flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Pintu Masuk / Buku Tamu</span>
                </button>
              )}
            </>
          )}

          {/* Kiosk Mode Button */}
          {onOpenKiosk && (
            <button
              onClick={onOpenKiosk}
              title="Tampilan Layar Stand / Kiosk TV"
              className="px-3 py-1.5 rounded-xl border border-[#c07a50]/40 text-[#c07a50] hover:bg-[#c07a50] hover:text-white transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
                <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" />
                <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" />
              </svg>
              <span className="hidden sm:inline">Layar Kios</span>
            </button>
          )}

          {/* Admin Portal Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-xl bg-[#1e2b82] hover:bg-[#152065] text-white transition-colors flex items-center gap-1.5 font-bold cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Admin Stand</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
