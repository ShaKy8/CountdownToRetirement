#!/usr/bin/env python3
"""
Attach security headers to the CloudFront distribution.

The site sends no security headers in production: server.js builds them
carefully for local use and CloudFront has never had a response-headers policy.
This creates two - one strict, one widened for the weather console's map tiles -
and attaches them to the right cache behaviours.

Dry run by default. It prints exactly what it would change and touches nothing
until you pass --apply.

    python3 scripts/cloudfront-headers.py            # show the plan
    python3 scripts/cloudfront-headers.py --apply    # do it

Needs the aws CLI on PATH with credentials that can read and update the
distribution (cloudfront:GetDistributionConfig, UpdateDistribution,
CreateResponseHeadersPolicy, ListResponseHeadersPolicies). The GitHub deploy
role deliberately cannot: it holds only CreateInvalidation.
"""

import argparse
import json
import subprocess
import sys

DISTRIBUTION = 'E1MBTRO86GIH7E'

# Kept in step with server.js by a test in tests.js.
TILE_HOSTS = 'https://services.arcgisonline.com https://tilecache.rainviewer.com'

BASE_CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:{tiles}; font-src 'self'; connect-src 'self'; "
            "frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'")

STRICT_CSP = BASE_CSP.format(tiles='')
WEATHER_CSP = BASE_CSP.format(tiles=' ' + TILE_HOSTS)

# geolocation=(self), NOT geolocation=(). server.js disables it because the
# tailnet is plain HTTP where it cannot work anyway; production is the opposite
# case. All three features - the console, ONE PUTT and THERMAL - call
# getCurrentPosition, and an empty allowlist would disable it site-wide with no
# error anywhere. Every visitor would silently be in Los Angeles, which is
# indistinguishable from "the feature works, everyone happens to be there".
PERMISSIONS_POLICY = 'geolocation=(self), microphone=(), camera=()'

POLICIES = [
    ('branyontech-strict', 'Site-wide security headers', STRICT_CSP),
    ('branyontech-weather', 'As branyontech-strict, plus the map tile hosts', WEATHER_CSP),
]


def aws(*args):
    out = subprocess.run(['aws'] + list(args), capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit('aws ' + ' '.join(args[:3]) + ' failed:\n' + out.stderr.strip())
    return json.loads(out.stdout) if out.stdout.strip() else {}


def policy_config(name, comment, csp):
    return {
        'Name': name,
        'Comment': comment,
        'SecurityHeadersConfig': {
            'ContentSecurityPolicy': {
                'ContentSecurityPolicy': csp, 'Override': True
            },
            'ContentTypeOptions': {'Override': True},
            'FrameOptions': {'FrameOption': 'DENY', 'Override': True},
            'ReferrerPolicy': {
                'ReferrerPolicy': 'strict-origin-when-cross-origin', 'Override': True
            },
            # No includeSubDomains and no preload. Both are effectively
            # irreversible for the lifetime of the max-age, and includeSubDomains
            # would harden every subdomain including any that does not yet serve
            # a valid certificate - browsers then refuse the bypass. Add them
            # deliberately later, not as part of switching headers on.
            'StrictTransportSecurity': {
                'AccessControlMaxAgeSec': 31536000, 'Override': True
            },
            # X-XSS-Protection is deliberately absent. server.js still sends
            # '1; mode=block'; it is deprecated, ignored by current browsers, and
            # its legacy filter could itself be abused. Omitting it is the
            # current guidance.
        },
        'CustomHeadersConfig': {
            'Quantity': 1,
            'Items': [{
                'Header': 'Permissions-Policy',
                'Value': PERMISSIONS_POLICY,
                'Override': True
            }]
        }
    }


def find_policies():
    existing = aws('cloudfront', 'list-response-headers-policies', '--type', 'custom')
    items = existing.get('ResponseHeadersPolicyList', {}).get('Items', [])
    return {i['ResponseHeadersPolicy']['ResponseHeadersPolicyConfig']['Name']:
            i['ResponseHeadersPolicy']['Id'] for i in items}


def ensure_policies(apply):
    have = find_policies()
    ids = {}
    for name, comment, csp in POLICIES:
        if name in have:
            print('  policy %-22s exists  %s' % (name, have[name]))
            ids[name] = have[name]
            continue
        if not apply:
            print('  policy %-22s WOULD CREATE' % name)
            ids[name] = '<new:' + name + '>'
            continue
        made = aws('cloudfront', 'create-response-headers-policy',
                   '--response-headers-policy-config',
                   json.dumps(policy_config(name, comment, csp)))
        ids[name] = made['ResponseHeadersPolicy']['Id']
        print('  policy %-22s created %s' % (name, ids[name]))
    return ids


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='actually update CloudFront')
    args = ap.parse_args()

    print('Response headers policies:')
    ids = ensure_policies(args.apply)

    print('\nDistribution %s:' % DISTRIBUTION)
    got = aws('cloudfront', 'get-distribution-config', '--id', DISTRIBUTION)
    etag, cfg = got['ETag'], got['DistributionConfig']

    changes = []

    default = cfg['DefaultCacheBehavior']
    if default.get('ResponseHeadersPolicyId') != ids['branyontech-strict']:
        changes.append('  default behaviour -> branyontech-strict')
        default['ResponseHeadersPolicyId'] = ids['branyontech-strict']

    behaviours = cfg.setdefault('CacheBehaviors', {'Quantity': 0, 'Items': []})
    items = behaviours.setdefault('Items', [])

    for b in items:
        # /weather/api/* is the API. It gets the strict policy: it returns JSON,
        # never HTML, and never loads a tile.
        want = ids['branyontech-weather'] if b['PathPattern'] == '/weather/*' \
            else ids['branyontech-strict']
        if b.get('ResponseHeadersPolicyId') != want:
            changes.append('  %-18s -> %s' % (b['PathPattern'],
                                              'weather' if want == ids['branyontech-weather'] else 'strict'))
            b['ResponseHeadersPolicyId'] = want

    if not any(b['PathPattern'] == '/weather/*' for b in items):
        # Must sit AFTER /weather/api/* - CloudFront takes the first match in
        # list order, and /weather/* would otherwise swallow the API behaviour.
        template = dict(default)
        template['PathPattern'] = '/weather/*'
        template['ResponseHeadersPolicyId'] = ids['branyontech-weather']
        items.append(template)
        behaviours['Quantity'] = len(items)
        changes.append('  CREATE /weather/*  (copy of default, weather policy)')

    if not changes:
        print('  nothing to change - already attached')
        return

    print('\n'.join(changes))

    if not args.apply:
        print('\nDry run. Re-run with --apply to make these changes.')
        print('Then verify:  ./scripts/check-headers.sh')
        return

    with open('/tmp/cf-config.json', 'w') as fh:
        json.dump(cfg, fh)
    aws('cloudfront', 'update-distribution', '--id', DISTRIBUTION,
        '--if-match', etag, '--distribution-config', 'file:///tmp/cf-config.json')
    print('\nUpdated. CloudFront takes a few minutes to propagate.')
    print('Then verify:  ./scripts/check-headers.sh')


if __name__ == '__main__':
    main()
