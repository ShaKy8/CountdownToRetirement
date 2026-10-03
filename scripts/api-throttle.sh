#!/usr/bin/env bash
#
# Limits on the weather API, from the October 3, 2026 security audit.
#
# The API had no throttle anywhere: no API Gateway rate limit, no Lambda
# concurrency cap, no WAF. CloudFront answers repeats, but any query it has not
# seen goes to the Lambda, and every route calls a free upstream service
# (Open-Meteo, NWS, adsb.lol, BigDataCloud, pollen.com). A flood of distinct
# queries would cost a little in AWS and, worse, get the Lambda's addresses
# blocked upstream, which takes the console down for everyone. These three
# changes are free:
#
#   1. API Gateway $default stage: 20 requests/second, bursts of 50. Last
#      month's real traffic was ~16,600 calls, about 0.006 a second.
#   2. Lambda reserved concurrency: at most 10 copies at once. That also bounds
#      /api/elsewhere's model calls: 10 copies x MODEL_CALLS_PER_HOUR (20).
#   3. The GitHub deploy role trusts pushes to main only. It trusted any ref in
#      the repo (repo:ShaKy8/CountdownToRetirement:*). Deploys, manual runs
#      and the scheduled spend check all run on main.
#
# Dry run by default; prints what is set now and what would change.
#
#   aws login
#   ./scripts/api-throttle.sh            # show the plan
#   ./scripts/api-throttle.sh --apply    # do it
#
# Undo: update-stage with --default-route-settings '{}',
#       delete-function-concurrency, and the old trust condition.
#
set -euo pipefail

API_NAME="${API_NAME:-atmos-weather-api}"
FN="${LAMBDA_FUNCTION:-atmos-weather-api}"
ROLE="${DEPLOY_ROLE:-branyontech-deploy}"
RATE=20 BURST=50 CONCURRENCY=10
SUB="repo:ShaKy8/CountdownToRetirement:ref:refs/heads/main"
APPLY=0; [ "${1:-}" = "--apply" ] && APPLY=1

aws sts get-caller-identity >/dev/null 2>&1 || { echo "No AWS session. Run: aws login"; exit 1; }

api=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text)
[ -n "$api" ] || { echo "No API named $API_NAME"; exit 1; }

now_rate=$(aws apigatewayv2 get-stage --api-id "$api" --stage-name '$default' \
  --query 'DefaultRouteSettings.ThrottlingRateLimit' --output text)
now_burst=$(aws apigatewayv2 get-stage --api-id "$api" --stage-name '$default' \
  --query 'DefaultRouteSettings.ThrottlingBurstLimit' --output text)
now_conc=$(aws lambda get-function-concurrency --function-name "$FN" \
  --query 'ReservedConcurrentExecutions' --output text)
now_sub=$(aws iam get-role --role-name "$ROLE" \
  --query 'Role.AssumeRolePolicyDocument.Statement[0].Condition.StringLike."token.actions.githubusercontent.com:sub"' --output text)

echo "API Gateway $api \$default   rate $now_rate -> $RATE/s, burst $now_burst -> $BURST"
echo "Lambda $FN   reserved concurrency $now_conc -> $CONCURRENCY"
echo "IAM role $ROLE   trusts $now_sub -> $SUB"

if [ "$APPLY" -ne 1 ]; then
  echo; echo "Dry run. Re-run with --apply to make these changes."; exit 0
fi

aws apigatewayv2 update-stage --api-id "$api" --stage-name '$default' \
  --default-route-settings "ThrottlingRateLimit=$RATE,ThrottlingBurstLimit=$BURST" >/dev/null
echo "throttle set"

aws lambda put-function-concurrency --function-name "$FN" \
  --reserved-concurrent-executions "$CONCURRENCY" >/dev/null
echo "concurrency set"

work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
aws iam get-role --role-name "$ROLE" --query 'Role.AssumeRolePolicyDocument' --output json > "$work/trust.json"
python3 - "$work/trust.json" "$SUB" <<'PY'
import json, sys
path, sub = sys.argv[1:3]
doc = json.load(open(path))
n = 0
for st in doc['Statement']:
    cond = st.get('Condition', {})
    like = cond.get('StringLike', {})
    if 'token.actions.githubusercontent.com:sub' in like:
        like['token.actions.githubusercontent.com:sub'] = sub
        n += 1
if n != 1:
    sys.exit(f'expected one GitHub subject condition, found {n}; not touching the role')
json.dump(doc, open(path, 'w'))
PY
aws iam update-assume-role-policy --role-name "$ROLE" --policy-document "file://$work/trust.json"
echo "deploy role trust narrowed"

echo
echo "Check: the next deploy, or now: gh workflow run spend.yml (it assumes the same role)."
