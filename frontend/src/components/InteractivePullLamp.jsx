import React, { useState, useRef, useEffect, useCallback } from 'react';

export function InteractivePullLamp({ isOn, onToggle, onHaptic }) {
  // Physics simulation state
  // Anchor coordinates (origin of cord at bottom right of lamp shade)
  const ANCHOR_X = 106;
  const ANCHOR_Y = 72;
  const REST_LENGTH = 58;
  const MAX_STRETCH = 96;
  const MIN_LENGTH = 45;
  const TRIGGER_DELTA = 20;

  const [angle, setAngle] = useState(0); // in radians
  const [cordLength, setCordLength] = useState(REST_LENGTH);
  const [isDragging, setIsDragging] = useState(false);
  const [hasTriggeredThisPull, setHasTriggeredThisPull] = useState(false);

  // Physics refs (avoid re-renders during RAF)
  const angleRef = useRef(0);
  const omegaRef = useRef(0); // angular velocity
  const lengthRef = useRef(REST_LENGTH);
  const lengthVelRef = useRef(0); // spring velocity
  const isDraggingRef = useRef(false);
  const hasTriggeredRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 });
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);

  // Sound click effect using Web Audio API (crisp mechanical pull-chain switch click)
  const playClickSound = useCallback((mode = 'on') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      
      const now = ctx.currentTime;
      if (mode === 'on') {
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      } else {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (_) {}
  }, []);

  // Physics animation loop (Damped pendulum + Hooke's spring)
  const runPhysicsLoop = useCallback(() => {
    let lastTime = performance.now();

    const step = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033); // clamp dt to max 30FPS step to avoid explosion
      lastTime = time;

      if (!isDraggingRef.current) {
        // 1. Pendulum angular physics
        const gravity = 2200; // px/s^2
        const angularDamping = 0.982; // air drag
        const alpha = (-gravity / lengthRef.current) * Math.sin(angleRef.current);
        
        omegaRef.current = (omegaRef.current + alpha * dt) * angularDamping;
        angleRef.current += omegaRef.current * dt;

        // 2. Spring length restoration (Hooke's law: F = -k * dx)
        const springK = 380; // spring stiffness
        const lengthDamping = 0.86;
        const deltaL = REST_LENGTH - lengthRef.current;
        const springForce = deltaL * springK;
        
        lengthVelRef.current = (lengthVelRef.current + springForce * dt) * lengthDamping;
        lengthRef.current += lengthVelRef.current * dt;

        // Update react state
        setAngle(angleRef.current);
        setCordLength(lengthRef.current);

        // Sleep when motion is imperceptible
        const isStill = 
          Math.abs(angleRef.current) < 0.002 && 
          Math.abs(omegaRef.current) < 0.01 && 
          Math.abs(lengthRef.current - REST_LENGTH) < 0.2 && 
          Math.abs(lengthVelRef.current) < 0.5;

        if (!isStill) {
          animFrameRef.current = requestAnimationFrame(step);
          return;
        } else {
          // Snap precisely to rest
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
  }, []);

  // Pointer down on cord bead or chain
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    isDraggingRef.current = true;
    hasTriggeredRef.current = false;
    setIsDragging(true);
    setHasTriggeredThisPull(false);

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

  // Pointer drag: rope follows pointer with stretch and angle
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const anchorScreenX = rect.left + ANCHOR_X;
    const anchorScreenY = rect.top + ANCHOR_Y;

    const dx = e.clientX - anchorScreenX;
    const dy = Math.max(15, e.clientY - anchorScreenY);

    // Calculate angle and clamp to natural pull arc (-65 deg to +65 deg)
    const rawAngle = Math.atan2(dx, dy);
    const clampedAngle = Math.min(Math.max(-1.15, rawAngle), 1.15);

    // Calculate pulled length with rubber-band resistance
    const rawLength = Math.hypot(dx, dy);
    const clampedLength = Math.min(Math.max(MIN_LENGTH, rawLength), MAX_STRETCH);

    // Record velocity for release momentum
    const now = performance.now();
    const timeDelta = (now - lastPointerRef.current.time) / 1000;
    if (timeDelta > 0.008) {
      const angleDelta = clampedAngle - angleRef.current;
      omegaRef.current = Math.min(Math.max(-15, angleDelta / timeDelta), 15);
      lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now };
    }

    angleRef.current = clampedAngle;
    lengthRef.current = clampedLength;
    setAngle(clampedAngle);
    setCordLength(clampedLength);

    // Check pull threshold trigger
    if (!hasTriggeredRef.current && (clampedLength - REST_LENGTH) >= TRIGGER_DELTA) {
      hasTriggeredRef.current = true;
      setHasTriggeredThisPull(true);
      onHaptic?.impact('heavy');
      playClickSound(isOn ? 'off' : 'on');
      onToggle();
    }
  };

  // Pointer release: cord springs back and swings like a real pendulum
  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    isDraggingRef.current = false;
    setIsDragging(false);

    // If released without pulling far enough, give an impulse
    if (!hasTriggeredRef.current) {
      const pulledDist = lengthRef.current - REST_LENGTH;
      if (pulledDist >= 8) {
        hasTriggeredRef.current = true;
        onHaptic?.impact('heavy');
        playClickSound(isOn ? 'off' : 'on');
        onToggle();
      }
    }

    // Give upward spring velocity
    lengthVelRef.current = -500;
    runPhysicsLoop();
  };

  // Single click fallback on cord or shade: causes a realistic spring-loaded pull & swing
  const handleClickCord = (e) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;

    onHaptic?.impact('heavy');
    playClickSound(isOn ? 'off' : 'on');
    onToggle();

    // Inject sudden physical impulse
    lengthRef.current = REST_LENGTH + 22;
    lengthVelRef.current = -420;
    omegaRef.current = (Math.random() - 0.5) * 6; // playful side-to-side swing
    runPhysicsLoop();
  };

  const handleClickShade = (e) => {
    e.stopPropagation();
    onHaptic?.impact('medium');
    playClickSound(isOn ? 'off' : 'on');
    onToggle();

    // Gentle swing impulse on cord when bumping the lamp
    omegaRef.current = 3.5;
    runPhysicsLoop();
  };

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Compute 2D tip of the rope from physics angle and length
  const tipX = ANCHOR_X + Math.sin(angle) * cordLength;
  const tipY = ANCHOR_Y + Math.cos(angle) * cordLength;

  // Generate 5 beaded chain links along the curve
  const beadCount = 6;
  const chainBeads = [];
  for (let i = 1; i <= beadCount; i++) {
    const t = i / (beadCount + 1);
    // Slight sag curve when angled
    const sag = Math.sin(t * Math.PI) * (angle * 4);
    const bx = ANCHOR_X + (tipX - ANCHOR_X) * t - sag;
    const by = ANCHOR_Y + (tipY - ANCHOR_Y) * t;
    chainBeads.push({ x: bx, y: by, id: i });
  }

  return (
    <div 
      ref={containerRef}
      className="relative select-none flex flex-col items-center justify-center pointer-events-auto"
      style={{ width: '220px', height: '240px' }}
    >
      {/* 
        ========================================================================
        1. ORGANIC WARM LIGHT GLOW (ZERO BOX CUTOFF, SOFT RADIAL FALLOFF)
        ========================================================================
      */}
      {isOn && (
        <div 
          className="pointer-events-none absolute -inset-32 sm:-inset-48 transition-opacity duration-500 ease-out z-0 flex items-center justify-center"
          style={{
            // Radial light with 100% transparent outer edge (no square clipping)
            background: 'radial-gradient(circle at 50% 45%, rgba(255, 235, 170, 0.42) 0%, rgba(255, 218, 125, 0.22) 28%, rgba(255, 195, 80, 0.07) 50%, transparent 72%)',
            opacity: 1
          }}
        />
      )}

      {/* Downward Warm Light Cone onto Desk Surface */}
      {isOn && (
        <div
          className="pointer-events-none absolute top-[70px] -left-20 -right-20 h-[340px] transition-opacity duration-500 ease-out z-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 240, 190, 0.35) 0%, rgba(255, 215, 110, 0.12) 42%, rgba(255, 190, 70, 0.02) 65%, transparent 75%)',
            opacity: 1
          }}
        />
      )}

      {/* 
        ========================================================================
        2. 3D LAMP MODEL (SHADE, METALLIC NECK, PEDESTAL BASE)
        ========================================================================
      */}
      <div className="relative flex flex-col items-center z-10">
        
        {/* Top Finial (3D Polished Brass Ball Screw on top of dome) */}
        <div 
          className="relative z-30 -mb-1 shadow-sm"
          style={{
            width: '14px',
            height: '11px',
            borderRadius: '50% 50% 25% 25%',
            background: isOn
              ? 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ffeaa7 35%, #d4af37 70%, #7d5e1a 100%)'
              : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #dcdcdc 40%, #888888 80%, #333333 100%)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        />

        {/* 3D Lampshade Dome (Deep spherical shading with inner filament glow) */}
        <div
          onClick={handleClickShade}
          title="Нажмите на лампу для включения"
          className="relative cursor-pointer transition-all duration-300 z-20 group"
          style={{
            width: '136px',
            height: '68px',
            borderTopLeftRadius: '136px',
            borderTopRightRadius: '136px',
            background: isOn
              ? 'radial-gradient(circle at 50% 25%, #ffffff 0%, #fffbe8 25%, #ffe699 55%, #e2c26c 85%, #b3923a 100%)'
              : 'radial-gradient(circle at 45% 25%, #f9f9fa 0%, #e2e4e8 35%, #9ca3af 75%, #4b5563 100%)',
            boxShadow: isOn
              ? '0 0 35px 10px rgba(255, 238, 179, 0.9), 0 0 75px 25px rgba(255, 210, 90, 0.35), inset 0 2px 5px rgba(255, 255, 255, 0.8), inset 0 -6px 12px rgba(230, 180, 60, 0.7)'
              : '0 8px 24px rgba(0, 0, 0, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.85), inset 0 -6px 10px rgba(0, 0, 0, 0.45)'
          }}
        >
          {/* Specular curved reflection on the dome */}
          <div 
            className="absolute top-2 left-5 right-5 h-6 rounded-full opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 100%)'
            }}
          />

          {/* 3D Bottom Opening Bevel (Elliptical Rim with inner glow) */}
          <div 
            className="absolute -bottom-1.5 inset-x-0 h-3 rounded-[50%] transition-colors duration-300 pointer-events-none"
            style={{
              background: isOn
                ? 'radial-gradient(ellipse at 50% 50%, #ffffff 0%, #ffdf7e 50%, #cca23a 100%)'
                : 'radial-gradient(ellipse at 50% 50%, #9ca3af 0%, #6b7280 60%, #374151 100%)',
              boxShadow: isOn 
                ? '0 3px 12px rgba(255, 220, 100, 0.95), inset 0 1px 2px #fff'
                : 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0,0,0,0.6)'
            }}
          />

          {/* Glowing Bulb Core under the shade */}
          {isOn && (
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #ffffff 30%, #fff0a0 70%, transparent 100%)',
                boxShadow: '0 0 16px 4px rgba(255, 255, 255, 0.9)'
              }}
            />
          )}
        </div>

        {/* Upper Neck Collar (Brass connector ring) */}
        <div 
          className="relative z-10 -mt-0.5 shadow-sm"
          style={{
            width: '18px',
            height: '8px',
            borderRadius: '3px',
            background: 'linear-gradient(to right, #443c29 0%, #a8935c 30%, #fef3c7 50%, #a8935c 70%, #3a3220 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        />

        {/* 3D Cylindrical Metallic Stem (Photorealistic chrome/brass cylinder highlight) */}
        <div
          className="relative z-10"
          style={{
            width: '11px',
            height: '130px',
            background: 'linear-gradient(to right, #2b271d 0%, #544b34 14%, #a69567 28%, #fffbe6 48%, #fffbe6 56%, #9e8b5a 76%, #3b3321 100%)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.45)'
          }}
        />

        {/* Lower Base Collar (Brass connector ring) */}
        <div 
          className="relative z-10 -mb-0.5 shadow-sm"
          style={{
            width: '22px',
            height: '9px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #443c29 0%, #a8935c 30%, #fef3c7 50%, #a8935c 70%, #3a3220 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        />

        {/* 3D Stepped Pedestal Base (Upper tier + Weighted bottom disc with realistic drop shadow) */}
        <div className="relative flex flex-col items-center z-10">
          {/* Upper Base Bevel */}
          <div 
            style={{
              width: '64px',
              height: '6px',
              borderRadius: '50%',
              background: 'linear-gradient(to right, #5c523a 0%, #b8a572 40%, #fffbe6 55%, #7a6b47 100%)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)'
            }}
          />

          {/* Lower Heavy Metallic Base */}
          <div
            style={{
              width: '102px',
              height: '14px',
              borderRadius: '7px',
              background: 'linear-gradient(to bottom, #dcdcdc 0%, #b0b0b0 25%, #7a7a7a 70%, #404040 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 12px 28px 2px rgba(0, 0, 0, 0.85), 0 3px 6px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Top specular reflection of the base */}
            <div 
              className="w-full h-1 rounded-t-full"
              style={{
                background: 'linear-gradient(to right, transparent 5%, rgba(255,255,255,0.8) 50%, transparent 95%)'
              }}
            />
          </div>
        </div>

      </div>

      {/* 
        ========================================================================
        3. REAL PHYSICS SWINGING CORD & BEADED CHAIN (Interactive Pendulum)
        ========================================================================
      */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-30 overflow-visible"
        style={{ width: '220px', height: '240px' }}
      >
        <defs>
          <radialGradient id="brassBeadGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          <filter id="ballDropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Chain Socket Eyelet hanging under the right rim of shade */}
        <circle 
          cx={ANCHOR_X} 
          cy={ANCHOR_Y} 
          r="2.5" 
          fill="#c29d59" 
          stroke="#452a0a" 
          strokeWidth="0.8" 
        />

        {/* Flexible Rope / Chain Line */}
        <line
          x1={ANCHOR_X}
          y1={ANCHOR_Y}
          x2={tipX}
          y2={tipY}
          stroke="#a38241"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="2.5, 2.5" // Beaded chain texture
        />

        {/* Individual Brass Beads along the cord for realistic beaded chain look */}
        {chainBeads.map((b) => (
          <circle
            key={b.id}
            cx={b.x}
            cy={b.y}
            r="1.7"
            fill="url(#brassBeadGlow)"
          />
        ))}

        {/* Main 3D Golden Ball Bead at the End of the Rope */}
        <g 
          transform={`translate(${tipX}, ${tipY})`} 
          filter="url(#ballDropShadow)"
        >
          {/* Outer glow when lamp is lit */}
          {isOn && (
            <circle
              cx="0"
              cy="0"
              r="7.5"
              fill="rgba(254, 240, 138, 0.35)"
            />
          )}

          {/* Golden 3D Spherical Bead */}
          <circle
            cx="0"
            cy="0"
            r="5.5"
            fill="url(#brassBeadGlow)"
            stroke="#5c3b0d"
            strokeWidth="0.6"
          />
        </g>
      </svg>

      {/* Invisible Expanded Touch/Pointer Hitbox over the Bead for Effortless Dragging */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClickCord}
        title="Потяните за шнурок с физикой"
        className="absolute z-40 touch-none cursor-grab active:cursor-grabbing rounded-full"
        style={{
          left: `${tipX - 18}px`,
          top: `${tipY - 18}px`,
          width: '36px',
          height: '36px',
          transform: isDragging ? 'scale(1.15)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
      />

      {/* Subtle Hint when Lamp is OFF */}
      {!isOn && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse text-[11px] text-amber-200/80 font-medium select-none pointer-events-none">
          💡 Потяните за веревочку
        </div>
      )}
    </div>
  );
}
