# Fish Hatchery — Claude handoff

The owner asked for an elegant property-magazine showcase for family and friends, focused on the property's transformation. Continue work in `fish-hatchery/` within this BranyonTech checkout. Intended public URL: https://branyontech.com/fish-hatchery/.

## Confirmed facts and editorial boundaries

- Property: 4881 Fish Hatchery Road, Grants Pass, Oregon.
- Rehab began January 2026. The owner has not supplied a completion date.
- Credit Keith (the owner's brother), Harley, Jeremiah, and Diane (added September 25, 2026). No surnames or individual trade roles were supplied.
- Focus on the property. No family narrative, unrelated properties, financial documents, or personal photographs.
- The owner supplied the before/during photographs and requested the finished photographs from the property's Zillow listing. The owner has no photographer originals.
- Dates below before/during photos come from image metadata. After photos do not have an asserted capture date.
- Five pairs were visually matched using architectural details; camera positions differ. Preserve complete frames in the comparisons and keep that distinction visible. Do not fabricate aligned views, enhance away damage, or generate replacement property photography.
- The owner explicitly requested a homepage link. This adds a seventh destination; small-phone spacing was tightened to accommodate it.

## What is included

- `fish-hatchery/index.html`, `styles.css`, `app.js`, `favicon.svg`, and 22 prepared WebP photographs in `assets/`.
- House exterior, living room, kitchen, workshop and barn comparisons, with Together / Before / After controls.
- A July 29, 2026 living-room work-in-progress section.
- Finished property details, a 20-photo full-screen viewer, keyboard navigation, and swipe handling.
- BranyonTech return link, canonical URL, and sharing metadata.
- This folder's `content.json` records matching evidence and editorial facts; `asset-manifest.json` maps every included photograph to its supplied filename or exact Zillow URL.

The wider original photo collection, private review materials, and the remaining Zillow images stay on the owner's Mac. No original was modified. All 87 Zillow images were reviewed; only selected property images are included here. Existing photographer watermarks remain in the assets.

## Integration and development

- The homepage links to `/fish-hatchery/` using its existing text-link styling.
- Both local servers have a WebP MIME mapping; the restricted server also allows the extension.
- The deployment allowlist includes the new page, scripts, stylesheet, favicon and images. It excludes these handoff notes and source manifests.
- Asset stamps include `fish-hatchery/index.html`; after editing the CSS or JavaScript, run `node scripts/stamp-assets.mjs`.
- Preview with `PORT=8100 node scripts/dev-server.mjs` and visit `/fish-hatchery/`. Choose a different port if 8100 is occupied. Do not stop an existing service.
- Run `node tests.js` and server integration tests on a free port, for example `PORT=8137 node tests-server.js`.

## Publication status

This handoff is an uncommitted working-tree change. Nothing was pushed to GitHub or deployed to AWS. A push to main can trigger the repository's existing AWS workflow. The owner's latest instruction is to continue the build with Claude; publish when the owner requests it.

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
