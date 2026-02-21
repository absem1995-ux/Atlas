#!/bin/bash
# Pain Detector - Scores posts for pain intensity using keyword matching + heuristics
# Input: logs/raw-posts.json
# Output: logs/pain-points.json (scored & filtered)

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CONFIG="$BASE_DIR/agent-config.json"
INPUT="$BASE_DIR/logs/raw-posts.json"
OUTPUT="$BASE_DIR/logs/pain-points.json"
MIN_SCORE=$(jq -r '.rules.min_pain_score' "$CONFIG")

if [ ! -f "$INPUT" ]; then
  echo "[pain-detector] No input file. Run reddit-reader first."
  exit 1
fi

# Build keyword regex from config
KEYWORDS=$(jq -r '.rules.pain_keywords | join("|")' "$CONFIG")

# Score each post: keyword density + engagement signals
jq --arg keywords "$KEYWORDS" --argjson min_score "$MIN_SCORE" '
  [.[] | . as $post |
    # Count keyword matches in title + body
    ((.title + " " + .selftext) | ascii_downcase) as $text |
    ($keywords | split("|")) as $kw_list |
    ([$kw_list[] | . as $kw | select($text | contains($kw))] | length) as $kw_hits |
    
    # Pain score formula
    (($kw_hits / ($kw_list | length)) * 0.5 +
     (if .num_comments > 10 then 0.2 elif .num_comments > 3 then 0.1 else 0 end) +
     (if .score > 20 then 0.15 elif .score > 5 then 0.08 else 0 end) +
     (if (($text | contains("anyone")) or ($text | contains("help")) or ($text | contains("please")) or ($text | contains("need")) or ($text | contains("looking for"))) then 0.15 else 0 end)
    ) as $pain_score |
    
    select($pain_score >= $min_score) |
    . + {
      pain_score: ($pain_score * 100 | round / 100),
      keyword_hits: $kw_hits,
      pain_category: (
        if (($text | contains("tool")) or ($text | contains("software")) or ($text | contains("app")) or ($text | contains("saas"))) then "tooling"
        elif (($text | contains("automat")) or ($text | contains("workflow")) or ($text | contains("manual"))) then "automation"
        elif (($text | contains("market")) or ($text | contains("seo")) or ($text | contains("traffic")) or ($text | contains("leads"))) then "marketing"
        elif (($text | contains("hire")) or ($text | contains("freelanc")) or ($text | contains("team"))) then "hiring"
        elif (($text | contains("cost")) or ($text | contains("expens")) or ($text | contains("budget")) or ($text | contains("pric"))) then "cost"
        else "general"
        end
      )
    }
  ] | sort_by(-.pain_score)
' "$INPUT" > "$OUTPUT"

COUNT=$(jq 'length' "$OUTPUT")
echo "[pain-detector] Found $COUNT pain points above threshold $MIN_SCORE"
jq '.[0:5] | .[] | "\(.pain_score) | \(.pain_category) | \(.subreddit) | \(.title[0:80])"' "$OUTPUT"
