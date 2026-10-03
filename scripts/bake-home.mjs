/*
 * The homepage says what retirement looks like, and the numbers are baked.
 *
 * The tagline's middle clause - "Since February: 6 trips, 10 concerts,
 * 4 books, 15 things built with AI." - is the length of each list in
 * countdown/stats.json, the same lists the retirement clock shows. So adding
 * a concert and pushing updates the homepage too, with no script on the
 * page and no network. The clause sits between two comment markers in
 * index.html and this rewrites exactly that and nothing else.
 *
 * It counts by the clock's own rules, and since October 3, 2026 by the same
 * code: countdown/journal.js countable(). An entry counts only if it is an
 * object carrying its title key, a book still open (`reading: true`) is not
 * counted because the phrase is books read, and an entry dated in the future
 * (a booked trip, a concert with tickets) is a countdown, not a thing done.
 * deploy.yml re-bakes daily, so the count rolls over the morning after.
 * An empty list drops out rather than print "0".
 *
 *   node scripts/bake-home.mjs            rewrite the clause
 *   node scripts/bake-home.mjs --check    exit 1 if index.html is stale
 *
 * tests.js checks the same thing independently, and deploy.yml runs this
 * before it syncs, because the test workflow does not gate the deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const Journal = createRequire(import.meta.url)('../countdown/journal.js');

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OPEN = '<!-- since -->';
const CLOSE = '<!-- /since -->';

// Kyle's retirement, as calc.js's default has it.
const RETIRED = new Date('2026-02-27T16:00:00');

const ITEMS = [
  // [list, title key, singular, plural]
  ['trips', 'place', 'trip', 'trips'],
  ['concerts', 'who', 'concert', 'concerts'],
  ['books', 'title', 'book', 'books'],
  ['projects', 'what', 'thing built with AI', 'things built with AI'],
];

/** How many entries of a list the clock would count, as of a date. */
export function countOf(stats, list, key, now = new Date()) {
  return Journal.countable(stats, list, key, now).length;
}

/** The clause, for a stats object and a build date. */
export function sinceClause(stats, now = new Date()) {
  // "Since February" is plain this year; next year it would be ambiguous.
  const since = (now - RETIRED) > 300 * 86400e3 ? 'Since February 2026' : 'Since February';
  const parts = ITEMS
    .map(([list, key, one, many]) => [countOf(stats, list, key, now), one, many])
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
  return parts.length ? `${since}: ${parts.join(', ')}.` : `${since}: building with AI.`;
}

/** index.html with the clause replaced; throws if the markers are not there once. */
export function bake(html, clause) {
  const i = html.indexOf(OPEN), j = html.indexOf(CLOSE);
  if (i < 0 || j < i || html.indexOf(OPEN, i + 1) >= 0) {
    throw new Error(`index.html needs exactly one ${OPEN}…${CLOSE} pair`);
  }
  return html.slice(0, i + OPEN.length) + clause + html.slice(j);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const file = path.join(ROOT, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const stats = JSON.parse(fs.readFileSync(path.join(ROOT, 'countdown', 'stats.json'), 'utf8'));
  const clause = sinceClause(stats);
  const next = bake(html, clause);
  if (process.argv.includes('--check')) {
    if (next !== html) {
      console.error(`index.html is stale -- run: node scripts/bake-home.mjs\n  want: ${clause}`);
      process.exit(1);
    }
    console.log('homepage clause is current');
  } else {
    if (next !== html) fs.writeFileSync(file, next);
    console.log(next === html ? `unchanged: ${clause}` : `baked: ${clause}`);
  }
}
