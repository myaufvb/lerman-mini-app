import React, { useEffect, useRef } from 'react';

/**
 * CyberCanvasWallpaper - 60 FPS lightweight HTML5 Canvas Live Wallpapers
 * Mode options: 'matrix' | 'grid' | 'particles'
 */
export function CyberCanvasWallpaper({ mode = 'matrix' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (mode === 'matrix') initMatrix();
      if (mode === 'particles') initParticles();
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 1. MATRIX DIGITAL RAIN
    // ==========================================
    const chars = '010101010101<>/{}[];:=+*~#@&$01🛡️⚡🔒01';
    const fontSize = 15;
    let columns = Math.floor(width / fontSize);
    let drops = [];

    function initMatrix() {
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100);
      }
    }

    function renderMatrix() {
      ctx.fillStyle = 'rgba(7, 11, 20, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.85) {
          ctx.fillStyle = '#00f2fe';
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = '#059669';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 3;
        }

        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    // ==========================================
    // 2. 3D NEON CYBER GRID (Perspective horizon)
    // ==========================================
    let gridOffset = 0;
    function renderGrid() {
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      const horizon = height * 0.45;
      gridOffset = (gridOffset + 1.2) % 40;

      // Horizon Glow
      const glowGrad = ctx.createLinearGradient(0, horizon - 80, 0, horizon + 120);
      glowGrad.addColorStop(0, 'rgba(0, 242, 254, 0)');
      glowGrad.addColorStop(0.45, 'rgba(0, 242, 254, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
      glowGrad.addColorStop(1, 'rgba(5, 8, 17, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, horizon - 80, width, 200);

      // Perspective horizontal lines
      ctx.lineWidth = 1;
      for (let y = horizon; y < height; y += (y - horizon) * 0.18 + 4) {
        const alpha = Math.min(1, (y - horizon) / (height - horizon));
        ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vanishing point perspective lines
      const vanishingX = width * 0.5;
      const stepX = 50;
      for (let x = -width; x < width * 2; x += stepX) {
        ctx.strokeStyle = 'rgba(79, 172, 254, 0.25)';
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizon);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Digital Cyber Horizon line
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(width, horizon);
      ctx.stroke();
    }

    // ==========================================
    // 3. CYBER NEURAL PARTICLES & CONNECTED NODES
    // ==========================================
    let particles = [];
    const particleCount = Math.min(65, Math.floor((width * height) / 18000));

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2 + 1.5,
          color: Math.random() > 0.4 ? '#00f2fe' : '#818cf8'
        });
      }
    }

    function renderParticles() {
      ctx.fillStyle = '#060b17';
      ctx.fillRect(0, 0, width, height);

      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = 1 - dist / maxDistance;
            ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (mode === 'matrix') initMatrix();
    if (mode === 'particles') initParticles();

    const animate = () => {
      if (mode === 'matrix') renderMatrix();
      else if (mode === 'grid') renderGrid();
      else if (mode === 'particles') renderParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
