import React, { useState, useRef } from 'react';
import { Sparkles, ArrowDown } from 'lucide-react';

export function InteractivePullLamp({ isOn, onToggle, onHaptic }) {
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isSpringing, setIsSpringing] = useState(false);
  const startYRef = useRef(0);

  // Pointer drag for pull cord
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    startYRef.current = e.clientY;
    setIsPulling(true);
    setIsSpringing(false);
    onHaptic?.impact('light');
  };

  const handlePointerMove = (e) => {
    if (!isPulling) return;
    const delta = e.clientY - startYRef.current;
    // Rubber band clamping (max 45px)
    const clamped = Math.min(Math.max(0, delta), 45);
    setPullY(clamped);

    // Haptic tick if passing activation threshold
    if (clamped >= 25 && pullY < 25) {
      onHaptic?.impact('medium');
    }
  };

  const handlePointerUp = (e) => {
    if (!isPulling) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    setIsPulling(false);

    // If pulled more than 18px, trigger switch!
    if (pullY >= 18) {
      onHaptic?.impact('heavy');
      onToggle();
    }

    // Spring back up
    setIsSpringing(true);
    setPullY(0);
    setTimeout(() => setIsSpringing(false), 500);
  };

  // Simple click / tap fallback
  const handleClick = (e) => {
    e.stopPropagation();
    if (isPulling) return;
    onHaptic?.impact('heavy');
    setPullY(28);
    setIsSpringing(true);
    setTimeout(() => {
      setPullY(0);
      onToggle();
      setTimeout(() => setIsSpringing(false), 450);
    }, 120);
  };

  const cordLength = 110 + pullY;

  return (
    <div className="relative flex flex-col items-center justify-start select-none z-30 pointer-events-none">
      
      {/* 1. Volumetric Light Cone when Lamp is ON */}
      {isOn && (
        <div 
          className="absolute top-[82px] left-1/2 -translate-x-1/2 w-[340px] sm:w-[520px] h-[580px] pointer-events-none transition-opacity duration-700 ease-out"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 242, 254, 0.42) 0%, rgba(79, 172, 254, 0.18) 45%, transparent 75%)',
            clipPath: 'polygon(46% 0%, 54% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(8px)',
            opacity: 1
          }}
        />
      )}

      {/* 2. Hanging Cable & Lamp Fixture */}
      <div className="relative flex flex-col items-center">
        {/* Ceiling Cable */}
        <div className="w-[2.5px] h-12 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-800 shadow-md" />

        {/* Lamp Base / Socket (Metallic) */}
        <div className="w-9 h-5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 rounded-t-lg border-t border-white/20 shadow-md flex items-center justify-center">
          <div className="w-7 h-1 bg-slate-800/60 rounded-full" />
        </div>

        {/* Light Bulb Enclosure */}
        <div className="relative flex items-center justify-center -mt-0.5">
          <svg
            width="64"
            height="76"
            viewBox="0 0 64 76"
            className="overflow-visible transition-all duration-300"
          >
            <defs>
              {/* Radial glow for bulb */}
              <radialGradient id="bulbGlow" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="25%" stopColor="#00f2fe" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </radialGradient>
              <filter id="neonFlare" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Bloom Aura when ON */}
            {isOn && (
              <>
                <circle
                  cx="32"
                  cy="36"
                  r="34"
                  fill="url(#bulbGlow)"
                  filter="url(#neonFlare)"
                  opacity="0.85"
                />
                <circle
                  cx="32"
                  cy="36"
                  r="18"
                  fill="#ffffff"
                  filter="blur(4px)"
                  opacity="0.9"
                />
              </>
            )}

            {/* Glass Bulb Outline & Body */}
            <path
              d="M 32,6 C 21,6 13,17 13,32 C 13,44 20,53 24,62 L 24,68 L 40,68 L 40,62 C 44,53 51,44 51,32 C 51,17 43,6 32,6 Z"
              fill={isOn ? 'url(#bulbGlow)' : 'rgba(255, 255, 255, 0.05)'}
              stroke={isOn ? '#a5f3fc' : 'rgba(255, 255, 255, 0.2)'}
              strokeWidth="1.5"
              className="transition-colors duration-300"
            />

            {/* Inner Filament */}
            <path
              d="M 27,48 L 29,28 L 32,24 L 35,28 L 37,48"
              fill="none"
              stroke={isOn ? '#ffffff' : '#64748b'}
              strokeWidth={isOn ? '2' : '1.2'}
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Specular glass reflection shine */}
            <path
              d="M 18,20 C 18,14 24,10 30,9"
              fill="none"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 3. The Interactive Beaded Pull-Chain Rope (Веревочка с кольцом) */}
        <div 
          className="absolute left-[44px] top-[14px] pointer-events-auto cursor-pointer"
          style={{
            transform: `translateY(${pullY}px)`,
            transition: isSpringing ? 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.35)' : 'none'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleClick}
        >
          {/* Beaded Chain SVG */}
          <svg width="24" height={cordLength} className="overflow-visible">
            {/* Chain line */}
            <line
              x1="12"
              y1="0"
              x2="12"
              y2={cordLength - 16}
              stroke={isOn ? '#38bdf8' : '#94a3b8'}
              strokeWidth="2"
              strokeDasharray="2 3"
              strokeLinecap="round"
            />

            {/* Bottom Ring / Bell Pull Handle */}
            <g transform={`translate(12, ${cordLength - 10})`}>
              {/* Outer glow ring */}
              <circle
                cx="0"
                cy="0"
                r="7.5"
                fill={isOn ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
                stroke={isOn ? '#00f2fe' : '#cbd5e1'}
                strokeWidth="2.5"
                className="transition-colors duration-200"
              />
              <circle
                cx="0"
                cy="0"
                r="3"
                fill={isOn ? '#ffffff' : '#64748b'}
              />
            </g>
          </svg>

          {/* Invisible enlarged hit target for easy tapping on touchscreens */}
          <div className="absolute -left-4 -bottom-3 w-16 h-16 pointer-events-auto" />
        </div>
      </div>

      {/* 4. Interactive Helper Hint when OFF */}
      {!isOn && (
        <div className="mt-7 flex flex-col items-center gap-1.5 animate-bounce pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full apple-liquid-glass border border-cyan-500/30 flex items-center gap-2 shadow-lg shadow-cyan-950/40">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 tracking-tight">
              Потяните за веревочку, чтобы включить свет
            </span>
          </div>
          <ArrowDown className="w-4 h-4 text-cyan-400/80 animate-pulse" />
        </div>
      )}

      {/* 5. Minimal switch text when ON */}
      {isOn && (
        <div className="mt-1 pointer-events-auto">
          <button
            onClick={handleClick}
            className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors underline decoration-dotted"
          >
            (потяните веревочку, чтобы выключить)
          </button>
        </div>
      )}

    </div>
  );
}
