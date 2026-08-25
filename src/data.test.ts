import { describe, expect, it } from 'vitest';
import { links, products, projects } from './data';

describe('published portfolio data', () => {
  it('never includes the excluded repository', () => {
    expect(projects.some((project) => project.slug.toLowerCase().includes('fpproject'))).toBe(false);
  });

  it('keeps approved profile and marketplace destinations', () => {
    expect(links.github).toBe('https://github.com/AdvaithD-572');
    expect(products).toHaveLength(3);
    products.forEach((product) => expect(product.href.startsWith('https://forgeproject.gumroad.com/')).toBe(true));
  });

  it('uses the extracted still only for its source project', () => {
    expect(projects.filter((project) => project.image)).toEqual([
      expect.objectContaining({ slug: 'sports-intelligence', image: '/assets/sports-intelligence-frame.jpg' }),
    ]);
  });
});
