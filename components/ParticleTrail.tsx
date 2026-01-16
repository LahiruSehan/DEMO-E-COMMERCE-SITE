
import React, { useEffect, useRef } from 'react';

const ParticleTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      life: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const createParticle = (x: number, y: number) => {
      const size = Math.random() * 3 + 1;
      const speedX = (Math.random() - 0.5) * 2;
      const speedY = (Math.random() - 0.5) * 2;
      const colors = ['#b48a3e', '#f9e1a9', '#ffffff', '#8a2be2'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({ x, y, size, speedX, speedY, color, life: 1 });
    };

    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < 5; i++) {
        createParticle(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.01;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a glow effect
        if (Math.random() > 0.95) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleTrail;
