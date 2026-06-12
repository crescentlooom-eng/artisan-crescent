import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ChapterCard({ to, imgSrc, imgAlt, chapter, title, subtitle, delay = 0, aspectClass = "aspect-[4/5]" }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [triggered, setTriggered] = useState(false);
  const animRef = useRef(null);
  const progressRef = useRef(0);
  const imgRef = useRef(null);
  const particlesRef = useRef([]);

  // Preload image
  useEffect(() => {
    if (!isMobile) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imgSrc;
    img.onload = () => { imgRef.current = img; };
  }, [imgSrc, isMobile]);

  // IntersectionObserver — trigger when card hits center of screen
  useEffect(() => {
    if (!isMobile || triggered) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setTriggered(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile, triggered, delay]);

  // Canvas animation
  useEffect(() => {
    if (!isMobile || !triggered) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Init particles
    const PARTICLE_COUNT = 180;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      targetX: Math.random() * W,
      targetY: Math.random() * H,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.025 + 0.01,
      color: Math.random() > 0.5
        ? `rgba(201,169,110,${Math.random() * 0.7 + 0.3})`
        : `rgba(245,240,232,${Math.random() * 0.5 + 0.2})`,
    }));

    let startTime = null;
    const duration = 1800; // ms

    function draw(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      progressRef.current = Math.min(elapsed / duration, 1);
      const p = progressRef.current;

      ctx.clearRect(0, 0, W, H);

      // Spotlight effect — grows from center
      const spotRadius = p * Math.max(W, H) * 0.85;
      const spotlight = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, spotRadius);
      spotlight.addColorStop(0, `rgba(0,0,0,0)`);
      spotlight.addColorStop(0.6, `rgba(0,0,0,${0.15 * (1 - p)})`);
      spotlight.addColorStop(1, `rgba(0,0,0,${0.95 * (1 - p * 0.7)})`);

      // Draw image with spotlight mask
      if (imgRef.current && p > 0.05) {
        ctx.save();
        ctx.globalAlpha = Math.min(p * 1.3, 1);
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
        ctx.restore();
      }

      // Spotlight overlay
      ctx.fillStyle = spotlight;
      ctx.fillRect(0, 0, W, H);

      // Particles — dissolve out as image reveals
      if (p < 0.85) {
        particlesRef.current.forEach(pt => {
          const particleOpacity = pt.opacity * (1 - p * 1.2);
          if (particleOpacity <= 0) return;
          ctx.beginPath();
          ctx.arc(
            pt.x + (pt.targetX - pt.x) * p * 0.5,
            pt.y + (pt.targetY - pt.y) * p * 0.5,
            pt.size * (1 - p * 0.8),
            0, Math.PI * 2
          );
          ctx.fillStyle = pt.color.replace(/[\d.]+\)$/, `${particleOpacity})`);
          ctx.fill();
        });
      }

      if (p < 1) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        // Animation done — show static image
        ctx.clearRect(0, 0, W, H);
        if (imgRef.current) {
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
        }
      }
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [triggered, isMobile]);

  // Desktop — plain image
  if (!isMobile) {
    return (
      <Link to={to} className="group block">
        <div className={`product-card-img-wrap ${aspectClass} mb-5`}>
          <img src={imgSrc} alt={imgAlt} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">{chapter}</div>
            <div className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8] mt-2">{title}</div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">{subtitle}</div>
          </div>
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/85 gold-underline">Explore</span>
        </div>
      </Link>
    );
  }

  // Mobile — cinematic canvas reveal
  return (
    <Link to={to} ref={sectionRef} className="group block">
      <div className={`relative ${aspectClass} mb-5 overflow-hidden bg-[#0A0E1A]`}>
        {/* Static image — hidden until animation starts */}
        {!triggered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]/40">
              {chapter}
            </div>
          </div>
        )}
        {/* Canvas for animation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: triggered ? "block" : "none" }}
        />
        {/* Fallback static image after animation */}
        {triggered && progressRef.current >= 1 && (
          <img src={imgSrc} alt={imgAlt} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Text — typewriter + fade */}
      <div className="flex items-end justify-between"
        style={{
          opacity: triggered ? 1 : 0,
          transform: triggered ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s",
        }}>
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">{chapter}</div>
          <div className="font-serif-display text-3xl text-[#F5F0E8] mt-2">{title}</div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">{subtitle}</div>
        </div>
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/85 gold-underline">Explore</span>
      </div>
    </Link>
  );
}
