import React, { useEffect, useState } from "react";

export default function CursorDot() {
  const [pos, setPos] = useState({ x: -50, y: -50 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFine) return;
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const onOver = (e) => {
      const t = e.target;
      const interactive = t.closest && t.closest('a, button, [role="button"], input, textarea, select, [data-cursor="hover"]');
      setHover(!!interactive);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return <div className={"cursor-dot" + (hover ? " hover" : "")} style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }} />;
}
