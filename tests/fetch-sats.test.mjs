import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { EventEmitter } from 'node:events';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer, request } from 'node:https';
import { gunzipSync } from 'node:zlib';
import { requestOnce } from '../scripts/lib/sats-http.mjs';
import { GROUPS, KEEP, getOnce, main } from '../scripts/fetch-sats.mjs';
import { reserve, finish, nextAllowed, STATE_KEY, JOB_BUDGET_MS, MIN_INTERVAL_MS } from '../scripts/sats-cooldown.mjs';

const quiet = () => {};
const sleep = async () => {};
const tcpTimeout = () => Object.assign(new Error('TCP timeout'), { code: 'SAT_CONNECT_TIMEOUT', retryableConnectTimeout: true });

test('bounded TCP retries recover, or stop after exactly three tries', async () => {
  for (const succeeds of [true, false]) {
    let calls = 0;
    const pauses = [];
    const pending = getOnce('unused', {}, {
      fetchImpl: async () => { if (++calls < 3 || !succeeds) throw tcpTimeout(); return { status: 200 }; },
      sleep: async (ms) => pauses.push(ms),
    });
    if (succeeds) assert.equal((await pending).status, 200);
    else await assert.rejects(pending, /TCP timeout/);
    assert.equal(calls, 3);
    assert.deepEqual(pauses, [30_000, 30_000]);
  }
});

test('ambiguous Undici, DNS, TLS and body errors are never retried', async () => {
  for (const error of [
    Object.assign(new Error('old Undici timeout'), { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } }),
    ...['EAI_AGAIN', 'ECONNRESET', 'CERT_HAS_EXPIRED', 'SAT_REQUEST_TIMEOUT', 'SAT_BODY_ABORTED'].map((code) => Object.assign(new Error(code), { code })),
  ]) {
    let calls = 0;
    await assert.rejects(getOnce('unused', {}, { fetchImpl: async () => { calls++; throw error; }, sleep }), (e) => e === error);
    assert.equal(calls, 1);
  }
});

test('only the actual TCP phase may classify a deadline as retryable', async () => {
  for (const phase of ['dns', 'tcp', 'tls', 'headers']) {
    const events = [];
    const pending = requestOnce('unused', {}, {
      connectMs: 15, requestMs: 30, log: (entry) => events.push(entry),
      requestImpl: () => {
        const req = new EventEmitter(), socket = new EventEmitter();
        socket.getProtocol = () => 'TLSv1.3';
        req.end = () => queueMicrotask(() => {
          req.emit('socket', socket);
          if (phase !== 'dns') socket.emit('lookup', null, '192.0.2.1', 4);
          if (['tls', 'headers'].includes(phase)) socket.emit('connect');
          if (phase === 'headers') socket.emit('secureConnect');
        });
        req.destroy = (error) => req.emit('error', error);
        return req;
      },
    });
    await assert.rejects(pending, (e) => phase === 'headers'
      ? e.code === 'SAT_REQUEST_TIMEOUT'
      : e.code === 'SAT_CONNECT_TIMEOUT' && e.retryableConnectTimeout === (phase === 'tcp'));
    assert.equal(events.at(-1).phase, phase);
  }
});

let certDir, tls;
before(async () => {
  certDir = await mkdtemp(join(tmpdir(), 'sats-tls-'));
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
    '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
    '-keyout', join(certDir, 'key.pem'), '-out', join(certDir, 'cert.pem')], { stdio: 'ignore' });
  tls = { key: await readFile(join(certDir, 'key.pem')), cert: await readFile(join(certDir, 'cert.pem')) };
});
after(async () => { await rm(certDir, { recursive: true, force: true }); });

