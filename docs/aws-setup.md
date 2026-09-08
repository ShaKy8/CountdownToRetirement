# AWS setup

One-time steps to finish the weather deployment. Everything else is automated by
`.github/workflows/deploy.yml`.

Existing resources this builds on: S3 bucket `branyontech.com`, CloudFront
distribution `E1MBTRO86GIH7E`, Route 53 hosted zone.

---

## 1. GitHub OIDC → IAM role (fixes the broken deploys)

Every deploy run this repo has ever attempted failed at *"Credentials could not
be loaded"* — the workflow expected `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
secrets that were never set. Rather than adding long-lived keys, GitHub mints a
short-lived token and assumes a role.

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

# Only needed once per AWS account.
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  2>/dev/null || echo "provider already exists"

cat > /tmp/trust.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:ShaKy8/CountdownToRetirement:*" }
    }
  }]
}
JSON

aws iam create-role --role-name branyontech-deploy \
  --assume-role-policy-document file:///tmp/trust.json
```

> **If you rename the repo**, update the `sub` condition to match, or deploys
> will start failing with an opaque AssumeRole error.

```bash
cat > /tmp/perms.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::branyontech.com/*" },
    { "Effect": "Allow", "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::branyontech.com" },
    { "Effect": "Allow", "Action": "cloudfront:CreateInvalidation",
      "Resource": "*" },
    { "Effect": "Allow",
      "Action": ["lambda:UpdateFunctionCode", "lambda:GetFunctionConfiguration"],
      "Resource": "arn:aws:lambda:us-east-1:*:function:atmos-weather-api" }
  ]
}
JSON

aws iam put-role-policy --role-name branyontech-deploy \
  --policy-name deploy --policy-document file:///tmp/perms.json

aws iam get-role --role-name branyontech-deploy --query Role.Arn --output text
```

Then store that ARN as a repo secret (this is not a credential — it is just an
identifier, and useless without the OIDC trust above):

```bash
gh secret set AWS_DEPLOY_ROLE_ARN --body 'arn:aws:iam::…:role/branyontech-deploy'
```

## 2. The weather API Lambda

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

aws iam create-role --role-name atmos-weather-api-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},
                  "Action":"sts:AssumeRole"}]}'

aws iam attach-role-policy --role-name atmos-weather-api-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

cd lambda && zip -qr ../function.zip . && cd ..

aws lambda create-function \
  --function-name atmos-weather-api \
  --runtime nodejs22.x \
  --role "arn:aws:iam::${ACCOUNT}:role/atmos-weather-api-role" \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 25 --memory-size 512
```

`--timeout 25` matters: a cold `/api/climate` fetches a 406 KB, 33-year archive
and `/api/bundle` fans out to nine upstreams. The 3 s default fails
intermittently and confusingly. Expect `create-function` to need a retry or two
while the new IAM role propagates.

## 3. HTTP API in front of it

> **Lambda Function URLs do not work in this account.** A Function URL returns
> `403 AccessDeniedException` for every request — with `AWS_IAM` *and* with
> `NONE` plus an explicit public `lambda:InvokeFunctionUrl` grant, on a
> freshly-recreated URL, with no SCPs attached. Requests never reach the
> function (nothing in CloudWatch). `aws lambda invoke` works fine, so the
> function and its code are sound. Cause unidentified; an API Gateway HTTP API
> works, so that is what this uses.

```bash
API=$(aws apigatewayv2 create-api \
  --name atmos-weather-api --protocol-type HTTP \
  --target "arn:aws:lambda:us-east-1:${ACCOUNT}:function:atmos-weather-api" \
  --query ApiId --output text)

aws lambda add-permission --function-name atmos-weather-api \
  --statement-id apigw-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:${ACCOUNT}:${API}/*"
```

> The source ARN must be `${API}/*`. An HTTP API's ARN is
> `apiid/stage/route`, so the four-part `apiid/*/*/*` form used with REST APIs
> silently fails to match — API Gateway then cannot invoke the function and
> returns **500 with no Lambda log entry at all**, which looks like a code bug
> and is not one.

## 3b. CloudFront: route `/weather/api/*` to the API

Add an origin for `${API}.execute-api.us-east-1.amazonaws.com` (HTTPS only, no
origin access control — that is for S3 and Lambda URLs, not API Gateway), then
a cache behaviour:

- Path pattern `/weather/api/*`, that origin, GET + HEAD
- Viewer protocol policy: redirect to HTTPS
- Origin request policy: `Managed-AllViewerExceptHostHeader` — API Gateway must
  set its own `Host`, so the viewer's must not be forwarded
- **Cache policy: custom, see the warning below**

> ### The one thing that will silently break everything
>
> The default `CachingOptimized` cache policy **excludes query strings from the
> cache key**. Every weather route is keyed by `?lat=…&lon=…`, so CloudFront
> would cache the first visitor's city and serve it to everyone — the site would
> look like it worked while showing the wrong location worldwide.

```bash
aws cloudfront create-cache-policy --cache-policy-config '{
  "Name": "atmos-weather-api",
  "Comment": "Query strings in the cache key; honour origin Cache-Control",
  "DefaultTTL": 300, "MinTTL": 0, "MaxTTL": 2592000,
  "ParametersInCacheKeyAndForwardedToOrigin": {
    "EnableAcceptEncodingGzip": true, "EnableAcceptEncodingBrotli": true,
    "QueryStringsConfig": { "QueryStringBehavior": "all" },
    "HeadersConfig": { "HeaderBehavior": "none" },
    "CookiesConfig": { "CookieBehavior": "none" }
  }
}'
```

## 4. Verify

```bash
curl -s 'https://branyontech.com/weather/api/config'
curl -sD- -o /dev/null 'https://branyontech.com/weather/api/config' | grep -i x-cache

# The check that matters: different coordinates must return different data.
curl -s 'https://branyontech.com/weather/api/bundle?lat=34.0522&lon=-118.2437' | head -c 80
curl -s 'https://branyontech.com/weather/api/bundle?lat=40.7128&lon=-74.0060'  | head -c 80
```

If those two return the *same* temperature, the cache policy is wrong and the
site is serving one city to the world.

## 5. Security headers on CloudFront

The site sent no security headers in production for a long time: `server.js`
builds them carefully via `headersFor()`, but that only ever protected the
tailnet. `scripts/cloudfront-headers.py` creates two response-headers policies
and attaches them. It is a dry run unless you pass `--apply`.

```bash
python3 scripts/cloudfront-headers.py            # show the plan, change nothing
python3 scripts/cloudfront-headers.py --apply    # create and attach
./scripts/check-headers.sh                       # confirm, a few minutes later
```

Two policies, because one CSP cannot serve the whole site:

| behaviour | policy | why |
|---|---|---|
| default | `branyontech-strict` | `img-src 'self' data:` |
| `/weather/*` | `branyontech-weather` | plus the Esri and RainViewer tile hosts |
| `/weather/api/*` | `branyontech-strict` | it returns JSON and never loads a tile |

The script creates the `/weather/*` behaviour if it is missing, and inserts it
**after** `/weather/api/*` — CloudFront takes the first matching pattern in list
order, so the reverse would swallow the API behaviour and route the API to S3.

> ### Do not copy `Permissions-Policy` from server.js
>
> `server.js` sends `geolocation=()`, which disables it outright. That is right
> for the tailnet, where the page is plain HTTP and geolocation could not work
> anyway — and completely wrong for production, where it is the entire premise.
>
> The weather console, ONE PUTT and THERMAL all call `getCurrentPosition`. An
> empty allowlist disables it site-wide with **no error anywhere**: the browser
> simply refuses, each game falls back to its default coordinates, and every
> visitor on earth silently gets Los Angeles weather. It is indistinguishable
> from the feature working.
>
> The policy sends `geolocation=(self)`. A test in `tests.js` asserts the two
> files disagree on exactly this header and agree on the rest.

Two deliberate differences from `server.js`, both noted in the script:

- **No `X-XSS-Protection`.** Deprecated, ignored by current browsers, and its
  legacy filter could itself be abused. `server.js` still sends it; production
  does not.
- **HSTS without `includeSubDomains` or `preload`.** Both are effectively
  irreversible for the lifetime of the `max-age`, and `includeSubDomains` would
  harden every subdomain including any that does not serve a valid certificate —
  browsers then refuse to let anyone through. Add them deliberately later.

The deploy role cannot do any of this: it holds `CreateInvalidation` and nothing
else on CloudFront. Run it with credentials that can update the distribution.

## Resolved: www.branyontech.com

This used to serve an invalid certificate from a second CloudFront distribution
carrying a stale copy of the site. As of 2026-09-07 `https://www.branyontech.com/`
serves a valid certificate and the current site, so
whatever it points at is reading the live bucket.

Worth knowing before enabling HSTS `includeSubDomains`: that would cover `www`
and any other subdomain for the whole `max-age`, with no way for a visitor to
click through a certificate error. Check every subdomain first.
