import { useEffect, useMemo, useState } from 'react';
import { AsciiMatrixBackground } from './components/AsciiMatrixBackground';
import { CardNav, Crosshair, ScrollThread } from './components/Chrome';
import { OptionWheel } from './components/OptionWheel';
import { RouteIntro } from './components/RouteIntro';
import { TiltCard } from './components/TiltCard';
import { links, products, projects, skills, type Project } from './data';

const external = { target: '_blank', rel: 'noreferrer' } as const;

function useRoute() {
  const read = () => location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => { const change = () => { setRoute(read()); scrollTo(0, 0); }; addEventListener('hashchange', change); return () => removeEventListener('hashchange', change); }, []);
  return route;
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <header className="section-head"><p>{eyebrow}</p><h2>{title}</h2></header>;
}

function Home() {
  return <><RouteIntro label="ADVAITH" /><main id="main" className="page-content">
    <section className="opening"><p className="eyebrow">SOFTWARE ENGINEER · STUDENT · BUILDER</p><h1>I build software that makes complex systems feel understandable.</h1><div><p>Third-year Computer Science undergraduate at VNR VJIET, focused on full-stack development and AI-assisted products.</p><p>Open to software-engineering opportunities and select freelance projects.</p></div><div className="actions"><a href="#/projects">Explore projects <span>↗</span></a><a href={links.resume} download>Download résumé <span>↓</span></a></div></section>
    <section className="facts"><article><strong>8.4</strong><span>CGPA</span></article><article><strong>2024–28</strong><span>B.Tech · CSE</span></article><article><strong>04</strong><span>Primary builds</span></article></section>
    <section className="split-section"><SectionHead eyebrow="01 / BACKGROUND" title="Computer science, applied." /><div className="copy"><p>At VNR VJIET, Advaith is studying Data Structures and Algorithms, Database Management Systems, Object-Oriented Programming, Probability and Statistics, Discrete Mathematics, and problem solving in C.</p><a href="#/skills">View capabilities ↗</a></div></section>
    <section><SectionHead eyebrow="02 / SELECTED WORK" title="Systems with a point of view." /><div className="project-index">{projects.map((project, i) => <a href={`#/projects/${project.slug}`} key={project.slug}><span>0{i + 1}</span><h3>{project.name}</h3><p>{project.kicker}</p><b>↗</b></a>)}</div></section>
    <section className="github-feed"><SectionHead eyebrow="GITHUB / VERIFIED DEMOS" title="Public code, directly inspectable." /><article><div><span>NEWEST ELIGIBLE · CREATED 03 AUG 2026</span><h3>team1-jardajanardhan</h3><p>Agentic RAG sports-intelligence app with a verified public demo recording and repository.</p></div><div className="actions"><a href="https://github.com/AdvaithD-572/team1-jardajanardhan" {...external}>Repository ↗</a><a href="https://drive.google.com/file/d/1xYbdZJTMuA6rBXW4tCNmsfXAqFcsQ3S4/view?usp=sharing" {...external}>Demo ↗</a></div></article><p className="feed-note">One repository currently meets the public-project and verified-demo rule. The section stays intentionally partial rather than presenting unverified links.</p></section>
    <section className="products"><SectionHead eyebrow="03 / DIGITAL PRODUCTS" title="Source kits for real workflows." /><div>{products.map((product) => <article key={product.name}><p>PRODUCT</p><h3>{product.name}</h3><span>{product.description}</span><a href={product.href} {...external}>View product ↗</a></article>)}</div></section>
    <section className="credentials"><SectionHead eyebrow="04 / RECOGNITION" title="Learning, documented." /><ul><li><span>Power BI and Data Analysis</span><b>Infosys</b></li><li><span>Google Cloud Certification</span><b>Google Study Jams</b></li><li><span>AgentBlazer Champion 2026</span><b>Salesforce</b></li><li><span>Data Structures and Algorithms</span><b>Smart Interviews · Ongoing</b></li></ul></section>
    <Footer />
  </main></>;
}

function ProjectVisual({ project, active }: { project: Project; active: boolean }) {
  return <article className={`project-panel ${active ? 'is-active' : ''}`} aria-hidden={!active}><TiltCard className="project-panel__tilt"><div className="project-panel__media">{project.image ? <img src={project.image} alt="Sports Intelligence interface extracted from the project demo" /> : <div className={`coded-visual coded-visual--${project.slug}`}><span>{project.stack[0]}</span><i /><i /><i /><strong>{project.name.slice(0, 2).toUpperCase()}</strong></div>}<span className="visual-shade" /></div><div className="project-panel__caption"><span>{project.name}</span><span>{project.stack.slice(0, 2).join(' / ')}</span></div></TiltCard></article>;
}

