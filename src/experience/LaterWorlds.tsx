import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { links, products, skills } from '../data';
import './later-worlds.css';

gsap.registerPlugin(ScrollTrigger);

const EMAIL = 'dabilipuramadvaith@gmail.com';
const SERVICE_AREAS = [
  { name: 'Web & full-stack applications', detail: 'Thoughtfully designed websites and web apps, with the interfaces, APIs, and data systems that make them work together.', tools: 'React / FastAPI / PostgreSQL' },
  { name: 'Mobile applications', detail: 'Mobile experiences built around what people need to do, connected to the backend services that support them.', tools: 'Flutter / REST APIs / PostgreSQL' },
  { name: 'Applied AI', detail: 'Conversational assistants, retrieval-based tools, and AI integrations that help solve a specific problem or simplify a workflow.', tools: 'Python / LLM APIs / Retrieval' },
  { name: 'Product engineering', detail: 'Help taking an idea from its first requirements through UI/UX, development, feedback, and a polished working product.', tools: 'UI/UX / Full-stack development / Testing' },
];

export function pointerOffset(position: number, origin: number, size: number, depth: number) {
  if (size <= 0) return 0;
  return Math.max(-1, Math.min(1, ((position - origin) / size - 0.5) * 2)) * depth;
}

export async function copyContactEmail(clipboard: Pick<Clipboard, 'writeText'> | undefined) {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(EMAIL);
    return true;
  } catch {
    return false;
  }
}

function useAboutParallax(scene: React.RefObject<HTMLDivElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    const element = scene.current;
    if (!element || reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const background = element.querySelector('.about-scenery');
    const foreground = element.querySelector('.about-foreground');
    if (!background || !foreground) return;
    let active = false;
    const ctx = gsap.context(() => {
      const foregroundX = gsap.quickTo(foreground, 'x', { duration: 0.9, ease: 'power3.out' });
      const foregroundY = gsap.quickTo(foreground, 'y', { duration: 0.9, ease: 'power3.out' });
      const backgroundX = gsap.quickTo(background, 'x', { duration: 1.1, ease: 'power3.out' });
      const backgroundY = gsap.quickTo(background, 'y', { duration: 1.1, ease: 'power3.out' });
      const reset = () => {
        foregroundX(0); foregroundY(0); backgroundX(0); backgroundY(0);
      };
      const move = (event: PointerEvent) => {
        if (!active || event.pointerType === 'touch') return;
        const rect = element.getBoundingClientRect();
        const x = pointerOffset(event.clientX, rect.left, rect.width, 8);
        const y = pointerOffset(event.clientY, rect.top, rect.height, 8);
        foregroundX(x); foregroundY(y); backgroundX(-x / 4); backgroundY(-y / 4);
      };
      const observer = new IntersectionObserver(([entry]) => {
        active = entry.isIntersecting && !document.hidden;
        if (!active) reset();
      }, { threshold: 0.05 });
      const visibility = () => { if (document.hidden) { active = false; reset(); } else { observer.unobserve(element); observer.observe(element); } };
      observer.observe(element);
      element.addEventListener('pointermove', move, { passive: true });
      element.addEventListener('pointerleave', reset);
      document.addEventListener('visibilitychange', visibility);
      return () => {
        observer.disconnect();
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', reset);
        document.removeEventListener('visibilitychange', visibility);
      };
    }, element);
    return () => ctx.revert();
  }, [scene, reducedMotion]);
}

