#!/usr/bin/env bash
#
# The storm watch that does not depend on GitHub's scheduler (October 21, 2026).
#
# .github/workflows/storms-watch.yml is a schedule GitHub drops most slots of:
# on its second day three runs fired in ten hours against twenty slots. This is
# the same watch on AWS, where a schedule is kept:
#
#   EventBridge rule atmos-storm-watch, rate(15 minutes)
#     -> the weather Lambda, with a Scheduled Event (lambda/index.mjs stormWatch)
#     -> two metrics in namespace AtmosWeather, from one log line:
#          ActiveStorms  how many storms NHC lists (only when NHC was read)
#          CheckFailed   1 when NHC could not be read, else 0 (every run)
#     -> three alarms, each emailing the SNS topic NotifyMe on a change of state:
#          atmos-storm-listed        ActiveStorms >= 1. One email when NHC first
#                                    lists a storm; none while it stays listed
#                                    (the alarm's state is "you were told"); one
#                                    when it clears.
#          atmos-storm-check-failed  CheckFailed >= 1 on two checks running: NHC
#                                    could not be read. Never "no storms".
#          atmos-storm-silent        No check at all for an hour: the watch
#                                    itself has stopped.
#
# Deploy the Lambda code FIRST (a push to main does it); until then the rule
# would invoke a function that does not know the event, and --test says so.
# The GitHub workflow stays as a second, independent path: it is the one that
# opens the issue with the checklist of what to look at on the first storm.
#
# Dry run by default; prints what exists now and what would change.
#
#   aws login
#   ./scripts/storm-watch-aws.sh            # show the plan
#   ./scripts/storm-watch-aws.sh --apply    # create or update it (idempotent)
#   ./scripts/storm-watch-aws.sh --test     # pretend one storm: the alarm goes
#                                           #   off, mails you, and clears itself
#                                           #   on the next real check
#
# Undo: aws events remove-targets --rule atmos-storm-watch --ids 1;
#       aws events delete-rule --name atmos-storm-watch;
#       aws lambda remove-permission --function-name atmos-weather-api \
#         --statement-id storm-watch-events;
#       aws cloudwatch delete-alarms --alarm-names atmos-storm-listed \
#         atmos-storm-check-failed atmos-storm-silent
#
set -euo pipefail

FN="${LAMBDA_FUNCTION:-atmos-weather-api}"
RULE="${RULE_NAME:-atmos-storm-watch}"
TOPIC="${SNS_TOPIC:-NotifyMe}"
SCHEDULE="rate(15 minutes)"
SID="storm-watch-events"
NS="AtmosWeather"
MODE="plan"
case "${1:-}" in --apply) MODE=apply;; --test) MODE=test;; "") ;; *) echo "usage: $0 [--apply|--test]"; exit 2;; esac

aws sts get-caller-identity >/dev/null 2>&1 || { echo "No AWS session. Run: aws login"; exit 1; }

FN_ARN=$(aws lambda get-function --function-name "$FN" --query 'Configuration.FunctionArn' --output text)
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region || echo us-east-1)}}"
TOPIC_ARN="arn:aws:sns:$REGION:$ACCOUNT:$TOPIC"
RULE_ARN="arn:aws:events:$REGION:$ACCOUNT:rule/$RULE"
aws sns get-topic-attributes --topic-arn "$TOPIC_ARN" >/dev/null 2>&1 || { echo "No SNS topic $TOPIC_ARN"; exit 1; }
SUBS=$(aws sns list-subscriptions-by-topic --topic-arn "$TOPIC_ARN" --query 'length(Subscriptions[?starts_with(SubscriptionArn, `arn:`)])' --output text)

if [ "$MODE" = test ]; then
  echo "Invoking $FN with a test Scheduled Event (pretends one storm is listed)..."
  out=$(mktemp); trap 'rm -f "$out"' EXIT
  aws lambda invoke --function-name "$FN" --cli-binary-format raw-in-base64-out \
    --payload '{"source":"aws.events","detail-type":"Scheduled Event","test":true}' "$out" >/dev/null
  cat "$out"; echo
  grep -q '"activeCount":1' "$out" || { echo "The function did not answer as the storm watch: deploy lambda/index.mjs first."; exit 1; }
  echo "Within about 15 minutes atmos-storm-listed should go to ALARM and $TOPIC should email you;"
  echo "the next real check (activeCount 0) clears it and sends the OK email."
  exit 0
