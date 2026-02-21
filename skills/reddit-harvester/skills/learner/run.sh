#!/bin/bash
# Learner - Self-improvement engine that tracks metrics and updates patterns
# Input: all pipeline outputs  Output: memory/learned-patterns.json updates

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MEMORY_DIR="$BASE_DIR/memory"
PATTERNS_FILE="$MEMORY_DIR/learned-patterns.json"
METRICS_FILE="$BASE_DIR/logs/success-metrics.json"

mkdir -p "$MEMORY_DIR"

# Initialize patterns if missing
if [ ! -f "$PATTERNS_FILE" ]; then
  cat > "$PATTERNS_FILE" << 'EOF'
{
  "version": 1,
  "runs": 0,
  "total_posts_scanned": 0,
  "total_pain_points_found": 0,
  "total_solutions_designed": 0,
  "category_distribution": {},
  "top_subreddits": {},
  "effective_keywords": {},
  "avg_pain_score": 0,
  "rules_added": [],
  "last_updated": null
}
EOF
fi

# Gather metrics from current run
POSTS=$(jq 'length // 0' "$BASE_DIR/logs/raw-posts.json" 2>/dev/null || echo 0)
PAINS=$(jq 'length // 0' "$BASE_DIR/logs/pain-points.json" 2>/dev/null || echo 0)
SOLUTIONS=$(jq 'length // 0' "$BASE_DIR/logs/solutions-found.json" 2>/dev/null || echo 0)

# Update patterns
jq --argjson posts "$POSTS" --argjson pains "$PAINS" --argjson solutions "$SOLUTIONS" '
  .runs += 1 |
  .total_posts_scanned += $posts |
  .total_pain_points_found += $pains |
  .total_solutions_designed += $solutions |
  .last_updated = (now | todate) |
  if .runs > 0 then
    .conversion_rate = ((.total_pain_points_found / (.total_posts_scanned + 0.001)) * 100 | round / 100)
  else . end
' "$PATTERNS_FILE" > /tmp/patterns_updated.json
mv /tmp/patterns_updated.json "$PATTERNS_FILE"

# Generate metrics summary
cat > "$METRICS_FILE" << EOF
{
  "run_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "posts_scanned": $POSTS,
  "pain_points_found": $PAINS,
  "solutions_designed": $SOLUTIONS,
  "conversion_rate": $(echo "scale=2; $PAINS * 100 / ($POSTS + 1)" | bc 2>/dev/null || echo 0),
  "cumulative": $(cat "$PATTERNS_FILE")
}
EOF

echo "[learner] Metrics updated. Run #$(jq '.runs' "$PATTERNS_FILE")"
echo "[learner] This run: $POSTS posts → $PAINS pain points → $SOLUTIONS solutions"
echo "[learner] Conversion rate: $(jq '.conversion_rate' "$PATTERNS_FILE")%"
