import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { scrollProgressFromPointer } from '../lib/ascii';
import { pageScrollProgress, resetPageScroll, scrollToProgress } from '../lib/navigation';

const navGroups = [
  { label: 'About', links: [['Home', '#/'], ['Profile', '#/about'], ['Resume', '/assets/advaith-dabilipuram-resume.pdf']] },
  { label: 'Projects', links: [['Selected work', '#/projects'], ['GitHub', 'https://github.com/AdvaithD-572']] },
  { label: 'Contact', links: [['Email', 'mailto:dabilipuramadvaith@gmail.com'], ['LinkedIn', 'https://www.linkedin.com/in/advaith-dabilipuram/'], ['Contact page', '#/contact']] },
];

function TextRoll({ children }: { children: string }) {
  const characters = [...children];
  const line = (suffix: string) => characters.map((character, index) => {
    const delay = 0.035 * Math.abs(index - (characters.length - 1) / 2);
    return <span key={`${suffix}-${index}`} className="text-roll__char" style={{ transitionDelay: `${delay}s` }}>{character === ' ' ? '\u00a0' : character}</span>;
  });
  return <span className="text-roll" aria-label={children}>
    <span className="text-roll__line" aria-hidden="true">{line('a')}</span>
    <span className="text-roll__line text-roll__line--next" aria-hidden="true">{line('b')}</span>
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

  const close = () => setOpen(false);
  const internalNavigate = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    close();
    if (!href.startsWith('#/')) return;
    if (location.hash === href) {
      event.preventDefault();
      resetPageScroll();
      dispatchEvent(new Event('portfolio:scroll-reset'));
    }
  };

  return <header className={`card-nav ${open ? 'is-open' : ''}`}>
    <button ref={buttonRef} className="menu-toggle" onClick={() => setOpen(current => !current)} aria-expanded={open} aria-controls="site-menu">
      {open ? 'CLOSE' : 'MENU'} <span aria-hidden="true">{open ? '×' : '+'}</span>
    </button>
    <button className="nav-backdrop" aria-label="Close navigation" tabIndex={open ? 0 : -1} onClick={close} hidden={!open} />
    <div ref={menuRef} id="site-menu" className="nav-cards" aria-hidden={!open} hidden={!open}>
      {navGroups.map(group => <section key={group.label} className="nav-card">
        <p>{group.label}</p>
        {group.links.map(([label, href]) => {
          const external = href.startsWith('http');
          return <a key={label} href={href} tabIndex={open ? 0 : -1} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} onClick={(event) => internalNavigate(event, href)}>
            <TextRoll>{label}</TextRoll><small aria-hidden="true">↗</small>
          </a>;
        })}
      </section>)}
    </div>
  </header>;
}

export function ScrollThread() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const draggingRef = useRef(false);

  const renderProgress = (progress: number) => {
    const next = Math.min(1, Math.max(0, progress));
    progressRef.current = next;
    progressPathRef.current?.style.setProperty('stroke-dashoffset', String(1 - next));
    const path = pathRef.current;
    const handle = handleRef.current;
    if (path && handle) {
      const point = path.getPointAtLength(path.getTotalLength() * next);
      handle.setAttribute('cx', String(point.x));
      handle.setAttribute('cy', String(point.y));
    }
    if (labelRef.current) labelRef.current.textContent = String(Math.round(next * 100)).padStart(2, '0');
    trackRef.current?.setAttribute('aria-valuenow', String(Math.round(next * 100)));
  };

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => renderProgress(pageScrollProgress()));
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    addEventListener('hashchange', update);
    addEventListener('portfolio:scroll-reset', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
      removeEventListener('hashchange', update);
      removeEventListener('portfolio:scroll-reset', update);
    };
  }, []);

  const seek = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const progress = scrollProgressFromPointer(clientY, rect.top, rect.height);
    renderProgress(progress);
    scrollToProgress(progress);
  };

  const handleKey = (event: React.KeyboardEvent) => {
    const increments: Record<string, number> = { ArrowDown: 0.02, ArrowRight: 0.02, ArrowUp: -0.02, ArrowLeft: -0.02, PageDown: 0.1, PageUp: -0.1 };
    if (event.key !== 'Home' && event.key !== 'End' && increments[event.key] === undefined) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : progressRef.current + increments[event.key];
    const progress = Math.min(1, Math.max(0, next));
    renderProgress(progress);
    scrollToProgress(progress, matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  };

  return <div className="scroll-thread-wrap">
    <span ref={labelRef} className="scroll-thread__label">00</span>
    <div
      ref={trackRef}
      className="scroll-thread"
      role="slider"
      aria-label="Page scroll position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-orientation="vertical"
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
    >
      <svg viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
        <path ref={pathRef} className="scroll-thread__track" pathLength="1" d="M42 18 C7 55 71 91 35 132 C5 166 68 211 41 252 C13 294 70 331 36 378 C8 418 69 456 43 506 C17 551 72 589 36 637 C6 679 68 725 41 770 C15 818 72 857 35 906 C16 936 53 958 40 982" />
        <path ref={progressPathRef} className="scroll-thread__progress" pathLength="1" d="M42 18 C7 55 71 91 35 132 C5 166 68 211 41 252 C13 294 70 331 36 378 C8 418 69 456 43 506 C17 551 72 589 36 637 C6 679 68 725 41 770 C15 818 72 857 35 906 C16 936 53 958 40 982" />
        <circle ref={handleRef} className="scroll-thread__handle" cx="42" cy="18" r="6" />
      </svg>
    </div>
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
