import { useCallback, useEffect, useRef, useState } from 'react';

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(b.x - a.x, b.y - a.y);
const axisValue = (d: number, max: number, min: number, high: number) => Math.max(min, high - Math.abs(high * d / Math.max(max, 1)) + min);

export function TextPressure({ text, className = '', minFontSize = 24 }: { text: string; className?: string; minFontSize?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const eased = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(minFontSize);
  const chars = [...text];
  const setSize = useCallback(() => { if (root.current) setFontSize(Math.max(root.current.getBoundingClientRect().width / Math.max(chars.length / 1.85, 1), minFontSize)); }, [chars.length, minFontSize]);
  useEffect(() => { let timer = 0; const resize = () => { clearTimeout(timer); timer = window.setTimeout(setSize, 100); }; setSize(); addEventListener('resize', resize); return () => { removeEventListener('resize', resize); clearTimeout(timer); }; }, [setSize]);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spans.current.forEach((span) => { if (span) span.style.fontVariationSettings = "'wght' 560, 'wdth' 100, 'ital' 0"; });
      return;
    }
    const rect = root.current?.getBoundingClientRect();
    if (rect) eased.current = pointer.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const mouse = (e: PointerEvent) => { pointer.current = { x: e.clientX, y: e.clientY }; };
    const touch = (e: TouchEvent) => { const t = e.touches[0]; if (t) pointer.current = { x: t.clientX, y: t.clientY }; };
    let raf = 0;
    let last = 0;
    const animate = (now: number) => {
      eased.current.x += (pointer.current.x - eased.current.x) / 15;
      eased.current.y += (pointer.current.y - eased.current.y) / 15;
      if (now - last > 30) {
        last = now;
        const titleRect = title.current?.getBoundingClientRect();
        if (titleRect) spans.current.forEach((span) => { if (!span) return; const r = span.getBoundingClientRect(); const d = distance(eased.current, { x: r.x + r.width / 2, y: r.y + r.height / 2 }); const max = titleRect.width / 2; span.style.fontVariationSettings = `'wght' ${Math.floor(axisValue(d, max, 100, 900))}, 'wdth' ${Math.floor(axisValue(d, max, 30, 151))}, 'ital' ${Math.min(1, axisValue(d, max, 0, 1)).toFixed(2)}`; });
      }
      raf = requestAnimationFrame(animate);
    };
    addEventListener('pointermove', mouse, { passive: true }); addEventListener('touchmove', touch, { passive: true }); raf = requestAnimationFrame(animate);
    return () => { removeEventListener('pointermove', mouse); removeEventListener('touchmove', touch); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={root} className={`text-pressure ${className}`}><h1 ref={title} aria-label={text} style={{ fontSize }}>{chars.map((char, i) => <span key={`${char}-${i}`} ref={(el) => { spans.current[i] = el; }} aria-hidden="true">{char === ' ' ? '\u00a0' : char}</span>)}</h1></div>;
}
