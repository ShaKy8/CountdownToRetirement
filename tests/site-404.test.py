"""Offline tests: no AWS calls or configuration changes."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('site404', Path(__file__).parents[1] / 'scripts/site-404.py')
site404 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(site404)


def distribution():
    return {'DefaultCacheBehavior': {'TargetOriginId': 'site'}, 'Origins': {'Items': [
        {'Id': 'site', 'DomainName': 'branyontech.com.s3-website-us-east-1.amazonaws.com',
         'CustomOriginConfig': {'OriginProtocolPolicy': 'http-only'}},
        {'Id': 'api', 'DomainName': 'example.execute-api.us-east-1.amazonaws.com',
         'CustomOriginConfig': {'OriginProtocolPolicy': 'https-only'}}]},
        'CacheBehaviors': {'Items': [{'PathPattern': '/weather/api/*', 'TargetOriginId': 'api'}]},
        'CustomErrorResponses': {'Quantity': 0}}


WEBSITE = {'IndexDocument': {'Suffix': 'index.html'}, 'RoutingRules': [
    {'Condition': {'KeyPrefixEquals': 'old/'}, 'Redirect': {'ReplaceKeyPrefixWith': 'new/'}}]}


class Site404Tests(unittest.TestCase):
    def test_website_origin_verified_without_mutating_api_or_any_distribution_field(self):
        config = distribution()
        original = copy.deepcopy(config)
        self.assertEqual(site404.verify_origin(config), config['Origins']['Items'][0]['DomainName'])
        self.assertEqual(config, original)

    def test_rest_oac_other_bucket_or_origin_path_requires_review(self):
        for change in [{'DomainName': 'branyontech.com.s3.amazonaws.com'},
                       {'DomainName': 'another.s3-website-us-east-1.amazonaws.com'},
                       {'OriginAccessControlId': 'example'}, {'OriginPath': '/prefix'}]:
            config = distribution()
            config['Origins']['Items'][0].update(change)
            with self.assertRaises(ValueError):
                site404.verify_origin(config)

    def test_existing_cloudfront_404_override_requires_review(self):
        config = distribution()
        config['CustomErrorResponses'] = {'Items': [{'ErrorCode': 404, 'ResponsePagePath': '/index.html', 'ResponseCode': '200'}]}
        with self.assertRaises(ValueError):
            site404.verify_origin(config)

    def test_plan_changes_only_error_document_and_is_idempotent(self):
        original = copy.deepcopy(WEBSITE)
        planned = site404.plan_website(WEBSITE)
        self.assertEqual(planned, dict(WEBSITE, ErrorDocument={'Key': '404.html'}))
        self.assertEqual(WEBSITE, original)
        self.assertEqual(site404.plan_website(planned), planned)

    def test_restore_preserves_newer_unrelated_website_changes(self):
        current = site404.plan_website(WEBSITE)
        current['IndexDocument']['Suffix'] = 'home.html'
        restored = site404.plan_website(current, None)
        self.assertNotIn('ErrorDocument', restored)
        self.assertEqual(restored['IndexDocument']['Suffix'], 'home.html')
        self.assertEqual(restored['RoutingRules'], WEBSITE['RoutingRules'])

    def test_redirect_or_unconfigured_website_is_never_replaced(self):
        for config in [{}, {'RedirectAllRequestsTo': {'HostName': 'example.com'}}, {'IndexDocument': {}}]:
            with self.assertRaises(ValueError):
                site404.plan_website(config)

    def test_backup_is_exclusive_and_cannot_overwrite_checkpoint(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'backup.json'
            site404.write_json_exclusive(path, WEBSITE)
            with self.assertRaises(FileExistsError):
                site404.write_json_exclusive(path, {})
            self.assertEqual(json.loads(path.read_text()), WEBSITE)

    def test_dry_run_only_reads_two_configurations(self):
        calls = []
        def aws(*args):
            calls.append(args)
            if args[:2] == ('cloudfront', 'get-distribution-config'):
                return {'DistributionConfig': distribution()}
            self.assertEqual(args[:2], ('s3api', 'get-bucket-website'))
            return copy.deepcopy(WEBSITE)
        with patch.object(site404, 'aws', aws), patch.object(sys, 'argv', ['site-404.py']):
            site404.main()
        self.assertEqual(len(calls), 2)

    def test_apply_rechecks_drift_and_never_writes_after_change(self):
        calls = []
        def aws(*args):
            calls.append(args)
            if args[:2] == ('cloudfront', 'get-distribution-config'):
                return {'DistributionConfig': distribution()}
            if args[:2] == ('s3api', 'head-object'):
                return {'ContentLength': 100, 'ContentType': 'text/html'}
            if args[:2] == ('s3api', 'get-bucket-website'):
                if len(calls) == 2:
                    return copy.deepcopy(WEBSITE)
                return dict(WEBSITE, ErrorDocument={'Key': 'someone-elses-page.html'})
            self.fail('Unexpected write: ' + str(args))
        with tempfile.TemporaryDirectory() as directory:
            backup = str(Path(directory) / 'backup.json')
            with patch.object(site404, 'aws', aws), patch.object(sys, 'argv', ['site-404.py', '--apply', '--backup', backup]):
                with self.assertRaisesRegex(ValueError, 'changed during planning'):
                    site404.main()
            self.assertEqual(json.loads(Path(backup).read_text())['website'], WEBSITE)

    def test_apply_writes_only_expected_website_and_verifies(self):
        calls = []
        state = copy.deepcopy(WEBSITE)
        def aws(*args):
            calls.append(args)
            if args[:2] == ('cloudfront', 'get-distribution-config'):
                return {'DistributionConfig': distribution()}
            if args[:2] == ('s3api', 'get-bucket-website'):
                return copy.deepcopy(state)
            if args[:2] == ('s3api', 'head-object'):
                return {'ContentLength': 100, 'ContentType': 'text/html; charset=utf-8'}
            self.assertEqual(args[:2], ('s3api', 'put-bucket-website'))
            self.assertEqual(args[2:4], ('--bucket', 'branyontech.com'))
            state.update(json.loads(args[5]))
            return {}
        with tempfile.TemporaryDirectory() as directory:
            backup = str(Path(directory) / 'backup.json')
            with patch.object(site404, 'aws', aws), patch.object(sys, 'argv', ['site-404.py', '--apply', '--backup', backup]):
                site404.main()
        self.assertEqual(state, site404.plan_website(WEBSITE))
        self.assertEqual(sum(call[:2] == ('s3api', 'put-bucket-website') for call in calls), 1)


if __name__ == '__main__':
    unittest.main()
