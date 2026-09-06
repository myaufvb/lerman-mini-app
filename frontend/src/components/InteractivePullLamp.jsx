import React, { useState, useRef, useEffect, useCallback } from 'react';

export function InteractivePullLamp({ isOn, onToggle, onHaptic }) {
  // Center coordinates of the lamp interior socket in SVG viewBox (0 0 220 450)
  const ANCHOR_X = 110;
  const ANCHOR_Y = 215; // exact center of the socket pin in the bottom diffuser opening
  const REST_LENGTH = 145; // matched with photo: cord is ~1.5x shade height
  const MAX_STRETCH = 210;
  const MIN_LENGTH = 90;
  const TRIGGER_DELTA = 18;

  const [angle, setAngle] = useState(0); // in radians
  const [cordLength, setCordLength] = useState(REST_LENGTH);
  const [isDragging, setIsDragging] = useState(false);

  // Physics simulation refs
  const angleRef = useRef(0);
  const omegaRef = useRef(0); // angular velocity
  const lengthRef = useRef(REST_LENGTH);
  const lengthVelRef = useRef(0); // spring velocity
  const isDraggingRef = useRef(false);
  const hasTriggeredRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const blockClicksUntilRef = useRef(0);
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 });
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);

  // Crisp mechanical toggle switch click sound
  const playClickSound = useCallback((mode = 'on') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';

      const now = ctx.currentTime;
      if (mode === 'on') {
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      } else {
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch (_) {}
  }, []);

  // Continuous physics loop for pendulum swing + spring restoration
  const runPhysicsLoop = useCallback(() => {
    let lastTime = performance.now();

    const step = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;

      if (!isDraggingRef.current) {
        // 1. Damped pendulum physics
        const gravity = 1900; // px/s^2
        const angularDamping = 0.985; // air drag
        const alpha = (-gravity / lengthRef.current) * Math.sin(angleRef.current);

        omegaRef.current = (omegaRef.current + alpha * dt) * angularDamping;
        angleRef.current += omegaRef.current * dt;

        // 2. Spring length restoration (Hooke's Law: F = -k * dx)
        const springK = 320;
        const lengthDamping = 0.84;
        const deltaL = REST_LENGTH - lengthRef.current;
        const springForce = deltaL * springK;

        lengthVelRef.current = (lengthVelRef.current + springForce * dt) * lengthDamping;
        lengthRef.current += lengthVelRef.current * dt;

        // Update state
        setAngle(angleRef.current);
        setCordLength(lengthRef.current);

        // Sleep when still
        const isStill =
          Math.abs(angleRef.current) < 0.002 &&
          Math.abs(omegaRef.current) < 0.008 &&
          Math.abs(lengthRef.current - REST_LENGTH) < 0.25 &&
          Math.abs(lengthVelRef.current) < 0.5;

        if (!isStill) {
          animFrameRef.current = requestAnimationFrame(step);
          return;
        } else {
          angleRef.current = 0;
          omegaRef.current = 0;
          lengthRef.current = REST_LENGTH;
          lengthVelRef.current = 0;
          setAngle(0);
          setCordLength(REST_LENGTH);
          animFrameRef.current = null;
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(step);
    }
  }, [REST_LENGTH]);

  // Pointer down on ring or cord
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    hasTriggeredRef.current = false;
    dragDistanceRef.current = 0;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);

    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };

    onHaptic?.impact('light');

    if (!animFrameRef.current) {
      runPhysicsLoop();
    }
  };

  // Global window listeners for drag: guarantees 100% smooth symmetric tracking everywhere
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowPointerMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      try {
        if (e.cancelable) e.preventDefault();
      } catch (_) {}

      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / 220;
      const scaleY = rect.height / 450;

      const mouseSvgX = (e.clientX - rect.left) / scaleX;
      const mouseSvgY = (e.clientY - rect.top) / scaleY;

      const dx = mouseSvgX - ANCHOR_X;
      const dy = Math.max(20, mouseSvgY - ANCHOR_Y);

      const moveDist = Math.hypot(
        e.clientX - pointerDownPosRef.current.x,
        e.clientY - pointerDownPosRef.current.y
      );
      dragDistanceRef.current = moveDist;

      // Symmetrical angle calculation (-48 to +48 deg)
      const rawAngle = Math.atan2(dx, dy);
      const clampedAngle = Math.min(Math.max(-0.82, rawAngle), 0.82);

      // Length calculation with elastic clamping
      const rawLength = Math.hypot(dx, dy);
      const clampedLength = Math.min(Math.max(MIN_LENGTH, rawLength), MAX_STRETCH);

      // Capture drag momentum for release
      const now = performance.now();
      const timeDelta = (now - lastPointerRef.current.time) / 1000;
      if (timeDelta > 0.008) {
        const angleDelta = clampedAngle - angleRef.current;
        omegaRef.current = Math.min(Math.max(-14, angleDelta / timeDelta), 14);
        lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now };
      }

      angleRef.current = clampedAngle;
      lengthRef.current = clampedLength;
      setAngle(clampedAngle);
      setCordLength(clampedLength);

      // Trigger toggle ONCE when threshold is passed
      if (!hasTriggeredRef.current && (clampedLength - REST_LENGTH) >= TRIGGER_DELTA) {
        hasTriggeredRef.current = true;
        blockClicksUntilRef.current = performance.now() + 700;
        onHaptic?.impact('heavy');
        playClickSound(isOn ? 'off' : 'on');
        onToggle();
      }
    };

    const handleWindowPointerUp = () => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      setIsDragging(false);

      if (dragDistanceRef.current > 5) {
        blockClicksUntilRef.current = Math.max(blockClicksUntilRef.current, performance.now() + 700);
      }

      // Upward spring rebound velocity
      lengthVelRef.current = -480;
      runPhysicsLoop();

      setTimeout(() => {
        hasTriggeredRef.current = false;
      }, 450);
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp, { passive: false });
    window.addEventListener('pointercancel', handleWindowPointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [isDragging, isOn, onToggle, onHaptic, playClickSound, runPhysicsLoop, REST_LENGTH, TRIGGER_DELTA, MIN_LENGTH, MAX_STRETCH]);

  // Pure click fallback on ring
  const handleClickRing = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      isDraggingRef.current ||
      hasTriggeredRef.current ||
      performance.now() < blockClicksUntilRef.current
    ) {
      return;
    }

    blockClicksUntilRef.current = performance.now() + 500;
    hasTriggeredRef.current = true;

    onHaptic?.impact('heavy');
    playClickSound(isOn ? 'off' : 'on');
    onToggle();

    // Physical impulse
    lengthRef.current = REST_LENGTH + 26;
    lengthVelRef.current = -400;
    omegaRef.current = (Math.random() - 0.5) * 6;
    runPhysicsLoop();

    setTimeout(() => {
      hasTriggeredRef.current = false;
    }, 450);
  };

  // Tap on lamp shade
  const handleClickShade = (e) => {
    e.stopPropagation();
    if (performance.now() < blockClicksUntilRef.current) return;
    blockClicksUntilRef.current = performance.now() + 400;

    onHaptic?.impact('medium');
    playClickSound(isOn ? 'off' : 'on');
    onToggle();

    omegaRef.current = (Math.random() > 0.5 ? 1 : -1) * 3;
    runPhysicsLoop();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Compute tip coordinate of the rope where the wooden ring hangs
  const tipX = ANCHOR_X + Math.sin(angle) * cordLength;
  const tipY = ANCHOR_Y + Math.cos(angle) * cordLength;
  const ringRotationDeg = (angle * 180) / Math.PI;

  return (
    <div
      ref={containerRef}
      className="relative select-none flex flex-col items-center justify-start pointer-events-auto"
      style={{ width: '220px', height: '450px' }}
    >
      {/* 
        ========================================================================
        1. ORGANIC WARM LIGHT GLOW (SOFT RADIAL FALLOFF, ZERO HARSH CUTOFF)
        ========================================================================
      */}
      {isOn && (
        <div
          className="pointer-events-none absolute -inset-32 sm:-inset-56 transition-opacity duration-500 ease-out z-0 flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 48%, rgba(255, 235, 170, 0.45) 0%, rgba(255, 220, 130, 0.22) 28%, rgba(255, 190, 80, 0.05) 52%, transparent 70%)',
            opacity: 1
          }}
        />
      )}

      {/* Downward Warm Cone of Light illuminating form & surface */}
      {isOn && (
        <div
          className="pointer-events-none absolute top-[170px] -left-36 -right-36 h-[460px] transition-opacity duration-500 ease-out z-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 242, 195, 0.38) 0%, rgba(255, 215, 115, 0.14) 38%, rgba(255, 190, 75, 0.03) 60%, transparent 72%)',
            opacity: 1
          }}
        />
      )}

      {/* 
        ========================================================================
        2. UNIFIED PRECISION SVG: PENDANT CEILING LAMP & PULL CORD
        All components share the exact same coordinate space (x = 110 center axis)
        ========================================================================
      */}
      <svg
        viewBox="0 0 220 450"
        className="w-full h-full overflow-visible drop-shadow-2xl z-10"
        style={{ width: '220px', height: '450px' }}
      >
        <defs>
          {/* Matte Black Shade Exterior Gradient */}
          <linearGradient id="matteBlackShade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#151619" />
            <stop offset="18%" stopColor="#282a30" />
            <stop offset="46%" stopColor="#3d4047" />
            <stop offset="68%" stopColor="#282a30" />
            <stop offset="100%" stopColor="#121315" />
          </linearGradient>

          {/* Wooden Top Neck Gradient */}
          <linearGradient id="woodenNeckGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8a5d2e" />
            <stop offset="25%" stopColor="#ba8a4d" />
            <stop offset="50%" stopColor="#dfb778" />
            <stop offset="75%" stopColor="#ba8a4d" />
            <stop offset="100%" stopColor="#7a4f24" />
          </linearGradient>

          {/* Wooden Ring Texture Gradient */}
          <radialGradient id="woodenRingGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f3d5a5" />
            <stop offset="35%" stopColor="#cf9e62" />
            <stop offset="70%" stopColor="#9c6832" />
            <stop offset="100%" stopColor="#5c3814" />
          </radialGradient>

          {/* Interior Reflector (Off) */}
          <radialGradient id="interiorReflectorOff" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8ed" />
            <stop offset="60%" stopColor="#ebdcc7" />
            <stop offset="100%" stopColor="#c7b49a" />
          </radialGradient>

          {/* Interior Reflector (On - Warm Incandescent Glow) */}
          <radialGradient id="interiorReflectorOn" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff7dd" />
            <stop offset="65%" stopColor="#ffda73" />
            <stop offset="100%" stopColor="#dca836" />
          </radialGradient>

          {/* Drop shadow for the wooden ring */}
          <filter id="ringShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 2.1 Ceiling Mount Canopy (Черная конусная чаша крепления к потолку) */}
        <polygon
          points="97,0 123,0 114,18 106,18"
          fill="url(#matteBlackShade)"
          stroke="#0e0f11"
          strokeWidth="0.8"
        />

        {/* 2.2 Ceiling Cable (Черный подвесной провод) */}
        <line
          x1="110"
          y1="18"
          x2="110"
          y2="88"
          stroke="#1b1c20"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <line
          x1="110.3"
          y1="18"
          x2="110.3"
          y2="88"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="0.8"
        />

        {/* 2.3 Wooden Socket / Neck Cap (Деревянная вставка из светлого дуба) */}
        <rect
          x="103"
          y="88"
          width="14"
          height="28"
          rx="3.5"
          fill="url(#woodenNeckGrad)"
          stroke="#5c3814"
          strokeWidth="0.8"
        />

        {/* 2.4 Pendant Lampshade Group (Clickable to Toggle) */}
        <g
          onClick={handleClickShade}
          className="cursor-pointer"
        >
          {/* Nordic Conical Bell Body (Outer Matte Black Shell) */}
          <path
            d="M 101,116 
               C 101,145 28,190 20,215 
               C 50,233 170,233 200,215 
               C 192,190 119,145 119,116 
               Z"
            fill="url(#matteBlackShade)"
            stroke="#0a0a0c"
            strokeWidth="0.8"
          />

          {/* Subtle highlight sheen along the left curve of the shade */}
          <path
            d="M 101,116 C 101,145 28,190 20,215"
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.5"
          />

          {/* Bottom Elliptical Opening Rim & Interior Diffuser */}
          <ellipse
            cx="110"
            cy="215"
            rx="90"
            ry="18"
            fill={isOn ? 'url(#interiorReflectorOn)' : 'url(#interiorReflectorOff)'}
            stroke="#222327"
            strokeWidth="1.2"
            filter={isOn ? 'drop-shadow(0 0 18px rgba(255, 220, 100, 0.95))' : 'none'}
          />

          {/* Inner rim ambient shadow for 3D depth */}
          <ellipse
            cx="110"
            cy="213"
            rx="87"
            ry="15"
            fill="none"
            stroke={isOn ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.12)'}
            strokeWidth="1"
          />

          {/* Center Metallic Cord Socket Pin (где точно крепится шнурок) */}
          <circle
            cx={ANCHOR_X}
            cy={ANCHOR_Y}
            r="4.5"
            fill="#c5a059"
            stroke="#593b08"
            strokeWidth="0.8"
          />
          <circle
            cx={ANCHOR_X}
            cy={ANCHOR_Y}
            r="2"
            fill="#222"
          />
        </g>

        {/* 
          ======================================================================
          2.5 HANGING PULL CORD & WOODEN RING
          Connected directly to the center socket pin (ANCHOR_X, ANCHOR_Y)
          ======================================================================
        */}
        {/* The braided pull cord line */}
        <line
          x1={ANCHOR_X}
          y1={ANCHOR_Y}
          x2={tipX}
          y2={tipY}
          stroke={isOn ? '#fffaed' : '#e6e6e6'}
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"
        />

        {/* Wooden O-Ring Handle & Brass Collar at the tip */}
        <g
          transform={`translate(${tipX}, ${tipY}) rotate(${ringRotationDeg})`}
          filter="url(#ringShadow)"
        >
          {/* Brass Collar at top of ring (holds cord seamlessly) */}
          <circle
            cx="0"
            cy="0"
            r="2.5"
            fill="#d4af37"
            stroke="#422907"
            strokeWidth="0.6"
          />

          {/* Subtle warm halo when lamp is ON */}
          {isOn && (
            <ellipse
              cx="0"
              cy="11.5"
              rx="13"
              ry="16"
              fill="rgba(255, 235, 170, 0.25)"
            />
          )}

          {/* Wooden O-Ring Body (Outer Oval) */}
          <ellipse
            cx="0"
            cy="11.5"
            rx="8"
            ry="11.5"
            fill="url(#woodenRingGrad)"
            stroke="#4a2c0c"
            strokeWidth="0.8"
          />

          {/* Wooden O-Ring Center Cutout Hole */}
          <ellipse
            cx="0"
            cy="11.5"
            rx="4.2"
            ry="7"
            fill="#121316"
            stroke="#3b2108"
            strokeWidth="0.6"
          />
        </g>

        {/* Invisible expanded hit line covering the cord itself for easy grabbing */}
        <line
          x1={ANCHOR_X}
          y1={ANCHOR_Y}
          x2={tipX}
          y2={tipY}
          stroke="transparent"
          strokeWidth="20"
          style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
        />

        {/* 
          Interactive Hitbox: perfectly centered on the wooden ring in SVG coordinates
        */}
        <circle
          cx={tipX}
          cy={tipY + 11.5}
          r="32"
          fill="transparent"
          className="cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onClick={handleClickRing}
        />
      </svg>

      {/* Helpful Subtle Hint when Lamp is OFF */}
      {!isOn && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse text-[11px] text-amber-200/80 font-medium select-none pointer-events-none z-20">
          💡 Потяните за кольцо
        </div>
      )}
    </div>
  );
}
