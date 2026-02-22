# Self-Optimizer Skill Integration

## Overview

Each agent in the multi-agent system now has built-in self-optimization capability through the `self-optimizer` skill. This enables:

1. **Continuous learning** — Each agent captures lessons from successes and failures
2. **Mistake prevention** — Active lessons serve as guardrails at session start
3. **Cross-agent knowledge sharing** — COO propagates lessons across agents
4. **Systemic improvement** — Patterns escalate for hard stop creation
5. **Operational excellence** — Feedback loops prevent repeating errors

---

## Architecture Integration

```
┌─────────────────────────────────────────────────────────┐
│               Multi-Agent System                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────┐  ┌─────────┐  ┌────────┐  ┌────────┐      │
│  │ Atlas   │  │ Astra   │  │Sentinel│  │ Email  │      │
│  │Marketing│  │Ops/VA   │  │Support │  │Comms   │      │
│  └────┬────┘  └────┬────┘  └───┬────┘  └───┬────┘      │
│       │            │           │           │            │
│       └──────────┬─────────────┬───────────┘            │
│                  │             │                         │
│        ┌─────────▼─────────────▼────────┐              │
│        │    Self-Optimizer Skill         │              │
│        │  ┌──────────────────────────┐  │              │
│        │  │Lesson Capture Protocol   │  │              │
│        │  │Pattern Tracking          │  │              │
│        │  │Cross-Agent Propagation   │  │              │
│        │  └──────────────────────────┘  │              │
│        └──────────────┬──────────────────┘              │
│                       │                                  │
│                  ┌────▼─────┐                            │
│                  │    COO    │                            │
│                  │Governance │                            │
│                  └───────────┘                            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

```
agents/
├── atlas/
│   ├── lessons.md                 ← Active lessons for Atlas
│   ├── scripts/
│   └── config/
├── astra/
│   ├── lessons.md                 ← Active lessons for Astra
│   └── ...
├── sentinel/
│   ├── lessons.md                 ← Active lessons for Sentinel
│   └── ...
├── email/
│   ├── lessons.md                 ← Active lessons for Email
│   └── ...
├── coo/
│   ├── lessons.md                 ← Central governance lessons
│   └── ...
└── SELF_OPTIMIZATION_INTEGRATION.md

skills/
└── self-optimizer/
    ├── SKILL.md                   ← Main skill definition
    ├── references/
    │   ├── LESSON_CAPTURE_PROTOCOL.md
    │   └── AGENT_LESSONS_TEMPLATE.md
    ├── package.json
    └── _meta.json
```

---

## Agent Workflow

### Daily Agent Session

```
1. START SESSION
   ↓
2. READ lessons.md
   - Active Lessons (current guardrails)
   - Pattern Tracking (watch for recurring issues)
   ↓
3. PERFORM TASKS
   - Apply Active Lessons as guardrails
   - Complete assigned work
   - Monitor for failures/patterns
   ↓
4. CAPTURE LESSONS
   - Significant event occurred? → Document it
   - Failure? → Root cause + fix
   - Pattern discovered? → Update tracking
   ↓
5. UPDATE lessons.md
   - Add new Active Lesson
   - Update Pattern Tracking
   - Archive resolved lessons
   ↓
6. END SESSION
```

### COO Daily Oversight

```
1. START COO SESSION
   ↓
2. COLLECT LESSONS from all agents
   - Read: atlas/lessons.md, astra/lessons.md, sentinel/lessons.md, email/lessons.md
   ↓
3. IDENTIFY PATTERNS
   - Same issue across multiple agents? → Cross-agent pattern
   - High-frequency patterns? → Escalation check
   ↓
4. CROSS-AGENT PROPAGATION
   - Relevant lesson for Agent X? → Add to their lessons.md
   - New pattern discovered? → Create hard stop if needed
   ↓
5. ESCALATION CHECK
   - Any pattern >3 in 1 week? → Escalate to human
   - System health degrading? → Alert human
   ↓
6. UPDATE coo/lessons.md
   - Add new learning from oversight
   - Update system-wide pattern tracking
   ↓
7. END SESSION
```

---

## Lesson Capture Flow

### For Any Agent (Atlas, Astra, Sentinel, Email)

When a significant event occurs:

```json
{
  "timestamp": "2026-02-18T14:30:00Z",
  "event": "task_completed | task_failed | pattern_discovered",
  "agent": "atlas",
  "context": "What happened? (2-5 sentences)",
  "lesson": "What should we remember? (actionable insight)",
  "action": "What changed? (code/workflow update)",
  "impact": "What improved? (measurable)",
  "status": "implemented"
}
```

Add to `agents/<agent>/lessons.md` under "Active Lessons" section.

### For COO

When collecting and propagating lessons:

```
1. Read all agent lessons.md files
2. Identify patterns across agents
3. For each pattern:
   - If >3 occurrences → Create hard stop
   - If cross-agent → Add to all affected agents
   - If critical → Escalate to human
4. Update coo/lessons.md with findings
5. Alert agents of new cross-agent lessons
```

---

## Integration with Hard Stops

Lessons drive hard stops creation:

```
Pattern occurs 3+ times in 1 week
          ↓
      Escalate to COO
          ↓
    Is it preventable?
    Yes ↙           ↘ No
     │               → Monitor pattern
     │
  Create Hard Stop
     │
  Level 1: PREVENT (never allow)
  Level 2: REQUIRE APPROVAL (needs approval)
  Level 3: NOTIFY (alert human)
  Level 4: RATE LIMIT (throttle action)
  Level 5: BUDGET LIMIT (cap spending)
     │
  Add to hard_stops.json
     │
  Agents enforce at runtime
