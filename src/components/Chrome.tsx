import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollProgressFromPointer } from '../lib/ascii';

gsap.registerPlugin(ScrollTrigger);

const navGroups = [
  { label: 'About', links: [['Home', '#/'], ['Profile', '#/about'], ['Resume', '/assets/advaith-dabilipuram-resume.pdf']] },
  { label: 'Projects', links: [['Selected work', '#/projects'], ['GitHub', 'https://github.com/AdvaithD-572']] },
  { label: 'Contact', links: [['Email', 'mailto:dabilipuramadvaith@gmail.com'], ['LinkedIn', 'https://www.linkedin.com/in/advaith-dabilipuram/'], ['Contact page', '#/contact']] },
];

function TextRoll({ children }: { children: string }) {
  return <span className="text-roll" aria-label={children}>
    <span aria-hidden="true">{children}</span>
    <span aria-hidden="true">{children}</span>
  </span>;
}

export function CardNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !menuRef.current) return;
      const focusable = [...menuRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')];
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    addEventListener('keydown', handleKey);
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => removeEventListener('keydown', handleKey);
  }, [open]);

  return <header className={`card-nav ${open ? 'is-open' : ''}`}>
    <a className="monogram" href="#/" aria-label="Advaith Dabilipuram home">AD</a>
    <span className="nav-status">FULL-STACK / AI / MOBILE</span>
    <button ref={buttonRef} className="menu-toggle" onClick={() => setOpen(current => !current)} aria-expanded={open} aria-controls="site-menu">
      {open ? 'CLOSE' : 'MENU'} <span aria-hidden="true">{open ? '×' : '+'}</span>
    </button>
    <div ref={menuRef} id="site-menu" className="nav-cards" aria-hidden={!open}>
      {navGroups.map(group => <section key={group.label} className="nav-card">
        <p>{group.label}</p>
        {group.links.map(([label, href]) => {
          const external = href.startsWith('http');
          return <a key={label} href={href} tabIndex={open ? 0 : -1} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} onClick={() => setOpen(false)}>
            <TextRoll>{label}</TextRoll><small aria-hidden="true">↗</small>
          </a>;
        })}
      </section>)}
    </div>
  </header>;
}

export function ScrollThread() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const handleRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const draggingRef = useRef(false);

  const renderProgress = (progress: number) => {
    const next = Math.min(1, Math.max(0, progress));
    progressRef.current = next;
    fillRef.current?.style.setProperty('transform', `scaleY(${next})`);
    const travel = Math.max(0, (trackRef.current?.clientHeight ?? 170) - 9);
    handleRef.current?.style.setProperty('transform', `translateY(${next * travel}px)`);
    if (labelRef.current) labelRef.current.textContent = String(Math.round(next * 100)).padStart(2, '0');
    trackRef.current?.setAttribute('aria-valuenow', String(Math.round(next * 100)));
  };

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => renderProgress(self.progress),
      onRefresh: self => renderProgress(self.progress),
    });
    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    addEventListener('hashchange', refresh);
    renderProgress(ScrollTrigger.maxScroll(window) > 0 ? scrollY / ScrollTrigger.maxScroll(window) : 0);
    return () => { removeEventListener('hashchange', refresh); trigger.kill(); };
  }, []);

  const seek = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const progress = scrollProgressFromPointer(clientY, rect.top, rect.height);
    renderProgress(progress);
    scrollTo({ top: progress * ScrollTrigger.maxScroll(window), behavior: 'auto' });
  };

  const handleKey = (event: React.KeyboardEvent) => {
    const increments: Record<string, number> = { ArrowDown: 0.02, ArrowRight: 0.02, ArrowUp: -0.02, ArrowLeft: -0.02, PageDown: 0.1, PageUp: -0.1 };
    if (event.key !== 'Home' && event.key !== 'End' && increments[event.key] === undefined) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : progressRef.current + increments[event.key];
    const progress = Math.min(1, Math.max(0, next));
    scrollTo({ top: progress * ScrollTrigger.maxScroll(window), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return <div className="scroll-thread-wrap">
    <span ref={labelRef}>00</span>
    <div
      ref={trackRef}
      className="scroll-thread"
      role="slider"
      aria-label="Page scroll position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={0}
      onKeyDown={handleKey}
      onPointerDown={event => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        seek(event.clientY);
      }}
      onPointerMove={event => draggingRef.current && seek(event.clientY)}
      onPointerUp={() => { draggingRef.current = false; }}
      onPointerCancel={() => { draggingRef.current = false; }}
    ><i ref={fillRef} /><b ref={handleRef} /></div>
  </div>;
}

export function Crosshair() {
  const horizontalRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const setX = gsap.quickSetter(verticalRef.current, 'x', 'px');
    const setY = gsap.quickSetter(horizontalRef.current, 'y', 'px');
    const move = (event: PointerEvent) => { setX(event.clientX); setY(event.clientY); };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);
  return <div className="crosshair" aria-hidden="true"><div ref={horizontalRef} className="crosshair-h" /><div ref={verticalRef} className="crosshair-v" /></div>;
}

export { TextRoll };
