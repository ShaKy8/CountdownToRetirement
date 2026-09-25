#!/usr/bin/env node
/**
 * Stamp a page's own scripts and stylesheets with a hash of their contents:
 *
 *   <script src="script.js?v=658ae5bb63"></script>
 *
 * WHY. Assets are served with max-age=3600 and their names never change, so a
 * returning visitor runs the old script.js for up to an hour after a deploy.
 * stats.json is fetched no-cache, so new DATA arrives at once and meets OLD
 * CODE: the San Diego trip showed up in the list without its note, because the
 * cached script had never heard of notes. index.html is only cached for five
 * minutes, and a new ?v= is a new URL to the browser, so stamping cuts that
 * hour to five minutes and means code and data can no longer disagree for long.
 *
 * The query string is for the BROWSER cache only. S3 ignores it, both local
 * servers strip it, and CloudFront is invalidated on every deploy anyway.
 *
 *   node scripts/stamp-assets.mjs           rewrite the stamps in place
 *   node scripts/stamp-assets.mjs --check   exit 1 if any stamp is stale
 *
 * tests.js checks the same thing independently, and deploy.yml runs this
 * before it syncs, so a forgotten stamp fails CI but never reaches a visitor.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Pages whose assets get stamped. Adding a page is adding a line -- here and
// in the STAMPED_PAGES list in tests.js, which checks the same thing.
const PAGES = ['countdown/index.html', 'game/index.html', 'slingshot/index.html', 'fish-hatchery/index.html'];

// This site's files only: a relative name, or a root-absolute one such as
// /shared/daily.js, which both games load and which has to move in step with
// them. Anything with a scheme or a // host is somebody else's to version.
const REF = /\b(src|href)="((?![a-z]+:|\/\/)[\w./-]+\.(?:js|css))(?:\?v=[0-9a-f]*)?"/g;

const check = process.argv.includes('--check');
const stale = [];

for (const page of PAGES) {
  const file = path.join(ROOT, page);
  const html = readFileSync(file, 'utf8');

  const stamped = html.replace(REF, (whole, attr, ref) => {
    const bytes = readFileSync(ref.startsWith('/')
      ? path.join(ROOT, ref) : path.resolve(path.dirname(file), ref));
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
    const fresh = `${attr}="${ref}?v=${hash}"`;
    if (fresh !== whole) stale.push(`${page}: ${whole}  ->  ${fresh}`);
    return fresh;
  });

  if (!check && stamped !== html) writeFileSync(file, stamped);
}

if (!stale.length) {
  console.log('asset stamps are current');
} else {
  console.log(`${check ? 'STALE' : 'stamped'}:\n  ${stale.join('\n  ')}`);
  if (check) {
    console.log('\nrun: node scripts/stamp-assets.mjs');
    process.exit(1);
  }
}
