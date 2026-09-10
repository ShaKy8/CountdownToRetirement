#!/usr/bin/env bash
#
# Set this project up on another machine.
#
# Everything that matters is in two git repos, so this is mostly clone and
# check. What it deliberately does NOT do is move secrets. The Anthropic key
# and the AWS session are handled by hand, because a script that copies
# credentials around is a script that leaves them somewhere.
#
# Safe to re-run: it updates instead of cloning when a repo is already there.
#
# This script lives in the repo it sets up, so bootstrap with one clone by
# hand and let it do the rest:
#
#   git clone https://github.com/ShaKy8/CountdownToRetirement.git ~/Projects/branyontech
#   bash ~/Projects/branyontech/scripts/setup-dev-machine.sh
#
set -euo pipefail

ROOT="${PROJECTS_DIR:-$HOME/Projects}"
SITE="$ROOT/branyontech"
WX="$ROOT/Weather"
SITE_URL="https://github.com/ShaKy8/CountdownToRetirement.git"
WX_URL="https://github.com/ShaKy8/weather.git"

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32mok\033[0m   %s\n' "$*"; }
warn() { printf '  \033[33mwarn\033[0m %s\n' "$*"; }
die()  { printf '  \033[31mFAIL\033[0m %s\n' "$*"; exit 1; }

say "Machine"
echo "  $(hostname) — $(uname -sm), $(nproc) cores, $(free -g 2>/dev/null | awk '/^Mem:/{print $2"GB"}' || echo '?') RAM"
echo "  home: $HOME"

say "Prerequisites"
command -v git >/dev/null || die "git is not installed"
ok "git $(git --version | awk '{print $3}')"

command -v node >/dev/null || die "node is not installed (need 22+)"
node_major=$(node -p 'process.versions.node.split(".")[0]')
[ "$node_major" -ge 22 ] || die "node $(node -v) is too old; the gates need 22+ for a global WebSocket"
# Checked directly rather than inferred from the version: the seven headless
# gates all speak CDP over `new WebSocket(...)` with no dependency to install,
# and without it they fail deep inside a browser session rather than up front.
node -e 'if (typeof WebSocket === "undefined") process.exit(1)' \
  || die "this node has no global WebSocket; the gates cannot talk to Chromium"
ok "node $(node -v), global WebSocket present"

command -v python3 >/dev/null || die "python3 is not installed (sync-weather.sh needs it)"
ok "python3 $(python3 -V 2>&1 | awk '{print $2}')"

found=""
for c in "${CHROMIUM:-}" /usr/bin/chromium /usr/bin/chromium-browser \
         /usr/bin/google-chrome-stable /usr/bin/google-chrome /snap/bin/chromium \
         /opt/google/chrome/chrome; do
  [ -n "$c" ] && [ -x "$c" ] && { found="$c"; break; }
done
if [ -n "$found" ]; then ok "chromium $found"
else warn "no chromium found — the seven audit gates will not run.
       install one, or export CHROMIUM=/path/to/it"
fi

if command -v aws >/dev/null; then
  v=$(aws --version 2>&1 | sed -E 's|aws-cli/([0-9.]+).*|\1|')
  ok "aws $v"
  case "$v" in 2.3[4-9]*|2.[4-9]*|[3-9]*) ;; *) warn "aws $v may predate 'aws login' (2.34 works)";; esac
else warn "aws cli missing — needed only to set the Lambda key and deploy by hand"; fi
command -v gh >/dev/null && ok "gh $(gh --version | head -1 | awk '{print $3}')" \
  || warn "gh missing — only used to watch deploy runs"

say "Repositories"
# They must be siblings: scripts/sync-weather.sh resolves ../../Weather/public
# relative to itself, and the console is generated output copied from there.
mkdir -p "$ROOT"
clone_or_pull() {
  local dir="$1" url="$2"
  if [ ! -d "$dir/.git" ]; then
    git clone --quiet "$url" "$dir" && ok "$dir cloned"
    return
  fi
  git -C "$dir" fetch --quiet origin || { warn "$dir: could not reach origin"; return; }
  # fetch + merge rather than `git pull`, which honours pull.rebase and then
  # refuses on any unstaged change with an error about rebasing that has
  # nothing to do with what went wrong here.
  if [ -n "$(git -C "$dir" status --porcelain)" ]; then
    warn "$dir has uncommitted changes — left alone, not updated"
    return
  fi
  git -C "$dir" merge --ff-only --quiet origin/main 2>/dev/null \
    && ok "$dir up to date ($(git -C "$dir" log --oneline -1 | cut -c1-50))" \
    || warn "$dir cannot fast-forward — it has diverged from origin/main"
}
clone_or_pull "$SITE" "$SITE_URL"
clone_or_pull "$WX" "$WX_URL"

say "Proof it works"
cd "$SITE"
node tests.js >/tmp/setup-tests.log 2>&1 \
  && ok "$(grep -E 'Total Tests' /tmp/setup-tests.log | tr -s ' ') — all passing" \
  || die "tests failed; see /tmp/setup-tests.log"

say "Still to do by hand"
cat <<NEXT
  1. The Anthropic API key. It is not in git and must not be.
     From the machine that has it:
       tailscale file cp ~/.config/anthropic/branyontech-key $(hostname):
     then here:
       mkdir -p ~/.config/anthropic && chmod 700 ~/.config/anthropic
       tailscale file get ~/.config/anthropic/
       chmod 600 ~/.config/anthropic/branyontech-key

  2. AWS. There is no session to copy; log in fresh:
       aws login          # IAM user in account 391292551001, region us-east-1
       aws sts get-caller-identity

  3. Claude Code's memory for this project lives outside the repo, at
       ~/.claude/projects/${SITE//\//-}/memory/
     Copy that directory over to keep what past sessions learned. The name is
     derived from the project path, so cloning to the same path on both
     machines is what makes it line up.
NEXT
echo
