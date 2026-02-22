# New Agent Scaffold

## Every Agent Gets Self-Optimizer From Day 1

This document defines the standard structure for all new agents. Each agent automatically includes self-optimization capability.

---

## Agent Template Structure

```
agents/<agent-name>/
├── lessons.md                        ← Agent's self-optimization file (REQUIRED)
├── SKILL.md                          ← Agent skill definition
├── scripts/                          ← Agent implementation
│   ├── main.js
│   └── ...
├── config/                           ← Configuration templates
│   └── <agent-name>-config.json
├── references/                       ← Documentation
│   └── ...
└── _meta.json                        ← Metadata
```

---

## Step 1: Create lessons.md

Every new agent starts with a `lessons.md` file. Use this template:

```markdown
# <AgentName> - Lessons Learned

_Last updated: YYYY-MM-DD | Next review: YYYY-MM-DD_

## Active Lessons (Apply These Now)

(No lessons yet — Agent is newly deployed. Lessons will be captured during operations.)

## Pattern Tracking

Monitor these patterns. Escalate to COO if count exceeds 5 in 1 week.

| Pattern | Count | First Seen | Last Seen | Status | Fix Applied |
|---------|-------|-----------|-----------|--------|------------|
| | | | | | |

## Resolved Lessons (History)

(None yet — Agent is in initial deployment phase.)

---

## Framework for Capturing Lessons

When a significant event occurs (task completed, failure, pattern discovered):

1. **Identify the pattern** — What happened? Why?
2. **Root cause** — Why did it happen?
3. **Action taken** — How did you fix it?
4. **Impact** — What improved?
5. **Update this file** — Add to "Active Lessons"

See `skills/self-optimizer/references/LESSON_CAPTURE_PROTOCOL.md` for detailed guidance.

---

## Session Startup Checklist

At the start of each <AgentName> session:

- [ ] Read "Active Lessons" (current guardrails)
- [ ] Review "Pattern Tracking" (watch for recurring issues)
- [ ] Update any patterns from previous session
- [ ] Identify today's operating constraints from lessons

---

## Escalation Criteria

Escalate to COO immediately if:
- **Same failure >3 times in 1 day** (indicates critical issue)
- **Task success rate drops below threshold** (indicates systematic problem)
- **New error type encountered** (unknown = needs investigation)
- **Cross-agent impact detected** (affects other agents)
```

---

## Step 2: Initialize Agent Skill

Create `<agent-name>/SKILL.md` following Anthropic's official framework:

```yaml
---
name: <agent-name>
description: [Your agent description + triggers for when to use]
---

# <AgentName> Skill

[Your agent documentation]
```

---

## Step 3: Add Self-Optimizer Integration

Add this section to the new agent's documentation:

```markdown
## Self-Optimization

This agent uses the self-optimizer skill for continuous improvement.

### Learning Process

1. **Capture lessons** — Document significant events (failures, patterns, successes)
2. **Update lessons.md** — Add to Active Lessons section
3. **Track patterns** — Update pattern tracking table
4. **Escalate** — If pattern >3 in 1 week, escalate to COO

See `agents/<agent-name>/lessons.md` for active lessons.

### Integration with Multi-Agent System

The COO agent:
- Collects lessons from all agents daily
- Identifies cross-agent patterns
- Propagates relevant lessons to other agents
- Creates hard stops from high-frequency patterns

This means your lessons benefit other agents, and their lessons benefit you.
```

---

## Step 4: Integrate with COO

Update `agents/coo/lessons.md` to note the new agent:

```markdown
## New Agent Tracking

When a new agent launches:

1. Check that `agents/<agent-name>/lessons.md` exists
2. Add to daily collection routine
3. Watch for patterns specific to this agent
4. Propagate relevant lessons from other agents
5. Monitor adoption of self-optimizer practices

### Agent Launch Checklist

- [ ] lessons.md file created
- [ ] Agent knows how to capture lessons
- [ ] COO included in daily collection
- [ ] Initial lessons patterns tracked
- [ ] Self-optimizer docs read by agent team
```

