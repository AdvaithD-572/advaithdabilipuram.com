import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
});

export const contentTypeFor = pathname =>
  MIME_TYPES[extname(pathname).toLowerCase()] ?? 'application/octet-stream';

export const resolveAssetPath = (pathname, availablePaths) => {
  if (availablePaths.has(pathname)) return pathname;
  if (pathname === '/' || !extname(pathname)) return '/index.html';
  return null;
};

export const cacheControlFor = pathname => {
  if (pathname === '/index.html') return 'no-cache';
  const filename = pathname.split('/').at(-1) ?? '';
  const extensionIndex = filename.lastIndexOf('.');
  const fingerprintIndex = filename.lastIndexOf('-', extensionIndex);
  const fingerprint = filename.slice(fingerprintIndex + 1, extensionIndex);
  if (pathname.startsWith('/assets/') && fingerprint.length === 8 && /^[A-Za-z0-9]+$/.test(fingerprint)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=3600, must-revalidate';
};

const collectFiles = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const pathname = resolve(directory, entry.name);
      return entry.isDirectory() ? collectFiles(pathname) : [pathname];
    }),
  );
  return files.flat();
};

export const createWorkerSource = assets => `
const ASSETS = ${JSON.stringify(assets)};
const AVAILABLE_PATHS = new Set(Object.keys(ASSETS));

// Decode only the requested base64 groups. Video seeks must not allocate a
// complete decoded video buffer for each tiny byte-range request.
const decode = (encoded, start, end) => {
  const groupStart = Math.floor(start / 3) * 4;
  const groupEnd = Math.ceil((end + 1) / 3) * 4;
  const binary = atob(encoded.slice(groupStart, groupEnd));
  const offset = start % 3;
  const bytes = new Uint8Array(end - start + 1);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = binary.charCodeAt(offset + i);
  return bytes;
};

const parseRange = (value, size) => {
  if (!value) return null;
  const match = /^bytes=(\\d*)-(\\d*)$/.exec(value.trim());
  // Unsupported multipart ranges and malformed fields are ignored.
  if (!match || (!match[1] && !match[2])) return null;
  const first = Number(match[1]);
  const last = Number(match[2]);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)) return null;
  if (!match[1]) return last > 0 && size > 0 ? [Math.max(0, size - last), size - 1] : false;
  if (first >= size || (match[2] && last < first)) return false;
  return [first, match[2] ? Math.min(last, size - 1) : size - 1];
};

const resolvePath = pathname => {
  if (AVAILABLE_PATHS.has(pathname)) return pathname;
  if (pathname === '/' || !/\\.[^/]+$/.test(pathname)) return '/index.html';
  return null;
};

const cacheControlFor = pathname => {
  if (pathname === '/index.html') return 'no-cache';
  const filename = pathname.split('/').at(-1) ?? '';
  const extensionIndex = filename.lastIndexOf('.');
  const fingerprintIndex = filename.lastIndexOf('-', extensionIndex);
  const fingerprint = filename.slice(fingerprintIndex + 1, extensionIndex);
  if (pathname.startsWith('/assets/') && fingerprint.length === 8 && /^[A-Za-z0-9]+$/.test(fingerprint)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=3600, must-revalidate';
};

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    const pathname = resolvePath(new URL(request.url).pathname);
    const asset = pathname ? ASSETS[pathname] : null;
    if (!asset) return new Response('Not Found', { status: 404 });

    const headers = {
        'Cache-Control': cacheControlFor(pathname),
        'Content-Type': asset.contentType,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(asset.size),
        'X-Content-Type-Options': 'nosniff',
    };
    // Range applies to GET. Without validators, If-Range must send the full file.
    const range = request.method === 'GET' && !request.headers.has('If-Range')
      ? parseRange(request.headers.get('Range'), asset.size) : null;
    if (range === false) {
      return new Response(null, { status: 416, headers: {
        ...headers, 'Content-Range': 'bytes */' + asset.size, 'Content-Length': '0',
      } });
    }
    const [start, end] = range || [0, asset.size - 1];
    const responseHeaders = range ? {
      ...headers,
      'Content-Range': 'bytes ' + start + '-' + end + '/' + asset.size,
      'Content-Length': String(end - start + 1),
    } : headers;
    const body = request.method === 'HEAD' ? null
      : asset.size === 0 ? new Uint8Array() : decode(asset.body, start, end);
    return new Response(body, { status: range ? 206 : 200, headers: responseHeaders });
  },
};
`;

const buildWorker = async () => {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const distributionRoot = resolve(projectRoot, 'dist');
  const outputPath = resolve(distributionRoot, 'server', 'index.js');
  const files = await collectFiles(distributionRoot);
  const assets = {};

  for (const file of files) {
    const relativePath = relative(distributionRoot, file).split(sep).join('/');
    if (relativePath.startsWith('.openai/') || relativePath.startsWith('server/')) continue;
    const pathname = `/${relativePath}`;
    const body = await readFile(file);
    assets[pathname] = {
      body: body.toString('base64'),
      size: body.byteLength,
      contentType: contentTypeFor(pathname),
    };
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, createWorkerSource(assets), 'utf8');
};

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) await buildWorker();
