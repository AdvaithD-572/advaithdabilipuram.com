import worker from '../dist/server/index.js';
import { readFile } from 'node:fs/promises';

const response = await worker.fetch(new Request('https://portfolio.test/'));
const html = await response.text();

if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) {
  throw new Error(`Worker smoke test failed with status ${response.status}.`);
}

if (!html.includes('id="root"')) {
  throw new Error('Worker smoke test did not return the portfolio app shell.');
}

const routeResponse = await worker.fetch(new Request('https://portfolio.test/projects'));
if (routeResponse.status !== 200) {
  throw new Error(`Worker route fallback failed with status ${routeResponse.status}.`);
}

const missingAsset = await worker.fetch(new Request('https://portfolio.test/assets/missing.js'));
if (missingAsset.status !== 404) {
  throw new Error(`Worker missing-asset check returned ${missingAsset.status}.`);
}

const videoUrl = 'https://portfolio.test/assets/worlds/sky.mp4';
const videoBytes = await readFile(new URL('../dist/assets/worlds/sky.mp4', import.meta.url));
const videoHead = await worker.fetch(new Request(videoUrl, { method: 'HEAD' }));
if (videoHead.headers.get('content-type') !== 'video/mp4'
  || Number(videoHead.headers.get('content-length')) !== videoBytes.length
  || (await videoHead.arrayBuffer()).byteLength !== 0) {
  throw new Error('Worker video HEAD did not return accurate media metadata.');
}

const videoRange = await worker.fetch(new Request(videoUrl, { headers: { Range: 'bytes=101-356' } }));
const rangeBytes = Buffer.from(await videoRange.arrayBuffer());
if (videoRange.status !== 206 || !rangeBytes.equals(videoBytes.subarray(101, 357))) {
  throw new Error('Worker video range seek did not return the exact requested bytes.');
}
