import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MagneticHero() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const particles = [];

      // Crescent moon shape
      const total = 280;
      for (let i = 0; i < total; i++) {
        const angle = (i / total) * Math.PI * 2;
        const layer = Math.floor(i / 40);
        const radius = 80 + layer * 22 + Math.random() * 12;

        // Outer circle
        const ox = cx + Math.cos(angle) * radius;
        const oy = cy + Math.sin(angle) * radius;

        // Inner offset circle (creates crescent cutout)
        const innerRadius = radius * 0.72;
        const offsetX = cx + 38;
        const innerX = offsetX + Math.cos(angle) * innerRadius;
        const innerY = cy + Math.sin(angle) * innerRadius;

        // Only keep points outside the inner circle = crescent shape
        const distFromInner = Math.sqrt(
          Math.pow(ox - offsetX, 2) + Math.pow(oy - cy, 2)
        );

        if (distFromInner > innerRadius - 10) {
          const gold = Math.random();
          particles.push({
            x: ox,
            y: oy,
            originX: ox,
            originY: oy,
            size: Math.random() * 2.2 + 0.5,
            color:
              gold > 0.7
                ? `rgba(201,169,110,${Math.random() * 0.6 + 0.4})`
                : gold > 0.4
                ? `rgba(245,240,232,${Math.random() * 0.5 + 0.3})`
                : `rgba(184,145,74,${Math.random() * 0.4 + 0.3})`,
            vx: 0,
            vy: 0,
            mass: Math.random() * 0.4 + 0.6,
          });
        }
      }

      // Scattered ambient stars
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          size: Math.random() * 1 + 0.2,
          color: `rgba(201,169,110,${Math.random() * 0.25 + 0.05})`,
          vx: 0,
          vy: 0,
          mass: Math.random() * 0.2 + 0.1,
          ambient: true,
        });
      }

      particlesRef.current = particles;
    }

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = "rgba(10,15,26,0.18)";
      ctx.fillRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach((p) => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const magnetRadius = p.ambient ? 120 : 200;
        const force = p.ambient ? 0.025 : 0.07;

        if (dist < magnetRadius && dist > 0) {
          const strength = ((magnetRadius - dist) / magnetRadius) * force;
          p.vx += (dx / dist) * strength * p.mass;
          p.vy += (dy / dist) * strength * p.mass;
        }

        // Spring back to origin
        const returnX = (p.originX - p.x) * 0.04;
        const returnY = (p.originY - p.y) * 0.04;
        p.vx += returnX;
        p.vy += returnY;

        // Damping
        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Central glow
      const glow = ctx.createRadialGradient(
        W / 2, H / 2, 0,
        W / 2, H / 2, 160
      );
      glow.addColorStop(0, "rgba(201,169,110,0.06)");
      glow.addColorStop(1, "rgba(10,15,26,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener("mousemove", handleMouse);
    window.addEventListener("mousemove", handleMouse);

    // Start dark, fade in
    ctx.fillStyle = "#0A0F1A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0A0F1A]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {/* Brand label */}
        <div className="text-[10px] tracking-[0.5em] uppercase text-[#C9A96E]/70 mb-16">
          Crescent Loom
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 pb-20 px-12 z-10 flex items-end justify-between">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">
            Subtle By Design
          </div>
          <h1 className="font-serif-display text-6xl xl:text-7xl text-[#F5F0E8] leading-[0.92]">
            Crafted For The<br />
            <span className="italic text-[#C9A96E]/90">Modern Chapter</span>
          </h1>
          <p className="text-[#8A8FA8] mt-5 text-sm tracking-wide max-w-sm leading-relaxed">
            Timeless essentials designed with intention.
          </p>
          <div className="mt-8 flex gap-4 pointer-events-auto">
            <Link
              to="/shop"
              className="text-[11px] tracking-[0.3em] uppercase text-[#0A0F1A] bg-[#C9A96E] px-8 py-3 hover:bg-[#B8914A] transition-colors"
            >
              Explore Collection
            </Link>
            <Link
              to="/shop?category=polo"
              className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] border border-[#C9A96E]/40 px-8 py-3 hover:border-[#C9A96E] transition-colors"
            >
              Shop Chapter I
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className="text-[9px] tracking-[0.4em] uppercase text-[#8A8FA8] rotate-90 mb-4">
            Scroll
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-[#C9A96E]/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
