import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const HERO_IMG = "https://images.unsplash.com/photo-1609062757924-6c2d01b3b422?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBlZGl0b3JpYWwlMjBmYXNoaW9uJTIwbW9vZHklMjBkYXJrfGVufDB8fHx8MTc4MDgyODI0OHww&ixlib=rb-4.1.0&q=85";

export default function WeaveHero() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const imgRef = useRef(null);
  const [done, setDone] = useState(false);

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

    let animId;
    let startTime = null;
    const DURATION = 3200; // ms for full weave

    // Threads: horizontal lines from left, vertical lines from top
    const NUM_H = 28;
    const NUM_V = 18;

    function drawImageCover(ctx, img, x, y, w, h) {
      const imgAspect = img.width / img.height;
      const boxAspect = w / h;
      let sx, sy, sw, sh;
      if (imgAspect > boxAspect) {
        sh = img.height;
        sw = sh * boxAspect;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / boxAspect;
        sx = 0;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }

    function draw(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background dark
      ctx.fillStyle = "#0B0E1A";
      ctx.fillRect(0, 0, W, H);

     const cellW = W / NUM_V;
      const cellH = H / NUM_H;

      // Draw image clipped by woven thread mask
      if (imgRef.current) {
        ctx.save();

        // Build clip path from threads
        ctx.beginPath();

        // Horizontal threads (reveal left to right)
        for (let i = 0; i < NUM_H; i++) {
          const y = i * cellH;
          const threadProgress = Math.max(0, Math.min(1, (eased * 1.4) - (i / NUM_H) * 0.3));
          const w = W * threadProgress;
          ctx.rect(0, y, w, cellH);
        }

        // Vertical threads (reveal top to bottom)
        for (let i = 0; i < NUM_V; i++) {
          const x = i * cellW;
          const threadProgress = Math.max(0, Math.min(1, (eased * 1.4) - (i / NUM_V) * 0.3));
          const h = H * threadProgress;
          ctx.rect(x, 0, cellW, h);
        }

        ctx.clip();
        drawImageCover(ctx, imgRef.current, 0, 0, W, H);

        // Dark gradient overlay
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "rgba(11,14,26,0.45)");
        grad.addColorStop(0.5, "rgba(11,14,26,0.15)");
        grad.addColorStop(1, "rgba(11,14,26,0.9)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.restore();
      }

      // Draw gold thread lines on top (fading out as they finish)
      const threadOpacity = Math.max(0, 1 - eased * 1.3);
      if (threadOpacity > 0.01) {
        ctx.strokeStyle = `rgba(201,169,110,${threadOpacity * 0.5})`;
        ctx.lineWidth = 1;

        for (let i = 0; i <= NUM_H; i++) {
          const y = i * cellH;
          const threadProgress = Math.max(0, Math.min(1, (eased * 1.4) - (i / NUM_H) * 0.3));
          const w = W * threadProgress;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
          // Leading edge glow
          if (w > 0 && w < W) {
            ctx.beginPath();
            ctx.arc(w, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,169,110,${threadOpacity})`;
            ctx.fill();
          }
        }

        for (let i = 0; i <= NUM_V; i++) {
          const x = i * cellW;
          const threadProgress = Math.max(0, Math.min(1, (eased * 1.4) - (i / NUM_V) * 0.3));
          const h = H * threadProgress;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
          if (h > 0 && h < H) {
            ctx.beginPath();
            ctx.arc(x, h, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,169,110,${threadOpacity})`;
            ctx.fill();
          }
        }
      }

      if (progress < 1) {
        animId = requestAnimationFrame(draw);
      } else {
        setDone(true);
      }
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-[#0B0E1A]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Content fades in after weave completes */}
      <div
        className="absolute inset-0 flex flex-col items-start justify-end pb-20 px-8 md:px-16 z-10"
        style={{
          opacity: done ? 1 : 0,
          transform: done ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
        }}
      >
        <div className="text-[11px] tracking-[0.5em] uppercase text-[#C9A96E] mb-4">
          Autumn / Winter — Volume IV
        </div>
        <h1 className="font-serif-display text-6xl md:text-8xl text-[#F5F0E8] leading-[0.95]">
          Woven in<br />
          <span className="italic text-[#C9A96E]/90">Moonlight</span>
        </h1>
        <p className="text-[#F5F0E8]/70 mt-6 text-base md:text-lg leading-relaxed max-w-md font-light">
          A quiet wardrobe. Cut from natural fibers, made in small numbers, intended to last beyond the season.
        </p>
        <div className="mt-8 flex gap-6">
          <Link to="/shop" className="btn-gold text-xs">Enter the Collection</Link>
          <Link to="/about" className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/60 gold-underline self-center">Our Philosophy</Link>
        </div>
        <div className="mt-12 text-[11px] tracking-[0.4em] uppercase text-[#C9A96E]/50">
          Crescent Loom
        </div>
      </div>
    </section>
  );
}
