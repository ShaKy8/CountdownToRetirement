#!/usr/bin/env python3
"""
Route /weather/api/here with the viewer's location in the cache key.

The homepage's sky wears the visitor's weather. /api/here reads the viewer's
approximate location from CloudFront's viewer headers. The existing
/weather/api/* behaviour already FORWARDS them (its origin request policy,
Managed-AllViewerExceptHostHeader, carries them -- this was assumed not to,
and was wrong), but it does not CACHE on them: its cache policy keys on query
strings only. So before this was applied, each edge served the first
visitor's city and weather to everyone for ten minutes. Applied 2026-09-28,
within half an hour of the route going live.

So this creates one cache policy, `atmos-here`, with the three location
headers in the key -- which also forwards them -- and query strings OUT of
it, and one cache behaviour, /weather/api/here, that uses it. The behaviour
copies /weather/api/* (origin, origin request policy, response headers
policy) and is inserted BEFORE it: CloudFront takes the first match.

Query strings still reach the Lambda through the origin request policy, and
the key does not include them, so the Lambda must never read them for this
route -- it does not, and a test in tests.js pins it. Otherwise one request
with ?lat= would set the weather for everyone in that city.

Dry run by default.

    python3 scripts/cloudfront-here.py            # show the plan
    python3 scripts/cloudfront-here.py --apply    # do it

Needs the aws CLI with rights to read and update the distribution and to
create cache policies. The GitHub deploy role deliberately cannot.
"""

import argparse
import copy
import json
import subprocess
import sys
import tempfile

DISTRIBUTION = 'E1MBTRO86GIH7E'
POLICY = 'atmos-here'
PATH = '/weather/api/here'
TEMPLATE = '/weather/api/*'
HEADERS = ['CloudFront-Viewer-Latitude', 'CloudFront-Viewer-Longitude', 'CloudFront-Viewer-City']


def aws(*args):
    out = subprocess.run(['aws'] + list(args), capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit('aws ' + ' '.join(args[:3]) + ' failed:\n' + out.stderr.strip())
    return json.loads(out.stdout) if out.stdout.strip() else {}


def policy_config():
    return {
        'Name': POLICY,
        'Comment': 'The homepage weather: viewer location in the key, query strings out',
        'DefaultTTL': 600, 'MinTTL': 0, 'MaxTTL': 3600,
        'ParametersInCacheKeyAndForwardedToOrigin': {
            'EnableAcceptEncodingGzip': True, 'EnableAcceptEncodingBrotli': True,
            'QueryStringsConfig': {'QueryStringBehavior': 'none'},
            'HeadersConfig': {'HeaderBehavior': 'whitelist',
                              'Headers': {'Quantity': len(HEADERS), 'Items': HEADERS}},
            'CookiesConfig': {'CookieBehavior': 'none'},
        },
    }


def find_policy():
    got = aws('cloudfront', 'list-cache-policies', '--type', 'custom')
    for item in got.get('CachePolicyList', {}).get('Items', []):
        cfg = item['CachePolicy']['CachePolicyConfig']
        if cfg['Name'] == POLICY:
            return item['CachePolicy']['Id']
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='actually update CloudFront')
    args = ap.parse_args()

    changes = []
    policy_id = find_policy()
    if policy_id:
        print('Cache policy %s exists: %s' % (POLICY, policy_id))
    else:
        changes.append('  CREATE cache policy %s: headers %s in the key, query strings none'
                       % (POLICY, ', '.join(HEADERS)))

    got = aws('cloudfront', 'get-distribution-config', '--id', DISTRIBUTION)
    etag, cfg = got['ETag'], got['DistributionConfig']
    items = cfg['CacheBehaviors']['Items']
    paths = [b['PathPattern'] for b in items]
    if TEMPLATE not in paths:
        sys.exit('no %s behaviour to copy from' % TEMPLATE)

    if PATH in paths:
        here = items[paths.index(PATH)]
        if paths.index(PATH) > paths.index(TEMPLATE):
            changes.append('  MOVE %s before %s (first match wins)' % (PATH, TEMPLATE))
        if policy_id and here.get('CachePolicyId') != policy_id:
            changes.append('  SET %s cache policy -> %s' % (PATH, POLICY))
    else:
        changes.append('  CREATE behaviour %s (copy of %s, cache policy %s), before it'
                       % (PATH, TEMPLATE, POLICY))

    print('\nDistribution %s behaviours now: %s' % (DISTRIBUTION, ', '.join(paths)))
    if not changes:
        print('nothing to change')
        return
    print('\n'.join(changes))

    if not args.apply:
        print('\nDry run. Re-run with --apply to make these changes.')
        return

    if not policy_id:
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as fh:
            json.dump(policy_config(), fh)
        policy_id = aws('cloudfront', 'create-cache-policy',
                        '--cache-policy-config', 'file://' + fh.name)['CachePolicy']['Id']
        print('created cache policy', policy_id)

    if PATH in paths:
        here = items.pop(paths.index(PATH))
    else:
        here = copy.deepcopy(items[paths.index(TEMPLATE)])
        here['PathPattern'] = PATH
    here['CachePolicyId'] = policy_id
    at = [b['PathPattern'] for b in items].index(TEMPLATE)
    items.insert(at, here)
    cfg['CacheBehaviors']['Quantity'] = len(items)

    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as fh:
        json.dump(cfg, fh)
    aws('cloudfront', 'update-distribution', '--id', DISTRIBUTION,
        '--if-match', etag, '--distribution-config', 'file://' + fh.name)
    print('updated. The distribution takes a few minutes to deploy; then:')
    print("  curl -s https://branyontech.com%s" % PATH)


if __name__ == '__main__':
    main()
