import React, { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on fine pointer devices (desktop/mouse)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let animId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check if target is interactive
      const target = e.target;
      const isInteractive = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[data-cursor="interactive"]') ||
        target.classList?.contains('interactive-cursor')
      );
      setIsHovered(!!isInteractive);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const lerp = (a, b, n) => (1 - n) * a + n * b;

    const loop = () => {
      // Smoothly interpolate ring towards mouse position
      ringX = lerp(ringX, mouseX, 0.18);
      ringY = lerp(ringY, mouseY, 0.18);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className={`pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Central Laser Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f2fe] will-change-transform pointer-events-none z-50"
      />

      {/* Trailing Fluid Neon Aura Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-5 -mt-5 w-10 h-10 rounded-full border pointer-events-none z-40 will-change-transform transition-[border-color,background-color,width,height,transform-scale] duration-200 ease-out flex items-center justify-center ${
          isClicked
            ? 'scale-75 border-cyan-300 bg-cyan-400/25 shadow-[0_0_20px_#00f2fe]'
            : isHovered
            ? 'scale-150 border-cyan-400/80 bg-cyan-500/15 shadow-[0_0_25px_rgba(0,242,254,0.4)] backdrop-blur-[1px]'
            : 'scale-100 border-cyan-400/30 bg-cyan-500/5'
        }`}
      >
        {isHovered && (
          <div className="w-2 h-2 rounded-full bg-cyan-400/40 animate-ping" />
        )}
      </div>
    </div>
  );
}
