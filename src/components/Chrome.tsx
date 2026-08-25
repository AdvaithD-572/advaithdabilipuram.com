import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { scrollProgressFromPointer } from '../lib/ascii';

const navGroups = [
  { label: 'Profile', links: [['Home', '#/'], ['Capabilities', '#/skills']] },
  { label: 'Projects', links: [['Selected work', '#/projects'], ['GitHub', 'https://github.com/AdvaithD-572']] },
  { label: 'Connect', links: [['Contact', '#/contact'], ['Email', 'mailto:dabilipuramadvaith@gmail.com'], ['LinkedIn', 'https://www.linkedin.com/in/advaith-dabilipuram/'], ['Résumé', '/assets/advaith-dabilipuram-resume.pdf']] },
];

function Roll({ children }: { children: string }) {
  return <span className="text-roll" aria-label={children}><span aria-hidden="true">{children}</span><span aria-hidden="true">{children}</span></span>;
}

export function CardNav() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); button.current?.focus(); return; }
      if (e.key !== 'Tab' || !menu.current) return;
      const focusable = [...menu.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    addEventListener('keydown', handleKey);
    menu.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => removeEventListener('keydown', handleKey);
  }, [open]);
  return <header className={`card-nav ${open ? 'is-open' : ''}`}>
    <a className="monogram" href="#/" aria-label="Advaith Dabilipuram home">AD</a>
    <span className="nav-status"><i /> AVAILABLE FOR OPPORTUNITIES</span>
    <button ref={button} className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-menu">{open ? 'CLOSE' : 'MENU'} <span aria-hidden="true">{open ? '×' : '+'}</span></button>
    <div ref={menu} id="site-menu" className="nav-cards" aria-hidden={!open}>
      {navGroups.map((group) => <section key={group.label} className="nav-card"><p>{group.label}</p>{group.links.map(([label, href]) => <a key={label} href={href} tabIndex={open ? 0 : -1} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} onClick={() => setOpen(false)}><Roll>{label}</Roll><small>↗</small></a>)}</section>)}
    </div>
  </header>;
}

export function ScrollThread() {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const dragging = useRef(false);
  const update = useCallback(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    setProgress(max > 0 ? scrollY / max : 0);
  }, []);
  useEffect(() => { update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); return () => { removeEventListener('scroll', update); removeEventListener('resize', update); }; }, [update]);
  const seek = (clientY: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    const p = scrollProgressFromPointer(clientY, rect.top, rect.height);
    scrollTo({ top: p * (document.documentElement.scrollHeight - innerHeight), behavior: 'auto' });
  };
  const key = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: .02, ArrowRight: .02, ArrowUp: -.02, ArrowLeft: -.02, PageDown: .1, PageUp: -.1 };
    if (e.key === 'Home' || e.key === 'End' || map[e.key] !== undefined) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : Math.min(1, Math.max(0, progress + map[e.key])); scrollTo({ top: next * (document.documentElement.scrollHeight - innerHeight), behavior: 'smooth' }); }
  };
  return <div className="scroll-thread-wrap"><span>{String(Math.round(progress * 100)).padStart(2, '0')}</span><div ref={track} className="scroll-thread" role="slider" aria-label="Page scroll position" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} tabIndex={0} onKeyDown={key} onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); seek(e.clientY); }} onPointerMove={(e) => dragging.current && seek(e.clientY)} onPointerUp={() => { dragging.current = false; }}><i style={{ height: `${progress * 100}%` }} /><b style={{ top: `calc(${progress * 100}% - 4px)` }} /></div></div>;
}

export function Crosshair() {
  const h = useRef<HTMLDivElement>(null);
  const v = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const setX = gsap.quickSetter(v.current, 'x', 'px');
    const setY = gsap.quickSetter(h.current, 'y', 'px');
    const move = (e: PointerEvent) => { setX(e.clientX); setY(e.clientY); };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);
  return <div className="crosshair" aria-hidden="true"><div ref={h} className="crosshair-h" /><div ref={v} className="crosshair-v" /></div>;
}
