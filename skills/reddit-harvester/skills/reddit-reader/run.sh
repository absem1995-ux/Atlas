#!/bin/bash
# Reddit Reader - Fetches recent posts from target subreddits via Reddit JSON API
# No auth needed for read-only public subreddit access (uses .json endpoints)
# Rate limited: max 10 req/min, 6s between requests

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG="$BASE_DIR/agent-config.json"
OUTPUT_DIR="$BASE_DIR/logs"
OUTPUT_FILE="$OUTPUT_DIR/raw-posts.json"
MAX_AGE_HOURS=48

mkdir -p "$OUTPUT_DIR"

# Read subreddits from config
SUBREDDITS=$(jq -r '.rules.subreddits[]' "$CONFIG")
CUTOFF_UTC=$(date -u -d "-${MAX_AGE_HOURS} hours" +%s 2>/dev/null || date -u -v-${MAX_AGE_HOURS}H +%s)

echo "[]" > "$OUTPUT_FILE"

for SUB in $SUBREDDITS; do
  echo "[reddit-reader] Fetching r/$SUB ..."
  
  RESPONSE=$(curl -s -A "ReaperBot/1.0 (pain-point-harvester)" \
    "https://www.reddit.com/r/${SUB}/new.json?limit=25&t=day" 2>/dev/null || echo '{"data":{"children":[]}}')
  
  # Parse and filter posts < 48h, extract relevant fields
  echo "$RESPONSE" | jq --argjson cutoff "$CUTOFF_UTC" '
    [.data.children[]?.data | select(.created_utc > $cutoff) | {
      id: .id,
      subreddit: .subreddit,
      title: .title,
      selftext: (.selftext // "")[0:2000],
      author: .author,
      score: .score,
      num_comments: .num_comments,
      url: ("https://reddit.com" + .permalink),
      created_utc: .created_utc,
      flair: .link_flair_text
    }]' 2>/dev/null > /tmp/sub_posts.json || echo "[]" > /tmp/sub_posts.json
  
  # Merge into output
  jq -s '.[0] + .[1]' "$OUTPUT_FILE" /tmp/sub_posts.json > /tmp/merged.json
  mv /tmp/merged.json "$OUTPUT_FILE"
  
  # Rate limit
  sleep 6
done

POST_COUNT=$(jq 'length' "$OUTPUT_FILE")
echo "[reddit-reader] Done. Fetched $POST_COUNT posts across all subreddits."
echo "{\"status\":\"ok\",\"post_count\":$POST_COUNT,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
