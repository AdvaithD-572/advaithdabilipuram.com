import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { destinationOffset, sectionTarget } from './motion';

const items = [['home', 'Home'], ['intro', 'Intro'], ['projects', 'Projects'], ['about', 'More about me'], ['services', 'Services'], ['contact', 'Contact']];

export function Navigation({ reducedMotion }: { reducedMotion: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Home');
  const [lightWorld, setLightWorld] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const transition = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const close = () => { dialog.current?.close(); setOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(entry => entry.isIntersecting);
      if (entry) {
        setActive(entry.target.getAttribute('data-world-label') ?? 'Home');
        setLightWorld(['about', 'skills'].includes(entry.target.id));
      }
    }, { rootMargin: '-15% 0px -75% 0px' });
    document.querySelectorAll('[data-world-label]').forEach(section => observer.observe(section));
    const worldChange = (event: Event) => {
      const world = (event as CustomEvent<{ label: string; light: boolean }>).detail;
      setActive(world.label); setLightWorld(world.light);
    };
    addEventListener('experience:world', worldChange);
    return () => { observer.disconnect(); animation.current?.kill(); removeEventListener('experience:world', worldChange); };
  }, []);

  const navigate = (id: string, label: string) => {
    close();
    dispatchEvent(new Event('experience:skip-intro'));
    animation.current?.kill();
    const arrive = () => {
      const target = document.getElementById(id);
      window.scrollTo({ top: destinationOffset(id, reducedMotion), behavior: 'instant' });
      ScrollTrigger.update();
      history.pushState(null, '', `/#${id}`);
      setActive(label);
      target?.focus({ preventScroll: true });
    };
    if (reducedMotion || !transition.current) { arrive(); return; }
    const title = transition.current.querySelector('span');
    if (title) title.textContent = label;
    animation.current = gsap.timeline()
      .set(transition.current, { visibility: 'visible' })
      .fromTo(transition.current, { opacity: 0 }, { opacity: 1, duration: .25 })
      .fromTo(title, { scale: .65, opacity: 0 }, { scale: 1, opacity: 1, duration: .4 }, 0)
      .call(arrive, [], .35)
      .to(title, { scale: 7, opacity: 0, duration: .8, ease: 'power3.in' }, .4)
      .to(transition.current, { opacity: 0, duration: .45 }, .8)
      .set(transition.current, { visibility: 'hidden' });
  };

  useEffect(() => {
    const restore = () => {
      const id = sectionTarget(location.pathname, location.hash);
      if (!id || id === 'home') { window.scrollTo(0, 0); return; }
      dispatchEvent(new Event('experience:skip-intro'));
      window.scrollTo(0, destinationOffset(id, reducedMotion));
      ScrollTrigger.update();
      document.getElementById(id)?.focus({ preventScroll: true });
    };
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    restore();
    addEventListener('popstate', restore);
    addEventListener('hashchange', restore);
    return () => { removeEventListener('popstate', restore); removeEventListener('hashchange', restore); history.scrollRestoration = previous; };
  }, [reducedMotion]);

  return <>
    <a className={`experience-home ${lightWorld ? 'chrome-light' : ''}`} href="/" aria-label="Home" onClick={event => { event.preventDefault(); navigate('home', 'Home'); }}>a</a>
    <div className={`experience-location ${lightWorld ? 'chrome-light' : ''}`} aria-hidden="true"><i />{active}</div>
    <button className={`experience-menu ${lightWorld ? 'chrome-light' : ''}`} ref={trigger} aria-expanded={open} aria-controls="experience-menu-dialog" onClick={() => { setOpen(true); dialog.current?.showModal(); }}>Menu <span>+</span></button>
    <dialog className="experience-dialog" id="experience-menu-dialog" ref={dialog} onCancel={() => setOpen(false)} onClick={event => { if (event.target === dialog.current) close(); }}>
      <button className="dialog-close" onClick={close}>Close ×</button>
      <nav aria-label="Main navigation">{items.map(([id, label], index) => <a key={id} href={`#${id}`} onClick={event => { event.preventDefault(); navigate(id, label); }}><small>0{index + 1}</small>{label}<span>↗</span></a>)}</nav>
      <p>Advaith Dabilipuram <span>Software / Selected work</span></p>
    </dialog>
    <div ref={transition} className="navigation-transition" aria-hidden="true"><span /></div>
  </>;
}
