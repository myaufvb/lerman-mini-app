import React, { useState, useRef } from 'react';

export function InteractivePullLamp({ isOn, onToggle, onHaptic }) {
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isAnimatingPull, setIsAnimatingPull] = useState(false);
  const startYRef = useRef(0);

  // Trigger toggle with cord pull animation
  const triggerToggle = () => {
    onHaptic?.impact('heavy');
    setIsAnimatingPull(true);
    setPullY(14);
    
    setTimeout(() => {
      onToggle();
      setPullY(0);
      setTimeout(() => setIsAnimatingPull(false), 200);
    }, 120);
  };

  // Pointer drag handling for physical cord pull
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    startYRef.current = e.clientY;
    setIsPulling(true);
    setIsAnimatingPull(false);
    onHaptic?.impact('light');
  };

  const handlePointerMove = (e) => {
    if (!isPulling) return;
    const delta = e.clientY - startYRef.current;
    // Rubber band limit (0 to 30px)
    const clamped = Math.min(Math.max(0, delta), 30);
    setPullY(clamped);

    if (clamped >= 14 && pullY < 14) {
      onHaptic?.impact('medium');
    }
  };

  const handlePointerUp = (e) => {
    if (!isPulling) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    setIsPulling(false);

    if (pullY >= 10) {
      onHaptic?.impact('heavy');
      onToggle();
    }

    // Spring back
    setIsAnimatingPull(true);
    setPullY(0);
    setTimeout(() => setIsAnimatingPull(false), 250);
  };

  return (
    <div className="relative select-none flex flex-col items-center justify-center pointer-events-auto">
      {/* 
        =======================================================
        LAMP WRAPPER (Exact CSS Recreation from User's Template)
        =======================================================
      */}
      <div className="relative flex flex-col items-center z-20">
        
        {/* Абажур (Lamp Head - Dome) */}
        <div
          id="lampToggle"
          onClick={triggerToggle}
          title="Нажмите на абажур или потяните за шнурок"
          className="relative cursor-pointer transition-all duration-300"
          style={{
            width: '130px',
            height: '65px',
            borderTopLeftRadius: '130px',
            borderTopRightRadius: '130px',
            background: isOn ? '#fffdf5' : '#e6e6e6',
            boxShadow: isOn
              ? '0 0 45px 14px rgba(255, 238, 179, 0.9), 0 0 90px 30px rgba(255, 210, 100, 0.35)'
              : '0 4px 15px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Subtle interior rim highlight */}
          <div 
            className="absolute bottom-0 inset-x-0 h-[2px] transition-colors duration-300"
            style={{
              background: isOn ? 'rgba(255, 245, 210, 0.9)' : 'rgba(0, 0, 0, 0.15)'
            }}
          />
        </div>

        {/* Шнурок выключателя (Cord hanging from right of lamp head) */}
        <div
          id="cordToggle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={(e) => {
            e.stopPropagation();
            if (!isPulling) triggerToggle();
          }}
          title="Потяните за шнурок, чтобы включить/выключить лампу"
          className="absolute cursor-pointer z-30 touch-none"
          style={{
            top: '65px',
            right: '24px',
            width: '2px',
            height: '55px',
            background: '#bbb',
            transform: `translateY(${pullY}px)`,
            transition: isPulling ? 'none' : 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Expanded clickable hitbox around the pull bead for easy touch */}
          <div className="absolute -inset-x-3.5 -bottom-4 top-2 cursor-pointer" />

          {/* Golden bead ball at the end */}
          <div
            className="absolute shadow-sm"
            style={{
              bottom: '-6px',
              left: '-3px',
              width: '8px',
              height: '8px',
              background: '#c29d59',
              borderRadius: '50%',
              boxShadow: isOn
                ? '0 0 8px 1px rgba(212, 168, 83, 0.8)'
                : '0 1px 3px rgba(0,0,0,0.5)'
            }}
          />
        </div>

        {/* Ножка (Lamp Stem) */}
        <div
          className="lamp-stem"
          style={{
            width: '10px',
            height: '130px',
            background: 'linear-gradient(to right, #d8d8d8, #f5f5f5, #d2d2d2)'
          }}
        />

        {/* Подставка (Lamp Base) */}
        <div
          className="lamp-base"
          style={{
            width: '90px',
            height: '12px',
            background: 'linear-gradient(to bottom, #f0f0f0, #dcdcdc)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
          }}
        />

        {/* 
          =======================================================
          СВЕТ И СВЕЧЕНИЕ (Light Glow with warm incandescent tone)
          =======================================================
        */}
        <div
          className="pointer-events-none transition-opacity duration-500 ease-out"
          style={{
            position: 'absolute',
            top: '40px',
            left: '-60px',
            width: '650px',
            height: '420px',
            background: 'radial-gradient(ellipse at top left, rgba(255, 235, 170, 0.32) 0%, rgba(255, 220, 130, 0.12) 50%, transparent 75%)',
            opacity: isOn ? 1 : 0,
            zIndex: 1
          }}
        />

        {/* Ambient Warm Volumetric Spread downward */}
        {isOn && (
          <div
            className="pointer-events-none absolute top-[65px] left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[360px] transition-opacity duration-300"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 238, 179, 0.22) 0%, rgba(255, 215, 120, 0.05) 50%, transparent 75%)',
              zIndex: 1
            }}
          />
        )}
      </div>

      {/* Helpful Subtle Hint when Lamp is OFF */}
      {!isOn && (
        <div className="mt-3 text-center animate-pulse text-[11px] text-amber-200/70 font-medium select-none pointer-events-none">
          💡 Потяните за шнурок или нажмите на лампу
        </div>
      )}
    </div>
  );
}
