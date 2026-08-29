import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPressure } from './TextPressure';
import { AsciiMatrixBackground } from './AsciiMatrixBackground';

gsap.registerPlugin(ScrollTrigger);

export function RouteIntro({ label, portrait = false }: { label: string; portrait?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const parallax = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const section = root.current;
    const backdrop = parallax.current;
    const foreground = content.current;
    const page = section?.nextElementSibling instanceof HTMLElement ? section.nextElementSibling : null;
    if (!section || !backdrop || !foreground || !page) return;

    gsap.set([backdrop, foreground, page], { clearProps: 'transform,opacity,clipPath,transformOrigin' });
    if (reduce) return () => gsap.set([backdrop, foreground, page], { clearProps: 'transform,opacity,clipPath,transformOrigin' });

    const ctx = gsap.context(() => {
      const exitScroll = () => ({ trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true });

      gsap.fromTo(backdrop, { yPercent: 0 }, {
        yPercent: 7.5,
        ease: 'none',
        scrollTrigger: exitScroll(),
      });

      gsap.fromTo(foreground, { y: 0, opacity: 1 }, {
        y: -30,
        opacity: 0,
        ease: 'none',
        scrollTrigger: exitScroll(),
      });

      gsap.fromTo(page, {
        clipPath: 'inset(0% 50%)',
        scale: 1.3,
        transformOrigin: '50% 0%',
      }, {
        clipPath: 'inset(0% 0%)',
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom 35%',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => {
      ctx.revert();
      gsap.set([backdrop, foreground, page], { clearProps: 'transform,opacity,clipPath,transformOrigin' });
    };
  }, [label]);
  return <section ref={root} className={`route-intro ${portrait ? 'route-intro--portrait' : ''}`} aria-label={`${label} introduction`}>
    <div className="route-intro__sticky">
      <div ref={parallax} className="route-intro__parallax" aria-hidden="true">
        {portrait ? <AsciiMatrixBackground /> : <span className="route-intro__ghost">{label}</span>}
      </div>
      <div ref={content} className="route-intro__content">
        <p className="route-intro__eyebrow">{label === 'ADVAITH' ? 'SOFTWARE PORTFOLIO' : "ADVAITH'S"}</p>
        <TextPressure text={label} />
      </div>
    </div>
  </section>;
}
