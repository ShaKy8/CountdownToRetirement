#!/usr/bin/env bash
#
# Check the security headers production actually sends.
#
# Run it before attaching the CloudFront policy to see the gap, and after to
# confirm it closed. Every check names what breaks if it fails, because most of
# these fail silently in a browser.
#
set -uo pipefail

SITE="${1:-https://branyontech.com}"
fail=0

hdr() { curl -sI --max-time 10 "$1" | tr -d '\r' | grep -i "^$2:" | cut -d' ' -f2-; }

check() {  # check <label> <value> <pattern> <why it matters>
  printf '  %-26s ' "$1"
  if [ -z "$2" ]; then
    printf 'MISSING    %s\n' "$4"; fail=1
  elif printf '%s' "$2" | grep -qi -- "$3"; then
    printf 'ok\n'
  else
    printf 'WRONG      %s\n' "$4"
    printf '    got: %s\n' "$2"; fail=1
  fi
}

echo "Landing page  $SITE/"
check "content-security-policy" "$(hdr "$SITE/" content-security-policy)" \
      "script-src 'self'" "scripts could be loaded from anywhere"
check "x-content-type-options" "$(hdr "$SITE/" x-content-type-options)" \
      "nosniff" "content could be sniffed into a different type"
check "x-frame-options" "$(hdr "$SITE/" x-frame-options)" \
      "DENY" "the site could be framed for clickjacking"
check "referrer-policy" "$(hdr "$SITE/" referrer-policy)" \
      "strict-origin" "full URLs leak to third parties"
check "strict-transport-security" "$(hdr "$SITE/" strict-transport-security)" \
      "max-age" "the first visit of a session can be downgraded"

# The one that silently removes a feature rather than adding risk.
perms=$(hdr "$SITE/" permissions-policy)
printf '  %-26s ' "permissions-policy"
if [ -z "$perms" ]; then
  printf 'MISSING    geolocation is allowed by default, which is what the games want\n'
elif printf '%s' "$perms" | grep -qi 'geolocation=()'; then
  printf 'BREAKS GAMES\n'
  printf '    geolocation=() disables it site-wide. ONE PUTT, THERMAL and the\n'
  printf '    console all call getCurrentPosition; every visitor would silently\n'
  printf '    be in Los Angeles. Use geolocation=(self).\n'
  fail=1
elif printf '%s' "$perms" | grep -qi 'geolocation=(self)'; then
  printf 'ok\n'
else
  printf 'CHECK      got: %s\n' "$perms"
fi

echo
echo "Weather console  $SITE/weather/"
wcsp=$(hdr "$SITE/weather/" content-security-policy)
check "content-security-policy" "$wcsp" "script-src 'self'" "scripts unrestricted"
printf '  %-26s ' "img-src tile hosts"
if [ -z "$wcsp" ]; then
  printf 'no CSP yet\n'
elif printf '%s' "$wcsp" | grep -q 'arcgisonline'; then
  printf 'ok\n'
else
  printf 'MISSING    the radar view renders blank with only a console error\n'; fail=1
fi

echo
echo "Games keep the strict policy"
for p in /game/ /thermal/; do
  csp=$(hdr "$SITE$p" content-security-policy)
  printf '  %-26s ' "$p"
  if [ -z "$csp" ]; then printf 'no CSP yet\n'
  elif printf '%s' "$csp" | grep -q 'arcgisonline'; then
    printf 'TOO WIDE   %s should not carry the tile hosts\n' "$p"; fail=1
  else printf 'ok\n'; fi
done

echo
[ "$fail" -eq 0 ] && echo "All good." || echo "Some checks failed (see above)."
exit "$fail"