async function localServer(t, handler) {
  const server = createServer(tls, handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
  return `https://127.0.0.1:${server.address().port}`;
}
const trustedRequest = (url, options, callback) => request(url, { ...options, ca: tls.cert }, callback);

test('real HTTPS GET logs connection phases and reads JSON', async (t) => {
  let calls = 0;
  const url = await localServer(t, (_, res) => { calls++; res.end('[{"NORAD_CAT_ID":25544}]'); });
  const events = [];
  const result = await requestOnce(url, {}, { requestImpl: trustedRequest, log: (entry) => events.push(entry) });
  assert.equal(result.status, 200);
  assert.equal((await result.json())[0].NORAD_CAT_ID, 25544);
  assert.equal(calls, 1);
  for (const name of ['tcp-connected', 'tls-connected', 'http', 'complete']) assert.ok(events.some((e) => e.event === name), name);
});

test('real 301/302/403/429/500/503 responses never redirect or retry', async (t) => {
  let calls = 0, status;
  const url = await localServer(t, (_, res) => { calls++; res.writeHead(status, { Location: '/do-not-follow' }); res.end('stop'); });
  for (status of [301, 302, 403, 429, 500, 503]) {
    const before = calls;
    const result = await getOnce(url, {}, { fetchImpl: (u, init) => requestOnce(u, init, { requestImpl: trustedRequest, log: quiet }), sleep });
    assert.equal(result.status, status);
    assert.equal(calls - before, 1);
  }
});

test('TLS verification stays enabled', async (t) => {
  let calls = 0;
  const url = await localServer(t, (_, res) => { calls++; res.end('[]'); });
  await assert.rejects(requestOnce(url, {}, { log: quiet }), (e) => /SELF_SIGNED|CERT/.test(e.code));
  assert.equal(calls, 0);
});

test('a stalled body is bounded and is not downloaded twice', async (t) => {
  let calls = 0;
  const url = await localServer(t, (_, res) => { calls++; res.writeHead(200); res.write('['); });
  await assert.rejects(getOnce(url, {}, {
    fetchImpl: (u, init) => requestOnce(u, init, { requestImpl: trustedRequest, connectMs: 500, requestMs: 100, log: quiet }), sleep,
  }), { code: 'SAT_REQUEST_TIMEOUT' });
  assert.equal(calls, 1);
});

test('truncated HTTPS body fails without a retry', async (t) => {
  let calls = 0;
  const url = await localServer(t, (_, res) => { calls++; res.writeHead(200, { 'Content-Length': 1000 }); res.write('['); setTimeout(() => res.destroy(), 10); });
  await assert.rejects(getOnce(url, {}, {
    fetchImpl: (u, init) => requestOnce(u, init, { requestImpl: trustedRequest, log: quiet }), sleep,
  }));
  assert.equal(calls, 1);
});

const recordsFor = (group) => Array.from({ length: GROUPS[group] }, (_, i) => ({
  NORAD_CAT_ID: 100000 + i, EPOCH: '2026-10-29T00:00:00', OBJECT_NAME: `test-${i}`, MEAN_MOTION: 15,
}));

test('successful fetch preserves all five gzip/JSON filenames and schema', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'sats-output-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const groups = [], pauses = [];
  await main(dir, {
    get: async (url) => {
      const group = new URL(url).searchParams.get('GROUP'); groups.push(group);
      return { status: 200, json: async () => recordsFor(group) };
    }, sleep: async (ms) => pauses.push(ms),
  });
  assert.deepEqual(groups, Object.keys(GROUPS));
  assert.deepEqual(await readdir(dir), Object.keys(GROUPS).map((g) => `${g}.json`).sort());
  for (const group of groups) {
    const data = JSON.parse(gunzipSync(await readFile(join(dir, `${group}.json`))));
    assert.equal(data.group, group);
    assert.ok(Number.isFinite(Date.parse(data.fetched)));
    assert.equal(data.records.length, GROUPS[group]);
    assert.ok(Object.keys(data.records[0]).every((key) => KEEP.includes(key)));
  }
  assert.deepEqual(pauses, Array(5).fill(2000));
});

