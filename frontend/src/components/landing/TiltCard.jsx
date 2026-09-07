import React, { useRef, useState } from 'react';

export function TiltCard({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.02,
  glare = true,
  glowColor = 'rgba(0, 242, 254, 0.25)'
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const tiltX = (0.5 - y) * maxTilt;
    const tiltY = (x - 0.5) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`);
    if (glare) {
      setGlarePosition({
        x: (x * 100).toFixed(1),
        y: (y * 100).toFixed(1),
        opacity: 1
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform || 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`relative preserve-3d will-change-transform rounded-2xl overflow-hidden ${className}`}
    >
      {/* Specular Glare Overlay reacting to cursor position */}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-2xl"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 300px at ${glarePosition.x}% ${glarePosition.y}%, ${glowColor}, transparent 70%)`
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-20 w-full h-full preserve-3d">
        {children}
      </div>
    </div>
  );
}
