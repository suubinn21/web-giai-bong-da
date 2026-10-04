import React from 'react';

/**
 * SportsBackground: Renders a professional, athletic football stadium atmosphere
 * featuring dynamic green floodlights, tactical pitch blueprint, hexagonal football mesh,
 * and high-energy sports geometry.
 */
export const SportsBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 1. Realistic Football Stadium High-Definition Background Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-[1.02]"
        style={{
          backgroundImage: `url('/images/stadium-bg.jpg')`,
        }}
      />

      {/* 2. Deep Athletic Sports Navy Atmosphere Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060F1D]/85 via-[#07172B]/65 to-[#040A14]/90" />

      {/* 3. Lush Green Pitch Lighting Boost (Màu xanh mặt cỏ thể thao rực rỡ) */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-500/25 via-emerald-600/10 to-transparent opacity-90" />

      {/* 4. Realistic Stadium Turf Stripes (Vệt sọc cỏ sân vận động xen kẽ) */}
      <div className="sports-turf-stripes absolute inset-0 opacity-50" />

      {/* 5. Hexagonal Football Net & Carbon Texture (Lưới bóng đá lục giác & sợi thể thao) */}
      <div className="sports-hex-pattern absolute inset-0 opacity-35" />

      {/* 6. Stadium Floodlights (Đèn pha sân vận động góc trái, phải và trung tâm) */}
      {/* Top-Left Stadium Floodlight Tower - Emerald Glow */}
      <div className="absolute -top-32 -left-32 w-[750px] h-[750px] rounded-full bg-gradient-to-br from-emerald-400/40 via-teal-400/25 to-transparent blur-[110px] animate-stadium-pulse" />
      
      {/* Top-Right Stadium Floodlight Tower */}
      <div className="absolute -top-32 -right-32 w-[750px] h-[750px] rounded-full bg-gradient-to-bl from-emerald-400/35 via-cyan-400/20 to-transparent blur-[110px] animate-stadium-pulse" />

      {/* Pitch Center Overhead Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[650px] rounded-full bg-gradient-to-b from-emerald-300/30 via-teal-400/15 to-transparent blur-[125px]" />

      {/* Stadium Light Cones / Angular Beams */}
      <div className="absolute top-0 left-[10%] w-96 h-[700px] bg-gradient-to-b from-emerald-300/25 via-emerald-400/10 to-transparent transform -rotate-12 blur-2xl opacity-90" />
      <div className="absolute top-0 right-[10%] w-96 h-[700px] bg-gradient-to-b from-teal-300/25 via-emerald-400/10 to-transparent transform rotate-12 blur-2xl opacity-90" />

      {/* 5. Giant Tactical Football Pitch Blueprint (Vector sa bàn & đường kẻ sân bóng đá thể thao) */}
      <svg
        className="absolute top-8 left-1/2 -translate-x-1/2 w-[1250px] max-w-[150vw] h-[860px] opacity-[0.10] stroke-emerald-400 pointer-events-none transition-all"
        viewBox="0 0 1000 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Pitch Boundary Line with corner notches */}
        <rect x="40" y="30" width="920" height="640" rx="8" strokeWidth="2.5" />
        
        {/* Halfway Line */}
        <line x1="500" y1="30" x2="500" y2="670" strokeWidth="2.5" />
        
        {/* Center Circle & Center Spot */}
        <circle cx="500" cy="350" r="115" strokeWidth="2.5" />
        <circle cx="500" cy="350" r="5" fill="#10B981" />
        <circle cx="500" cy="350" r="22" strokeWidth="1" strokeDasharray="4 4" />

        {/* Left Penalty Area (Vòng cấm địa cánh trái) */}
        <rect x="40" y="180" width="180" height="340" strokeWidth="2" />
        <rect x="40" y="260" width="65" height="180" strokeWidth="1.5" />
        <path d="M 220 285 A 95 95 0 0 1 220 415" strokeWidth="1.5" />
        <circle cx="165" cy="350" r="4" fill="#10B981" />
        {/* Left Goal Cage (Khung thành trái) */}
        <rect x="22" y="295" width="18" height="110" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Right Penalty Area (Vòng cấm địa cánh phải) */}
        <rect x="780" y="180" width="180" height="340" strokeWidth="2" />
        <rect x="895" y="260" width="65" height="180" strokeWidth="1.5" />
        <path d="M 780 285 A 95 95 0 0 0 780 415" strokeWidth="1.5" />
        <circle cx="835" cy="350" r="4" fill="#10B981" />
        {/* Right Goal Cage (Khung thành phải) */}
        <rect x="960" y="295" width="18" height="110" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* 4 Corner Kick Arcs (Vòng cung phạt góc) */}
        <path d="M 40 65 A 35 35 0 0 1 75 30" strokeWidth="2" />
        <path d="M 925 30 A 35 35 0 0 1 960 65" strokeWidth="2" />
        <path d="M 40 635 A 35 35 0 0 0 75 670" strokeWidth="2" />
        <path d="M 925 670 A 35 35 0 0 0 960 635" strokeWidth="2" />

        {/* Tactical Attack Trajectories (Đường hướng tấn công chiến thuật thể thao) */}
        <g strokeWidth="1.5" strokeDasharray="5 5" className="stroke-cyan-400/80">
          {/* Wing attack runs */}
          <path d="M 280 120 C 390 90, 560 110, 720 180" />
          <polygon points="726,182 715,185 718,173" fill="#06B6D4" />

          <path d="M 280 580 C 390 610, 560 590, 720 520" />
          <polygon points="726,518 718,527 715,515" fill="#06B6D4" />

          {/* Central through ball */}
          <path d="M 420 350 L 620 350" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="628,350 616,345 616,355" fill="#06B6D4" />
        </g>
      </svg>

      {/* 6. Dynamic Sports Energy Angle Slashes (Dải băng đồ họa thể thao góc nghiêng) */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] opacity-25 pointer-events-none overflow-hidden">
        <div className="w-[180%] h-4 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transform -rotate-45 translate-y-16" />
        <div className="w-[180%] h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -rotate-45 translate-y-28" />
        <div className="w-[180%] h-8 bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent transform -rotate-45 translate-y-44" />
        <div className="w-[180%] h-2 bg-gradient-to-r from-transparent via-teal-300 to-transparent transform -rotate-45 translate-y-64" />
      </div>

      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] opacity-25 pointer-events-none overflow-hidden">
        <div className="w-[180%] h-3 bg-gradient-to-r from-transparent via-teal-400 to-transparent transform -rotate-45 translate-y-36" />
        <div className="w-[180%] h-8 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent transform -rotate-45 translate-y-56" />
        <div className="w-[180%] h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -rotate-45 translate-y-80" />
      </div>

      {/* 7. Bottom Stadium Glow (Ánh sáng hắt từ mặt sân lên) */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[1100px] h-[350px] rounded-full bg-gradient-to-t from-emerald-500/30 via-teal-500/15 to-transparent blur-3xl pointer-events-none" />

      {/* 8. Vignette Falloff */}
      <div className="absolute inset-0 bg-radial-vignette opacity-50 pointer-events-none" />
    </div>
  );
};
