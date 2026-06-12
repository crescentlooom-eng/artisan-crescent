import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HERO_IMG = "https://images.unsplash.com/photo-1609062757924-6c2d01b3b422?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBlZGl0b3JpYWwlMjBmYXNoaW9uJTIwbW9vZHklMjBkYXJrfGVufDB8fHx8MTc4MDgyODI0OHww&ixlib=rb-4.1.0&q=85";

export default function MobileHero() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const ripplesRef = useRef([]);
  const animRef = useRef(null);
  const imgRef = useRef(null);
  const revealProgressRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = HERO_IMG;
    img.onload = () => { imgRef.current = img; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      // Init ambient particles
      particlesRef.current = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: -(Math.random() * 0.3 + 0.08),
        size: Math.random() * 1.4 + 0.2,
        opacity: Math.random() * 0.25 + 0.04,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    let lastTime = 0;

    function draw(timestamp) {
      const delta = Math.min(timestamp - lastTime, 32); // cap at 32ms
      lastTime = timestamp;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Base dark bg
      ctx.fillStyle = "#0B0E1A";
      ctx.fillRect(0, 0, W, H);

      // Draw image with reveal
      if (imgRef.current && revealProgressRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(revealProgressRef.current * 1.1, 0.88);
        const imgAspect = imgRef.current.width / imgRef.current.height;
        const canvasAspect = W / H;
        let sx = 0, sy = 0, sw = imgRef.current.width, sh = imgRef.current.height;
        if (imgAspect > canvasAspect) {
          sw = sh * canvasAspect;
          sx = (imgRef.current.width - sw) / 2;
        } else {
          sh = sw / canvasAspect;
          sy = (imgRef.current.height - sh) / 2;
        }
        ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, W, H);

        // Gradient overlay
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "rgba(11,14,26,0.35)");
        grad.addColorStop(0.4, "rgba(11,14,26,0.05)");
        grad.addColorStop(0.75, "rgba(11,14,26,0.5)");
        grad.addColorStop(1, "rgba(11,14,26,0.92)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Ripples — smooth with delta
      ripplesRef.current = ripplesRef.current.filter(r => r.radius < r.maxRadius);
      ripplesRef.current.forEach(r => {
        r.radius += r.speed * (delta / 16);
        r.opacity = Math.pow(1 - r.radius / r.maxRadius, 1.5);

        // Outer gold ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,169,110,${r.opacity * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Middle ring
        if (r.radius > 20) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245,240,232,${r.opacity * 0.18})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Inner glow dot
        if (r.radius < 60) {
          const innerGlow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 30);
          innerGlow.addColorStop(0, `rgba(201,169,110,${r.opacity * 0.3})`);
          innerGlow.addColorStop(1, "rgba(201,169,110,0)");
          ctx.fillStyle = innerGlow;
          ctx.beginPath();
          ctx.arc(r.x, r.y, 30, 0, Math.PI * 2);
          ctx.fill();
        }

        const coverage = r.radius / r.maxRadius;
        if (coverage > revealProgressRef.current) {
          revealProgressRef.current = Math.min(coverage * 1.15, 1);
        }
      });

      // Ambient particles
      particlesRef.current.forEach(p => {
        p.y += p.vy * (delta / 16);
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${p.opacity})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleTap = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ripplesRef.current.push({
      x, y,
      radius: 0,
      maxRadius: Math.max(canvas.width, canvas.height) * 1.6,
      speed: 5,
      opacity: 1,
    });
    if (!revealed) setRevealed(true);
  };

  return (
    <section
      ref={heroRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#0B0E1A]"
      onTouchStart={handleTap}
      onClick={handleTap}
      style={{ cursor: "crosshair" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Tap hint — hidden after first tap */}
      {!revealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="text-[10px] tracking-[0.5em] uppercase text-[#C9A96E] mb-5 animate-pulse">
            Crescent Loom
          </div>
          <div className="font-serif-display text-4xl text-[#F5F0E8] text-center leading-tight px-8">
            Tap to <span className="italic text-[#C9A96E]/90">reveal</span>
          </div>
          <div className="mt-4 text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">
            Touch anywhere
          </div>
          <div className="mt-4 w-px h-10 bg-gradient-to-b from-[#C9A96E]/60 to-transparent animate-pulse" />
        </div>
      )}

      {/* Always visible bottom content */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 px-8 z-10">
        {/* Tagline — always visible */}
        <div
          className="font-serif-display text-5xl text-[#F5F0E8] leading-tight mb-2"
          style={{
            opacity: revealed ? 1 : 0.15,
            transition: "opacity 1.2s ease",
          }}
        >
          Beyond
        </div>
        <div
          className="font-serif-display text-5xl italic text-[#C9A96E] leading-tight mb-6"
          style={{
            opacity: revealed ? 1 : 0.15,
            transition: "opacity 1.4s ease",
          }}
        >
          Comparison.
        </div>

        {/* Subtext */}
        <p
          className="text-[#F5F0E8]/65 text-sm leading-relaxed mb-8 max-w-xs"
          style={{
            opacity: revealed ? 1 : 0,
            transition: "opacity 1.6s ease",
          }}
        >
          Timeless essentials designed with intention.
        </p>

        {/* CTA Button */}
        <div
          className="pointer-events-auto"
          style={{
            opacity: revealed ? 1 : 0.2,
            transition: "opacity 1.8s ease",
          }}
        >
          <Link
            to="/shop"
            className="inline-block text-[11px] tracking-[0.35em] uppercase text-[#0B0E1A] bg-[#C9A96E] px-10 py-4 hover:bg-[#B8914A] active:bg-[#A07840] transition-colors"
            onClick={e => e.stopPropagation()}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
