import { describe, expect, it } from 'vitest';
import { cacheControlFor, contentTypeFor, resolveAssetPath } from '../scripts/build-worker.mjs';

describe('embedded Sites worker routing', () => {
  const paths = new Set(['/index.html', '/assets/app.js', '/assets/photo.jpg']);

  it('falls back to the app shell for client-side routes', () => {
    expect(resolveAssetPath('/', paths)).toBe('/index.html');
    expect(resolveAssetPath('/projects', paths)).toBe('/index.html');
  });

  it('preserves real assets and rejects missing files', () => {
    expect(resolveAssetPath('/assets/app.js', paths)).toBe('/assets/app.js');
    expect(resolveAssetPath('/assets/missing.js', paths)).toBeNull();
  });

  it('sets the important browser content types', () => {
    expect(contentTypeFor('/index.html')).toContain('text/html');
    expect(contentTypeFor('/assets/app.js')).toContain('javascript');
    expect(contentTypeFor('/assets/photo.jpg')).toBe('image/jpeg');
  });

  it('only marks fingerprinted build assets as immutable', () => {
    expect(cacheControlFor('/assets/index-C9apw3Rg.js')).toContain('immutable');
    expect(cacheControlFor('/assets/advaith-dabilipuram-resume.pdf')).toBe('public, max-age=3600, must-revalidate');
    expect(cacheControlFor('/index.html')).toBe('no-cache');
  });
});
