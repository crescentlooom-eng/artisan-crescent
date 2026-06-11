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
    }
    resize();
    window.addEventListener("resize", resize);

    function addRipple(x, y) {
      ripplesRef.current.push({
        x, y,
        radius: 0,
        maxRadius: Math.max(canvas.width, canvas.height) * 1.5,
        speed: 8,
        opacity: 1,
      });
    }

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Dark overlay base
      ctx.fillStyle = "#0B0E1A";
      ctx.fillRect(0, 0, W, H);

      // Draw image underneath with reveal mask
      if (imgRef.current && revealProgressRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(revealProgressRef.current, 0.85);

        // Draw image
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

        // Dark gradient overlay on image
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "rgba(11,14,26,0.5)");
        grad.addColorStop(0.5, "rgba(11,14,26,0.1)");
        grad.addColorStop(1, "rgba(11,14,26,0.9)");
        ctx.fillStyle = grad;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Ripples
      ripplesRef.current = ripplesRef.current.filter(r => r.radius < r.maxRadius);
      ripplesRef.current.forEach(r => {
        r.radius += r.speed;
        r.opacity = 1 - r.radius / r.maxRadius;

        // Gold ripple ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,169,110,${r.opacity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner glow
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,240,232,${r.opacity * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Update reveal progress based on ripple coverage
        const coverage = r.radius / r.maxRadius;
        if (coverage > revealProgressRef.current) {
          revealProgressRef.current = Math.min(coverage * 1.2, 1);
        }
      });

      // Ambient floating particles
      animRef._particles = animRef._particles || Array.from({ length: 30 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: -(Math.random() * 0.4 + 0.1),
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.3 + 0.05,
      }));

      animRef._particles.forEach(p => {
        p.y += p.vy;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${p.opacity})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

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
    const x = (touch.clientX - rect.left);
    const y = (touch.clientY - rect.top);
    ripplesRef.current.push({
      x, y,
      radius: 0,
      maxRadius: Math.max(canvas.width, canvas.height) * 1.5,
      speed: 6,
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
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-6 animate-pulse">
            Crescent Loom
          </div>
          <div className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] text-center leading-tight px-8">
            Tap to <span className="italic text-[#C9A96E]/90">reveal</span>
          </div>
          <div className="mt-6 text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">
            Touch anywhere
          </div>
          <div className="mt-4 w-px h-10 bg-gradient-to-b from-[#C9A96E]/60 to-transparent animate-pulse" />
        </div>
      )}

      {/* Content — shows after reveal */}
      <div
        className="absolute inset-0 flex flex-col justify-end pb-24 px-8 z-10 pointer-events-none"
        style={{
          opacity: revealProgressRef.current > 0.3 ? 1 : 0,
          transition: "opacity 1s ease",
        }}
      >
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">
          Autumn / Winter — Volume IV
        </div>
        <h1 className="font-serif-display text-5xl text-[#F5F0E8] leading-[0.95]">
          Woven in<br />
          <span className="italic text-[#C9A96E]/90">Moonlight</span>
        </h1>
        <p className="text-[#F5F0E8]/70 mt-4 text-sm leading-relaxed max-w-xs">
          A quiet wardrobe. Cut from natural fibers, made in small numbers.
        </p>
        <div className="mt-8 flex gap-4 pointer-events-auto">
          <Link to="/shop" className="btn-gold text-xs">Enter Collection</Link>
        </div>
      </div>
    </section>
  );
}
