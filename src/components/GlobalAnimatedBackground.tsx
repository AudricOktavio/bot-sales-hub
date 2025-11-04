import { useEffect, useRef } from 'react';

export const GlobalAnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Configuration
    const gridSize = 80;
    const maxParticles = 25;
    let animationFrame: number;
    let time = 0;

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
      size: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.4 + 0.2,
        size: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update time (slow animation)
      time += 0.003;

      // Draw diagonal moving grid
      ctx.save();
      
      // Vertical lines (diagonal movement)
      const offsetX = (time * 10) % gridSize;
      for (let x = -gridSize; x <= width + gridSize; x += gridSize) {
        const posX = x + offsetX;
        const opacity = 0.03 + Math.sin(time + x * 0.01) * 0.03;
        
        ctx.beginPath();
        ctx.moveTo(posX, 0);
        ctx.lineTo(posX, height);
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`; // Purple
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Horizontal lines (diagonal movement)
      const offsetY = (time * 10) % gridSize;
      for (let y = -gridSize; y <= height + gridSize; y += gridSize) {
        const posY = y + offsetY;
        const opacity = 0.03 + Math.sin(time + y * 0.01) * 0.03;
        
        ctx.beginPath();
        ctx.moveTo(0, posY);
        ctx.lineTo(width, posY);
        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`; // Blue
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();

      // Draw and update particles
      particles.forEach((particle, index) => {
        // Update position (slow drift)
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));

        // Pulsing opacity (slow pulse)
        const pulse = Math.sin(time * 2 + index * 0.5) * 0.3 + 0.7;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity * pulse * 0.6})`;
        ctx.fill();

        // Add subtle glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(139, 92, 246, ${particle.opacity * pulse * 0.4})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connection lines between nearby particles (subtle)
        particles.slice(index + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            const lineOpacity = (1 - distance / 120) * 0.08 * pulse;
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrame);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 pointer-events-none" />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      style={{ mixBlendMode: 'screen', minWidth: '100%' }}
    />
  );
};

