# Mustang Micro Plus presets

`/mustang-micro-plus/` publishes Kyle's supplied
`Mustang-Micro-Plus-Presets.html` as the third link in the homepage's Music
group. Games and the other destinations remain in their existing groups.

The attachment's 70 preset records and their order are unchanged. The dark
table/card presentation, search, genre filters, favorites, notes, and
`mmp-presets-v1` localStorage key are retained. Script and styles are extracted
into same-origin files so the existing `script-src 'self'` policy can run the
page. A home link and accessible search/notes labels are added. Genre badge
classes use hyphens so High Gain and Surf/Rockabilly receive their colors.

The homepage has six groups and fourteen links. The new link required a small
reduction in outer intro padding for tall phones and 800–899px-high desktop
card layouts; link sizes and gaps are unchanged. `404.html` only receives the
new shared stylesheet stamp.

Deploy uses the existing GitHub Actions workflow, S3 bucket `branyontech.com`,
and CloudFront distribution `E1MBTRO86GIH7E`. The route and its assets are in
the workflow's explicit include lists and asset-stamping list.

Validation before publication:

- All 70 preset records compared exactly with the supplied attachment.
- Production-prepared client tests: 617 passed; server tests: 90 passed.
- Existing Postcards, Elevator, Asteroids, Ironwing, and satellite tests passed.
- Homepage browser audit passed at its nine phone/desktop sizes, including
  320×700, 360×640, 375×667, 390×844, 430×932, and 1280×800.
- A separate browser verified the Music link, all 70 rows, name search, genre
  filtering, favorite/notes persistence after reload, favorites filtering,
  the home link, and responsive layouts from 320px through desktop.

## Rollback

The pre-change source/deployment checkpoint is
`18190dd76ddbb7d539d88d61e8da349c704e3b44` (successful Deploy run
`41324315552`). Revert the commit titled “Add Mustang Micro Plus presets under
Music” and push the revert to `main`; the existing workflow restores the
homepage, layout, sitemap, and deploy configuration. Prefer a revert over
resetting the branch so later unrelated changes remain intact.

The workflow intentionally does not delete removed static objects. If a full
removal of the new page is needed, delete only these three S3 keys after the
revert deploy succeeds, then invalidate `/mustang-micro-plus/*`:

- `mustang-micro-plus/index.html`
- `mustang-micro-plus/app.js`
- `mustang-micro-plus/styles.css`

No AWS permissions, caching policies, audiences, or other site content were
changed for this addition.