test('late HTTP, malformed JSON, invalid data and timeout failures preserve previous files', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'sats-preserve-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  for (const group of Object.keys(GROUPS)) await writeFile(join(dir, `${group}.json`), `previous-${group}`);
  for (const failure of ['http', 'json', 'invalid', 'timeout']) {
    const seen = [];
    await assert.rejects(main(dir, {
      get: async (url) => {
        const group = new URL(url).searchParams.get('GROUP'); seen.push(group);
        if (group !== 'visual') return { status: 200, json: async () => recordsFor(group) };
        if (failure === 'timeout') throw tcpTimeout();
        if (failure === 'http') return { status: 403 };
        return { status: 200, json: async () => { if (failure === 'json') throw new SyntaxError('bad JSON'); return []; } };
      }, sleep,
    }));
    assert.deepEqual(seen, ['stations', 'visual']);
    for (const group of Object.keys(GROUPS)) assert.equal(await readFile(join(dir, `${group}.json`), 'utf8'), `previous-${group}`);
  }
});

test('cooldown bootstraps from latest S3 snapshot and skips without a write', async () => {
  const now = Date.parse('2026-10-29T12:00:00Z');
  const objects = [{ Key: 'sats/stations.json', LastModified: new Date(now - 60_000).toISOString() }];
  let writes = 0;
  const ready = await reserve({ now: () => now, list: async () => objects, read: async () => assert.fail('no marker'), write: async () => writes++ });
  assert.equal(ready, false); assert.equal(writes, 0);
  assert.equal(nextAllowed(objects, null), now - 60_000 + MIN_INTERVAL_MS);
});

test('reservation and final cooldown survive partial failure, cancellation and immediate reruns', async () => {
  let clock = Date.parse('2026-10-29T12:00:00Z'), state = null;
  const io = { now: () => clock, list: async () => state ? [{ Key: STATE_KEY }] : [], read: async () => state, write: async (s) => { state = s; } };
  assert.equal(await reserve(io), true);
  assert.equal(Date.parse(state.notBefore), clock + MIN_INTERVAL_MS + JOB_BUDGET_MS);
  assert.equal(await reserve(io), false);
  clock += JOB_BUDGET_MS;
  assert.equal(await reserve(io), false, 'cancelled job remains protected for another two hours');
  await finish(io);
  assert.equal(Date.parse(state.notBefore), clock + MIN_INTERVAL_MS);
  clock += MIN_INTERVAL_MS - 1;
  assert.equal(await reserve(io), false);
  clock++;
  assert.equal(await reserve(io), true);
});

test('S3 errors and invalid timestamps fail closed before any reservation is granted', async () => {
  assert.throws(() => nextAllowed([], {}), /Invalid satellite/);
  assert.throws(() => nextAllowed([{ Key: 'sats/starlink.json', LastModified: 'bad' }], null), /Invalid S3/);
  for (const stage of ['list', 'read', 'write']) {
    const io = { list: async () => stage === 'read' ? [{ Key: STATE_KEY }] : [], read: async () => ({}), write: async () => {} };
    io[stage] = async () => { throw new Error(`S3 ${stage} denied`); };
    await assert.rejects(reserve(io), new RegExp(`S3 ${stage} denied`));
  }
});

test('workflow bounds the reservation and gates publishing on successful fetch and cooldown', async () => {
  const workflow = await readFile(new URL('../.github/workflows/sats.yml', import.meta.url), 'utf8');
  assert.equal(Number(workflow.match(/timeout-minutes: (\d+)/)[1]) * 60_000, JOB_BUDGET_MS);
  assert.match(workflow, /group: sats\n  cancel-in-progress: false/);
  assert.match(workflow, /name: Publish\n\s+if: success\(\) && steps.cooldown.outputs.ready == 'true'/);
  assert.doesNotMatch(workflow, /continue-on-error|--delete/);
});
