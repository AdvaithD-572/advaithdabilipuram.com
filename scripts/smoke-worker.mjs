import worker from '../dist/server/index.js';

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
