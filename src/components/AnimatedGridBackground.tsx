import { useEffect, useRef } from 'react';

export const AnimatedGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    // Grid configuration
    const gridSize = 60;
    let animationFrame: number;
    let time = 0;

    // Particle configuration
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update time for animation
      time += 0.005;

      // Draw vertical lines with increased opacity
      for (let x = 0; x <= width; x += gridSize) {
        const offset = Math.sin(time + x * 0.01) * 3;
        const glowIntensity = Math.sin(time * 2 + x * 0.02) * 0.3 + 0.4;
        
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, height);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.35 * glowIntensity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Add glow effect
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(139, 92, 246, ${0.5 * glowIntensity})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw horizontal lines with increased opacity
      for (let y = 0; y <= height; y += gridSize) {
        const offset = Math.sin(time + y * 0.01) * 3;
        const glowIntensity = Math.sin(time * 2 + y * 0.02) * 0.3 + 0.4;
        
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(width, y + offset);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.35 * glowIntensity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Add glow effect
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(59, 130, 246, ${0.5 * glowIntensity})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw and update particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));

        // Pulsing opacity
        const pulse = Math.sin(time * 3 + particle.x * 0.01) * 0.3 + 0.7;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity * pulse})`;
        ctx.fill();

        // Add glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(139, 92, 246, ${particle.opacity * pulse * 0.8})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connection lines between nearby particles
        particles.forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            const lineOpacity = (1 - distance / 150) * 0.15 * pulse;
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
            ctx.lineWidth = 1;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      style={{ mixBlendMode: 'screen', minWidth: '100%' }}
    />
  );
};