```

### Example: TikTok Metadata Lesson → Hard Stop

**Lesson:** "TikTok rejects posts without description AND hashtags"

**Pattern:** 5 rejections in 2 days

**COO Action:** Create hard stop

**Hard Stop Enforced:**
```json
{
  "rule_id": "TIKTOK_METADATA_001",
  "name": "Always validate TikTok metadata",
  "level": "PREVENT",
  "agent": "atlas",
  "condition": "posting_to_tiktok",
  "action": "Validate description AND hashtags; reject post if either missing",
  "triggered_by": "Atlas lesson on 2026-02-15"
}
```

**Result:** Hard stop prevents all future TikTok metadata failures

---

## Knowledge Transfer Between Agents

### Cross-Agent Learning Example

**Day 1 (Monday):** Atlas learns lesson
```
Atlas: "Account status must be checked before posting"
       (learned through 3 failed posts to restricted account)
```

**Day 2 (Tuesday):** COO propagates lesson
```
COO identifies lesson is relevant to: Astra, Sentinel, Email
↓
COO updates their lessons.md files with lesson
↓
Relevant to Astra: "Check account health before new tasks"
Relevant to Sentinel: "Check account status before escalation"
Relevant to Email: "Verify sender account before sending"
```

**Day 3 (Wednesday):** Other agents benefit
```
Astra encounters account issue → Prevents it using lesson
Sentinel tries to escalate → Checks account first → Prevents error
Email sends → Checks account → No bounces
```

**Impact:** 3 agents benefit from 1 agent's learning

---

## Metrics & Monitoring

### Per-Agent Metrics

Track these metrics for each agent:

```
1. Lesson Success Rate
   - How many lessons led to improvements? (target: >90%)
   
2. Repeat Failure Rate
   - How often do resolved issues reoccur? (target: <5%)
   
3. Active Lesson Count
   - How many guardrails are currently active? (target: 5-10)
   
4. Time to Resolution
   - How fast are issues caught and fixed? (target: <1 day)
   
5. Cross-Agent Learning
   - How many lessons adopted from other agents? (target: >50%)
```

### System-Wide Metrics

Track these for COO:

```
1. System Health Score
   - Composite of all agent metrics (target: >95%)
   
2. Pattern Detection Time
   - How fast are recurring issues identified? (target: <2 days)
   
3. Hard Stop Effectiveness
   - How many failures are prevented by hard stops? (target: >80%)
   
4. Escalation Accuracy
   - What percentage of escalations actually require human action? (target: >80%)
   
5. Learning Velocity
   - How many lessons per week? (target: 3-5 per agent)
```

---

## Implementation Checklist

### Phase 1: Setup (Complete)
- [x] Create self-optimizer skill
- [x] Create lessons.md for each agent
- [x] Define lesson capture protocol
- [x] Create agent lessons template
- [x] Document integration

### Phase 2: Onboarding (Ready to Start)
- [ ] Agents read skill documentation
- [ ] Agents review their lessons.md file
- [ ] Agents understand lesson capture protocol
- [ ] COO understands daily oversight workflow
- [ ] Team understands escalation criteria

### Phase 3: Execution (Ready)
- [ ] Agents begin capturing lessons during operations
- [ ] COO begins daily lesson collection
- [ ] COO propagates cross-agent learnings
- [ ] Track metrics and patterns
- [ ] Create hard stops from high-frequency patterns

### Phase 4: Optimization (Ongoing)
- [ ] Review lessons effectiveness
- [ ] Archive old/obsolete lessons
- [ ] Update hard stops based on learnings
- [ ] Continuous improvement cycle

---

## Best Practices

### For All Agents

1. **Be specific** — Not "failed" but "failed: API timeout after 30s"
2. **Root cause first** — Why, not just what
3. **Actionable fix** — Code change, not vague improvement
4. **Measure impact** — Numbers, percentages, concrete metrics
5. **Review regularly** — Prevents repeating mistakes

### For COO

1. **Collect daily** — Don't let lessons pile up
2. **Cross-pollinate** — Share relevant lessons across agents
3. **Escalate early** — >3 in 1 week = escalation threshold
4. **Archive aggressively** — Keep active lessons under 10 per agent
5. **Measure system health** — Track metrics, trends, improvements

---

## Support & Troubleshooting

### Q: What if an agent has conflicting lessons?
**A:** COO resolves conflicts by reviewing context and updating the hard stop that enforces the "right" approach.

### Q: How do we prevent lessons from becoming outdated?
**A:** Monthly review cycle. Archive lessons that no longer apply. Update lessons as systems change.

### Q: What if COO's lesson contradicts an agent's lesson?
**A:** COO's lesson takes precedence (system-level > agent-level). Update agent's lessons accordingly.

### Q: How often should agents review their lessons?
**A:** At every session start. Quick read (5 min). Weekly deep review (15 min). Monthly archive/cleanup (30 min).

---

## References

- **Skill:** `skills/self-optimizer/SKILL.md`
- **Lesson Protocol:** `skills/self-optimizer/references/LESSON_CAPTURE_PROTOCOL.md`
- **Agent Templates:** `skills/self-optimizer/references/AGENT_LESSONS_TEMPLATE.md`
- **Agent Lessons:**
  - Atlas: `agents/atlas/lessons.md`
  - Astra: `agents/astra/lessons.md`
  - Sentinel: `agents/sentinel/lessons.md`
  - Email: `agents/email/lessons.md`
  - COO: `agents/coo/lessons.md`
- **Multi-Agent Architecture:** `agents/MULTI_AGENT_SYSTEM_ARCHITECTURE.md`

---

_Last updated: 2026-02-18_
