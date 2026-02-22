#!/bin/bash
# Tester - End-to-end verification of the harvester pipeline
# Tests each component and reports pass/fail with details

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
RESULTS_FILE="$BASE_DIR/test-results.md"
PASS=0
FAIL=0

log_test() {
  local name="$1" status="$2" detail="$3"
  if [ "$status" = "PASS" ]; then
    PASS=$((PASS + 1))
    echo "| $name | ✅ PASS | $detail |" >> "$RESULTS_FILE"
  else
    FAIL=$((FAIL + 1))
    echo "| $name | ❌ FAIL | $detail |" >> "$RESULTS_FILE"
  fi
}

cat > "$RESULTS_FILE" << 'EOF'
# Test Results — Reddit Pain-Point Harvester

**Run:** $(date -u +%Y-%m-%dT%H:%M:%SZ)

| Test | Status | Details |
|------|--------|---------|
EOF

# Overwrite timestamp properly
sed -i "s|\$(date -u +%Y-%m-%dT%H:%M:%SZ)|$(date -u +%Y-%m-%dT%H:%M:%SZ)|" "$RESULTS_FILE"

# Test 1: Config validity
if jq empty "$BASE_DIR/agent-config.json" 2>/dev/null; then
  log_test "Config valid JSON" "PASS" "agent-config.json parses correctly"
else
  log_test "Config valid JSON" "FAIL" "agent-config.json has JSON errors"
fi

# Test 2: Skill-map validity
if jq empty "$BASE_DIR/skill-map.json" 2>/dev/null; then
  log_test "Skill-map valid JSON" "PASS" "skill-map.json parses correctly"
else
  log_test "Skill-map valid JSON" "FAIL" "skill-map.json has JSON errors"
fi

# Test 3: All skill directories exist
ALL_SKILLS="reddit-reader pain-detector solution-designer skill-builder message-crafter postiz-connector tester learner"
MISSING=""
for skill in $ALL_SKILLS; do
  if [ ! -d "$BASE_DIR/skills/$skill" ]; then
    MISSING="$MISSING $skill"
  fi
done
if [ -z "$MISSING" ]; then
  log_test "All skill dirs exist" "PASS" "8/8 skill directories present"
else
  log_test "All skill dirs exist" "FAIL" "Missing:$MISSING"
fi

# Test 4: All run.sh scripts exist and are executable
MISSING_SCRIPTS=""
for skill in $ALL_SKILLS; do
  if [ ! -f "$BASE_DIR/skills/$skill/run.sh" ]; then
    MISSING_SCRIPTS="$MISSING_SCRIPTS $skill"
  fi
done
if [ -z "$MISSING_SCRIPTS" ]; then
  log_test "All run.sh exist" "PASS" "8/8 run scripts present"
else
  log_test "All run.sh exist" "FAIL" "Missing:$MISSING_SCRIPTS"
fi

# Test 5: Credentials use vault placeholders (no plaintext)
PLAINTEXT=$(jq -r '.credentials | to_entries[] | select(.value | test("^\\$\\{AGENT_VAULT:") | not) | .key' "$BASE_DIR/agent-config.json" 2>/dev/null)
if [ -z "$PLAINTEXT" ]; then
  log_test "No plaintext secrets" "PASS" "All credentials use agent-vault"
else
  log_test "No plaintext secrets" "FAIL" "Plaintext found in: $PLAINTEXT"
fi

# Test 6: Rate limiting configured
RATE=$(jq '.rules.max_reddit_requests_per_minute' "$BASE_DIR/agent-config.json")
if [ "$RATE" -le 15 ] 2>/dev/null; then
  log_test "Rate limiting" "PASS" "Max $RATE requests/min"
else
  log_test "Rate limiting" "FAIL" "Rate limit too high or missing"
fi

# Test 7: Outreach requires approval
APPROVAL=$(jq -r '.rules.require_approval_for_outreach' "$BASE_DIR/agent-config.json")
if [ "$APPROVAL" = "true" ]; then
  log_test "Outreach approval gate" "PASS" "require_approval_for_outreach=true"
else
  log_test "Outreach approval gate" "FAIL" "Outreach not gated!"
fi

# Test 8: Post age limit configured
AGE=$(jq '.rules.max_post_age_hours' "$BASE_DIR/agent-config.json")
if [ "$AGE" -le 48 ] 2>/dev/null; then
  log_test "Post age limit" "PASS" "Max ${AGE}h posts"
else
  log_test "Post age limit" "FAIL" "Age limit missing or >48h"
fi

# Test 9: Log directory exists
if [ -d "$BASE_DIR/logs" ]; then
  log_test "Log directory" "PASS" "logs/ exists"
else
  log_test "Log directory" "FAIL" "logs/ missing"
fi

# Test 10: Memory directory exists
if [ -d "$BASE_DIR/memory" ]; then
  log_test "Memory directory" "PASS" "memory/ exists"
else
  log_test "Memory directory" "FAIL" "memory/ missing"
fi

# Summary
echo "" >> "$RESULTS_FILE"
echo "## Summary" >> "$RESULTS_FILE"
echo "- **Passed:** $PASS" >> "$RESULTS_FILE"
echo "- **Failed:** $FAIL" >> "$RESULTS_FILE"
echo "- **Total:** $((PASS + FAIL))" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "## Notes" >> "$RESULTS_FILE"
echo "- Live Reddit fetch test requires network access (run reddit-reader manually)" >> "$RESULTS_FILE"
echo "- Postiz integration test requires configured credentials" >> "$RESULTS_FILE"
echo "- End-to-end pipeline test: run orchestrator.sh" >> "$RESULTS_FILE"

echo "[tester] Results: $PASS passed, $FAIL failed out of $((PASS + FAIL)) tests"
cat "$RESULTS_FILE"
