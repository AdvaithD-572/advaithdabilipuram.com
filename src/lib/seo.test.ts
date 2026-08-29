import { describe, expect, it } from 'vitest';
import { metadataForRoute } from './seo';

describe('route metadata', () => {
  it('uses an indexable clean URL and specific copy for a project page', () => {
    expect(metadataForRoute({ kind: 'project', projectSlug: 'sienna' }, 'SIENNA')).toMatchObject({
      title: 'SIENNA | Advaith Dabilipuram',
      path: '/projects/sienna',
      description: expect.stringContaining('SIENNA'),
    });
  });

  it('keeps the root metadata at the canonical home URL', () => {
    expect(metadataForRoute({ kind: 'home' })).toMatchObject({ path: '/', title: 'Software Portfolio | Advaith Dabilipuram' });
  });
});
