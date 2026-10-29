# Satellite refresh reliability

## Evidence checked on 2026-10-29

- [Run 40782048208](https://github.com/ShaKy8/CountdownToRetirement/actions/runs/40782048208), 2026-10-28 22:42 UTC: AWS OIDC succeeded; the first group failed with three 10-second `UND_ERR_CONNECT_TIMEOUT`s, 30 seconds apart; Publish was skipped. Node 24.22.1, Ubuntu image 20261025.179.1, Azure westus3.
- [Run 40826885415](https://github.com/ShaKy8/CountdownToRetirement/actions/runs/40826885415), 2026-10-29 06:03 UTC: the same repository commit and Ubuntu image fetched all five groups and uploaded them to S3, without a retry. Azure centralus. This was the latest satellite run when changes began.
- [Run 39919670515](https://github.com/ShaKy8/CountdownToRetirement/actions/runs/39919670515), 2026-10-23 07:43 UTC: the same connection-timeout signature, on Ubuntu 24.04 / Node 22.23.3 / centralus. This predates the October 23 retry commit, `d388667`.

The observed failure is connection establishment, not AWS authentication or an HTTP rejection. The historical logs do not distinguish DNS delay, TCP reachability, TLS handshake delay, a destination firewall, or an upstream outage. Success on the same image and failure on different Node majors argue against blaming an image or Node version alone. Region differences are clues, not proof of a regional fault. No source found establishes a CelesTrak outage at the failure timestamps.

## Changes

The dependency-free HTTPS transport gives connection establishment 30 seconds and each complete request 60 seconds. It records DNS addresses, TCP attempts, TCP success, TLS success, HTTP status, bytes and elapsed time from the real request. No diagnostic requests are sent to CelesTrak. DNS-provided IPv4/IPv6 addresses remain eligible; no address or IP family is hard-coded. TLS certificate verification stays enabled.

Only a confirmed TCP connect timeout can repeat, with the existing maximum of three tries and 30-second pauses. DNS/TLS uncertainty, connection resets, header/body timeouts, invalid JSON and invalid records stop the job. Redirects are not followed: every non-200 stops immediately. Previously, native fetch followed redirects before the script could check the status.

`sats-cooldown.mjs` uses S3 to share a cooldown across scheduled/manual runs. It checks the newest of the five published snapshot timestamps and `sats/_fetch-state.json`. Before fetching, it reserves two hours plus one minute plus the 20-minute job budget. At completion, including a failed/partial fetch, it records two hours plus one minute from completion. If a job is cancelled before cleanup, the longer reservation remains. S3 failures stop fetching rather than silently bypassing the guard. The workflow concurrency group serializes these operations; all production invocations must use this workflow.

The two-hour cron is unchanged, but a run that arrives before the cooldown expires skips fetching and publishing. Consequently some adjacent scheduled runs may skip, trading freshness for compliance. The one-minute margin avoids boundary collisions with the provider's update cycle. A non-200 still requires investigation; do not repeatedly dispatch the workflow to clear it.

All five downloads must validate before any local snapshot is written. Publish still requires job success. Existing S3 data files and their gzip/JSON schema remain unchanged on retrieval failure. The new state object contains only a timestamp, has `Cache-Control: no-store`, and is not an orbital-data file. The IAM policy documented in `docs/aws-setup.md` already allows ListBucket/GetObject/PutObject; deployed IAM was not independently inspected.

The workflow now explicitly selects Ubuntu 24.04 and Node 24 for reproducibility. This is not evidence that changing the image fixes networking.

## Validation and follow-up

Run `node --test tests/fetch-sats.test.mjs`. Tests use fixtures, fake connection events and local HTTPS with a temporary trusted certificate. They cover retry limits, redirect/HTTP stopping, TLS verification, stalled/truncated bodies, snapshot preservation, cooldown/cancellation, and S3 errors. They make no requests to CelesTrak or AWS. The test is also included in npm test and PR CI.

After merge, allow the next eligible scheduled run to validate the real runner-to-CelesTrak path and S3 state access. A successful unit test cannot prove that an external route has recovered. Do not rerun the old failed commit to test the new implementation.

If failures recur, use the new phase logs:

| Last successful phase | Investigate |
| --- | --- |
| No DNS result | Runner resolver / DNS delay |
| DNS only; TCP times out | Runner egress, routing, destination availability/firewall |
| TCP connected; TLS never completes | TLS handshake/path/server delay |
| TLS connected; headers/body stall | HTTP service responsiveness or interrupted transfer |
| HTTP non-200 | Provider message, query and usage policy; no immediate retry |

For persistent TCP failures, compare runs' timestamps, runner regions and destination addresses. Obtain the affected runner's public egress IP from the infrastructure provider (or one bounded request to a non-CelesTrak IP-echo service), then ask CelesTrak to check its firewall/server logs. A known egress IP on a self-hosted or static-IP runner is an escalation option if evidence confirms a source-IP/path problem, not an automatic fix or a way around rate limits. No infrastructure migration is included here.

References: [CelesTrak policy](https://celestrak.org/usage-policy.php), [GP data documentation](https://celestrak.org/NORAD/documentation/gp-data-formats.php), [GitHub runner network troubleshooting](https://docs.github.com/en/actions/how-tos/troubleshoot-workflows), [Node connection events](https://github.com/nodejs/node/blob/main/doc/api/net.md).
