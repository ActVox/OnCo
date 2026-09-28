#!/bin/zsh
# Send a product change for the owner's review instead of shipping it.
#
#   scripts/propose-product-change.sh "what changed and why it is better"
#
# Pushes the current branch, opens a pull request, builds a preview deployment and records both in
# public/product-queue.json, which /admin/ renders. The owner approves by merging the pull request; the change
# then ships on the next run of scripts/ship.sh.
#
# A preview, not a description, is the point: the complaints that led to this were all about how a page looks and
# what order it is in, which no diff shows.
set -o pipefail
cd "$(dirname "$0")/.." || exit 1
WHY="$1"
[ -n "$WHY" ] || { echo "usage: scripts/propose-product-change.sh \"what changed and why\""; exit 1; }

BRANCH="product/$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BRANCH" >/dev/null 2>&1 || { echo "could not branch"; exit 1; }
git push -u origin "$BRANCH" >/dev/null 2>&1 || { echo "PUSH-FAILED"; exit 1; }

npx tsx scripts/change-class.ts "origin/main..HEAD" > /tmp/onco-change-class.txt 2>&1
FILES=$(grep -c "  product:" /tmp/onco-change-class.txt)

PR=$(gh pr create --title "Product change: ${WHY:0:70}" --body "$WHY

$(cat /tmp/onco-change-class.txt)

A preview is linked in \`public/product-queue.json\` and rendered at /admin/. Merging this is the approval." 2>&1 | tail -1)

echo "opened $PR"
PREVIEW=$(vercel deploy --archive=tgz 2>/dev/null | tail -1)
echo "preview $PREVIEW"

npx tsx scripts/queue-product-change.ts "$BRANCH" "$WHY" "$PR" "$PREVIEW" "$FILES"
echo "QUEUED: the owner reviews it at /admin/ and approves by merging."
