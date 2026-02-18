---
name: self-optimizer
description: Agent self-optimization through structured lesson capture and continuous improvement. Use when an agent completes a task, encounters a failure, or identifies a pattern worth learning. Captures lessons in structured format, prevents repeating mistakes, and drives operational excellence.
---

# Self-Optimizer Skill

Every agent learns from experience. This skill embeds that learning directly into operations.

## How It Works

### 1. Capture Lessons

After any significant event (task completion, failure, pattern discovered), document it:

```json
{
  "timestamp": "2026-02-18T14:30:00Z",
  "event": "task_completed | task_failed | pattern_discovered",
  "agent": "atlas",
  "context": "What happened?",
  "lesson": "What should we remember?",
  "action": "What changes to make?",
  "impact": "What gets better?",
  "status": "implemented | pending"
}
```

### 2. Review Lessons Daily

Each agent reviews its lessons at session start:
- **What failed last time?** → Fix it first
- **What worked?** → Keep doing it
- **What changed?** → Adapt to it

### 3. Update Agent Rules

Lessons become hard stops, preferences, or workflow changes:
- **Hard stop:** "Never post without reading recent performance data"
- **Preference:** "Always check X before doing Y"
- **Workflow:** "Add validation step Z to prevent timeout errors"

## Implementation

### For Each Agent

Create `agents/<agent-name>/lessons.md`:

```markdown
# <AgentName> - Lessons Learned

## Active Lessons (Apply Now)

### Lesson: [Pattern/Issue]
- **What happened:** [Context]
- **Root cause:** [Why]
- **Fix:** [Solution implemented]
- **Impact:** [What got better]
- **Date:** [When learned]
- **Status:** ✅ Active

## Resolved Lessons (History)

[Previous lessons that have been resolved or superseded]

## Pattern Tracking

| Pattern | Count | Last Seen | Status |
|---------|-------|-----------|--------|
| API timeout | 3 | 2026-02-18 | Fixed: added retry logic |
| Config error | 2 | 2026-02-15 | Fixed: validation added |
```

### During Operations

When an agent works on a task, it:

1. **Identify risks** — Does this look like a previous failure?
2. **Apply lessons** — Use knowledge from failures to prevent repeating them
3. **Capture outcomes** — After task completion, document what happened
4. **Update lessons** — Roll learnings into the live lessons.md

### At Session Start

Read the agent's `lessons.md` file:
- **Active lessons:** These are your guardrails today
- **Pattern tracking:** These failures are most frequent
- **Recent changes:** These workflows were recently updated

## Reference Files

See `references/LESSON_CAPTURE_PROTOCOL.md` for:
- Detailed lesson structure (7 fields)
- What makes a good lesson (actionable, specific, measurable)
- How to avoid repeat failures
- Impact scoring (high/medium/low)
- Root cause analysis checklist

See `references/AGENT_LESSONS_TEMPLATE.md` for:
- Template for each agent's lessons.md
- Examples from Atlas, Astra, Sentinel, Email, COO
- How to review lessons at session start

## Integration with Multi-Agent System

### COO Oversight

The COO agent:
- **Collects lessons** from all agents daily
- **Identifies patterns** (e.g., "3 agents hit same API timeout")
- **Escalates critical lessons** to prevent cross-agent failures
- **Updates hard stops** when lessons require enforcement

### Hard Stops from Lessons

High-impact lessons become hard stops:

```json
{
  "rule_id": "LESSON-ATLAS-001",
  "name": "Always validate image before posting",
  "level": "REQUIRE_APPROVAL",
  "triggered_by": "Failed image post (missing alt text)",
  "action": "Require human review of all images before scheduling"
}
```

### Cross-Agent Learning

When one agent learns a lesson, the COO propagates relevant learnings to other agents:

- **Atlas learns:** Post times matter (schedule during peak hours)
- **COO propagates:** All agents should consider timing for user-facing actions
- **Other agents adapt:** Email, Sentinel check optimal timing before acting

## Execution Workflow

### For Atlas (Marketing Agent)

1. **Post a piece of content**
2. **Collect performance data** (24 hours later)
3. **Analyze results:** Did it work? Why/why not?
4. **Capture lesson:** 
   ```
   Lesson: Post timing affects engagement by 40%
   Action: Always post between 6-9 PM for this audience
   Impact: 40% higher engagement
   ```
5. **Update tomorrow's schedule** based on lesson

### For COO (Governance Agent)

1. **Receive updates** from all agents
2. **Review lessons** from each agent
3. **Identify patterns:** Which failures are most frequent?
4. **Escalate critical issues** to human oversight
5. **Update hard stops** when new guardrails needed
6. **Share cross-agent learnings** with all agents

## Example: Atlas Learns from Failure

**Task:** Schedule 5 posts to TikTok
**Failure:** 2 posts rejected due to missing metadata

**Lesson captured:**
```json
{
  "timestamp": "2026-02-18T10:15:00Z",
  "event": "task_failed",
  "agent": "atlas",
  "context": "Posted 5 videos to TikTok; 2 rejected during scheduling",
  "lesson": "TikTok API requires description + hashtags for every video. Missing either causes rejection.",
  "action": "Add validation step: check description AND hashtags before posting",
  "impact": "100% post success rate (previously 60%)",
  "status": "implemented"
}
```

**Lesson applied to lessons.md:**
```markdown
### Lesson: TikTok Metadata Required
- **What happened:** 2 of 5 posts rejected for missing metadata
- **Root cause:** Validation step skipped in generate-content script
- **Fix:** Added validation to check description + hashtags before scheduling
- **Impact:** Posts now 100% successful (previously 60%)
- **Date:** 2026-02-18
- **Status:** ✅ Active
```

**Workflow updated:**
- `schedule-posts.js` now validates description + hashtags
- Validation is now a HARD STOP (cannot post without both)
- Future posts use this validation automatically

## Best Practices

1. **Be specific** — "Post failed" ≠ useful. "Post failed: missing description" = actionable
2. **Identify root cause** — Why did it fail? API limitation? Configuration? Timing?
3. **Implement the fix** — Don't just document; change the code/workflow
4. **Measure impact** — How much better is this? 10% improvement? 100%?
5. **Review regularly** — Old lessons might not apply anymore; deprecate them

## Avoid Common Mistakes

- ❌ "Lesson: Things are hard" → Too vague
- ✅ "Lesson: API times out after 30 seconds; add 60-second timeout and retry logic"

- ❌ Document but don't change anything → Lessons are only useful when applied
- ✅ Document + implement + measure impact

- ❌ Keep outdated lessons → They become noise
- ✅ Archive lessons that no longer apply; keep active lessons current
