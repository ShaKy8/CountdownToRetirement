#!/usr/bin/env bash
#
# Put ANTHROPIC_API_KEY on the weather Lambda, without losing what is already
# there.
#
# `aws lambda update-function-configuration --environment` REPLACES the whole
# variable set. Passing just the new key would silently drop every other
# variable the function has, and the failure would show up later as a route
# that used to work. So this reads the current set, merges, and writes back.
#
# The key is never echoed, never passed on a command line, and the temp file
# holding it is mode 600 and removed on exit.
#
#   aws login                      # the session expires; this needs a live one
#   ./scripts/set-lambda-key.sh
#
set -euo pipefail

FN="${LAMBDA_FUNCTION:-atmos-weather-api}"
KEY_FILE="${KEY_FILE:-$HOME/.config/anthropic/branyontech-key}"
SITE="${SITE:-https://branyontech.com}"

[ -f "$KEY_FILE" ] || { echo "No key at $KEY_FILE (override with KEY_FILE=...)"; exit 1; }
grep -q '^sk-ant-' "$KEY_FILE" || { echo "$KEY_FILE does not look like an API key"; exit 1; }

aws sts get-caller-identity >/dev/null 2>&1 || { echo "No AWS session. Run: aws login"; exit 1; }

work="$(mktemp -d)"; chmod 700 "$work"
trap 'rm -rf "$work"' EXIT

echo "Reading the current environment from $FN…"
aws lambda get-function-configuration --function-name "$FN" \
  --query 'Environment.Variables' --output json > "$work/current.json"
chmod 600 "$work/current.json"

python3 - "$work/current.json" "$KEY_FILE" "$FN" "$work/payload.json" <<'PY'
import json, sys
cur_path, key_path, fn, out_path = sys.argv[1:5]
cur = json.load(open(cur_path))
if not isinstance(cur, dict):          # null when the function has no env yet
    cur = {}
before = sorted(cur)
cur['ANTHROPIC_API_KEY'] = open(key_path).read().strip()
json.dump({'FunctionName': fn, 'Environment': {'Variables': cur}}, open(out_path, 'w'))
kept = [k for k in before if k != 'ANTHROPIC_API_KEY']
print(f"  keeping {len(kept)} existing variable(s): {', '.join(kept) or 'none'}")
print(f"  {'replacing' if 'ANTHROPIC_API_KEY' in before else 'adding'} ANTHROPIC_API_KEY")
PY
chmod 600 "$work/payload.json"

echo "Updating…"
aws lambda update-function-configuration \
  --cli-input-json "file://$work/payload.json" >/dev/null
aws lambda wait function-updated-v2 --function-name "$FN"

# Names only. Never the values.
echo "Now set: $(aws lambda get-function-configuration --function-name "$FN" \
  --query 'join(`, `, sort(keys(Environment.Variables)))' --output text)"

# Two layers, checked separately, because "it still says no key" has two very
# different causes and the fix differs. A direct invoke asks the function
# itself; the public URL asks the whole path through CloudFront and API
# Gateway. If the first works and the second does not, the problem is routing
# or caching, not the key.
q=$(python3 -c "
import json, base64
f = {'here': 'Los Angeles', 'hereSky': 'clear', 'hereScore': 76,
     'rows': [{'name': 'Johnson City, Texas', 'delta': -8, 'sky': 'clear', 'better': True}]}
print(base64.urlsafe_b64encode(json.dumps(f).encode()).decode().rstrip('='))")

python3 -c "
import json, sys
q = sys.argv[1]
json.dump({'version': '2.0', 'rawPath': '/weather/api/elsewhere',
           'rawQueryString': 'q=' + q,
           'requestContext': {'http': {'method': 'GET', 'path': '/weather/api/elsewhere'}}},
          open(sys.argv[2], 'w'))" "$q" "$work/event.json"

echo "Asking the function directly…"
aws lambda invoke --function-name "$FN"   --payload "fileb://$work/event.json" "$work/out.json" >/dev/null
direct=$(python3 -c "
import json, sys
try:
    body = json.loads(json.load(open(sys.argv[1]))['body'])
except Exception:
    print('unreadable'); raise SystemExit
print(body.get('why') or ('OK: ' + body['text']) if not body.get('text') else 'OK: ' + body['text'])
" "$work/out.json")
echo "  $direct"

echo "Asking through the site…"
sleep 3
public=$(curl -s "$SITE/weather/api/elsewhere?q=$q" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(('OK: ' + d['text']) if d.get('text') else (d.get('why') or 'unreadable'))")
echo "  $public"

echo
case "$direct:$public" in
  OK*:OK*)   echo "The model is answering." ;;
  OK*:*)     echo "The FUNCTION has the key but the SITE does not see it."
             echo "That is routing or caching, not the key:"
             echo "  - the edge caches this route for 30 minutes; try again shortly"
             echo "  - check the API Gateway integration is unqualified (no version"
             echo "    or alias), since a published version snapshots its own env" ;;
  *)         echo "The function itself does not see the key."
             echo "The config says it is set, so check they are the same function:"
             echo "  aws lambda get-function-configuration --function-name $FN \\"
             echo "    --query '[FunctionArn, Version, LastUpdateStatus]' --output text" ;;
esac
