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

const createWorkerSource = assets => `
const ASSETS = ${JSON.stringify(assets)};
const AVAILABLE_PATHS = new Set(Object.keys(ASSETS));

const decode = encoded => {
  const binary = atob(encoded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
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

    const cacheControl = cacheControlFor(pathname);
    const body = request.method === 'HEAD' ? null : decode(asset.body);

    return new Response(body, {
      status: 200,
      headers: {
        'Cache-Control': cacheControl,
        'Content-Type': asset.contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
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
      contentType: contentTypeFor(pathname),
    };
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, createWorkerSource(assets), 'utf8');
};

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) await buildWorker();
