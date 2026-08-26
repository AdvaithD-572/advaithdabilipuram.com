import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TiltCard } from './TiltCard';
import type { Project } from '../data';

type Props = { projects: Project[]; active: number; onActiveChange: (index: number) => void };

export function AccordionGallery({ projects, active, onActiveChange }: Props) {
  const panels = useRef<Array<HTMLElement | null>>([]);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = gsap.to(panels.current, { flexGrow: (index) => index === active ? 5 : 1, opacity: (index) => index === active ? 1 : 0.48, duration: reduced ? 0 : 0.55, ease: 'power3.out', overwrite: true });
    return () => { animation.kill(); };
  }, [active]);
  return <div className="accordion-gallery" role="list" aria-label="Selected projects">{projects.map((project, index) => <article ref={(node) => { panels.current[index] = node; }} className={index === active ? 'ag-panel is-active' : 'ag-panel'} key={project.slug} role="listitem" tabIndex={index === active ? 0 : -1} onMouseEnter={() => onActiveChange(index)} onFocus={() => onActiveChange(index)} onClick={() => onActiveChange(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onActiveChange(index); } }}>
    <TiltCard title={project.name} description={project.kicker} price={`0${index + 1}`} badgeLabel={index === active ? 'OPEN' : undefined} imageSrc={project.image} imageAlt={project.image ? `${project.name} interface` : ''}><div className="ag-code" aria-hidden="true">{project.name.slice(0, 2).toUpperCase()}</div></TiltCard>
    <a className="ag-link" href={`#/projects/${project.slug}`} tabIndex={index === active ? 0 : -1} aria-hidden={index !== active} aria-label={`Read ${project.name} project notes`}>VIEW PROJECT ↗</a>
  </article>)}</div>;
}
