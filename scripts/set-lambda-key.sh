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

echo "Checking the route…"
q=$(python3 -c "
import json, base64
f = {'here': 'Los Angeles', 'hereSky': 'clear', 'hereScore': 76,
     'rows': [{'name': 'Johnson City, Texas', 'delta': -8, 'sky': 'clear', 'better': True}]}
print(base64.urlsafe_b64encode(json.dumps(f).encode()).decode().rstrip('='))")
sleep 3
curl -s "$SITE/weather/api/elsewhere?q=$q" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('text'):
    print('  the model is answering:'); print(f\"    {d['text']}\")
else:
    print(f\"  still falling back ({d.get('why')}). The edge caches this for 30 minutes,\")
    print('  so if it says \'no key\' give it a moment and try again.')"
