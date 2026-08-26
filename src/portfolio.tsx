import { useEffect, useState } from 'react';
import { AccordionGallery } from './components/AccordionGallery';
import { CardNav, Crosshair, ScrollThread } from './components/Chrome';
import { OptionWheel } from './components/OptionWheel';
import { RouteIntro } from './components/RouteIntro';
import { links, products, projects, skills, type Project } from './data';
import { resolvePortfolioRoute, titleForRoute } from './lib/routes';
import { resetPageScroll } from './lib/navigation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const external = { target: '_blank', rel: 'noreferrer' } as const;
function useHash() {
  const read = () => location.hash || '#/';
  const [hash, setHash] = useState(read);
  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const change = () => {
      resetPageScroll();
      setHash(read());
      requestAnimationFrame(() => requestAnimationFrame(() => {
        resetPageScroll();
        ScrollTrigger.refresh(true);
        dispatchEvent(new Event('portfolio:scroll-reset'));
      }));
    };
    addEventListener('hashchange', change);
    resetPageScroll();
    return () => {
      removeEventListener('hashchange', change);
      history.scrollRestoration = previousRestoration;
    };
  }, []);
  return hash;
}
function Heading({ index, children }: { index: string; children: string }) { return <header className="section-heading"><span>{index}</span><h2>{children}</h2></header>; }
function Footer() {
  const toTop = () => {
    resetPageScroll();
    dispatchEvent(new Event('portfolio:scroll-reset'));
  };
  return <footer><b>ADVAITH DABILIPURAM</b><span>FULL-STACK, AI, MOBILE</span><button type="button" onClick={toTop}>TOP ↑</button></footer>;
}

function Home() { return <><RouteIntro label="ADVAITH" portrait /><main id="main" className="page-content">
  <section className="home-statement"><span className="eyebrow">SOFTWARE ENGINEER IN PROGRESS</span><h1>Building useful systems with clear thinking.</h1><div><p>Computer Science undergraduate focused on full-stack products, applied AI and mobile experiences.</p><nav className="actions"><a href="#/projects">SEE THE WORK ↗</a><a href={links.resume} download>RESUME ↓</a></nav></div></section>
  <section><Heading index="01 / SELECTED WORK">Four builds. Four real problems.</Heading><div className="project-list">{projects.map((project, index) => <a href={`#/projects/${project.slug}`} key={project.slug}><span>0{index + 1}</span><h3>{project.name}</h3><p>{project.kicker}</p><b>↗</b></a>)}</div></section>
  <section className="compact-cta"><span>AVAILABLE FOR SOFTWARE ENGINEERING OPPORTUNITIES</span><h2>Let’s build something that earns its place.</h2><a href="#/contact">START A CONVERSATION ↗</a></section><Footer />
</main></>; }

function About() { return <><RouteIntro label="ABOUT" /><main id="main" className="page-content">
  <section className="about-lead"><span className="eyebrow">VNR VJIET, B.TECH CSE, 2024 TO 2028</span><h1>Curious by default. Practical by choice.</h1><p>Advaith works across product interfaces, APIs and AI systems, turning technical complexity into software people can actually use.</p></section>
  <section><Heading index="01 / CAPABILITIES">The working stack.</Heading><div className="skill-list">{skills.map(([name, values]) => <article key={name}><h3>{name}</h3><p>{values}</p></article>)}</div></section>
  <section><Heading index="02 / LEARNING">Proof of continued practice.</Heading><div className="credential-list"><p>Power BI and Data Analysis <span>Infosys</span></p><p>Google Cloud Certification <span>Google Study Jams</span></p><p>AgentBlazer Champion 2026 <span>Salesforce</span></p><p>Data Structures and Algorithms <span>Smart Interviews</span></p></div></section><Footer />
</main></>; }

function ProjectExplorer() { const [active, setActive] = useState(0); const project = projects[active]; return <><RouteIntro label="PROJECTS" /><main id="main" className="page-content">
  <section><Heading index="01 / PROJECT INDEX">Choose a build.</Heading><div className="project-explorer"><OptionWheel items={projects.map(({ name }) => name)} selected={active} onChange={(index) => setActive(index)} fontSize={2.7} inset={44} /><AccordionGallery projects={projects} active={active} onActiveChange={setActive} /></div><article className="project-summary" aria-live="polite"><span>0{active + 1} / 0{projects.length}</span><div><h2>{project.name}</h2><p>{project.description}</p><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul><nav className="actions"><a href={`#/projects/${project.slug}`}>PROJECT NOTES ↗</a>{project.github && <a href={project.github} {...external}>SOURCE ↗</a>}</nav></div></article></section>
  <section><Heading index="02 / SOURCE KITS">Products built for ownership.</Heading><div className="product-row">{products.map((product) => <a href={product.href} {...external} key={product.name}><span>DIGITAL PRODUCT</span><h3>{product.name}</h3><p>{product.description}</p><b>VIEW ↗</b></a>)}</div></section><Footer />
</main></>; }

function ProjectDetail({ project }: { project: Project }) { return <><RouteIntro label={project.name.toUpperCase()} /><main id="main" className="page-content detail-page"><section className="detail-lead"><span className="eyebrow">PROJECT / {project.stack[0].toUpperCase()}</span><h1>{project.kicker}</h1><p>{project.description}</p></section>{project.image && <img className="detail-image" src={project.image} alt={`${project.name} interface`} />}<section className="detail-grid"><h2>Technical surface</h2><div><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul><nav className="actions">{project.github && <a href={project.github} {...external}>SOURCE ↗</a>}{project.demo && <a href={project.demo} {...external}>DEMO ↗</a>}<a href="#/projects">ALL PROJECTS ←</a></nav></div></section><Footer /></main></>; }
function Contact() { return <><RouteIntro label="CONTACT" /><main id="main" className="page-content contact-page"><section><span className="eyebrow">OPEN TO SOFTWARE ENGINEERING AND FREELANCE</span><h1>Have a worthwhile problem?</h1><a className="big-email" href={links.email}>dabilipuramadvaith@gmail.com ↗</a><nav className="contact-links"><a href={links.github} {...external}>GITHUB</a><a href={links.linkedin} {...external}>LINKEDIN</a><a href={links.codechef} {...external}>CODECHEF</a><a href={links.leetcode} {...external}>LEETCODE</a></nav></section><Footer /></main></>; }
function NotFound() { return <main id="main" className="not-found"><span>404</span><h1>That page stepped out.</h1><a href="#/">RETURN HOME ↗</a></main>; }

export function Portfolio() {
  const route = resolvePortfolioRoute(useHash());
  const project = route.kind === 'project' ? projects.find(({ slug }) => slug === route.projectSlug) : undefined;
  const routeKey = route.kind === 'project' ? `project-${route.projectSlug}` : route.kind;
  useEffect(() => { document.title = titleForRoute(route, project?.name); }, [route, project]);
  const page = route.kind === 'home' ? <Home /> : route.kind === 'about' ? <About /> : route.kind === 'projects' ? <ProjectExplorer /> : route.kind === 'project' && project ? <ProjectDetail project={project} /> : route.kind === 'contact' ? <Contact /> : <NotFound />;
  return <><a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); const main = document.getElementById('main'); if (main) { main.tabIndex = -1; main.scrollIntoView(); main.focus({ preventScroll: true }); } }}>Skip to content</a><div className="noise" aria-hidden="true" /><CardNav /><ScrollThread /><Crosshair /><div className="route-shell" key={routeKey}>{page}</div></>;
}
