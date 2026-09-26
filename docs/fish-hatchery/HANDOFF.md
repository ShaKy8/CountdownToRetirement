# Fish Hatchery — Claude handoff

The owner asked for an elegant property-magazine showcase for family and friends, focused on the property's transformation. Continue work in `fish-hatchery/` within this BranyonTech checkout. Intended public URL: https://branyontech.com/fish-hatchery/.

## Confirmed facts and editorial boundaries

- Property: 4881 Fish Hatchery Road, Grants Pass, Oregon.
- Rehab began January 2026. The owner has not supplied a completion date.
- Credit, in this order: Keith (the owner's brother), Diane, Jeremiah, and Harley. The order is the owner's (September 25, 2026). No surnames or individual trade roles were supplied.
- Focus on the property. No family narrative, unrelated properties, financial documents, or personal photographs.
- The owner supplied the before/during photographs and requested the finished photographs from the property's Zillow listing. The owner has no photographer originals.
- Dates below before/during photos come from image metadata. After photos do not have an asserted capture date.
- Tonal adjustments have been made at the owner's request: eight under-exposed before photographs (bedroom, barn interior, barn aisle, bathroom, kitchen, living room, room by the deck, workshop) had their exposure lifted on September 25, 2026 -- the bedroom, kitchen, workshop, barn and barn aisle a second time, further, at the owner's request. Nothing was removed, added or reframed; the owner's originals are untouched. Each is recorded in `asset-manifest.json` with the gamma used. The exterior before photographs were already bright enough and are unchanged.
- Eleven pairs were visually matched using architectural details; camera positions differ. Preserve complete frames in the comparisons and keep that distinction visible. Do not fabricate aligned views, enhance away damage, or generate replacement property photography.
- The owner explicitly requested a homepage link. This adds a seventh destination; small-phone spacing was tightened to accommodate it.

## What is included

- `fish-hatchery/index.html`, `styles.css`, `app.js`, `favicon.svg`, and 34 prepared WebP photographs in `assets/`.
- House exterior, living room, kitchen, room by the deck, bedroom, bathroom, workshop, covered workshop area, barn interior, barn entrance, and barn aisle comparisons, with Together / Before / After controls.
- A three-stage living-room chapter: Before / During / After, with an All three view. The work-in-progress photograph is dated July 29, 2026.
- A three-highlight opening with manual navigation and optional 60-second playback (20 seconds per view).
- Finished property details, a 32-photo full-screen viewer, keyboard navigation, and swipe handling.
- BranyonTech return link, canonical URL, and sharing metadata.
- This folder's `content.json` records matching evidence and editorial facts; `asset-manifest.json` maps every included photograph to its supplied filename or exact Zillow URL.

The wider original photo collection, private review materials, and the remaining Zillow images stay on the owner's Mac. No original was modified. All 87 Zillow images were reviewed; only selected property images are included here. Existing photographer watermarks remain in the assets.

## Integration and development

- The homepage links to `/fish-hatchery/` using its existing text-link styling.
- Both local servers have a WebP MIME mapping; the restricted server also allows the extension.
- The deployment allowlist includes the new page, scripts, stylesheet, favicon and images. It excludes these handoff notes and source manifests.
- Asset stamps include `fish-hatchery/index.html`, and cover the photographs (`src` and `data-image`) as well as the CSS and JavaScript; after editing any of them, run `node scripts/stamp-assets.mjs`. A re-edited photograph under its old name otherwise sits in a visitor's browser cache for an hour.
- Preview with `PORT=8100 node scripts/dev-server.mjs` and visit `/fish-hatchery/`. Choose a different port if 8100 is occupied. Do not stop an existing service.
- Run `node tests.js` and server integration tests on a free port, for example `PORT=8137 node tests-server.js`.

## Publication status

Fish Hatchery is published from `main` through the repository's GitHub Actions workflow to AWS S3 and CloudFront. This release includes the opening transformation tour, the three-stage living-room chapter, and the final-cleanup photograph. Earlier notes about uncommitted changes describe the preparation history. The release preserves the latest published photograph adjustments and the header's Back to BranyonTech link.

## Useful next review

Ask which transformation deserves more emphasis and whether the photo choices or editorial tone need refinement. Do not invent a completion date. Verify live HTML, all photos, mobile layout, CloudFront headers, and sharing metadata after eventual deployment. Link previews depend on the receiving platform's cache and should be checked once the URL is public.

## Handoff verification — September 25, 2026

- Existing client suite: 421 passed, 0 failed.
- Existing server suite: 60 passed, 0 failed.
- Both `server.js` and `scripts/dev-server.mjs` served `/fish-hatchery/` successfully; all 25 referenced assets matched their on-disk hashes. WebP photographs returned `image/webp`.
- The exact integrated homepage was visually checked at 320×700, 375×667, 390×844, and desktop size. All seven links fit without horizontal overflow; at each tested phone size the page height equaled the viewport height.
- The homepage link opened the showcase successfully. The earlier standalone draft had its comparison controls, full-screen gallery, keyboard navigation, focus restoration, images, captions, and credits checked.
- The asset stamps were regenerated. `git diff --check` passed.
- The working tree was clean before this handoff. All current changes were left uncommitted for Claude and the owner to review. No AWS calls, Git commits, or pushes were performed.


## Additional transformation matches — September 25, 2026

Six new comparisons were added after reviewing the owner originals and all listing views. The supporting filenames, Zillow numbers, dates, and architectural evidence are in the two JSON files beside this handoff. Full frames are preserved. The room with former red walls is provisionally called “the room by the deck”; its use/name awaits the owner's answer. No completion date or individual trade roles have been inferred.

The three new interior chapters sit after the kitchen. The covered workshop area, barn entrance, and barn aisle are grouped with their existing buildings. The chapter index now has eight entries. A repeated finished workshop image appears only once in the full-screen viewer. Credits retain the existing order: Keith, Diane, Jeremiah, Harley; their layout now accommodates four names.

The previous integration was already committed when this expansion began. These additions are left uncommitted for Claude. No deployment, push, or AWS action was performed.

### Expansion verification

- All six new comparisons passed Together / Before / After checks in the browser.
- Full-screen viewer contains 31 unique photographs; next-photo navigation, Escape, and focus restoration passed.
- Desktop (1440px), phone (390px), and small phone (320px) were checked. All comparison controls fit; no horizontal page overflow.
- All 34 rendered image instances match their declared dimensions; 33 unique photographs have source-manifest entries; internal anchor targets are valid.
- Existing client and server integration suites passed. Both development servers served the page plus all 36 referenced assets with matching content hashes and correct WebP MIME types. Temporary test processes were stopped; existing services were untouched.
- Asset stamps were already current after regeneration, and git diff --check passed. The six edited files and eleven new image assets remain uncommitted.


## Opening tour and living-room journey — September 25, 2026

The owner approved the opening highlights sequence and bringing the living-room stages together. The opening at `#highlights` uses the bathroom, the room by the deck, and the covered workshop. Manual selection and previous/next controls are always available when JavaScript is enabled; optional playback lasts 60 seconds (20 seconds per view), starts only on a visitor's click, and supports pause/resume/replay. Playback pauses when leaving the section, hiding the page, opening a photograph, or following a chapter link. Without JavaScript, all three highlight panels remain readable. Full photographic frames and original captions remain intact.

The living-room chapter now has All three / Before / During / After controls. The July 29, 2026 work-in-progress photograph was moved from its separate interlude into this chapter. January 2026 is still the start date; a completion date is not asserted.

No new photo assets are needed. The page reuses the 33 existing photographs; the full-screen viewer still has 31 unique photographs, ordered by the main property story. The opening repeats do not add duplicate viewer entries. Mobile highlight panels reserve consistent image and text space while changing views. No statistics, additional property claims, generated photography, or standalone video were added.

The checkout was clean at commit `f4fa3d0473b50a106dc46982b01e47230f72c7ce` before this work. These changes are prepared for the owner's Claude workflow; they are left uncommitted and have not been pushed or deployed by Codex.

The newer owner-requested exposure adjustments made by Claude were retained; the preview was refreshed with those images. The concurrent handoff update at commit `d4718f3600a4ee6e9d6204508b77a207484aeae1` was merged before copying this feature.

### Tour and three-stage verification

- Browser checks passed for all three highlight selections, previous/next wrapping, photo enlargement, and the unchanged 31-photo viewer.
- A real 60-second playback run advanced through all three views and completed at 100%. Pause held its position; resume continued; completion offered replay. Opening a photograph and leaving the section paused playback. No console warnings or errors were reported.
- Living-room All three / Before / During / After controls each showed the correct photographs. The During image retained its July 29, 2026 caption and enlarged correctly.
- Desktop at 1440px and phones at 390px and 320px were reviewed. No horizontal overflow; controls fit; highlight panel height stayed consistent between selections at 390px.
- All 40 image instances have declared dimensions matching their files; the 33 unique assets retain provenance; internal anchors and content stamps passed checks.
- Client tests: 421 passed. Server integration tests: 60 passed. Both local servers returned the page and all 36 referenced assets with matching hashes and WebP MIME types. `git diff --check` passed.
- Updated source and notes are on geekom1; five files remain uncommitted. No production deployment was performed.


## The final sweep — September 25, 2026

The owner supplied IMG_1216.heic and explicitly requested a final photo with clever final-cleanup / ready-to-sell copy. A closing spread now follows the credits at `#final-sweep`. The complete portrait photograph shows a broom, dustpan, and a small pile of dust. Its heading is “The last sweep. The next chapter.”, followed by “A lot of work. A little dust. Ready to sell.” and “The work tells one story. The next owners get to write another.” A link opens the property's existing Zillow listing. Readiness wording comes from the owner's request; no completion date, sale terms, price, or promise of a sale was added.

The new `assets/final-sweep.webp` is 1350×1800, converted to sRGB, resized, and compressed from the owner's HEIC. The complete frame is retained; no content or exposure edits were made, and the original is preserved in the owner's Photo Gallery folder. The public WebP omits source metadata. Its provenance is in asset-manifest.json.

The page now uses 34 unique photographs; 32 are in the full-screen viewer. Claude's existing photo adjustments and photograph cache stamps are preserved. This addition changes only the showcase HTML/CSS, the new photo, and these documentation files. The checkout already contained other owner/Claude changes; those are retained. No commit, push, or deployment was performed for this addition.

### Final-sweep verification

- Full-frame photo and closing typography reviewed at desktop width 1440px and phone widths 390px and 320px; no horizontal overflow or clipped headline/link.
- The new photograph opened as image 32 of 32 in the full-screen viewer; Escape restored focus correctly.
- All 41 image instances match their declared dimensions; 34 unique photographs have provenance; all image/script/style references have valid content stamps; internal anchors are valid.
- Client checks: 421 passed. Server integration checks: 60 passed. Both development servers served the page and all 37 referenced stamped assets with matching hashes and correct WebP types.
- The six addition files were copied into the existing BranyonTech working tree after baseline hash checks. Existing Claude changes were preserved; no commit, push, or deployment was performed.
