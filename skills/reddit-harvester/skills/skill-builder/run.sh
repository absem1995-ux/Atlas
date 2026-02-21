#!/bin/bash
# Skill Builder - Creates solution skill packages from solution designs
# Generates: directory structure, README, basic implementation, config
# Input: logs/solutions-found.json  Output: /skills/reddit-harvester/built-solutions/

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
INPUT="$BASE_DIR/logs/solutions-found.json"
OUTPUT_DIR="$BASE_DIR/built-solutions"

mkdir -p "$OUTPUT_DIR"

if [ ! -f "$INPUT" ]; then
  echo "[skill-builder] No solutions to build."
  exit 1
fi

# Build top 5 solutions (by pain_score)
SOLUTIONS=$(jq -c '.[0:5][]' "$INPUT")

COUNT=0
while IFS= read -r solution; do
  PAIN_ID=$(echo "$solution" | jq -r '.pain_point.id')
  TYPE=$(echo "$solution" | jq -r '.best_solution.type')
  CATEGORY=$(echo "$solution" | jq -r '.pain_point.category')
  TITLE=$(echo "$solution" | jq -r '.pain_point.title[0:60]')
  APPROACH=$(echo "$solution" | jq -r '.best_solution.approach')
  SUBREDDIT=$(echo "$solution" | jq -r '.pain_point.subreddit')
  
  SKILL_DIR="$OUTPUT_DIR/${PAIN_ID}-${TYPE}"
  mkdir -p "$SKILL_DIR"
  
  # Generate skill README
  cat > "$SKILL_DIR/README.md" << EOF
# Solution: ${TYPE} for r/${SUBREDDIT}

**Pain Point:** ${TITLE}
**Category:** ${CATEGORY}
**Approach:** ${APPROACH}
**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Status
- [ ] Drafted
- [ ] Reviewed by ehi
- [ ] Tested
- [ ] Deployed

## Implementation Notes
Solution type: ${TYPE}
Auto-generated scaffold — needs human review before deployment.
EOF

  # Generate basic config
  echo "$solution" | jq '{
    skill_id: .pain_point.id,
    type: .best_solution.type,
    category: .pain_point.category,
    feasibility: .best_solution.feasibility,
    effort: .best_solution.effort,
    source_url: .pain_point.url,
    status: "draft"
  }' > "$SKILL_DIR/config.json"
  
  COUNT=$((COUNT + 1))
done <<< "$SOLUTIONS"

echo "[skill-builder] Built $COUNT solution scaffolds in $OUTPUT_DIR"
