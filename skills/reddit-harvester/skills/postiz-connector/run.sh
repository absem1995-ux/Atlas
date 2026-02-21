#!/bin/bash
# Postiz Connector - Schedules approved outreach via Postiz API
# SAFETY: Only sends messages marked as "approved" by ehi
# Uses agent-vault for credentials — never exposes keys

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CONFIG="$BASE_DIR/agent-config.json"
INPUT="$BASE_DIR/logs/outreach-drafts.json"
OUTPUT="$BASE_DIR/logs/postiz-results.json"

POSTIZ_URL=$(jq -r '.credentials.postiz_api_url' "$CONFIG")
POSTIZ_KEY=$(jq -r '.credentials.postiz_api_key' "$CONFIG")

if [ ! -f "$INPUT" ]; then
  echo "[postiz-connector] No outreach drafts found."
  exit 1
fi

# Only process approved messages
APPROVED=$(jq '[.[] | select(.status == "approved")]' "$INPUT")
APPROVED_COUNT=$(echo "$APPROVED" | jq 'length')

if [ "$APPROVED_COUNT" -eq 0 ]; then
  echo "[postiz-connector] No approved messages to send. All $( jq 'length' "$INPUT") drafts pending approval."
  echo '{"status":"no_approved_messages","pending":'"$(jq 'length' "$INPUT")"'}' > "$OUTPUT"
  exit 0
fi

# Check for vault placeholders (don't send with unresolved creds)
if echo "$POSTIZ_KEY" | grep -q 'AGENT_VAULT'; then
  echo "[postiz-connector] ERROR: Postiz API key not configured. Set up agent-vault first."
  echo '{"status":"error","reason":"credentials_not_configured"}' > "$OUTPUT"
  exit 1
fi

echo "[postiz-connector] Would send $APPROVED_COUNT approved messages via Postiz"
echo "[postiz-connector] DRY RUN MODE — real sending disabled until production approval"
echo '{"status":"dry_run","approved_count":'"$APPROVED_COUNT"',"sent":0}' > "$OUTPUT"
