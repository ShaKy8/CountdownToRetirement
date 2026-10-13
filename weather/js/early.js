/*
 * Starts the first two requests before the module graph has loaded.
 *
 * main.js needs /api/config (first visit) and then /api/bundle, but it can only
 * ask once ~25 modules have downloaded and run. This classic script is in
 * <head>, so those requests overlap the module downloads instead of following
 * them. api.js takes a request from here when its URL matches exactly, once;
 * anything that does not match, or failed, is fetched the ordinary way.
 * Same URLs, same no-store policy, so the data is what api.js would have got.
 */
(function () {
  var early = window.__early = {};
  if (/[?&]fresh\b/.test(location.search)) return;
  var base = new URL('./', location.href);
  function start(path, params) {
    var u = new URL(path, base);
    for (var k in params) u.searchParams.set(k, params[k]);
    var key = u.pathname + u.search;
    var p = fetch(u, { cache: 'no-store' });
    p.catch(function () {});
    early[key] = p;
    return p;
  }
  function bundle(loc) {
    if (loc && isFinite(+loc.lat) && isFinite(+loc.lon)) start('api/bundle', { lat: +loc.lat, lon: +loc.lon });
  }
  var saved = null;
  try { saved = (JSON.parse(localStorage.getItem('atmos.v1') || '{}') || {}).loc; } catch (e) { /* first run */ }
  if (saved && saved.lat != null && saved.lon != null && saved.lat !== '' && saved.lon !== '') {
    bundle(saved);
  } else {
    start('api/config', {}).then(function (r) { return r.ok ? r.clone().json() : null; })
      .then(function (c) { if (c && c.home) bundle(c.home); }).catch(function () {});
  }
})();
