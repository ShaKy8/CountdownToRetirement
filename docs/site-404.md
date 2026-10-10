# Branded missing-page routing

The site already deploys `/404.html`, but a file alone does not make an S3
website use it for missing routes. The 2026-10-09 QA run received the raw S3
`NoSuchKey` page. The local dev server uses the branded page, and the original
Node server now does too, both retaining HTTP 404.

## Status and required approval

**Applied October 9, 2026** at Kyle's request: the bucket's `ErrorDocument` is `404.html` (it was unset; `IndexDocument` untouched), and `check-404.mjs` passes against production. The pre-change backup is `~/Projects/site-404-before.json` (outside the repo), for the rollback below. What follows is the procedure as it was run.

Originally this routing change was **prepared, not applied**. The live CloudFront origin
and S3 website settings must be inspected first. Repository documentation says
the deploy role lacks distribution-update permission; that is not a live IAM
inspection. No credentials or permission changes are part of this fix.

Preferred change: if CloudFront distribution `E1MBTRO86GIH7E` has the
`branyontech.com` S3 **website** endpoint as its default origin, set that bucket's
`ErrorDocument.Key` to `404.html`. Preserve its `IndexDocument` and all routing
rules. This retains the 404 status and affects only S3 website errors, leaving
the separate `/weather/api/*` origin's JSON responses untouched.

Do not substitute a distribution-wide CloudFront custom 404 mapping: it would
also replace API 404 bodies. If the origin is S3 REST/OAC, this script stops and
the routing plan needs another review. It also refuses existing CloudFront 404
overrides rather than silently changing their behavior.

## Authorized operator procedure

Use an existing authorized AWS session. Reads need
`cloudfront:GetDistributionConfig`, `s3:GetBucketWebsite` and `s3:GetObject`
(for checking the already-deployed error page). The eventual write requires
`s3:PutBucketWebsite` on `branyontech.com`. Do not broaden the deployment role
or create credentials to run this step. Obtain explicit routing approval first.

1. Inspect the plan (read-only; creates no files):

   `python3 scripts/site-404.py`

2. After reviewing that exact change and obtaining approval, apply with a fresh
   backup filename outside the repo:

   `python3 scripts/site-404.py --apply --backup ../site-404-before.json`

3. Verify the configuration read-back and, after cached errors expire, run:

   `node scripts/check-404.mjs https://branyontech.com`

   This checks root and nested nonexistent routes for HTTP 404, the branded
   heading and root-relative recovery links. It separately verifies that a
   nonexistent Weather API route still returns an error JSON response.
   Inspect the error page in a browser and follow Home to confirm recovery.

S3's website-configuration update API has no conditional ETag write. The script
re-reads immediately before writing and stops on drift; do not run concurrent
website-setting changes during this operation. Existing saved settings are
never overwritten. The script does not invalidate CloudFront; allow its cached
errors to expire, or request separate authorization for a targeted invalidation
if immediate verification is needed.

## Rollback

Restore only the saved `ErrorDocument` field; keep any unrelated newer website
settings. First dry-run, then explicitly apply with a new rollback backup:

`python3 scripts/site-404.py --restore ../site-404-before.json`

`python3 scripts/site-404.py --restore ../site-404-before.json --apply --backup ../site-404-before-rollback.json`

Restoration stops if another operator has changed the error document since this
fix. Re-run the public status/API checks after rollback. Source changes can be
reverted through an ordinary reviewed PR; preserved pre-fix branches identify
the exact deployed checkpoints.

AWS references: [S3 website custom error documents](https://docs.aws.amazon.com/AmazonS3/latest/userguide/CustomErrorDocSupport.html),
[CloudFront custom error responses](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesErrorPages.html).
