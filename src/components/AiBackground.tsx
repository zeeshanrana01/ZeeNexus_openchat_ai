"use client";

import React from "react";

export const AiBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* 1. Deep Space Base Background */}
      <div className="absolute inset-0 bg-[#0a0f1d]" />

      {/* 2. Cybernetic Neural Dot Grid with Center Glow Mask */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.4) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 65% at 50% 45%, black 20%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 65% at 50% 45%, black 20%, transparent 85%)",
        }}
      />

      {/* 3. Primary Glowing Emerald Orb (Gemini / AI Intelligence Pulse) */}
      <div
        className="absolute -top-[10%] left-[20%] w-[520px] h-[520px] rounded-full bg-emerald-500/15 blur-[120px] will-change-transform animate-orb-slow"
      />

      {/* 4. Secondary Cyan / Electric Blue Neural Aurora */}
      <div
        className="absolute top-[25%] -right-[10%] w-[580px] h-[580px] rounded-full bg-cyan-500/15 blur-[130px] will-change-transform animate-orb-reverse"
      />

      {/* 5. Tertiary Deep Indigo / Violet Frontier Intelligence Glow */}
      <div
        className="absolute -bottom-[15%] left-[30%] w-[650px] h-[650px] rounded-full bg-indigo-600/15 blur-[140px] will-change-transform animate-orb-pulse"
      />

      {/* 6. Subtle Floating Micro Stardust Particles (CSS Ambient Twinkling) */}
      <div className="absolute inset-0">
        <div className="absolute top-[18%] left-[25%] w-1.5 h-1.5 rounded-full bg-emerald-300/40 blur-[0.5px] animate-pulse" style={{ animationDuration: "3s" }} />
        <div className="absolute top-[35%] right-[22%] w-1.5 h-1.5 rounded-full bg-cyan-300/40 blur-[0.5px] animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }} />
        <div className="absolute top-[65%] left-[18%] w-1 h-1 rounded-full bg-emerald-400/35 blur-[0.5px] animate-pulse" style={{ animationDuration: "5s", animationDelay: "2s" }} />
        <div className="absolute top-[75%] right-[32%] w-1.5 h-1.5 rounded-full bg-indigo-300/35 blur-[0.5px] animate-pulse" style={{ animationDuration: "4.5s", animationDelay: "1.5s" }} />
        <div className="absolute top-[12%] right-[40%] w-1 h-1 rounded-full bg-cyan-400/30 blur-[0.5px] animate-pulse" style={{ animationDuration: "6s" }} />
      </div>

      {/* 7. Subtle Vignette Border Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent opacity-80" />
    </div>
  );
};
