#!/bin/zsh
# The ship chain: gates, commit, push, remote build on Vercel, then verify the alias serves the new pages.
#
#   scripts/ship.sh <n> "<commit subject>" <check-page> [<check-page> ...]
#   scripts/ship.sh 160 "What changed" "cancers/prostate/" id:egfr
#
# A check page is a path, or `id:<entity-id>` to have the record's real route resolved from the built API. It ran
# nineteen times on 25 September 2026 and lived in /tmp until then, which is why it is here now.
# The local `next build` was dropped: Vercel builds from source on deploy, a failed remote build never aliases, and the
# local build cost 25 minutes and 9 GB of disk per chain (it also triggered the 21 Sept memory crash). We verify after.
set -o pipefail
cd "$(dirname "$0")/.." || exit 1   # the repo root, wherever this checkout lives
N="$1"; S="$2"; shift 2; CHECKS=("$@")
# Four whole-page render tests carry their own wall-clock guard, which --testTimeout does not override. On this
# machine agents are usually building in other worktrees, so the guard measures contention rather than the code:
# chain 150 failed on all four at 149 seconds and every one passed on a re-run. The chain says how loaded it is.
export SLOW_TEST_MS=600000
npx tsx scripts/changelog-sync.ts "$S" && npm run -s validate && npm run -s typecheck && npm run -s lint && npx vitest run --testTimeout=600000 --hookTimeout=600000
rc=$?; if [ $rc -ne 0 ]; then echo "GATES-FAILED rc=$rc"; exit 1; fi
# From chain 147: `vercel deploy --archive=tgz` reads public/ while it packs, and `build:api` begins by clearing
# public/api/v1. A gate run started in another shell during the deploy deleted a file mid-archive and the upload
# died with ENOENT on a path that existed a second earlier. The lock makes the two mutually exclusive: nothing
# else may rebuild the API or deploy while this chain is between its build and the end of its upload.
# macOS has no flock(1), so the lock is a directory: mkdir is atomic on APFS and fails if it already exists.
LOCK=/tmp/onco-api-build.lock
for i in $(seq 1 240); do mkdir "$LOCK" 2>/dev/null && break; sleep 5; done
if [ ! -d "$LOCK" ]; then echo "LOCK-FAILED: could not take /tmp/onco-api-build.lock"; exit 1; fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT INT TERM
npm run -s build:api || { echo "BUILD-API-FAILED"; exit 1; }
# A check written as id:<entity-id> is resolved to the record's real route from the built API, because guessing a
# route is the one way this verification fails on a deploy that actually worked: /glossary/<id>/ looked obvious and
# the route is /terms/<id>/, so chain 141 reported a timeout on a site that was serving every page.
for i in {1..${#CHECKS[@]}}; do
  case "${CHECKS[$i]}" in
    id:*) eid="${CHECKS[$i]#id:}"
      route=$(grep -m1 "\"id\":\"$eid\"" public/api/v1/all.ndjson | sed -n 's/.*"route":"\([^"]*\)".*/\1/p')
      [ -n "$route" ] || { echo "CHECK-UNRESOLVED: no record with id $eid in public/api/v1/all.ndjson"; exit 1; }
      CHECKS[$i]="${route#/}" ;;
  esac
done
git add -A
git commit -q -m "$S" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" || echo "nothing new to commit"
git push origin HEAD || { echo PUSH-FAILED; exit 1; }
echo UPLOADED
vercel deploy --prod --yes --archive=tgz > /tmp/vercel-tick$N.log 2>&1
rmdir "$LOCK" 2>/dev/null; trap - EXIT INT TERM
grep -i "aliased\|error" /tmp/vercel-tick$N.log | head -3
# Verify: the alias must serve every check page with 200 within 30 minutes (the CLI can drop while the remote build continues).
for i in $(seq 1 60); do ok=1; for p in "${CHECKS[@]}"; do c=$(curl -s -o /dev/null -w "%{http_code}" "https://onco.cc/$p"); [ "$c" = "200" ] || { ok=0; break; }; done; [ $ok = 1 ] && { echo "VERIFIED ${#CHECKS[@]} pages"; echo CHAIN-DONE; exit 0; }; sleep 30; done
echo "VERIFY-TIMEOUT: a check page is not live after 30 minutes"; exit 1
