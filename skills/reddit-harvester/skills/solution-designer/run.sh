#!/bin/bash
# Solution Designer - Generates solution approaches for each pain point
# Uses templates + heuristics to propose solutions ranked by feasibility
# Input: logs/pain-points.json  Output: logs/solutions-found.json

set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
INPUT="$BASE_DIR/logs/pain-points.json"
OUTPUT="$BASE_DIR/logs/solutions-found.json"

if [ ! -f "$INPUT" ]; then
  echo "[solution-designer] No pain points found. Run pain-detector first."
  exit 1
fi

# Solution templates by category
jq '
  def solutions_for(cat):
    if cat == "tooling" then [
      {"type": "curated-list", "approach": "Build a comparison guide of existing tools with pros/cons", "feasibility": 0.9, "effort": "low"},
      {"type": "micro-saas", "approach": "Build lightweight tool solving this specific niche", "feasibility": 0.5, "effort": "high"},
      {"type": "integration", "approach": "Create integration/bridge between tools they mention", "feasibility": 0.6, "effort": "medium"}
    ]
    elif cat == "automation" then [
      {"type": "script", "approach": "Build automation script/workflow they can plug in", "feasibility": 0.8, "effort": "medium"},
      {"type": "template", "approach": "Create reusable template/playbook for the process", "feasibility": 0.9, "effort": "low"},
      {"type": "no-code", "approach": "Design no-code solution using Zapier/Make/n8n", "feasibility": 0.7, "effort": "medium"}
    ]
    elif cat == "marketing" then [
      {"type": "guide", "approach": "Write actionable guide solving their specific marketing problem", "feasibility": 0.9, "effort": "low"},
      {"type": "tool", "approach": "Build simple marketing tool (calculator, analyzer, generator)", "feasibility": 0.6, "effort": "medium"},
      {"type": "service", "approach": "Offer as done-for-you service", "feasibility": 0.7, "effort": "high"}
    ]
    elif cat == "hiring" then [
      {"type": "template", "approach": "Create hiring template/process/checklist", "feasibility": 0.9, "effort": "low"},
      {"type": "directory", "approach": "Build curated freelancer/agency directory for niche", "feasibility": 0.6, "effort": "medium"},
      {"type": "guide", "approach": "Write guide on finding/vetting talent for their specific need", "feasibility": 0.85, "effort": "low"}
    ]
    elif cat == "cost" then [
      {"type": "comparison", "approach": "Build cost comparison tool/spreadsheet", "feasibility": 0.9, "effort": "low"},
      {"type": "alternative", "approach": "Curate cheaper alternatives with migration guides", "feasibility": 0.8, "effort": "medium"},
      {"type": "optimization", "approach": "Create cost optimization audit checklist", "feasibility": 0.85, "effort": "low"}
    ]
    else [
      {"type": "guide", "approach": "Write comprehensive guide addressing the problem", "feasibility": 0.9, "effort": "low"},
      {"type": "community", "approach": "Create community resource/wiki for this topic", "feasibility": 0.7, "effort": "medium"},
      {"type": "tool", "approach": "Build simple tool that addresses the core issue", "feasibility": 0.5, "effort": "high"}
    ]
    end;

  [.[] | . as $pain |
    {
      pain_point: {id: .id, title: .title, subreddit: .subreddit, pain_score: .pain_score, category: .pain_category, url: .url, author: .author},
      solutions: solutions_for(.pain_category),
      best_solution: (solutions_for(.pain_category) | sort_by(-.feasibility) | .[0]),
      timestamp: now | todate
    }
  ]
' "$INPUT" > "$OUTPUT"

COUNT=$(jq 'length' "$OUTPUT")
echo "[solution-designer] Generated solutions for $COUNT pain points"
jq '.[0:5] | .[] | "\(.pain_point.pain_score) | \(.pain_point.category) | \(.best_solution.type): \(.best_solution.approach[0:60])"' "$OUTPUT"
