import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data';
import { destinationOffset, range, smooth } from './motion';

const principles = [['ASK BETTER', 'QUESTIONS.'], ['MAKE ROOM', 'FOR IDEAS.'], ['THINK IN', 'SYSTEMS.'], ['GIVE IDEAS', 'A FORM.']];

export function WorkJourney({ reducedMotion }: { reducedMotion: boolean }) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!root.current || reducedMotion) return;
    const section = root.current;
    const select = gsap.utils.selector(section);
    const track = section.querySelector<HTMLElement>('.project-track')!;
    const context = gsap.context(() => {
      let world = '';
      const render = (p: number) => {
        const nextWorld = p < .35 ? 'A way of thinking' : 'Projects';
        if (world !== nextWorld && section.getBoundingClientRect().top <= 0 && section.getBoundingClientRect().bottom > innerHeight) { world = nextWorld; dispatchEvent(new CustomEvent('experience:world', { detail: { label: world, light: p < .35 } })); }
        const compression = smooth(range(p, .265, .345));
        gsap.set(select('.type-environment'), { opacity: 1 - range(p, .3, .38), scale: 1.12 - range(p, 0, .2) * .12 });
        select('.principle').forEach((element: HTMLElement, i: number) => {
          const center = .028 + i * .077;
          const alpha = i === 0 ? 1 - range(p, .052, .077) : Math.min(range(p, center - .025, center - .012), 1 - range(p, center + .022, center + .047));
          gsap.set(element, { opacity: alpha, scaleX: 1 + range(p, center - .025, center + .047) * .12, rotationX: (i % 2 ? -1 : 1) * range(p, center, center + .05) * 24, y: -range(p, center, center + .05) * 25, letterSpacing: `${-.075 + range(p, center, center + .05) * .02}em` });
        });
        gsap.set(select('.type-architecture'), { scaleY: 1 - compression * .94, scaleX: 1 + compression * .2, yPercent: compression * 28, opacity: 1 - range(p, .325, .35) });
        gsap.set(select('.type-copy'), { opacity: 1 - range(p, .25, .3) });
        gsap.set(select('.single-brick'), { scaleX: .75 + compression * .25, scaleY: range(p, .285, .335) * (1 + range(p, .335, .38) * 13), opacity: range(p, .282, .3), rotationX: 18 * (1 - compression) });
        gsap.set(select('.project-heading'), { opacity: Math.min(range(p, .345, .4), 1 - range(p, .86, .9)) });
        const traversal = range(p, .4, .835);
        gsap.set(track, { x: -(track.offsetWidth - section.clientWidth) * traversal, y: (1 - smooth(range(p, .335, .405))) * innerHeight, opacity: range(p, .33, .36) });
        select('.project-object').forEach((element: HTMLElement, i: number) => {
          const center = i / 3;
          const distance = Math.min(1, Math.abs(traversal - center));
          if (i < 3) gsap.set(element, { rotation: (i % 2 ? 1 : -1) * distance * 5, y: distance * (i % 2 ? -35 : 35) });
        });
        const collapse = smooth(range(p, .865, .925));
        const open = Math.pow(range(p, .937, 1), 2);
        gsap.set(select('.project-object:last-child'), { scaleX: 1 - collapse * .65 + open * 6, scaleY: 1 - collapse * .16 + open * 4, rotation: 0, borderRadius: `${collapse * 48}% ${collapse * 48}% 0 0` });
        gsap.set(select('.project-object:last-child .project-content'), { opacity: 1 - range(p, .865, .91) });
        gsap.set(select('.door-light'), { opacity: range(p, .925, .95) });
        gsap.set(select('.door-caption'), { opacity: Math.min(range(p, .895, .92), 1 - range(p, .95, .98)) });
      };
      ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onUpdate: self => render(self.progress), onRefresh: self => render(self.progress) });
      render(0);
    }, section);
    return () => context.revert();
  }, [reducedMotion]);

  return <section id="work-journey" ref={root} className={`work-journey ${reducedMotion ? 'work-static' : ''}`} data-world-label="Thinking / Projects">
    <div className="work-stage">
      <img className="type-environment" src="/assets/worlds/type-world.webp" width="1677" height="938" alt="" loading="lazy" />
      <div className="type-copy"><span className="chapter-label">A way of thinking</span><p>Four principles. One foundation.</p><small className="placeholder-label">Personal philosophy · placeholder</small></div>
      <div className="type-architecture">{principles.map(([a, b], i) => <h2 className={`principle principle-${i}`} key={a}><span>{a}</span><span>{b}</span></h2>)}</div>
      <div className="single-brick" aria-hidden="true" />
      <header className="project-heading" id="projects" tabIndex={-1}><span>Selected work</span><span>Four systems, built.</span></header>
      <div className="project-track">{projects.map((project, index) => <article className={`project-object project-object-${index}`} id={project.slug} key={project.slug} tabIndex={-1} onFocus={event => {
        if (!reducedMotion && event.target instanceof HTMLAnchorElement) queueMicrotask(() => { window.scrollTo({ top: destinationOffset(project.slug), behavior: 'instant' }); ScrollTrigger.update(); });
      }}>
        <div className="project-content"><div className="project-meta"><span>Selected project / 0{index + 1}</span><span>{project.stack[0]}</span></div>
          <h2>{project.name}</h2><div className="project-information"><h3>{project.kicker}</h3><div><p>{project.description}</p><ul aria-label="Technologies">{project.stack.map(item => <li key={item}>{item}</li>)}</ul></div></div>
          <div className="project-bottom"><span className="project-large-index" aria-hidden="true">0{index + 1}</span><nav aria-label={`${project.name} links`}>{project.github && <a href={project.github} target="_blank" rel="noreferrer">Explore the source <span>↗</span></a>}{project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Watch the demo <span>↗</span></a>}</nav></div>
        </div>{index === 3 && <div className="door-light" aria-hidden="true" />}
      </article>)}</div>
      <div className="door-caption" aria-hidden="true">Beyond the work.<span>More about me ↓</span></div>
    </div>
  </section>;
}
