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
    { "Effect": "Allow", "Action": "lambda:UpdateFunctionCode",
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
  --timeout 25 \
  --memory-size 512
```

`--timeout 25` matters: the cold `/api/climate` call fetches a 406 KB, 33-year
archive and takes ~2 s, and `/api/bundle` fans out to nine upstreams. The
default 3 s would fail intermittently and confusingly.

Then a Function URL, locked to CloudFront:

```bash
aws lambda create-function-url-config \
  --function-name atmos-weather-api \
  --auth-type AWS_IAM \
  --invoke-mode BUFFERED

aws lambda add-permission \
  --function-name atmos-weather-api \
  --statement-id cloudfront-oac \
  --action lambda:InvokeFunctionUrl \
  --principal cloudfront.amazonaws.com \
  --source-arn "arn:aws:cloudfront::${ACCOUNT}:distribution/E1MBTRO86GIH7E" \
  --function-url-auth-type AWS_IAM
```

`AWS_IAM` rather than `NONE` is deliberate. A `NONE` Function URL is openly
reachable on the internet, so anyone could bypass CloudFront entirely and invoke
the Lambda directly — no edge cache, and the bill is yours. With `AWS_IAM` plus
an origin access control, only CloudFront can call it.

## 3. CloudFront: route `/weather/api/*` to the Lambda

In the CloudFront console for `E1MBTRO86GIH7E`:

1. **Origins → Create origin.** Domain = the Function URL host (from
   `aws lambda get-function-url-config --function-name atmos-weather-api
   --query FunctionUrl --output text`, without the scheme or trailing slash).
   Protocol HTTPS only. Under **Origin access**, create a new
   **origin access control** with signing behaviour "Sign requests", origin type
   **Lambda**.
2. **Behaviors → Create behavior.**
   - Path pattern: `/weather/api/*`
   - Origin: the Lambda origin
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed methods: GET, HEAD
   - **Cache policy: a custom one — see the warning below**
   - Origin request policy: `AllViewerExceptHostHeader`

> ### The one thing that will silently break everything
>
> The default `CachingOptimized` cache policy **excludes query strings from the
> cache key**. Every weather route is keyed by `?lat=…&lon=…`, so CloudFront
> would cache the first visitor's city and serve it to everyone — the site would
> look like it worked while showing the wrong location worldwide.
>
> Create a cache policy with **Query strings: All**, and TTLs of
> min 0 / default 300 / max 2592000 so the `Cache-Control` headers the Lambda
> already sets are respected per route.

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
curl -s 'https://branyontech.com/weather/api/config' | head -c 200; echo
curl -sI 'https://branyontech.com/weather/api/bundle?lat=34.05&lon=-118.24' \
  | grep -i 'x-cache\|cache-control'
```

The second request to the same coordinates should report `Hit from cloudfront`.
Then confirm two *different* coordinate pairs return *different* bodies — that
is the check that the query-string cache key is actually working.

## If you add a CloudFront response-headers policy

The site currently sends no security headers in production. Adding them is
worthwhile — but the console draws Esri and RainViewer map tiles into a canvas,
so a policy with `img-src 'self' data:` blanks the radar view with nothing but a
console error to explain it. Use a separate policy on the `/weather/*`
behaviours:

```
img-src 'self' data: https://services.arcgisonline.com https://tilecache.rainviewer.com
```

`server.js` already does this locally via `headersFor()`; keep the two in step.

## Known issue, unrelated but worth fixing

`www.branyontech.com` currently serves an invalid certificate (the ACM cert
covers the apex only, so browsers show a full-page warning) from a **second**
CloudFront distribution carrying a stale, drifted copy of the site. Either add
`www` to the cert and point it at `E1MBTRO86GIH7E`, or delete that distribution
and redirect www → apex.