---

## Step 5: Agent Onboarding

When deploying a new agent, ensure it knows:

```markdown
# <AgentName> Onboarding

## What You Need to Know About Self-Optimization

### Your Lessons File

Location: `agents/<agent-name>/lessons.md`

**At session start:** Read "Active Lessons" (your guardrails)
**During work:** Apply lessons as guardrails
**When something happens:** Capture the lesson
**Before session end:** Update lessons.md with learnings

### The Self-Optimizer Skill

See `skills/self-optimizer/SKILL.md` for full documentation.

Key points:
1. **Capture** — Document failures, successes, patterns
2. **Track** — Monitor recurring issues
3. **Escalate** — If pattern >3 in 1 week, tell COO
4. **Improve** — Lessons become guardrails (hard stops)

### How COO Helps

The COO agent:
- Reads your lessons daily
- Shares relevant lessons from other agents
- Creates hard stops from your learnings
- Escalates critical issues

**Your job:** Be specific and actionable in your lessons.

### Examples

See `agents/atlas/lessons.md` for real examples of active lessons.

### Quick Lesson Template

When something happens, document:

```json
{
  "timestamp": "2026-02-18T14:30:00Z",
  "event": "task_failed | task_completed | pattern_discovered",
  "context": "What happened? (2-5 sentences)",
  "lesson": "What should we remember? (actionable insight)",
  "action": "What changed? (code/workflow update)",
  "impact": "What improved? (measurable)",
  "status": "implemented"
}
```

Add to your `lessons.md` under "Active Lessons" section.
```

---

## Agent Checklist (For Every New Agent)

Use this checklist when creating a new agent:

### Setup
- [ ] Create `agents/<agent-name>/` directory
- [ ] Create `agents/<agent-name>/lessons.md` (use template above)
- [ ] Create `agents/<agent-name>/SKILL.md` (Anthropic framework)
- [ ] Create `agents/<agent-name>/scripts/` directory
- [ ] Create `agents/<agent-name>/config/` directory
- [ ] Create `agents/<agent-name>/_meta.json`

### Documentation
- [ ] Add self-optimizer section to SKILL.md
- [ ] Create onboarding guide for agent
- [ ] Document lesson capture expectations
- [ ] Provide examples from existing agents

### Integration
- [ ] Add agent to COO's daily collection routine
- [ ] Update `agents/coo/lessons.md` with new agent
- [ ] Ensure agent knows about self-optimizer
- [ ] Create initial pattern tracking table

### Testing
- [ ] Run agent through workflow
- [ ] Capture test lesson (verify format works)
- [ ] Update lessons.md with test lesson
- [ ] Verify COO can read and collect lessons

### Documentation Updates
- [ ] Update `agents/SYSTEM_OVERVIEW.md` with new agent
- [ ] Update `agents/SELF_OPTIMIZATION_INTEGRATION.md` if needed
- [ ] Update main README with new agent
- [ ] Commit all files to git

---

## Example: Creating Astra (Operations/VA Agent)

### Step 1: Create Directory and Files

```bash
mkdir -p agents/astra/{scripts,config,references}
touch agents/astra/lessons.md
touch agents/astra/SKILL.md
touch agents/astra/_meta.json
```

### Step 2: Initialize lessons.md

```markdown
# Astra - Lessons Learned

_Last updated: 2026-02-18 | Next review: 2026-02-25_

## Active Lessons (Apply These Now)

(Astra is in initial deployment phase. Lessons will be captured as operations begin.)

[... rest of template ...]
```

### Step 3: Create SKILL.md

