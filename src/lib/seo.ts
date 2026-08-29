import type { PortfolioRoute } from './routes';
import { titleForRoute } from './routes';

export const siteUrl = 'https://advaithdabilipuram.com';

type RouteMetadata = {
  title: string;
  description: string;
  path: string;
};

export function metadataForRoute(route: PortfolioRoute, projectName?: string): RouteMetadata {
  if (route.kind === 'about') return { title: titleForRoute(route), path: '/about', description: 'Learn about Advaith Dabilipuram, a computer science student focused on full-stack products, applied AI, and mobile software.' };
  if (route.kind === 'projects') return { title: titleForRoute(route), path: '/projects', description: 'Explore full-stack, AI, and mobile software projects by Advaith Dabilipuram.' };
  if (route.kind === 'contact') return { title: titleForRoute(route), path: '/contact', description: 'Contact Advaith Dabilipuram about software engineering opportunities and worthwhile product problems.' };
  if (route.kind === 'project') return { title: titleForRoute(route, projectName), path: `/projects/${route.projectSlug}`, description: `${projectName ?? 'This project'} is a software project by Advaith Dabilipuram, covering its problem, technical stack, and implementation.` };
  if (route.kind === 'not-found') return { title: titleForRoute(route), path: '/', description: 'The requested page was not found on Advaith Dabilipuram’s software portfolio.' };
  return { title: titleForRoute(route), path: '/', description: 'Portfolio of Advaith Dabilipuram, a computer science student building full-stack, AI-assisted, and mobile software.' };
}

function setMeta(selector: string, attribute: 'name' | 'property', value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector) ?? document.head.appendChild(document.createElement('meta'));
  element.setAttribute(attribute, selector.match(/="([^"]+)/)?.[1] ?? '');
  element.content = value;
}

export function applyRouteMetadata(route: PortfolioRoute, projectName?: string) {
  const metadata = metadataForRoute(route, projectName);
  const url = `${siteUrl}${metadata.path}`;
  document.title = metadata.title;
  setMeta('meta[name="description"]', 'name', metadata.description);
  setMeta('meta[property="og:title"]', 'property', metadata.title);
  setMeta('meta[property="og:description"]', 'property', metadata.description);
  setMeta('meta[property="og:url"]', 'property', url);
  setMeta('meta[name="twitter:title"]', 'name', metadata.title);
  setMeta('meta[name="twitter:description"]', 'name', metadata.description);
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.head.appendChild(document.createElement('link'));
  canonical.rel = 'canonical';
  canonical.href = url;
}
