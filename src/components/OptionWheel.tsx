import { useCallback, useEffect, useRef, useState } from 'react';

export function OptionWheel({ items, selected, onChange }: { items: string[]; selected: number; onChange: (index: number) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const target = useRef(selected);
  const current = useRef(selected);
  const frame = useRef(0);
  const dragging = useRef<{ y: number; start: number } | null>(null);
  const layout = useCallback(() => {
    current.current += (target.current - current.current) * .16;
    const settled = Math.abs(target.current - current.current) < .002;
    if (settled) current.current = target.current;
    refs.current.forEach((el, index) => {
      if (!el) return;
      const d = index - current.current;
      const angle = Math.max(-1.35, Math.min(1.35, d * .24));
      const radius = 190;
      el.style.transform = `translate(${(-radius * (1 - Math.cos(angle))).toFixed(2)}px, calc(${(radius * Math.sin(angle)).toFixed(2)}px - 50%)) rotate(${(angle * 28).toFixed(2)}deg)`;
      el.style.opacity = String(Math.max(.08, 1 - Math.abs(d) * .23));
      el.style.filter = `blur(${Math.max(0, Math.abs(d) - .45) * 1.2}px)`;
    });
    if (!settled) frame.current = requestAnimationFrame(layout);
  }, []);
  const set = useCallback((index: number) => { const next = Math.max(0, Math.min(items.length - 1, index)); target.current = next; onChange(Math.round(next)); cancelAnimationFrame(frame.current); frame.current = requestAnimationFrame(layout); }, [items.length, layout, onChange]);
  useEffect(() => { target.current = selected; cancelAnimationFrame(frame.current); frame.current = requestAnimationFrame(layout); return () => cancelAnimationFrame(frame.current); }, [selected, layout]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => { e.preventDefault(); set(Math.round(target.current + Math.sign(e.deltaY))); };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [set]);
  return <div ref={root} className="option-wheel" role="listbox" aria-label="Select a project" aria-activedescendant={`project-option-${selected}`} tabIndex={0} onKeyDown={(e) => { if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); set(selected + 1); } if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); set(selected - 1); } }} onPointerDown={(e) => { dragging.current = { y: e.clientY, start: selected }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (dragging.current) set(Math.round(dragging.current.start - (e.clientY - dragging.current.y) / 58)); }} onPointerUp={() => { dragging.current = null; }}>
    {items.map((label, index) => <button id={`project-option-${index}`} key={label} ref={(el) => { refs.current[index] = el; }} role="option" tabIndex={-1} aria-selected={selected === index} className={selected === index ? 'is-selected' : ''} onClick={() => set(index)}>{label}</button>)}
  </div>;
}