```yaml
---
name: astra
description: Operations and Virtual Assistant agent. Handles task automation, scheduling, process management. Use for: task management, workflow automation, delegation, scheduling, process optimization.
---

# Astra - Operations & VA Agent

[Agent documentation...]

## Self-Optimization

This agent uses the self-optimizer skill for continuous improvement.

See `agents/astra/lessons.md` for active lessons.

[... rest of skill ...]
```

### Step 4: Add to COO Oversight

Update `agents/coo/lessons.md`:

```markdown
## Agent Tracking

### Astra (Operations)
- Status: Deployed 2026-02-18
- Lessons file: agents/astra/lessons.md
- Collection: Daily
- Initial patterns: (to be tracked)
```

### Step 5: Test and Validate

1. Run Astra through a workflow
2. Capture a test lesson
3. Verify format in lessons.md
4. Verify COO can read it
5. Commit to git

---

## Standard Practices for All Agents

### Daily Workflow

```
1. Start session
   → Read your lessons.md (Active Lessons)

2. Work
   → Apply lessons as guardrails
   → Complete assigned tasks

3. Capture lessons
   → Significant event? → Document it
   → Use 7-field format

4. Update lessons.md
   → Add new Active Lesson
   → Update Pattern Tracking
   → Archive resolved lessons

5. End session
   → COO collects your lessons
```

### Weekly Review

- [ ] Review all lessons (30 min)
- [ ] Archive outdated lessons
- [ ] Update pattern counts
- [ ] Prepare for COO review

### Monthly Maintenance

- [ ] Full lessons audit
- [ ] Deprecate old patterns
- [ ] Update success metrics
- [ ] Plan improvements

---

## Common Mistakes (For All Agents)

❌ **Vague lessons** → "Failed" (not actionable)
✅ **Specific lessons** → "API timeout after 30s; added 60s retry"

❌ **Document without fixing** → Lesson is useless
✅ **Document + fix + measure** → Lesson prevents future failures

❌ **Forget to update** → Lessons get stale
✅ **Review regularly** → Keep active list current

❌ **Keep everything** → Noise accumulates
✅ **Archive old lessons** → Keep active list <10 items

---

## Success Metrics (Per Agent)

Track these for every agent:

| Metric | Target | Meaning |
|--------|--------|---------|
| Lesson Success Rate | >90% | Lessons actually improve things |
| Repeat Failure Rate | <5% | Fixed issues don't reoccur |
| Task Success Rate | >95% | Work gets done reliably |
| Time to Resolution | <1 day | Issues caught and fixed quickly |
| Active Lessons | 5-10 | Right amount of guardrails |
| Pattern Detection | <2 days | Recurring issues caught early |

---

## Reference Files

| File | Purpose |
|------|---------|
| `skills/self-optimizer/SKILL.md` | How self-optimizer skill works |
| `skills/self-optimizer/references/LESSON_CAPTURE_PROTOCOL.md` | Detailed lesson structure |
| `skills/self-optimizer/references/AGENT_LESSONS_TEMPLATE.md` | Examples from all agents |
| `agents/SELF_OPTIMIZATION_INTEGRATION.md` | Full integration guide |
| `agents/SYSTEM_OVERVIEW.md` | System architecture |
| `agents/QUICK_START_LESSONS.md` | Quick start for agents |
| `agents/atlas/lessons.md` | Example: Atlas with real lessons |
| `agents/coo/lessons.md` | Example: COO system-wide lessons |

---

## Summary

Every agent follows the same pattern:

1. ✅ **Create lessons.md** — Self-optimization file
2. ✅ **Read self-optimizer skill** — Understand the process
3. ✅ **Capture lessons** — During operations
4. ✅ **Update regularly** — Keep file current
5. ✅ **Escalate patterns** — Tell COO when >3
6. ✅ **Benefit from others** — COO propagates lessons

**Result:** System that learns from mistakes, prevents repeats, and improves continuously.

---

_New Agent Scaffold: Standard for all agents in the multi-agent system._

**Version:** 1.0
**Status:** Production
**Last Updated:** 2026-02-18
