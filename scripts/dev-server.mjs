#!/usr/bin/env node
/**
 * Local replica of the production routing.
 *
 * In production CloudFront serves the static site from S3 and routes
 * /weather/api/* to a Lambda Function URL. This does the same thing on one
 * port, so the site can be exercised exactly as deployed — in particular the
 * console runs from the /weather/ SUBPATH, which is what catches absolute-path
 * bugs before they reach production.
 *
 *   node scripts/dev-server.mjs      →  http://localhost:8000
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handler } from '../lambda/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8000);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  // Anything under an /api/ segment goes to the Lambda, as CloudFront will do.
  if (/\/api\/[a-z]+\/?$/.test(pathname)) {
    const out = await handler({
      rawPath: pathname,
      rawQueryString: url.searchParams.toString(),
      requestContext: { http: { method: req.method } },
    });
    res.writeHead(out.statusCode, out.headers);
    return res.end(out.body);
  }

  let rel = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
  const file = path.resolve(ROOT, '.' + rel);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    res.writeHead(403); return res.end('forbidden');
  }
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-cache',
    });
    res.end(data);
  } catch {
    // Directory without a trailing slash: redirect, as the S3 website endpoint
    // and CloudFront both do. This is what makes relative URLs resolve.
    try {
      await fs.stat(path.resolve(ROOT, '.' + pathname, 'index.html'));
      res.writeHead(301, { location: pathname + '/' });
      return res.end();
    } catch { /* genuinely missing */ }
    res.writeHead(404, { 'content-type': 'text/html' });
    res.end(await fs.readFile(path.join(ROOT, '404.html')).catch(() => 'not found'));
  }
}).listen(PORT, () => {
  console.log(`\n  branyontech.com dev server`);
  console.log(`  → http://localhost:${PORT}/           site`);
  console.log(`  → http://localhost:${PORT}/countdown/ retirement clock`);
  console.log(`  → http://localhost:${PORT}/weather/   weather console`);
  console.log(`  (\\/api\\/ routes are served by lambda/index.mjs)\n`);
});