fi

exists_rule=$(aws events describe-rule --name "$RULE" --query 'ScheduleExpression' --output text 2>/dev/null || echo none)
has_perm=$(aws lambda get-policy --function-name "$FN" --query 'Policy' --output text 2>/dev/null | grep -c "\"$SID\"" || true)
alarms=$(aws cloudwatch describe-alarms --alarm-names atmos-storm-listed atmos-storm-check-failed atmos-storm-silent \
  --query 'MetricAlarms[].AlarmName' --output text)

echo "Lambda        $FN"
echo "EventBridge   rule $RULE   now: $exists_rule -> $SCHEDULE, target $FN"
echo "Permission    $SID (events.amazonaws.com may invoke $FN)   now: $([ "$has_perm" -gt 0 ] && echo present || echo missing)"
echo "Alarms        atmos-storm-listed, atmos-storm-check-failed, atmos-storm-silent   now: ${alarms:-none}"
echo "Notify        $TOPIC_ARN   confirmed subscriptions: $SUBS"
[ "$SUBS" -gt 0 ] || echo "WARNING: $TOPIC has no confirmed subscription, so no alarm would reach anyone."

if [ "$MODE" != apply ]; then
  echo; echo "Dry run. Re-run with --apply to make these changes (and --test afterwards to prove the email path)."; exit 0
fi

aws events put-rule --name "$RULE" --schedule-expression "$SCHEDULE" --state ENABLED \
  --description "Storm watch: invokes $FN every 15 minutes to ask NHC whether a storm is listed" >/dev/null
if [ "$has_perm" -eq 0 ]; then
  aws lambda add-permission --function-name "$FN" --statement-id "$SID" --action lambda:InvokeFunction \
    --principal events.amazonaws.com --source-arn "$RULE_ARN" >/dev/null
fi
aws events put-targets --rule "$RULE" --targets "Id=1,Arn=$FN_ARN" >/dev/null

# Listed: Maximum over 15 minutes, one datapoint. Missing data is ignored, so a failed check
# neither clears the alarm nor raises it; CheckFailed speaks for failures.
aws cloudwatch put-metric-alarm --alarm-name atmos-storm-listed \
  --alarm-description "NHC lists a live storm. Look at https://branyontech.com/weather/#radar and https://www.nhc.noaa.gov/ . Not an official source. The GitHub issue labelled storm-watch has the checklist." \
  --namespace "$NS" --metric-name ActiveStorms --statistic Maximum --period 900 \
  --evaluation-periods 1 --datapoints-to-alarm 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data ignore --alarm-actions "$TOPIC_ARN" --ok-actions "$TOPIC_ARN"

# Could not check: two 15-minute periods running, so one NHC blip does not mail. Missing data is
# fine here; the silent alarm covers a watch that stopped. Its message must never say "no storms".
aws cloudwatch put-metric-alarm --alarm-name atmos-storm-check-failed \
  --alarm-description "The storm watch could not read NHC's CurrentStorms.json twice running. That is not 'no storms': nobody knows. Check https://www.nhc.noaa.gov/ and the Lambda's CloudWatch log for '[api] /api/storms'." \
  --namespace "$NS" --metric-name CheckFailed --statistic Maximum --period 900 \
  --evaluation-periods 2 --datapoints-to-alarm 2 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching --alarm-actions "$TOPIC_ARN" --ok-actions "$TOPIC_ARN"

# Silent: no run at all in a whole hour. SampleCount below 1 with missing data breaching.
aws cloudwatch put-metric-alarm --alarm-name atmos-storm-silent \
  --alarm-description "The storm watch has not run for an hour: the EventBridge rule atmos-storm-watch, its permission or the Lambda has stopped. Until it is back nobody is watching NHC (the hourly GitHub workflow is the only other path)." \
  --namespace "$NS" --metric-name CheckFailed --statistic SampleCount --period 3600 \
  --evaluation-periods 1 --datapoints-to-alarm 1 --threshold 1 --comparison-operator LessThanThreshold \
  --treat-missing-data breaching --alarm-actions "$TOPIC_ARN" --ok-actions "$TOPIC_ARN"

echo; echo "Applied. Prove the email path with: $0 --test"
