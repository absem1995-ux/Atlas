#!/bin/bash
# Reaper Orchestrator - Runs the full pipeline in sequence
# Usage: ./orchestrator.sh [--dry-run]

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
ERRORS_FILE="$BASE_DIR/logs/errors.json"
echo "[]" > "$ERRORS_FILE"

log_error() {
  local skill="$1" error="$2"
  jq --arg s "$skill" --arg e "$error" '. + [{"skill": $s, "error": $e, "time": (now | todate)}]' \
    "$ERRORS_FILE" > /tmp/errors_tmp.json
  mv /tmp/errors_tmp.json "$ERRORS_FILE"
}

echo "========================================="
echo "🔥 REAPER — Reddit Pain-Point Harvester"
echo "   Run: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "========================================="

SKILLS="reddit-reader pain-detector solution-designer skill-builder message-crafter postiz-connector learner"

for skill in $SKILLS; do
  echo ""
  echo ">>> Running: $skill"
  if bash "$BASE_DIR/skills/$skill/run.sh" 2>&1; then
    echo "<<< $skill: OK"
  else
    echo "<<< $skill: FAILED"
    log_error "$skill" "Exit code $?"
  fi
done

echo ""
echo "========================================="
echo "🔥 Pipeline complete"
echo "   Errors: $(jq 'length' "$ERRORS_FILE")"
echo "========================================="
