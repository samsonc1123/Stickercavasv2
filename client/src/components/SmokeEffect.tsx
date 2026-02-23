import { useState, useEffect, useRef } from 'react';
import ashtrayImg from '../assets/images/lit-backwoods.png';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface SmokeEffectProps {
  isRevealActive?: boolean;
}

export default function SmokeEffect({ isRevealActive = false }: SmokeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const swipeForce = useRef({ vx: 0, vy: 0, lastX: 0, lastY: 0, active: 0 });
  const isRevealActiveRef = useRef(isRevealActive);

  // Update ref when prop changes
  useEffect(() => {
    isRevealActiveRef.current = isRevealActive;
  }, [isRevealActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let lightSweep = { y: -100, active: false, opacity: 0 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Swipe handling
    const handleMove = (x: number, y: number) => {
      const dx = x - lastTouch.x;
      const dy = y - lastTouch.y;
      
      swipeForce.current = { 
        vx: dx * 0.2, 
        vy: dy * 0.2, 
        lastX: x,
        lastY: y,
        active: Date.now() + 400 
      };
      
      lastTouch = { x, y };
    };

    let lastTouch = { x: 0, y: 0 };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    // Light sweep timer
    const scheduleSweep = () => {
      const delay = 8000 + Math.random() * 4000;
      setTimeout(() => {
        lightSweep.active = true;
        lightSweep.y = -200;
        lightSweep.opacity = 0;
        scheduleSweep();
      }, delay);
    };
    scheduleSweep();

    const createParticle = () => {
      // Smoke originates from the entire bottom edge
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 1.5, // Faster horizontal spread for volume
        vy: -Math.random() * 2.5 - 1.5, // Faster rise potential
        size: Math.random() * 80 + 40, // Larger clouds like before
        alpha: Math.random() * 0.6 + 0.3, // More opaque like before
        life: 0,
        maxLife: Math.random() * 150 + 100 
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add particles - back to heavy volume (150 particles)
      if (particles.length < 150) {
        particles.push(createParticle());
      }

      const isSwipeActive = Date.now() < swipeForce.current.active;

      particles = particles.filter(p => {
        p.life++;
        
        // Basic drift - Slower global speed as requested
        // Even slower during reveal mode for "light haze" feel
        const speedMult = isRevealActiveRef.current ? 0.3 : 0.45;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        // Swipe reaction (Follow swipe direction, localized to finger size)
        if (isSwipeActive) {
          // Distance from particle to swipe point
          const dx = p.x - swipeForce.current.lastX;
          const dy = p.y - swipeForce.current.lastY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Localization: size of a fingerprint
          const fingerSize = 60;
          if (dist < fingerSize) {
            const force = (1 - dist / fingerSize) * 5; // Stronger push in localized area
            p.x += swipeForce.current.vx * force;
            p.y += swipeForce.current.vy * force;
          }
        }

        // Slight natural wobble
        p.vx += (Math.random() - 0.5) * 0.05;

        const lifeRatio = p.life / p.maxLife;
        // Fade opacity based on reveal mode
        const opacityMult = isRevealActiveRef.current ? 0 : 1.0;
        const currentAlpha = p.alpha * Math.sin(Math.PI * lifeRatio) * opacityMult;

        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.6})`);
        grad.addColorStop(0.3, `rgba(200, 220, 200, ${currentAlpha * 0.3})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return p.life < p.maxLife && p.y > -200;
      });

      // Update light sweep (Golden hue)
      if (lightSweep.active) {
        lightSweep.y += 4;
        if (lightSweep.y < canvas.height / 2) {
          lightSweep.opacity = Math.min(0.1, lightSweep.opacity + 0.005);
        } else {
          lightSweep.opacity = Math.max(0, lightSweep.opacity - 0.005);
        }
        
        if (lightSweep.y > canvas.height + 250) {
          lightSweep.active = false;
        }

        const gradient = ctx.createLinearGradient(0, lightSweep.y - 200, 0, lightSweep.y + 200);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(255, 215, 100, ${lightSweep.opacity})`); 
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ opacity: 0.9, zIndex: 100 }}
      />
    </>
  );
}
