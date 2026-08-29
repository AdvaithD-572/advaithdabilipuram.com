import { describe, expect, it } from 'vitest';
import { resolvePortfolioRoute, titleForRoute } from './routes';

describe('portfolio routes', () => {
  it.each([
    ['#/', 'home'],
    ['/', 'home'],
    ['#/about', 'about'],
    ['/about', 'about'],
    ['#/skills', 'about'],
    ['#/projects', 'projects'],
    ['/projects', 'projects'],
    ['#/contact', 'contact'],
  ])('maps %s to %s', (hash, expected) => {
    expect(resolvePortfolioRoute(hash).kind).toBe(expected);
  });

  it('resolves project details without swallowing unknown routes', () => {
    expect(resolvePortfolioRoute('#/projects/sienna')).toEqual({ kind: 'project', projectSlug: 'sienna' });
    expect(resolvePortfolioRoute('#/missing')).toEqual({ kind: 'not-found' });
  });

  it('creates concise route titles', () => {
    expect(titleForRoute({ kind: 'projects' })).toBe('Projects | Advaith Dabilipuram');
    expect(titleForRoute({ kind: 'project', projectSlug: 'sienna' }, 'SIENNA')).toBe('SIENNA | Advaith Dabilipuram');
  });
});
