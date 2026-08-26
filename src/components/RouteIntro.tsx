import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPressure } from './TextPressure';
import { AsciiMatrixBackground } from './AsciiMatrixBackground';

gsap.registerPlugin(ScrollTrigger);

export function RouteIntro({ label, portrait = false }: { label: string; portrait?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !root.current || !title.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(title.current, { scale: 1, opacity: 1 }, { scale: 18, opacity: 0, ease: 'power2.in', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: .7 } });
    }, root);
    return () => ctx.revert();
  }, [label]);
  return <section ref={root} className={`route-intro ${portrait ? 'route-intro--portrait' : ''}`} aria-label={`${label} introduction`}><div className="route-intro__sticky" ref={title}>{portrait && <AsciiMatrixBackground />}<p>{label === 'ADVAITH' ? 'SOFTWARE PORTFOLIO' : "ADVAITH'S"}</p><TextPressure text={label} /></div></section>;
}
