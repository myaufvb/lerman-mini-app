import React, { useState, useRef, useEffect, useCallback } from 'react';

export function InteractivePullLamp({ isOn, onToggle, onHaptic }) {
  // Center coordinates of the lamp interior socket
  const ANCHOR_X = 110;
  const ANCHOR_Y = 175; // bottom opening center
  const REST_LENGTH = 115;
  const MAX_STRETCH = 175;
  const MIN_LENGTH = 80;
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

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

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

  // Pointer drag: rope follows finger/mouse
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const anchorScreenX = rect.left + ANCHOR_X;
    const anchorScreenY = rect.top + ANCHOR_Y;

    const dx = e.clientX - anchorScreenX;
    const dy = Math.max(20, e.clientY - anchorScreenY);

    const moveDist = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );
    dragDistanceRef.current = moveDist;

    // Angle calculation (-60 to +60 deg)
    const rawAngle = Math.atan2(dx, dy);
    const clampedAngle = Math.min(Math.max(-1.05, rawAngle), 1.05);

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

  // Pointer release: release spring & start pendulum swing
  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    isDraggingRef.current = false;
    setIsDragging(false);

    if (dragDistanceRef.current > 4) {
      blockClicksUntilRef.current = Math.max(blockClicksUntilRef.current, performance.now() + 700);
    }

    // Upward spring rebound velocity
    lengthVelRef.current = -480;
    runPhysicsLoop();

    setTimeout(() => {
      hasTriggeredRef.current = false;
    }, 450);
  };

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
      style={{ width: '220px', height: '360px' }}
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
            // Completely fades to 0% opacity before the edge
            background: 'radial-gradient(circle at 50% 48%, rgba(255, 235, 170, 0.45) 0%, rgba(255, 220, 130, 0.22) 28%, rgba(255, 190, 80, 0.05) 52%, transparent 70%)',
            opacity: 1
          }}
        />
      )}

      {/* Downward Warm Cone of Light illuminating form & surface */}
      {isOn && (
        <div
          className="pointer-events-none absolute top-[150px] -left-36 -right-36 h-[460px] transition-opacity duration-500 ease-out z-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 242, 195, 0.38) 0%, rgba(255, 215, 115, 0.14) 38%, rgba(255, 190, 75, 0.03) 60%, transparent 72%)',
            opacity: 1
          }}
        />
      )}

      {/* 
        ========================================================================
        2. EXACT PENDANT CEILING LAMP (FROM PHOTO)
        ========================================================================
      */}
      <div className="relative flex flex-col items-center z-10 w-full">

        {/* 2.1 Ceiling Mount Canopy (Черная конусная чаша крепления к потолку) */}
        <div
          className="relative z-30 shadow-md"
          style={{
            width: '26px',
            height: '18px',
            clipPath: 'polygon(0 0, 100% 0, 60% 100%, 40% 100%)',
            background: 'linear-gradient(to right, #151518 0%, #303238 45%, #18191c 100%)'
          }}
        />

        {/* 2.2 Ceiling Cable (Черный подвесной провод) */}
        <div
          className="relative z-20"
          style={{
            width: '2.5px',
            height: '68px',
            background: 'linear-gradient(to right, #111 0%, #333 50%, #111 100%)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
          }}
        />

        {/* 2.3 Wooden Socket / Neck Cap (Деревянная вставка из светлого дуба) */}
        <div
          className="relative z-20 -mb-0.5 shadow-sm"
          style={{
            width: '15px',
            height: '28px',
            borderRadius: '4px 4px 1px 1px',
            background: 'linear-gradient(to right, #8a5d2e 0%, #ba8a4d 25%, #dfb778 50%, #ba8a4d 75%, #7a4f24 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.5)'
          }}
        />

        {/* 2.4 Pendant Lampshade SVG (Черный матовый конусный купол + светящееся дно) */}
        <div
          onClick={handleClickShade}
          title="Нажмите на лампу для включения"
          className="relative cursor-pointer z-20"
          style={{ width: '190px', height: '115px' }}
        >
          <svg
            viewBox="0 0 190 115"
            className="w-full h-full overflow-visible drop-shadow-2xl"
          >
            <defs>
              {/* Matte Black Shade Exterior Gradient */}
              <linearGradient id="matteBlackShade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#151619" />
                <stop offset="20%" stopColor="#282a30" />
                <stop offset="48%" stopColor="#3d4047" />
                <stop offset="65%" stopColor="#282a30" />
                <stop offset="100%" stopColor="#121315" />
              </linearGradient>

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
            </defs>

            {/* Nordic Conical Bell Body (Outer Matte Black Shell) */}
            <path
              d="M 87,0 
                 C 87,22 15,70 5,95 
                 C 35,115 155,115 185,95 
                 C 175,70 103,22 103,0 
                 Z"
              fill="url(#matteBlackShade)"
              stroke="#0a0a0c"
              strokeWidth="0.8"
            />

            {/* Subtle highlight sheen along the left curve of the shade */}
            <path
              d="M 87,0 C 87,22 15,70 5,95"
              fill="none"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="1.5"
            />

            {/* Bottom Elliptical Opening Rim & Interior View */}
            <ellipse
              cx="95"
              cy="95"
              rx="87"
              ry="18"
              fill={isOn ? 'url(#interiorReflectorOn)' : 'url(#interiorReflectorOff)'}
              stroke="#222327"
              strokeWidth="1.2"
              filter={isOn ? 'drop-shadow(0 0 16px rgba(255, 220, 100, 0.95))' : 'none'}
            />

            {/* Inner rim ambient shadow for depth */}
            <ellipse
              cx="95"
              cy="93"
              rx="84"
              ry="15"
              fill="none"
              stroke={isOn ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.12)'}
              strokeWidth="1"
            />

            {/* Center Metallic Cord Socket Pin (где крепится шнурок) */}
            <circle
              cx="95"
              cy="95"
              r="4.5"
              fill="#c5a059"
              stroke="#593b08"
              strokeWidth="0.8"
            />
            <circle
              cx="95"
              cy="95"
              r="2"
              fill="#222"
            />
          </svg>
        </div>
      </div>

      {/* 
        ========================================================================
        3. PULL CORD WITH WOODEN RING & REAL PENDULUM PHYSICS
        ========================================================================
      */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-30 overflow-visible"
        style={{ width: '220px', height: '360px' }}
      >
        <defs>
          {/* Wooden Ring Texture Gradient (matching top wooden neck) */}
          <radialGradient id="woodenRingGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f3d5a5" />
            <stop offset="35%" stopColor="#cf9e62" />
            <stop offset="70%" stopColor="#9c6832" />
            <stop offset="100%" stopColor="#5c3814" />
          </radialGradient>
          <filter id="ringShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* Thin Silver/White Hanging Cord from Center Socket */}
        <line
          x1={ANCHOR_X}
          y1={ANCHOR_Y}
          x2={tipX}
          y2={tipY}
          stroke={isOn ? '#fffaed' : '#dcdcdc'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Small brass knot/fitting holding the wooden ring */}
        <circle
          cx={tipX}
          cy={tipY}
          r="2.5"
          fill="#c5a059"
          stroke="#422907"
          strokeWidth="0.6"
        />

        {/* Wooden O-Ring Handle at Bottom of Cord (From Photo) */}
        <g
          transform={`translate(${tipX}, ${tipY + 12}) rotate(${ringRotationDeg})`}
          filter="url(#ringShadow)"
        >
          {/* Subtle warm halo when lamp is ON */}
          {isOn && (
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="rgba(255, 235, 170, 0.25)"
            />
          )}

          {/* Wooden O-Ring Outer Body */}
          <circle
            cx="0"
            cy="0"
            r="10.5"
            fill="url(#woodenRingGrad)"
            stroke="#4a2c0c"
            strokeWidth="0.8"
          />

          {/* Wooden O-Ring Center Cutout Hole */}
          <circle
            cx="0"
            cy="0"
            r="5"
            fill="#121316"
            stroke="#3b2108"
            strokeWidth="0.6"
          />
        </g>
      </svg>

      {/* Expanded Pointer Hitbox around the Wooden Ring for Easy Touch/Pull */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClickRing}
        title="Потяните за кольцо (шнурок с физикой)"
        className="absolute z-40 touch-none cursor-grab active:cursor-grabbing rounded-full"
        style={{
          left: `${tipX - 22}px`,
          top: `${tipY - 10}px`,
          width: '44px',
          height: '48px',
          transform: isDragging ? 'scale(1.18)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
      />

      {/* Helpful Subtle Hint when Lamp is OFF */}
      {!isOn && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse text-[11px] text-amber-200/80 font-medium select-none pointer-events-none">
          💡 Потяните за кольцо
        </div>
      )}
    </div>
  );
}