function ProjectsPage() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  return <><RouteIntro label="PROJECTS" /><main id="main" className="page-content projects-page"><SectionHead eyebrow="SELECTED PROJECTS / 2025–26" title="Choose a build." /><section className="project-explorer"><OptionWheel items={projects.map((p) => p.name)} selected={selected} onChange={setSelected} /><div className="project-gallery" aria-live="polite">{projects.map((item, i) => <ProjectVisual project={item} active={i === selected} key={item.slug} />)}</div></section><section className="selected-project"><p>0{selected + 1} / 0{projects.length}</p><div><h2>{project.name}</h2><h3>{project.kicker}</h3><p>{project.description}</p><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul><div className="actions"><a href={`#/projects/${project.slug}`}>Read project notes ↗</a>{project.github && <a href={project.github} {...external}>View source ↗</a>}</div></div></section><Footer /></main></>;
}

function ProjectDetail({ project }: { project: Project }) {
  return <><RouteIntro label={project.name.toUpperCase()} /><main id="main" className="page-content detail-page"><p className="eyebrow">PROJECT / {project.stack[0].toUpperCase()}</p><h1>{project.kicker}</h1>{project.image && <img className="detail-image" src={project.image} alt="Sports Intelligence interface extracted from its demo recording" />}<div className="detail-grid"><div><h2>What it is</h2><p>{project.description}</p></div><div><h2>Technical surface</h2><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="actions">{project.github && <a href={project.github} {...external}>GitHub repository ↗</a>}{project.demo && <a href={project.demo} {...external}>View demo ↗</a>}<a href="#/projects">All projects ←</a></div><Footer /></main></>;
}

function SkillsPage() {
  return <><RouteIntro label="CAPABILITIES" /><main id="main" className="page-content"><section><SectionHead eyebrow="EVIDENCE-BASED STACK" title="Tools I use to ship." /><div className="skill-list">{skills.map(([name, values]) => <article key={name}><h3>{name}</h3><p>{values}</p></article>)}</div></section><section className="split-section"><SectionHead eyebrow="ACADEMIC FOUNDATION" title="Theory meets implementation." /><div className="copy"><p>Relevant coursework includes Data Structures and Algorithms, Database Management Systems, Object-Oriented Programming through Java, Probability and Statistics, Discrete Mathematics, and Problem Solving Using C.</p><a href={links.resume} download>Download résumé ↓</a></div></section><Footer /></main></>;
}

function ContactPage() {
  return <><RouteIntro label="CONNECT" /><main id="main" className="page-content contact-page"><p className="eyebrow">OPEN TO SOFTWARE ENGINEERING & FREELANCE</p><h1>Have an interesting system to build?</h1><a className="big-email" href={links.email}>dabilipuramadvaith@gmail.com ↗</a><div className="contact-links"><a href={links.github} {...external}>GitHub</a><a href={links.linkedin} {...external}>LinkedIn</a><a href={links.codechef} {...external}>CodeChef</a><a href={links.leetcode} {...external}>LeetCode</a></div><Footer /></main></>;
}

function Footer() { return <footer><p>ADVAITH DABILIPURAM</p><p>Built with React, Canvas2D & GSAP</p><a href="#/">Back to start ↑</a></footer>; }

export function Portfolio() {
  const route = useRoute();
  const project = useMemo(() => route.startsWith('/projects/') ? projects.find((p) => p.slug === route.split('/')[2]) : undefined, [route]);
  useEffect(() => { const label = project?.name || (route === '/projects' ? 'Projects' : route === '/skills' ? 'Capabilities' : route === '/contact' ? 'Contact' : 'Software Portfolio'); document.title = `${label} — Advaith Dabilipuram`; }, [route, project]);
  return <><a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); const main = document.getElementById('main'); if (main) { main.tabIndex = -1; main.scrollIntoView(); main.focus({ preventScroll: true }); } }}>Skip to content</a><AsciiMatrixBackground /><div className="noise" aria-hidden="true" /><CardNav /><ScrollThread /><Crosshair />{project ? <ProjectDetail project={project} /> : route === '/projects' ? <ProjectsPage /> : route === '/skills' ? <SkillsPage /> : route === '/contact' ? <ContactPage /> : <Home />}</>;
}
