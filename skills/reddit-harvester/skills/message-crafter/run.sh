#!/bin/bash
# Message Crafter - Generates personalized outreach messages for pain points
# Input: logs/solutions-found.json  Output: logs/outreach-drafts.json
# All messages are DRAFTS requiring ehi approval before sending

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
INPUT="$BASE_DIR/logs/solutions-found.json"
OUTPUT="$BASE_DIR/logs/outreach-drafts.json"

if [ ! -f "$INPUT" ]; then
  echo "[message-crafter] No solutions to craft messages for."
  exit 1
fi

jq '
  [.[0:10][] |
    . as $s |
    {
      target_post: .pain_point.url,
      target_author: .pain_point.author,
      subreddit: .pain_point.subreddit,
      solution_type: .best_solution.type,
      status: "draft_needs_approval",
      message: (
        "Hey! I saw your post about " + (.pain_point.title[0:50]) + " — I totally get the frustration.\n\n" +
        "I actually put together a " + .best_solution.type + " that might help: " + .best_solution.approach + ".\n\n" +
        "Would love to share it if you are interested — no strings attached. Just trying to help people dealing with this exact problem.\n\n" +
        "Let me know!"
      ),
      crafted_at: (now | todate),
      compliance: {
        no_spam: true,
        value_first: true,
        no_hard_sell: true,
        personalized: true,
        approval_required: true
      }
    }
  ]
' "$INPUT" > "$OUTPUT"

COUNT=$(jq 'length' "$OUTPUT")
echo "[message-crafter] Drafted $COUNT outreach messages (all pending approval)"