function AboutWorld({ reducedMotion }: { reducedMotion: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  useAboutParallax(scene, reducedMotion);
  return <section id="about" tabIndex={-1} className="later-world about-world" aria-labelledby="about-title" data-world="about" data-world-label="More about me">
    <div className="about-heading later-shell">
      <p className="later-eyebrow">More about me</p>
      <h2 id="about-title" className="about-title later-reveal">A little<br /><em>more human.</em></h2>
    </div>
    <div className="about-art-entrance">
      <div ref={scene} className="about-art" role="img" aria-label="A Renaissance seascape with airborne figures, a cat standing on a shell, and a woman holding a floral cloak.">
        <img className="about-scenery" src="/assets/worlds/about-scenery.webp" alt="" width="1672" height="941" loading="lazy" decoding="async" />
        <img className="about-foreground" src="/assets/worlds/about-foreground.webp" alt="" width="1672" height="941" loading="lazy" decoding="async" />
      </div>
    </div>
    <div className="about-copy later-shell">
      <span className="later-eyebrow">Beyond the work</span>
      <div>
        <p className="about-body">Coffee, a camera,<br />and one more rabbit hole.</p>
        <div className="about-story"><p>I love art in pretty much every form—drawing, painting, and especially music and dance. Being good at all of them? A separate conversation. Appreciating them an unreasonable amount? Absolutely.</p><p>Photography and cinematography are where I really get hands-on. I also love riding, learning how bikes work, and keeping up with what’s happening in AI. Give me something interesting or challenging and I’ll go deep. Sometimes deep enough to forget a few less-important things. Probably less-important.</p><p>I’m a coffee person, an enthusiastic nerd, and occasionally the source of a philosophical thought that makes me go, “Wait. That was actually pretty good.” I don’t need to do everything—but when something grabs me, I want to get properly good at it.</p></div>
      </div>
      <a className="later-text-link" href={links.resume} target="_blank" rel="noreferrer">View résumé <span aria-hidden="true">↗</span></a>
    </div>
    <div className="about-type-bridge" aria-hidden="true"><span className="later-morph-word"><span className="about-word-from">curiosity</span><span className="about-word-to">Python</span></span><span className="later-morph-word"><span className="about-word-from">into craft</span><span className="about-word-to">React</span></span></div>
  </section>;
}

function SkillsWorld() {
  return <section id="skills" tabIndex={-1} className="later-world skills-world" aria-labelledby="skills-title" data-world="skills" data-world-label="Skills">
    <div className="later-shell">
      <div className="skills-header"><p className="later-eyebrow">The working vocabulary</p><h2 id="skills-title" className="skills-title later-reveal">Tools of<br /><em>the trade.</em></h2></div>
      <div className="skills-ledger">{skills.map(([group, values]) => <div className="skills-row" key={group}>
        <h3>{group}</h3><p>{values.split(', ').map((value) => <span key={value}>{value}</span>)}</p>
      </div>)}</div>
      <div className="skills-footer"><span className="later-eyebrow">From tools to outcomes</span><div className="skills-to-services" aria-hidden="true">{[['React', 'Web applications'], ['Python', 'Applied AI'], ['Docker', 'Product engineering']].map(([tool, service]) => <span className="later-morph-word" key={tool}><span className="skills-word-from">{tool}</span><span className="skills-word-to">{service}</span></span>)}</div></div>
    </div>
  </section>;
}

function ServicesWorld() {
  return <section id="services" tabIndex={-1} className="later-world services-world" aria-labelledby="services-title" data-world="services" data-world-label="Services">
    <div className="later-shell">
      <div className="services-heading"><p className="later-eyebrow">Services</p><h2 id="services-title" className="services-title later-reveal">What I<br /><em>can build.</em></h2></div>
      <div className="services-list">{SERVICE_AREAS.map((service) => <article className="services-row" key={service.name}>
        <h3>{service.name}</h3><div><p>{service.detail}</p><span className="services-tools">{service.tools}</span></div><a href="#contact" aria-label={`Discuss ${service.name.toLowerCase()}`} className="services-discuss"><span aria-hidden="true">↗</span></a>
      </article>)}</div>
    </div>
    <p className="services-proof-bridge" aria-hidden="true">Built. <em>Documented.</em></p>
  </section>;
}

function CredibilityWorld() {
  return <section id="credibility" tabIndex={-1} className="later-world proof-world" aria-labelledby="proof-title" data-world="credibility" data-world-label="Evidence & archive">
    <div className="later-shell">
      <div className="proof-heading"><p className="later-eyebrow">Evidence & archive</p><h2 id="proof-title" className="proof-title later-reveal">The work<br /><em>has a trail.</em></h2><a className="later-text-link" href={links.github} target="_blank" rel="noreferrer">Explore GitHub <span aria-hidden="true">↗</span></a></div>
      <div className="proof-evidence">
        <article className="proof-education"><span className="later-eyebrow">Education</span><h3>Computer Science<br />& Engineering</h3><p>VNR VJIET · B.Tech</p><span className="proof-note">August 2024–present · CGPA 8.4/10</span><a className="later-text-link" href={links.resume} target="_blank" rel="noreferrer">Read résumé <span aria-hidden="true">↗</span></a></article>
        <div className="proof-records"><h3>Learning & practice</h3><dl><div><dt>Google Cloud Certification</dt><dd>Google Study Jams</dd></div><div><dt>Power BI and Data Analysis</dt><dd>Infosys</dd></div><div><dt>AgentBlazer Champion</dt><dd>Salesforce · 2026</dd></div><div><dt>Data Structures and Algorithms</dt><dd>Smart Interviews · ongoing</dd></div><div><dt>100+ algorithmic problems solved</dt><dd>CodeForces / CodeChef / LeetCode</dd></div><div><dt>CodeChef Division 3</dt><dd>Rating: 1538</dd></div></dl><div className="proof-profile-links"><a href={links.codechef} target="_blank" rel="noreferrer">CodeChef ↗</a><a href={links.leetcode} target="_blank" rel="noreferrer">LeetCode ↗</a></div><p className="proof-note">Education, learning records, and programming statistics from my résumé.</p></div>
      </div>
      <div className="proof-archive"><div className="proof-archive-label"><h3>Product archive</h3><span>Source kits & software</span></div>{products.map((product) => <a className="proof-product" key={product.name} href={product.href} target="_blank" rel="noreferrer"><h4>{product.name}</h4><p>{product.description}</p><span className="proof-product-arrow" aria-hidden="true">↗</span></a>)}</div>
    </div>
  </section>;
}

function ContactWorld() {
  const [copyStatus, setCopyStatus] = useState('');
  const copy = async () => {
    const copied = await copyContactEmail(navigator.clipboard);
    setCopyStatus(copied ? 'Email address copied.' : 'Could not copy automatically. You can select the address below.');
  };
  return <section id="contact" tabIndex={-1} className="later-world contact-world" aria-labelledby="contact-title" data-world="contact" data-world-label="Contact">
    <div className="contact-scene">
      <img className="contact-background" src="/assets/worlds/contact.webp" width="1672" height="941" alt="An ivory rotary telephone in a burgundy architectural hall, with clouds visible through tall arches." loading="lazy" decoding="async" />
      <div className="contact-heading"><p className="later-eyebrow">Contact</p><h2 id="contact-title">Let’s <em>talk.</em></h2></div>
      <div className="contact-floor"><div className="contact-details later-shell">
      <div className="contact-email-block"><span className="later-eyebrow">A conversation starts here</span><a href={links.email} onClick={() => { void copy(); }} className="contact-email">dabilipuramadvaith<wbr />@gmail.com <span aria-hidden="true">↗</span></a><p className="contact-copy-status" role="status" aria-live="polite">{copyStatus || 'Open email & copy address'}</p></div>
      <div className="contact-links"><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={links.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={links.resume} target="_blank" rel="noreferrer">Résumé ↗</a></div>
    </div>
      <footer className="contact-footer later-shell"><span>Advaith Dabilipuram</span><span>Thank you for your time.</span></footer></div>
    </div>
  </section>;
}

export function LaterWorlds({ reducedMotion }: { reducedMotion: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.later-reveal').forEach((heading) => {
        gsap.from(heading, { y: 55, rotate: -1.2, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: heading, start: 'top 92%', end: 'top 55%', scrub: 0.6 } });
      });
      gsap.from('.about-art-entrance', { y: 70, scale: 0.96, transformOrigin: '50% 0%', scrollTrigger: { trigger: '.about-art-entrance', start: 'top bottom', end: 'top 35%', scrub: 0.7 } });
      gsap.fromTo('.about-type-bridge .later-morph-word', { y: 12, rotate: -1 }, { y: 0, rotate: 0, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.about-type-bridge', start: 'top 90%', end: 'top 62%', scrub: 0.4 } });
      gsap.from('.skills-row', { x: (index) => (index % 2 ? 35 : -35), stagger: 0.08, scrollTrigger: { trigger: '.skills-ledger', start: 'top 85%', end: 'bottom 80%', scrub: 0.6 } });
      gsap.from('.skills-to-services .later-morph-word', { y: 12, rotate: (index) => (index - 1) * 0.75, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.skills-to-services', start: 'top 92%', end: 'top 63%', scrub: 0.4 } });
      gsap.from('.services-row', { y: 45, stagger: 0.15, scrollTrigger: { trigger: '.services-list', start: 'top 90%', end: 'bottom 80%', scrub: 0.5 } });
      gsap.to('.services-proof-bridge', { scaleX: 0.7, letterSpacing: '-0.085em', transformOrigin: '50% 100%', scrollTrigger: { trigger: '.services-proof-bridge', start: 'top 80%', end: 'bottom top', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [reducedMotion]);
  return <div ref={root} className="later-worlds"><AboutWorld reducedMotion={reducedMotion} /><SkillsWorld /><ServicesWorld /><CredibilityWorld /><ContactWorld /></div>;
}
