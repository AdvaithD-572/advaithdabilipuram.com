import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { scrollProgressFromPointer } from '../lib/ascii';
import { pageScrollProgress, resetPageScroll, scrollToProgress } from '../lib/navigation';
import { flowRevealHeight } from '../lib/scroll-thread';

const FLOW_HEIGHT = 2669;
const FLOW_PATH = 'M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89';

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
  const revealRef = useRef<SVGRectElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const draggingRef = useRef(false);

  const renderProgress = (progress: number) => {
    const next = Math.min(1, Math.max(0, progress));
    progressRef.current = next;
    revealRef.current?.setAttribute('height', String(flowRevealHeight(next, FLOW_HEIGHT)));
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
      draggingRef.current = false;
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
      onLostPointerCapture={() => { draggingRef.current = false; }}
    >
      <svg viewBox={`0 0 1278 ${FLOW_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
        <defs><clipPath id="scroll-thread-reveal"><rect ref={revealRef} x="0" y="0" width="1278" height="0" /></clipPath></defs>
        <path className="scroll-thread__hit" d={FLOW_PATH} />
        <path className="scroll-thread__track" d={FLOW_PATH} />
        <path className="scroll-thread__progress" clipPath="url(#scroll-thread-reveal)" d={FLOW_PATH} />
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
