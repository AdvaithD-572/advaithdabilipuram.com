import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Opening } from './experience/Opening';
import { WorkJourney } from './experience/WorkJourney';
import { LaterWorlds } from './experience/LaterWorlds';
import { Navigation } from './experience/Navigation';
import { destinationOffset, sectionTarget } from './experience/motion';
import { applyRouteMetadata } from './lib/seo';
import { resolvePortfolioRoute } from './lib/routes';
import { projects } from './data';

export function Portfolio() {
  const [reducedMotion, setReducedMotion] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const target = sectionTarget(location.pathname, location.hash);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    const route = resolvePortfolioRoute(location.pathname);
    applyRouteMetadata(route, route.kind === 'project' ? projects.find(project => project.slug === route.projectSlug)?.name : undefined);
    let alive = true;
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; media.removeEventListener('change', update); };
  }, []);
  if (!target) return <main className="not-found"><span>404</span><h1>That page stepped out.</h1><a href="/">Return home ↗</a></main>;
  return <>
    <a className="skip-link" href="#intro" onClick={event => { event.preventDefault(); dispatchEvent(new Event('experience:skip-intro')); window.scrollTo(0, destinationOffset('intro', reducedMotion)); document.getElementById('intro')?.focus({ preventScroll: true }); }}>Skip to content</a>
    <Navigation reducedMotion={reducedMotion} />
    <main id="main" tabIndex={-1} className={reducedMotion ? 'experience reduced-motion' : 'experience'}>
      <Opening reducedMotion={reducedMotion} />
      <WorkJourney reducedMotion={reducedMotion} />
      <LaterWorlds reducedMotion={reducedMotion} />
    </main>
  </>;
}
