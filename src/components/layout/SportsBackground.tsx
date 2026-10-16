import React from 'react';

/**
 * SportsBackground: Renders a clean, luminous White & Ocean Blue athletic football atmosphere
 * featuring subtle tactical pitch blueprints, clean geometric energy slashes,
 * and high-contrast sports architecture without dark overlays or blurred glass.
 */
export const SportsBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 1. Crisp White & Soft Sky Blue Canvas Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F0F7FF] to-[#E6F0FA]" />

      {/* 2. Soft Ocean Blue Atmospheric Auras */}
      <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-sky-200/40 via-blue-200/25 to-transparent blur-[100px]" />
      <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-blue-200/40 via-cyan-200/25 to-transparent blur-[100px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full bg-gradient-to-b from-sky-100/60 via-blue-50/40 to-transparent blur-[120px]" />

      {/* 3. Subtle Athletic Turf Stripes in Ocean Blue Tone */}
      <div className="sports-turf-stripes absolute inset-0 opacity-40" />

      {/* 4. Hexagonal Football Net & Sports Mesh */}
      <div className="sports-hex-pattern absolute inset-0 opacity-30" />

      {/* 5. Clean Tactical Football Pitch Blueprint (Vector sa bàn chiến thuật bóng đá màu xanh biển) */}
      <svg
        className="absolute top-8 left-1/2 -translate-x-1/2 w-[1250px] max-w-[150vw] h-[860px] opacity-[0.20] stroke-sky-500 pointer-events-none transition-all"
        viewBox="0 0 1000 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Pitch Boundary Line */}
        <rect x="40" y="30" width="920" height="640" rx="8" strokeWidth="2.5" />
        
        {/* Halfway Line */}
        <line x1="500" y1="30" x2="500" y2="670" strokeWidth="2.5" />
        
        {/* Center Circle & Center Spot */}
        <circle cx="500" cy="350" r="115" strokeWidth="2.5" />
        <circle cx="500" cy="350" r="5" fill="#0284C7" />
        <circle cx="500" cy="350" r="22" strokeWidth="1" strokeDasharray="4 4" />

        {/* Left Penalty Area */}
        <rect x="40" y="180" width="180" height="340" strokeWidth="2" />
        <rect x="40" y="260" width="65" height="180" strokeWidth="1.5" />
        <path d="M 220 285 A 95 95 0 0 1 220 415" strokeWidth="1.5" />
        <circle cx="165" cy="350" r="4" fill="#0284C7" />
        {/* Left Goal Cage */}
        <rect x="22" y="295" width="18" height="110" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Right Penalty Area */}
        <rect x="780" y="180" width="180" height="340" strokeWidth="2" />
        <rect x="895" y="260" width="65" height="180" strokeWidth="1.5" />
        <path d="M 780 285 A 95 95 0 0 0 780 415" strokeWidth="1.5" />
        <circle cx="835" cy="350" r="4" fill="#0284C7" />
        {/* Right Goal Cage */}
        <rect x="960" y="295" width="18" height="110" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* 4 Corner Kick Arcs */}
        <path d="M 40 65 A 35 35 0 0 1 75 30" strokeWidth="2" />
        <path d="M 925 30 A 35 35 0 0 1 960 65" strokeWidth="2" />
        <path d="M 40 635 A 35 35 0 0 0 75 670" strokeWidth="2" />
        <path d="M 925 670 A 35 35 0 0 0 960 635" strokeWidth="2" />

        {/* Tactical Attack Trajectories */}
        <g strokeWidth="1.5" strokeDasharray="5 5" className="stroke-blue-500/70">
          <path d="M 280 120 C 390 90, 560 110, 720 180" />
          <polygon points="726,182 715,185 718,173" fill="#2563EB" />

          <path d="M 280 580 C 390 610, 560 590, 720 520" />
          <polygon points="726,518 718,527 715,515" fill="#2563EB" />

          <path d="M 420 350 L 620 350" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="628,350 616,345 616,355" fill="#2563EB" />
        </g>
      </svg>

      {/* 6. Clean Dynamic Ocean Blue Energy Angles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 pointer-events-none overflow-hidden">
        <div className="w-[180%] h-3 bg-gradient-to-r from-transparent via-sky-400 to-transparent transform -rotate-45 translate-y-16" />
        <div className="w-[180%] h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transform -rotate-45 translate-y-28" />
        <div className="w-[180%] h-6 bg-gradient-to-r from-transparent via-sky-300/40 to-transparent transform -rotate-45 translate-y-44" />
      </div>

      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none overflow-hidden">
        <div className="w-[180%] h-2.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform -rotate-45 translate-y-36" />
        <div className="w-[180%] h-6 bg-gradient-to-r from-transparent via-sky-300/35 to-transparent transform -rotate-45 translate-y-56" />
      </div>

      {/* 7. Bottom Ground Glow */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[1100px] h-[300px] rounded-full bg-gradient-to-t from-sky-200/40 via-blue-100/20 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};
