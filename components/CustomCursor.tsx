'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };

    const onMouseMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.x - 4}px, ${pos.y - 4}px)`;
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    let raf: number;
    const animateRing = () => {
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x - 20}px, ${ring.y - 20}px)`;
      }
      raf = requestAnimationFrame(animateRing);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        const isInteractive = target.closest('a, button, [role="tab"], [role="button"], input, textarea, select, .fluxx-interactive');
        setIsHovering(!!isInteractive);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver);
    raf = requestAnimationFrame(animateRing);

    document.documentElement.style.cursor = 'none';
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = `
      a, button, [role="tab"], [role="button"], input, textarea, select, .fluxx-interactive {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = '';
      const existingStyle = document.getElementById('custom-cursor-style');
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#fff',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{
          width: isHovering ? 48 : 40,
          height: isHovering ? 48 : 40,
          borderRadius: '50%',
          border: `1.5px solid ${isHovering ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.25)'}`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s, width 0.2s ease, height 0.2s ease, border-color 0.2s',
          background: isHovering ? 'rgba(99,102,241,0.06)' : 'transparent',
        }}
      />
    </>
  );
}
