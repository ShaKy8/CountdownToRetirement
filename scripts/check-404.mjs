// Public read-only smoke test. Use the production-like dev server for local QA.
import assert from 'node:assert/strict';
const origin = new URL(process.argv[2] || 'https://branyontech.com');
if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Expected an HTTP(S) origin');
const marker = `qa-missing-${Date.now()}`;
for (const path of [`/${marker}`, `/nested/${marker}/page.html`]) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15000) });
  const body = await response.text();
  assert.equal(response.status, 404, `${path} must remain a real 404`);
  assert.match(response.headers.get('content-type') || '', /text\/html/);
  assert.match(body, /<h1>Page not found<\/h1>/);
  assert.match(body, /href="\/">Home<\/a>/);
  assert.doesNotMatch(body, /NoSuchKey/);
  console.log(`PASS branded 404: ${path}`);
}
const api = await fetch(new URL('/weather/api/qamissing', origin), { signal: AbortSignal.timeout(15000) });
assert.equal(api.status, 404, 'unknown API route remains a 404');
assert.match(api.headers.get('content-type') || '', /application\/json/);
const json = await api.json();
assert.ok(json && typeof json === 'object', 'API error is JSON, not the site error page');
console.log('PASS Weather API 404 stays JSON');
