export type PortfolioRoute =
  | { kind: 'home' }
  | { kind: 'about' }
  | { kind: 'projects' }
  | { kind: 'project'; projectSlug: string }
  | { kind: 'contact' }
  | { kind: 'not-found' };

export function resolvePortfolioRoute(hash: string): PortfolioRoute {
  const path = hash.replace(/^#/, '') || '/';
  if (path === '/') return { kind: 'home' };
  if (path === '/about' || path === '/skills') return { kind: 'about' };
  if (path === '/projects') return { kind: 'projects' };
  if (path === '/contact') return { kind: 'contact' };
  const match = path.match(/^\/projects\/([^/]+)$/);
  if (match) return { kind: 'project', projectSlug: match[1] };
  return { kind: 'not-found' };
}

export function titleForRoute(route: PortfolioRoute, projectName?: string) {
  const label = route.kind === 'home'
    ? 'Software Portfolio'
    : route.kind === 'about'
      ? 'About'
      : route.kind === 'projects'
        ? 'Projects'
        : route.kind === 'contact'
          ? 'Contact'
          : route.kind === 'project'
            ? projectName ?? 'Project'
            : 'Page not found';
  return `${label} | Advaith Dabilipuram`;
}
