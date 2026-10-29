import { request } from 'node:https';

export const CONNECT_TIMEOUT_MS = 30_000;
export const REQUEST_TIMEOUT_MS = 60_000;
const MAX_BYTES = 16 * 1024 * 1024;

/** One HTTPS GET, with no redirects or internal retries. No extra probes.
 * Diagnostics come from the actual data connection. Keep TCP and TLS separate:
 * a TLS timeout is not evidence that the TCP connection failed.
 */
export function requestOnce(url, { headers } = {}, {
  requestImpl = request,
  connectMs = CONNECT_TIMEOUT_MS,
  requestMs = REQUEST_TIMEOUT_MS,
  log = (entry) => console.error(JSON.stringify(entry)),
} = {}) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    let phase = 'dns', socket, settled = false, connectTimer, requestTimer;
    const report = (event, extra = {}) => log({ event, phase, ms: Date.now() - started, ...extra });
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(connectTimer);
      clearTimeout(requestTimer);
      if (error) {
        report('error', { code: error.code, message: error.message,
          addresses: socket?.autoSelectFamilyAttemptedAddresses });
        reject(error);
      } else resolve(value);
    };
    const req = requestImpl(url, {
      method: 'GET', headers, agent: false,
      // Try DNS-provided IPv6/IPv4 addresses; don't force an unproven family fix.
      autoSelectFamily: true, autoSelectFamilyAttemptTimeout: 1000,
    }, (res) => {
      phase = 'body';
      clearTimeout(connectTimer);
      report('http', { status: res.statusCode, remoteAddress: socket?.remoteAddress });
      if (res.statusCode !== 200) {
        // Stop at the headers, including 301/302/429/5xx. Never follow Location.
        finish(null, { status: res.statusCode });
        res.destroy();
        return;
      }
      let bytes = 0;
      const chunks = [];
      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > MAX_BYTES) {
          const error = Object.assign(new Error('Satellite response exceeds 16 MiB'), { code: 'SAT_BODY_LIMIT' });
          finish(error);
          res.destroy();
          return;
        }
        chunks.push(chunk);
      });
      res.on('error', (error) => finish(error));
      res.on('aborted', () => finish(Object.assign(new Error('Satellite response truncated'), { code: 'SAT_BODY_ABORTED' })));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        report('complete', { bytes });
        finish(null, { status: 200, json: async () => JSON.parse(body) });
      });
    });
    req.on('socket', (s) => {
      socket = s;
      s.on('lookup', (error, address, family) => {
        if (!error) phase = 'tcp';
        report('dns', { address, family, code: error?.code });
      });
      s.on('connectionAttempt', (address, port, family) => {
        phase = 'tcp';
        report('connect', { address, port, family });
      });
      s.on('connectionAttemptFailed', (address, port, family, error) =>
        report('connect-failed', { address, port, family, code: error.code }));
      s.on('connectionAttemptTimeout', (address, port, family) =>
        report('connect-timeout', { address, port, family }));
      s.once('connect', () => {
        phase = 'tls';
        report('tcp-connected', { remoteAddress: s.remoteAddress, family: s.remoteFamily });
      });
      s.once('secureConnect', () => {
        phase = 'headers';
        clearTimeout(connectTimer);
        report('tls-connected', { protocol: s.getProtocol() });
      });
    });
    req.on('error', (error) => finish(error));
    connectTimer = setTimeout(() => {
      const error = Object.assign(new Error(`Connection deadline exceeded during ${phase}`), {
        code: 'SAT_CONNECT_TIMEOUT',
        // Conservative: retry only a known TCP timeout, not DNS/TLS uncertainty.
        retryableConnectTimeout: phase === 'tcp',
      });
      finish(error);
      req.destroy(error);
    }, connectMs);
    requestTimer = setTimeout(() => {
      const error = Object.assign(new Error(`Request deadline exceeded during ${phase}`), { code: 'SAT_REQUEST_TIMEOUT' });
      finish(error);
      req.destroy(error);
    }, requestMs);
    req.end();
  });
}
