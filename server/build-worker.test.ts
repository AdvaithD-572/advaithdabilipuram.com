import { describe, expect, it } from 'vitest';
import { cacheControlFor, contentTypeFor, createWorkerSource, resolveAssetPath } from '../scripts/build-worker.mjs';

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
    expect(contentTypeFor('/assets/sky.mp4')).toBe('video/mp4');
    expect(contentTypeFor('/assets/font.woff2')).toBe('font/woff2');
  });

  it('only marks fingerprinted build assets as immutable', () => {
    expect(cacheControlFor('/assets/index-C9apw3Rg.js')).toContain('immutable');
    expect(cacheControlFor('/assets/advaith-dabilipuram-resume.pdf')).toBe('public, max-age=3600, must-revalidate');
    expect(cacheControlFor('/index.html')).toBe('no-cache');
  });
});

describe('media delivery', () => {
  const bytes = Buffer.from('0123456789abcdefghijklmnop');
  const source = createWorkerSource({
    '/assets/sky.mp4': { body: bytes.toString('base64'), size: bytes.length, contentType: 'video/mp4' },
  });
  const getWorker = async () => (await import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
  const request = (headers = {}, method = 'GET') => new Request('https://portfolio.test/assets/sky.mp4', { method, headers });

  it('returns the complete file with an accurate length and range support', async () => {
    const response = await (await getWorker()).fetch(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('content-length')).toBe('26');
    expect(response.headers.get('accept-ranges')).toBe('bytes');
    expect(await response.text()).toBe(bytes.toString());
  });

  it.each([
    ['bytes=0-3', '0123', 'bytes 0-3/26'],
    ['bytes=5-9', '56789', 'bytes 5-9/26'],
    ['bytes=23-', 'nop', 'bytes 23-25/26'],
    ['bytes=-4', 'mnop', 'bytes 22-25/26'],
    ['bytes=24-999', 'op', 'bytes 24-25/26'],
  ])('supports byte seeks: %s', async (range, expected, contentRange) => {
    const response = await (await getWorker()).fetch(request({ Range: range }));
    expect(response.status).toBe(206);
    expect(response.headers.get('content-range')).toBe(contentRange);
    expect(response.headers.get('content-length')).toBe(String(expected.length));
    expect(await response.text()).toBe(expected);
  });

  it.each(['bytes=26-', 'bytes=-0', 'bytes=9-3'])('rejects an unsatisfiable range: %s', async range => {
    const response = await (await getWorker()).fetch(request({ Range: range }));
    expect(response.status).toBe(416);
    expect(response.headers.get('content-range')).toBe('bytes */26');
  });

  it.each(['invalid', 'bytes=0-1,4-5'])('ignores unsupported or malformed range: %s', async range => {
    expect((await (await getWorker()).fetch(request({ Range: range }))).status).toBe(200);
  });

  it('does not return partial data for a validator it cannot satisfy', async () => {
    expect((await (await getWorker()).fetch(request({ Range: 'bytes=0-2', 'If-Range': 'unknown-validator' }))).status).toBe(200);
  });

  it('HEAD reports full metadata without a body, ignoring Range', async () => {
    const response = await (await getWorker()).fetch(request({ Range: 'bytes=0-2' }, 'HEAD'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-length')).toBe('26');
    expect(await response.text()).toBe('');
  });
});
