#!/usr/bin/env python3
"""Plan the S3 website error document without changing API error responses.

Dry run by default. Applying needs separately authorized existing AWS access;
this script never creates credentials, grants permissions or updates CloudFront.
It refuses REST/OAC origins: a distribution-wide CloudFront custom 404 would
also replace Weather API JSON errors. See docs/site-404.md.
"""
import argparse
import copy
import json
from pathlib import Path
import re
import subprocess

DISTRIBUTION = 'E1MBTRO86GIH7E'
BUCKET = 'branyontech.com'
ERROR_DOCUMENT = {'Key': '404.html'}


def aws(*args):
    result = subprocess.run(['aws', *args, '--output', 'json'],
                            check=True, capture_output=True, text=True)
    return json.loads(result.stdout) if result.stdout.strip() else {}


def verify_origin(config):
    origin_id = config['DefaultCacheBehavior']['TargetOriginId']
    origins = config['Origins']['Items']
    origin = next((item for item in origins if item['Id'] == origin_id), None)
    pattern = re.escape(BUCKET) + r'\.s3-website[.-][a-z0-9-]+\.amazonaws\.com'
    if not origin or not re.fullmatch(pattern, origin.get('DomainName', '')):
        raise ValueError('Default origin is not the expected S3 website endpoint; stop and review routing.')
    if origin.get('OriginPath') or origin.get('OriginAccessControlId') or 'CustomOriginConfig' not in origin:
        raise ValueError('Unexpected origin path/access configuration; stop and review routing.')
    for error in config.get('CustomErrorResponses', {}).get('Items', []):
        if error['ErrorCode'] == 404 and (error.get('ResponsePagePath') or error.get('ResponseCode')):
            raise ValueError('CloudFront already overrides 404 responses; review that rule before changing S3.')
    return origin['DomainName']


def plan_website(config, error_document=ERROR_DOCUMENT):
    if 'RedirectAllRequestsTo' in config or not config.get('IndexDocument', {}).get('Suffix'):
        raise ValueError('Expected an existing index-based website; refuse to enable or replace website hosting.')
    planned = copy.deepcopy(config)
    if error_document is None:
        planned.pop('ErrorDocument', None)
    else:
        planned['ErrorDocument'] = copy.deepcopy(error_document)
    return planned


def write_json_exclusive(filename, value):
    with Path(filename).open('x', encoding='utf-8') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='apply the displayed, separately approved change')
    parser.add_argument('--backup', help='new file for the current configuration; required for apply')
    parser.add_argument('--restore', help='previous backup; restores only its ErrorDocument field')
    args = parser.parse_args()
    if args.apply and not args.backup:
        parser.error('--apply requires --backup PATH (an existing file is never overwritten)')

    distribution = aws('cloudfront', 'get-distribution-config', '--id', DISTRIBUTION)
    domain = verify_origin(distribution['DistributionConfig'])
    current = aws('s3api', 'get-bucket-website', '--bucket', BUCKET)
    desired = ERROR_DOCUMENT
    if args.restore:
        saved = json.loads(Path(args.restore).read_text(encoding='utf-8'))
        if saved.get('bucket') != BUCKET or saved.get('distribution') != DISTRIBUTION:
            raise ValueError('Backup targets a different website; refusing restore.')
        desired = saved['website'].get('ErrorDocument')
        if current.get('ErrorDocument') not in (ERROR_DOCUMENT, desired):
            raise ValueError('ErrorDocument changed since this fix; review before restoring.')
    planned = plan_website(current, desired)
    print(json.dumps({'bucket': BUCKET, 'verifiedWebsiteOrigin': domain,
                      'before': current.get('ErrorDocument'),
                      'after': planned.get('ErrorDocument')}, indent=2))
    if planned == current:
        print('Already configured. Nothing to change.')
        return
    if not args.apply:
        print('Dry run only. No configuration or backup files were written.')
        return

    # The object is already deployed by deploy.yml. Verify before selecting it.
    if desired == ERROR_DOCUMENT:
        page = aws('s3api', 'head-object', '--bucket', BUCKET, '--key', '404.html')
        if not page.get('ContentLength') or not page.get('ContentType', '').startswith('text/html'):
            raise ValueError('404.html must exist in this bucket with an HTML content type first.')
    write_json_exclusive(args.backup, {'bucket': BUCKET, 'distribution': DISTRIBUTION,
                                      'website': current})
    # S3 website updates have no If-Match option. Re-read immediately before
    # writing and abort on drift; coordinate this one-time change with operators.
    if aws('s3api', 'get-bucket-website', '--bucket', BUCKET) != current:
        raise ValueError('Website configuration changed during planning; no write attempted.')
    aws('s3api', 'put-bucket-website', '--bucket', BUCKET,
        '--website-configuration', json.dumps(planned))
    if aws('s3api', 'get-bucket-website', '--bucket', BUCKET) != planned:
        raise RuntimeError('Post-write verification did not match; inspect AWS before retrying.')
    print('Verified S3 website configuration. Wait for cached errors to expire, then run the public 404 check.')


if __name__ == '__main__':
    main()
