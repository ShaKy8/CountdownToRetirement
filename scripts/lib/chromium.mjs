/**
 * Where Chromium is.
 *
 * Twelve gates spawn a headless browser and every one of them hardcoded
 * `/usr/bin/chromium`, which is right on Arch and wrong nearly everywhere
 * else. Moving this work to another machine turns that into twelve identical
 * unhelpful failures, so the answer lives in one place and says what to do
 * when it cannot find one.
 *
 * $CHROMIUM wins when set, so an unusual install needs no code change.
 */
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
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

/**
 * Flags every gate's browser starts with, beside its own.
 *
 * --disable-extensions: a gate measures the site, not what a machine has
 * installed. On the laptop on November 18, 2026 an extension installed for the
 * whole machine loaded into a gate's fresh profile (it opened its own welcome
 * tab and background page, with or without the launcher's flags file), and
 * journal-audit.mjs hung on its first /year/ page on every run until timeout
 * stopped it at 600 s. With extensions off it passed 208/208. A throwaway
 * profile does not keep such an extension out; this flag does.
 */
export const GATE_FLAGS = ['--disable-extensions'];

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

/**
 * A browser profile for one gate run, deleted when the gate exits.
 *
 * Without --user-data-dir, headless Chromium makes its own profile under
 * ~/.config/chromium-headless and removes it only when it is shut down
 * cleanly (Browser.close). The gates stop it with chrome.kill(), which skips
 * that, so every run left a profile of about 50 MB behind: 337 of them,
 * 13 GB, on Kyle's laptop by November 14, 2026.
 *
 *   const profile = throwawayProfile();
 *   const chrome = spawn(chromiumPath(), ['--headless=new', profile.arg, ...GATE_FLAGS, ...]);
 *   profile.owner(chrome);
 *
 * On exit, including an uncaught error or Ctrl-C, the browser is stopped
 * first and the folder removed after: a browser still shutting down writes
 * into its profile and would put files back.
 */
export function throwawayProfile() {
  const dir = mkdtempSync(join(tmpdir(), 'gate-chromium-'));
  let browser = null;
  process.on('exit', () => {
    try { browser?.kill('SIGKILL'); } catch { /* already gone */ }
    // A moment for it to die. This runs on 'exit', so there is no event loop
    // to wait on; Atomics.wait blocks without one.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
    } catch { /* best effort: a leftover is all that is at stake */ }
  });
  // A signal ends Node without 'exit' unless something handles it.
  for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143], ['SIGHUP', 129]]) {
    process.once(signal, () => process.exit(code));
  }
  return { arg: `--user-data-dir=${dir}`, owner(child) { browser = child; } };
}
