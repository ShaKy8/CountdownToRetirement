/**
 * Where Chromium is.
 *
 * Seven gates spawn a headless browser and every one of them hardcoded
 * `/usr/bin/chromium`, which is right on Arch and wrong nearly everywhere
 * else. Moving this work to another machine turns that into seven identical
 * unhelpful failures, so the answer lives in one place and says what to do
 * when it cannot find one.
 *
 * $CHROMIUM wins when set, so an unusual install needs no code change.
 */
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = homedir();

const CANDIDATES = [
  // A user-local install, which is how you get a browser on a machine where
  // you do not have sudo — and the gates are the only thing that needs one.
  join(HOME, '.local/opt/chrome-linux64/chrome'),
  join(HOME, '.local/opt/chromium/chrome'),
  join(HOME, '.cache/puppeteer/chrome'),
  '/usr/bin/chromium',                 // Arch, Fedora
  '/usr/bin/chromium-browser',         // Debian, Ubuntu, Raspberry Pi OS
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/snap/bin/chromium',
  '/opt/google/chrome/chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

/** The browser to spawn, or a thrown error that says how to fix it. */
export function chromiumPath() {
  const named = process.env.CHROMIUM;
  if (named) {
    if (existsSync(named)) return named;
    throw new Error(`$CHROMIUM is set to "${named}", which does not exist.`);
  }
  const found = CANDIDATES.find((p) => existsSync(p));
  if (found) return found;
  throw new Error(
    'No Chromium found. Install one, or set $CHROMIUM to its path.\n  looked in:\n'
    + CANDIDATES.map((p) => `    ${p}`).join('\n'));
}
