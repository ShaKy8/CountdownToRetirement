#!/usr/bin/env node
/**
 * Add <link rel="modulepreload"> for every module the console imports
 * statically, to weather/index.html. Usage: node scripts/preload-hints.mjs <weatherDir>
 *
 * The console is ~40 ES modules importing each other by relative specifier
 * with no bundler. A browser finds an import only after it has downloaded
 * and parsed the importer, so the page loads level by level, one round trip
 * per level: on a slow phone that is most of the wait. Listing every module
 * in the HTML lets it fetch them all at once.
 *
 * Only STATIC imports are followed. Dynamic import() is how lazy code (the
 * satellite SGP4 library) stays out of the page load, and preloading it would
 * undo that. A test keeps this list equal to the static graph.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';

const STATIC = /(?:^|\n)\s*(?:import|export)\s[^;'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]|(?:^|\n)\s*import\s*['"](\.{1,2}\/[^'"]+)['"]/g;

/** Modules reachable from `entry` by static import, in breadth-first order. */
export function staticGraph(root, entry = 'js/main.js') {
  const seen = [];
  const queue = [resolve(root, entry)];
  while (queue.length) {
    const file = queue.shift();
    if (seen.includes(file)) continue;
    seen.push(file);
    const src = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    for (const m of src.matchAll(STATIC)) {
      const spec = m[1] || m[2];
      queue.push(resolve(dirname(file), spec));
    }
  }
  return seen.map((f) => relative(root, f).split('\\').join('/'));
}

export function inject(html, modules) {
  const links = modules.map((m) => `<link rel="modulepreload" href="${m}">`).join('\n');
  const clean = html.replace(/<link rel="modulepreload"[^>]*>\n?/g, '');
  const at = clean.indexOf('<link rel="stylesheet"');
  if (at < 0) throw new Error('no stylesheet link to anchor the preload hints on');
  return clean.slice(0, at) + links + '\n' + clean.slice(at);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: preload-hints.mjs <weatherDir>'); process.exit(2); }
  const mods = staticGraph(dir);
  const file = join(dir, 'index.html');
  writeFileSync(file, inject(readFileSync(file, 'utf8'), mods));
  console.log(`  preload hints: ${mods.length} modules`);
}
